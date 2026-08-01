// =====================================================================
//  Edge Function "stripe-webhook" — attiva l'acquisto dopo l'incasso
//  Deploy:  supabase functions deploy stripe-webhook --no-verify-jwt
//  Segreti: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
//
//  Questo è l'UNICO punto in cui acquisti e membership vengono attivati.
//  Verifica la firma di Stripe, poi scrive nel database con la chiave
//  service-role (quindi in modo affidabile, non falsificabile dal client).
//
//  In Stripe Dashboard -> Developers -> Webhooks aggiungi l'endpoint:
//    https://IL-TUO-PROGETTO.supabase.co/functions/v1/stripe-webhook
//  Eventi: checkout.session.completed, customer.subscription.deleted
// =====================================================================
import Stripe from "npm:stripe@14";
import { createClient } from "jsr:@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-06-20" });
const WH = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig!, WH);
  } catch (e) {
    return new Response("Firma non valida: " + (e as Error).message, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const s = event.data.object as Stripe.Checkout.Session;
      const uid = (s.client_reference_id ?? s.metadata?.uid) as string;
      const kind = s.metadata?.kind;
      const ref = s.metadata?.ref as string;
      if (uid) {
        await admin.from("payments").insert({
          profile_id: uid, kind: kind ?? "item", ref: ref ?? "",
          amount: s.amount_total, stripe_session: s.id,
        });
        if (kind === "item") {
          await admin.from("purchases").upsert(
            { profile_id: uid, item: ref }, { onConflict: "profile_id,item" },
          );
        } else if (kind === "membership") {
          const patch: Record<string, unknown> = { membership: ref };
          if (s.customer) patch.stripe_customer_id = s.customer;
          if (ref === "academicus") {
            const until = new Date(); until.setFullYear(until.getFullYear() + 1);
            patch.membership_until = until.toISOString();
          }
          await admin.from("profiles").update(patch).eq("id", uid);
        }
      }
    } else if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      // abbonamento Civis annullato/scaduto -> torna Free
      await admin.from("profiles").update({ membership: "free" })
        .eq("stripe_customer_id", sub.customer as string);
    }
    return new Response(JSON.stringify({ received: true }), {
      headers: { "content-type": "application/json" },
    });
  } catch (e) {
    return new Response("Errore: " + (e as Error).message, { status: 500 });
  }
});
