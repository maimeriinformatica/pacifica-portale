/* =====================================================================
   CONFIGURAZIONE — La Pacifica Res Publica
   ---------------------------------------------------------------------
   In produzione su Netlify questo file viene RIGENERATO automaticamente
   in fase di build dalle variabili d'ambiente (vedi README e
   scripts/build-config.js). I valori qui sotto servono allo sviluppo locale.

   La chiave "anon" è PUBBLICA: può stare nel sito. La sicurezza dei dati è
   garantita dalle Row Level Security del database. Non inserire MAI qui la
   chiave "service_role".
   ===================================================================== */
window.PACIFICA_CONFIG = {
  SUPABASE_URL:      "https://IL-TUO-PROGETTO.supabase.co",
  SUPABASE_ANON_KEY: "LA-TUA-CHIAVE-ANON-PUBBLICA",

  // Base delle Edge Function, es. https://IL-TUO-PROGETTO.supabase.co/functions/v1
  FUNCTIONS_BASE: "",

  // true quando Stripe è configurato (Edge Function + webhook). Vedi README.
  // Se false, acquisti e abbonamenti si attivano in modo dimostrativo.
  STRIPE_ENABLED: false,

  // Endpoint del motore IA. Se vuoto ma FUNCTIONS_BASE è impostato,
  // viene usato FUNCTIONS_BASE + "/ia".
  AI_FUNCTION_URL: ""
};
