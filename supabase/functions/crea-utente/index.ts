// =====================================================================
// crea-utente — crea un account del portale dal gestionale.
// Da quando l'auto-iscrizione è spenta (v1.89), gli account li crea
// l'Accademia: questa funzione permette alla PRESIDENZA di creare un
// utente con email e password provvisoria, assegnando ruolo e
// membership. La chiave service_role resta sul server.
//
// Deploy:  supabase functions deploy crea-utente
// Chi può usarla: solo la presidenza (verifica sul profilo).
// Il frontend (db.js -> DB.creaUtente) invia:
//   { email, password, nome, ruolo, membership }
// e riceve { ok:true } oppure { error:"..." }.
// =====================================================================
import { createClient } from "npm:@supabase/supabase-js@2";

const RUOLI = ["iscritto", "delegato", "formatore", "presidenza"];
const MEMBERSHIP = ["free", "civis", "academicus"];

Deno.serve(async (req) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    // 1. chi chiama dev'essere un utente autenticato...
    const auth = req.headers.get("Authorization") ?? "";
    const anon = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await anon.auth.getUser();
    if (!user) return json({ error: "Accesso richiesto" }, 401, cors);

    // 2. ...con ruolo di presidenza
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: prof } = await admin.from("profiles").select("ruolo").eq("id", user.id).single();
    if (!prof || prof.ruolo !== "presidenza") return json({ error: "Riservato alla Presidenza" }, 403, cors);

    // 3. dati del nuovo account
    const b = await req.json();
    const email = String(b.email ?? "").trim().toLowerCase();
    const password = String(b.password ?? "");
    const nome = String(b.nome ?? "").trim();
    const ruolo = RUOLI.includes(b.ruolo) ? b.ruolo : "iscritto";
    const membership = MEMBERSHIP.includes(b.membership) ? b.membership : "free";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: "Email non valida" }, 400, cors);
    if (password.length < 8) return json({ error: "La password deve avere almeno 8 caratteri" }, 400, cors);
    if (nome.length < 2) return json({ error: "Inserisci il nome" }, 400, cors);

    // 4. crea l'utente (email già confermata: entra subito)
    const { data: created, error: e1 } = await admin.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { nome },
    });
    if (e1) {
      const msg = /already/i.test(e1.message) ? "Esiste già un account con questa email" : e1.message;
      return json({ error: msg }, 400, cors);
    }

    // 5. completa il profilo (il trigger lo crea; qui ruolo e membership)
    const { error: e2 } = await admin.from("profiles")
      .upsert({ id: created.user.id, nome, ruolo, membership }, { onConflict: "id" });
    if (e2) return json({ error: "Account creato, ma profilo non aggiornato: " + e2.message }, 500, cors);

    return json({ ok: true, id: created.user.id }, 200, cors);
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 500, cors);
  }

  function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
    return new Response(JSON.stringify(body), {
      status, headers: { ...headers, "content-type": "application/json" },
    });
  }
});
