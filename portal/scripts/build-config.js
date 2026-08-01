/* =====================================================================
   build-config.js — genera public/js/config.js dalle variabili d'ambiente
   Eseguito da Netlify in fase di build (vedi netlify.toml).
   Così non serve modificare file a mano e nulla di segreto resta nel repo.

   Variabili d'ambiente da impostare in Netlify (Site settings -> Environment):
     SUPABASE_URL        (obbligatoria)
     SUPABASE_ANON_KEY   (obbligatoria, chiave pubblica)
     FUNCTIONS_BASE      (facoltativa) es. https://xxx.supabase.co/functions/v1
     STRIPE_ENABLED      (facoltativa) "true" per attivare i pagamenti reali
     AI_FUNCTION_URL     (facoltativa) altrimenti deriva da FUNCTIONS_BASE
   ===================================================================== */
const fs = require("fs");
const path = require("path");

const env = process.env;
const url = env.SUPABASE_URL || "";
const anon = env.SUPABASE_ANON_KEY || "";
let funcs = env.FUNCTIONS_BASE || "";
if (!funcs && url) funcs = url.replace(/\/+$/, "") + "/functions/v1";

const cfg = {
  SUPABASE_URL: url,
  SUPABASE_ANON_KEY: anon,
  FUNCTIONS_BASE: funcs,
  STRIPE_ENABLED: String(env.STRIPE_ENABLED || "").toLowerCase() === "true",
  AI_FUNCTION_URL: env.AI_FUNCTION_URL || "",
};

const out = "window.PACIFICA_CONFIG = " + JSON.stringify(cfg, null, 2) + ";\n";
const dest = path.join(__dirname, "..", "public", "js", "config.js");
fs.writeFileSync(dest, out);

if (!url || !anon) {
  console.warn("\n⚠️  SUPABASE_URL o SUPABASE_ANON_KEY mancanti: il sito mostrerà la schermata di configurazione.\n");
} else {
  console.log("✓ config.js generato. Stripe:", cfg.STRIPE_ENABLED ? "attivo" : "disattivo",
              "| Functions:", funcs || "(nessuna)");
}
