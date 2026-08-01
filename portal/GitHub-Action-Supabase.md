# Aggiornare Supabase da solo a ogni push (GitHub Actions)

Con questo workflow, ogni `git push` su `main` che modifica la cartella `supabase/`
applica le **migrazioni** al database e ripubblica le **Edge Functions**. Il frontend
lo pubblica Render in parallelo: così un solo push aggiorna tutto.

## Segreti da impostare (una volta)
Su GitHub: **repo → Settings → Secrets and variables → Actions → New repository secret**
- `SUPABASE_ACCESS_TOKEN` — Supabase → *Account → Access Tokens* (token personale)
- `SUPABASE_DB_PASSWORD` — la password del database del progetto
- `SUPABASE_PROJECT_ID` — Supabase → *Project Settings → General → Reference ID*

E nel file `supabase/config.toml` sostituisci `IL-TUO-PROJECT-REF` con lo stesso Reference ID.

## Secret delle funzioni (una volta, lato Supabase)
Il codice delle funzioni si pubblica da solo, ma le loro **chiavi di runtime** vanno
impostate sul progetto (non stanno nel repo). Dalla tua macchina, una volta:
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```
`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` sono già forniti da Supabase alle funzioni.

## Attenzione: le migrazioni vanno in produzione
`supabase db push` applica le migrazioni **al database di produzione**, e le modifiche
allo schema non si annullano da sole. Consigli:
- prova prima le migrazioni in locale o su un progetto di *staging*;
- chi è sul piano Pro può usare il **branching** di Supabase per avere un'anteprima a
  ogni pull request prima di andare in produzione.

## Nota sul webhook Stripe
In `supabase/config.toml` il webhook è marcato `verify_jwt = false`: lo chiama Stripe,
che non invia un token Supabase. Le altre funzioni mantengono la verifica (le chiama il
sito con la sessione dell'utente).
