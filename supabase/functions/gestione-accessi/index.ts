// =====================================================================
// gestione-accessi — tutte le password si gestiscono DAL PROGRAMMA.
// Tre azioni:
//
//  { azione:"admin", email, password }
//     Accesso di riserva dell'amministratore. Confronta email e password
//     con le variabili riservate ADMIN_EMAIL e ADMIN_PASSWORD (Secrets
//     delle Edge Functions su Supabase). Se coincidono, crea o ripara
//     l'account amministratore con quella password (email confermata,
//     ruolo presidenza). Così l'amministratore si imposta da variabile
//     e il portale lo applica da solo: nessuna gestione manuale.
//
//  { azione:"imposta-password", id, password }
//     La PRESIDENZA (verificata dal token di accesso) imposta una nuova
//     password a un utente, confermando anche l'email.
//
//  { azione:"conferma-email", id }
//     La PRESIDENZA conferma l'email di un utente che non riesce a farlo.
//
// Deploy:  supabase functions deploy gestione-accessi --no-verify-jwt
// (dal sito Supabase: Edge Functions -> Deploy new function, nome
//  "gestione-accessi", incollare questo file e DISATTIVARE la spunta
//  "Enforce JWT verification": l'azione "admin" arriva prima del login.)
// La chiave service_role resta sul server e non entra mai nel sito.
// =====================================================================
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const b = await req.json().catch(() => ({}));
    const azione = String(b.azione ?? "");

    // ---------------- ACCESSO DI RISERVA DELL'AMMINISTRATORE ----------------
    if (azione === "admin") {
      const cfgEmail = (Deno.env.get("ADMIN_EMAIL") ?? "").trim().toLowerCase();
      const cfgPass = Deno.env.get("ADMIN_PASSWORD") ?? "";
      if (!cfgEmail || !cfgPass) {
        return json({ error: "Variabili ADMIN_EMAIL e ADMIN_PASSWORD non impostate nei Secrets" }, 500, cors);
      }
      const email = String(b.email ?? "").trim().toLowerCase();
      const password = String(b.password ?? "");
      if (email !== cfgEmail || password !== cfgPass || password.length < 8) {
        // nessun dettaglio: non si deve capire quale dei due non coincide
        return json({ error: "Credenziali non riconosciute" }, 403, cors);
      }

      // cerca l'account; se manca lo crea, se c'è gli applica la password
      const trovato = await trovaUtente(admin, email);
      let id = trovato?.id ?? null;
      if (id) {
        const { error } = await admin.auth.admin.updateUserById(id, { password, email_confirm: true });
        if (error) return json({ error: "Account trovato ma non aggiornabile: " + error.message }, 500, cors);
      } else {
        const { data, error } = await admin.auth.admin.createUser({
          email, password, email_confirm: true, user_metadata: { nome: "Presidenza" },
        });
        if (error) return json({ error: "Account non creabile: " + error.message }, 500, cors);
        id = data.user.id;
      }
      // profilo con ruolo di presidenza (senza toccare il nome se già c'è)
      const { data: prof } = await admin.from("profiles").select("id,nome").eq("id", id).maybeSingle();
      const nome = prof?.nome || "Presidenza";
      const { error: e2 } = await admin.from("profiles")
        .upsert({ id, nome, ruolo: "presidenza", membership: "academicus" }, { onConflict: "id" });
      if (e2) return json({ error: "Profilo non aggiornato: " + e2.message }, 500, cors);
      return json({ ok: true }, 200, cors);
    }

    // ------------- AZIONI RISERVATE ALLA PRESIDENZA (dal gestionale) -------------
    const auth = req.headers.get("Authorization") ?? "";
    const anon = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await anon.auth.getUser();
    if (!user) return json({ error: "Accesso richiesto" }, 401, cors);
    const { data: chi } = await admin.from("profiles").select("ruolo").eq("id", user.id).single();
    if (!chi || chi.ruolo !== "presidenza") return json({ error: "Riservato alla Presidenza" }, 403, cors);

    const id = String(b.id ?? "");
    if (!id) return json({ error: "Manca l'utente" }, 400, cors);

    if (azione === "imposta-password") {
      const password = String(b.password ?? "");
      if (password.length < 8) return json({ error: "La password deve avere almeno 8 caratteri" }, 400, cors);
      const { error } = await admin.auth.admin.updateUserById(id, { password, email_confirm: true });
      if (error) return json({ error: error.message }, 500, cors);
      return json({ ok: true }, 200, cors);
    }

    if (azione === "conferma-email") {
      const { error } = await admin.auth.admin.updateUserById(id, { email_confirm: true });
      if (error) return json({ error: error.message }, 500, cors);
      return json({ ok: true }, 200, cors);
    }

    return json({ error: "Azione sconosciuta" }, 400, cors);
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 500, cors);
  }

  // scorre gli utenti registrati e trova quello con l'email indicata
  async function trovaUtente(admin: ReturnType<typeof createClient>, email: string) {
    for (let page = 1; page <= 20; page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 500 });
      if (error || !data?.users?.length) return null;
      const u = data.users.find((x: { email?: string }) => (x.email ?? "").toLowerCase() === email);
      if (u) return u;
      if (data.users.length < 500) return null;
    }
    return null;
  }

  function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
    return new Response(JSON.stringify(body), {
      status, headers: { ...headers, "content-type": "application/json" },
    });
  }
});
