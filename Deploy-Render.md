# Pubblicare il portale con GitHub + Render

**In breve:** Render ospita il **frontend statico**; il **backend resta su Supabase**
(database, login, regole RLS, Edge Functions). GitHub è la sorgente di entrambi.

## 1) Frontend su Render (Static Site)
1. Metti il progetto su GitHub.
2. Su Render: **New + → Blueprint**, scegli il repo. Render legge `render.yaml`.
   (In alternativa: **New + → Static Site**, e imposti a mano
   *Build Command* = `node scripts/build-config.js`, *Publish Directory* = `public`.)
3. Imposta le variabili d'ambiente (le trovi su Supabase → *Project Settings → API*):
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY` (chiave **pubblica**; a proteggere i dati è la RLS, non la segretezza della chiave)
   - `FUNCTIONS_BASE` (facoltativa), `STRIPE_ENABLED`, `AI_FUNCTION_URL`
4. Deploy. Render fornisce HTTPS, CDN, dominio `onrender.com` e **auto-deploy a ogni push**.
   Un dominio tuo si aggiunge dalle impostazioni del sito.

## 2) Backend: resta su Supabase
Render **non** ospita queste parti — vanno su Supabase, dal repo, con la Supabase CLI:
- **Migrazioni del database** (`supabase/migrations/*.sql`): `supabase db push`
- **Edge Functions** (`supabase/functions/*`): `supabase functions deploy`
  (create-checkout, ia, stripe-webhook, rassegna)
- Il **webhook di Stripe** va puntato all'URL della funzione Supabase `stripe-webhook`.

Puoi automatizzare anche questo con una GitHub Action che, a ogni push, lancia la
Supabase CLI — ma è un passo successivo, non necessario per partire.

## Perché non tutto su Render?
Render offre anche un suo PostgreSQL, ma il portale è costruito **sull'autenticazione
e sulle regole RLS di Supabase** e sulle sue Edge Functions. Spostare il database su
Render vorrebbe dire riscrivere login, permessi e funzioni: non è "gestire con Render",
è un altro progetto. La divisione naturale è: **Render per il sito, Supabase per il motore.**
