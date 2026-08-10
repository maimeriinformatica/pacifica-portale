// =====================================================================
// s3-presign — genera URL firmati (SigV4) per caricare file video su
// una destinazione compatibile S3 (AWS S3, Cloudflare R2, Backblaze B2,
// Wasabi...). Gli account sono nella tabella s3_accounts; le chiavi non
// lasciano mai il server: al browser arriva solo l'URL firmato.
//
// Chi puo' usarla: solo la presidenza (verifica sul profilo).
// Limite del metodo: un PUT firmato carica UN file fino a 5 GB.
// Oltre serve il multipart upload (estensione futura).
// =====================================================================
import { createClient } from "npm:@supabase/supabase-js@2";
import { presignPut } from "./sigv4.ts";

Deno.serve(async (req) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, content-type",
  };
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const auth = req.headers.get("Authorization") ?? "";
    const anon = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await anon.auth.getUser();
    if (!user) return json({ error: "Accesso richiesto" }, 401, cors);

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: prof } = await admin.from("profiles").select("ruolo").eq("id", user.id).single();
    if (!prof || prof.ruolo !== "presidenza") return json({ error: "Riservato alla Presidenza" }, 403, cors);

    const { account_id, filename, content_type } = await req.json();
    const { data: acc } = await admin.from("s3_accounts").select("*").eq("id", account_id).eq("attivo", true).single();
    if (!acc) return json({ error: "Account S3 non trovato o disattivato" }, 404, cors);

    // percorso: video/ANNO/nomefile ripulito, con suffisso anti-collisione
    const pulito = String(filename || "file").replace(/[^A-Za-z0-9._-]+/g, "-").slice(0, 120);
    const key = `video/${new Date().getFullYear()}/${Date.now().toString(36)}-${pulito}`;

    const url = await presignPut({
      endpoint: acc.endpoint, region: acc.region || "auto", bucket: acc.bucket,
      accessKeyId: acc.access_key_id, secretAccessKey: acc.secret_access_key,
      key, contentType: content_type || "application/octet-stream", expiresSec: 3600,
    });
    const base = (acc.public_base_url || "").replace(/\/$/, "");
    const publicUrl = base ? `${base}/${key}` : `${acc.endpoint.replace(/\/$/, "")}/${acc.bucket}/${key}`;
    return json({ upload_url: url, key, public_url: publicUrl, content_type: content_type || "application/octet-stream" }, 200, cors);
  } catch (e) {
    return json({ error: String(e?.message || e) }, 500, cors);
  }
});

function json(body: unknown, status: number, cors: Record<string, string>) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
}
