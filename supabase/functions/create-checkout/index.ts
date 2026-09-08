// =====================================================================
//  Edge Function "create-checkout" — crea una sessione di pagamento Stripe
//  Deploy:  supabase functions deploy create-checkout
//  Segreti: STRIPE_SECRET_KEY, SITE_URL
//
//  Il browser (autenticato) invia { kind, ref } e riceve { url } verso cui
//  reindirizzare. Il prezzo è calcolato SUL SERVER leggendo il catalogo:
//  il client non può alterarlo.
//
//    kind = 'item'        ref = 'corso:c1' | 'pacc:p1' | 'percorso'   -> pagamento una tantum
//    kind = 'membership'  ref = 'civis'                               -> abbonamento mensile
//    kind = 'membership'  ref = 'academicus'                          -> pagamento annuale
// =====================================================================
import Stripe from "npm:stripe@14";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...CORS, "content-type": "application/json" } });

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-06-20" });
const SITE = Deno.env.get("SITE_URL") ?? "";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    // client con il token dell'utente per identificarlo
    const authHeader = req.headers.get("Authorization") ?? "";
    const supa = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await supa.auth.getUser();
    if (!user) return json({ error: "Non autenticato" }, 401);

    const { kind, ref } = await req.json();

    // client service-role per leggere prezzi/profilo in modo affidabile
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const settings: Record<string, string> = {};
    const { data: srows } = await admin.from("settings").select("key,value");
    (srows ?? []).forEach((r: any) => (settings[r.key] = r.value));
    const eur = (v: string | number, def: number) => Math.round((parseFloat(String(v ?? def)) || def) * 100);

    let nome = "", amount = 0, mode: "payment" | "subscription" = "payment", recurring: any = undefined;

    if (kind === "membership") {
      if (ref === "civis") {
        nome = "Membership Civis"; amount = eur(settings["prezzo_civis_mese"], 9.9);
        mode = "subscription"; recurring = { interval: "month" };
      } else if (ref === "academicus") {
        nome = "Membership Civis Academicus (annuale)"; amount = eur(settings["prezzo_academicus"], 320);
      } else return json({ error: "Piano non valido" }, 400);
    } else if (kind === "item") {
      if (ref === "percorso") {
        nome = "Percorso di Pace completo"; amount = eur(settings["prezzo_percorso"], 440);
      } else if (ref.startsWith("campus:")) {
        const parts = ref.split(":");           // campus:<id>[:soggiorno]
        const soggiorno = parts[2] === "soggiorno";
        const { data: cm } = await admin.from("campus").select("titolo,prezzo,prezzo_soggiorno").eq("id", parts[1]).single();
        if (!cm) return json({ error: "Campus non trovato" }, 404);
        nome = cm.titolo + (soggiorno ? " — con soggiorno" : " — partecipazione");
        amount = ((soggiorno ? cm.prezzo_soggiorno : cm.prezzo) ?? 0) * 100;
      } else if (ref.startsWith("evento:")) {
        const { data: e2 } = await admin.from("events").select("titolo,prezzo").eq("id", ref.slice(7)).single();
        if (!e2) return json({ error: "Evento non trovato" }, 404);
        nome = "Biglietto — " + e2.titolo; amount = (e2.prezzo ?? 0) * 100;
      } else if (ref.startsWith("libro:")) {
        const { data: lb } = await admin.from("libri").select("titolo,prezzo").eq("id", ref.slice(6)).single();
        if (!lb) return json({ error: "Libro non trovato" }, 404);
        nome = "Libro — " + lb.titolo; amount = Math.round((Number(lb.prezzo) || 0) * 100);
      } else if (ref.startsWith("pacc:")) {
        const { data: p } = await admin.from("packages").select("nome,prezzo").eq("id", ref.slice(5)).single();
        if (!p) return json({ error: "Pacchetto non trovato" }, 404);
        nome = "Pacchetto " + p.nome; amount = (p.prezzo ?? 0) * 100;
      } else if (ref.startsWith("corso:")) {
        const { data: c } = await admin.from("courses").select("titolo,prezzo").eq("id", ref.slice(6)).single();
        if (!c) return json({ error: "Corso non trovato" }, 404);
        nome = c.titolo; amount = (c.prezzo ?? eur(settings["prezzo_corso"], 69) / 100) * 100;
      } else return json({ error: "Prodotto non valido" }, 400);
      // sconto Civis 20% sui corsi/pacchetti (non su campus ed eventi)
      const { data: prof } = await admin.from("profiles").select("membership").eq("id", user.id).single();
      if (prof?.membership === "civis" && !ref.startsWith("campus:") && !ref.startsWith("evento:")) amount = Math.round(amount * 0.8);
    } else return json({ error: "Tipo non valido" }, 400);

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: amount,
          product_data: { name: nome },
          ...(recurring ? { recurring } : {}),
        },
      }],
      client_reference_id: user.id,
      customer_email: user.email,
      metadata: { kind, ref, uid: user.id },
      ...(mode === "subscription" ? { subscription_data: { metadata: { uid: user.id, ref } } } : {}),
      success_url: `${SITE}/?paid=1`,
      cancel_url: `${SITE}/?canceled=1`,
    });

    return json({ url: session.url });
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});
