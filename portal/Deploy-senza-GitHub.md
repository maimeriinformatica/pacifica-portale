# Pubblicare il portale SENZA GitHub

GitHub non serve in nessun passaggio. Qui trovi due strade per Netlify
(scegline una) e i passaggi Supabase, tutti senza repository Git.

In breve:
- **Strada A — Trascinamento**: nessuno strumento, compili un file e trascini una cartella. Consigliata per partire.
- **Strada B — Netlify CLI**: usa le variabili d'ambiente e la build automatica. Utile soprattutto con Stripe.

---

## Prima di tutto — Supabase (uguale per entrambe le strade)

1. Crea il progetto su [supabase.com](https://supabase.com) → **New project**.
2. **SQL Editor → New query**: esegui, in quest'ordine, il contenuto di:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_content.sql`
   - `supabase/migrations/0003_payments.sql`
   - `supabase/migrations/0004_campus.sql`
   - `supabase/migrations/0005_texts.sql`
   - `supabase/migrations/0006_events.sql`
   - `supabase/migrations/0007_chapters.sql`
3. Imposta il tuo codice di fondazione segreto:
   ```sql
   update public.app_config set value = 'IL-TUO-CODICE-SEGRETO' where key = 'founder_code';
   ```
4. **Authentication → Providers → Email**: attivo (per le prove puoi disattivare
   *Confirm email*).
5. **Project Settings → API**: annota **Project URL** e chiave **anon public**.

Nessun passaggio qui richiede GitHub.

---

## Strada A — Trascinamento (nessuno strumento)

1. Apri il file `public/js/config.js` con un editor di testo e compila:
   ```js
   window.PACIFICA_CONFIG = {
     SUPABASE_URL:      "https://IL-TUO-PROGETTO.supabase.co",
     SUPABASE_ANON_KEY: "eyJ....la-tua-chiave-anon....",
     FUNCTIONS_BASE: "",       // lascia "" finché non usi Stripe/IA
     STRIPE_ENABLED: false,
     AI_FUNCTION_URL: ""
   };
   ```
   Salva.
2. Vai su **[app.netlify.com/drop](https://app.netlify.com/drop)** (o, dentro Netlify,
   la sezione *drag and drop* in fondo alla pagina dei progetti).
3. **Trascina la cartella `public`** (non la cartella `portal`) nell'area di rilascio.
4. In pochi secondi ottieni un indirizzo tipo `https://qualcosa.netlify.app`.
5. Torna in **Supabase → Authentication → URL Configuration** e inserisci quell'indirizzo
   in *Site URL* e *Redirect URLs*.

**Per aggiornare il sito**: modifica i file in `public/` e ritrascina la cartella `public`
nella zona di rilascio (nella pagina *Deploys* del sito).

> Nota: i deploy per trascinamento non eseguono la build, quindi la configurazione
> si scrive a mano in `config.js` (come sopra). È normale e va benissimo.

---

## Strada B — Netlify CLI (senza GitHub, con build automatica)

Richiede Node.js installato sul tuo computer.

1. Installa e accedi:
   ```bash
   npm i -g netlify-cli
   netlify login
   ```
2. Dalla cartella `portal/`, crea un sito senza collegare alcun repository:
   ```bash
   netlify sites:create
   ```
   (oppure `netlify link` se il sito esiste già).
3. Imposta le variabili d'ambiente:
   ```bash
   netlify env:set SUPABASE_URL "https://IL-TUO-PROGETTO.supabase.co"
   netlify env:set SUPABASE_ANON_KEY "eyJ....la-tua-chiave-anon...."
   # facoltative:
   netlify env:set FUNCTIONS_BASE "https://IL-TUO-PROGETTO.supabase.co/functions/v1"
   netlify env:set STRIPE_ENABLED "true"
   ```
4. Pubblica (esegue `scripts/build-config.js` e mette online la cartella `public`):
   ```bash
   netlify deploy --build --prod
   ```
5. Inserisci l'indirizzo ottenuto in **Supabase → Authentication → URL Configuration**.

**Per aggiornare**: ripeti solo `netlify deploy --build --prod`.

> Suggerimento: `netlify deploy --build` (senza `--prod`) crea un'anteprima a un URL
> provvisorio, utile per controllare prima di pubblicare.

---

## Funzioni Stripe e IA (facoltative, sempre senza GitHub)

Le Edge Function si pubblicano con la **CLI di Supabase**, non con GitHub:
```bash
npm i -g supabase
supabase login
supabase link --project-ref IL-TUO-PROJECT-REF

# motore IA della Biblioteca
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase functions deploy ia

# pagamenti Stripe
supabase secrets set STRIPE_SECRET_KEY=sk_...
supabase secrets set SITE_URL=https://IL-TUO-SITO.netlify.app
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook --no-verify-jwt
# poi, in Stripe, crea il webhook verso .../functions/v1/stripe-webhook e:
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```
Dopo aver attivato Stripe, ricordati `STRIPE_ENABLED=true` (in `config.js` con la
Strada A, o come variabile d'ambiente con la Strada B).

---

## Riepilogo

| | Strada A (trascinamento) | Strada B (CLI) |
|---|---|---|
| Strumenti | nessuno | Node.js + netlify-cli |
| Configurazione | a mano in `config.js` | variabili d'ambiente |
| GitHub | no | no |
| Aggiornamenti | ritrascini `public` | `netlify deploy --build --prod` |

Per cominciare in fretta, la **Strada A** è più che sufficiente. La dettagliata
procedura completa resta nel `README.md`.
