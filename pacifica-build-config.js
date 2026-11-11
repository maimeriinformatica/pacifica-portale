/* =====================================================================
   build-config.js — genera public/js/config.js dalle variabili d'ambiente
   Eseguito da Render (o Netlify) in fase di build: vedi render.yaml.
   Così non serve modificare file a mano e nulla di segreto resta nel repo.

   Variabili d'ambiente da impostare su Render (Environment):
     SUPABASE_URL        (obbligatoria) es. https://xxxx.supabase.co
     SUPABASE_ANON_KEY   (obbligatoria, chiave pubblica)
     FUNCTIONS_BASE      (facoltativa) es. https://xxxx.supabase.co/functions/v1
     STRIPE_ENABLED      (facoltativa) "true" per attivare i pagamenti reali
     AI_FUNCTION_URL     (facoltativa) altrimenti deriva da FUNCTIONS_BASE

   Novembre 2026: lo script ora PULISCE da solo gli indirizzi. Se in
   SUPABASE_URL viene incollato per sbaglio l'indirizzo delle funzioni
   (quello che finisce con /functions/v1), il suffisso viene tolto; e
   FUNCTIONS_BASE viene ricostruita sempre nella forma giusta, senza
   doppioni. Così una svista nelle variabili non spegne più il portale.
   ===================================================================== */
const fs = require("fs");
const path = require("path");

const env = process.env;

// toglie spazi e barre finali
function pulisci(v) {
  return String(v || "").trim().replace(/\/+$/, "");
}

// --- indirizzo del progetto Supabase: MAI con /functions/v1 in fondo ---
let url = pulisci(env.SUPABASE_URL);
const urlOriginale = url;
while (/\/functions\/v1$/.test(url)) url = pulisci(url.replace(/\/functions\/v1$/, ""));
if (url !== urlOriginale) {
  console.warn("⚠️  SUPABASE_URL conteneva /functions/v1: corretto automaticamente in " + url);
}

const anon = String(env.SUPABASE_ANON_KEY || "").trim();

// --- indirizzo delle funzioni: sempre <progetto>/functions/v1, una volta sola ---
let base = pulisci(env.FUNCTIONS_BASE);
while (/\/functions\/v1$/.test(base)) base = pulisci(base.replace(/\/functions\/v1$/, ""));
if (!base) base = url;
const funcs = base ? base + "/functions/v1" : "";

const cfg = {
  SUPABASE_URL: url,
  SUPABASE_ANON_KEY: anon,
  FUNCTIONS_BASE: funcs,
  STRIPE_ENABLED: String(env.STRIPE_ENABLED || "").toLowerCase() === "true",
  AI_FUNCTION_URL: String(env.AI_FUNCTION_URL || "").trim(),
};

const out = "window.PACIFICA_CONFIG = " + JSON.stringify(cfg, null, 2) + ";\n";
const dest = path.join(__dirname, "..", "public", "js", "config.js");
fs.writeFileSync(dest, out);

if (!url || !anon) {
  console.warn("\n⚠️  SUPABASE_URL o SUPABASE_ANON_KEY mancanti: il sito mostrerà la schermata di configurazione.\n");
} else {
  console.log("✓ config.js generato. Database:", url,
              "| Functions:", funcs || "(nessuna)",
              "| Stripe:", cfg.STRIPE_ENABLED ? "attivo" : "disattivo");
}
