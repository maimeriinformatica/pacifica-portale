/* =====================================================================
   CONFIGURAZIONE — La Pacifica Res Publica
   ---------------------------------------------------------------------
   ATTENZIONE: SUPABASE_URL deve essere SOLO l'indirizzo del progetto,
   SENZA "/functions/v1" in coda. Quel suffisso va unicamente in
   FUNCTIONS_BASE.

   La chiave "anon" è PUBBLICA: può stare nel sito. La sicurezza dei dati è
   garantita dalle Row Level Security del database. Non inserire MAI qui la
   chiave "service_role".
   ===================================================================== */
window.PACIFICA_CONFIG = {
  SUPABASE_URL:      "https://wpqdvyvapsqryxcqvpat.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_c8pp2TMS67MXAvboxQ8xeA_kl_NStx6",

  // Base delle Edge Function (facoltativa; serve solo a Stripe e al motore IA)
  FUNCTIONS_BASE: "https://wpqdvyvapsqryxcqvpat.supabase.co/functions/v1",

  // true quando Stripe è configurato (Edge Function + webhook). Vedi README.
  STRIPE_ENABLED: false,

  // Endpoint del motore IA. Se vuoto ma FUNCTIONS_BASE è impostato,
  // viene usato FUNCTIONS_BASE + "/ia".
  AI_FUNCTION_URL: ""
};
