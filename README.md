# La Pacifica Res Publica — Portale online (Supabase + Netlify)

> **Novità della versione 1.93 — gli accessi li gestisce il programma**
> Le password non si toccano più dal pannello di Supabase:
> - **Amministratore da variabile**: l'account amministratore si imposta con
>   le variabili riservate **ADMIN_EMAIL** e **ADMIN_PASSWORD** (Supabase →
>   Edge Functions → Secrets). Al primo accesso con quelle credenziali il
>   portale crea o ripara da solo l'account (ruolo presidenza, email
>   confermata). Per cambiare la password dell'amministratore basta cambiare
>   la variabile.
> - **Nuova password dal gestionale**: in *Presidenza → Contenuti → Utenti →
>   Modifica* c'è il campo «Nuova password»: la imposta la Presidenza e
>   conferma anche l'email dell'utente.
> Serve la nuova Edge Function **`gestione-accessi`** pubblicata su Supabase
> **senza** la verifica JWT (vedi guida 1.93). La chiave service_role resta
> sul server; su Render non va aggiunto nulla.

> **Novità della versione 1.92 — il Percorso di Pace**
> Il portale ospita il **Percorso di Pace a quattro livelli** (voce di menu
> «Percorso di Pace»):
> 1. **Esploratore di Pace** — registrazione gratuita dal portale (riaperta la
>    scheda «Inizia il Percorso di Pace» nella pagina di accesso) e
>    collegamento al corso introduttivo gratuito sulla Pace Positiva
>    (Positive Peace Academy / IEP — solo link, nessun contenuto ricaricato).
> 2. **Costruttore di Pace** — dopo il corso: caricamento dell'attestato
>    oppure questionario di rientro; attestato della Pacifica «Primo passo di
>    pace» stampabile, Quaderno di Pace e lezione omaggio.
> 3. **Accademico** — corso singolo o abbonamento Academicus.
> 4. **Ambasciatore di Pace** — candidatura (arriva in *Presidenza →
>    Richieste*); il livello si assegna da *Utenti → Modifica*.
> Link e documenti del percorso si cambiano da *Presidenza → Contenuti →
> Testi delle pagine* (chiavi `percorso.*`). Serve la migrazione
> `0027_percorso_di_pace.sql` e, su Supabase, riattivare **Allow new users
> to sign up** (Authentication → Sign In / Providers).

> **Novità della versione 1.91 — il gestionale dell'associazione**
> In *Presidenza → Contenuti* c'è il gruppo **Amministrazione**:
> - **Clienti** e **Fornitori** — il database delle anagrafiche (il cliente può
>   essere collegato all'account del portale di chi si registra).
> - **Prodotti** — il catalogo, con le **famiglie** (es. Corsi, Libri, Serie TV)
>   e il collegamento ai contenuti del portale.
> - **Pacchetti prodotti** — ogni pacchetto ha un nome identificativo e raccoglie
>   famiglie intere o singoli prodotti; le modalità dell'abbonamento si
>   definiscono qui, come pacchetti.
> - **Acquisti ed erogazioni** — si registra l'acquisto (bonifico, carta,
>   contanti…) e si rilascia l'**erogazione liberale numerata** (progressivo per
>   anno) con la ricevuta stampabile (art. 83 D.Lgs. 117/2017).
> Inoltre: i **libri** hanno il link di vendita Amazon e la lettura online
> inclusa nell'abbonamento Academicus; il **Video On Demand** raggruppa i video
> in **serie TV** (serie, stagione, episodio). Serve la migrazione
> `0026_crm_amministrazione.sql`.

> **Novità della versione 1.90 — gestione corsi e portale**
> - **Le sette aree formative**: ogni corso ha la sua area (campo nel gestionale) e
>   l'Accademia mostra i corsi raggruppati per area, con filtro dedicato.
> - **I venti corsi canonici**: la migrazione `0025_aree_formative.sql` rinomina gli
>   otto corsi esistenti sui titoli del progetto (conservando lezioni, acquisti e
>   progressi) e crea i dodici mancanti come **bozze** da completare e pubblicare.
>   Prezzo del corso singolo: **159 €**.
> - **Crea account dal gestionale**: in *Presidenza → Contenuti → Utenti* c'è
>   «+ Crea account» (nome, email, password provvisoria, ruolo, membership).
>   Serve la nuova Edge Function **`crea-utente`** pubblicata su Supabase.

Ecosistema digitale integrato (un solo account, una sola dashboard, quattro pilastri):

- **I · Parlamento dei Giovani** — 150 seggi, 7 commissioni, proposte di legge e votazioni
- **II · Accademia** — il Percorso di Pace in 8 corsi
- **III · Video On Demand** — documentari, lezioni, conferenze
- **IV · Biblioteca con motore IA** — audiolibri e testi (anche libri interi in capitoli, importabili da PDF) da leggere e ascoltare, con sintesi e percorsi su misura
- **V · Campus** — campus formativi in presenza all'Abbazia di Maguzzano, con possibilità di soggiorno
- **VI · Eventi** — mostre ed eventi de La Pacifica (partecipazione legata alla membership); primo evento: Speculum 2027

**Porta d'ingresso pubblica** — chi non ha effettuato l'accesso vede una landing costruita
attorno alla *Scuola di Atene* di Raffaello: i Sette Principi, i sei pilastri e i **servizi
gratuiti realmente fruibili senza account** (lettura dei testi liberi e ascolto con voce IA,
video gratuiti), con inviti discreti a iscriversi o a diventare *Civis*. È una modifica solo
di frontend (`public/js/app.js` + `public/css/styles.css` + `public/img/`): nessuna nuova
migrazione o variabile, il deploy resta identico.

**L'immagine dell'hero** — `public/img/scuola-di-atene.{webp,jpg}` (1280×808, servite via
`<picture>`: WebP con fallback JPEG). È l'affresco ritagliato sopra il dado decorativo.
L'opera è di pubblico dominio (Raffaello Sanzio, 1509–1511); la didascalia in basso a destra
la attribuisce ai Musei Vaticani. Note tecniche sull'hero:

- Il testo poggia su una **lastra in vetro** (`.lp-hero-copy`, `backdrop-filter`) invece che
  su un velo diffuso: sul marmo chiaro del dipinto nessuna sfumatura raggiungeva il contrasto
  AA, mentre la lastra lo garantisce per costruzione (misurato: 5,1:1 l'occhiello, 8,7:1 l'H1).
  C'è un fallback `@supports` per i browser senza `backdrop-filter`.
- L'inquadratura (`transform:translateX(6%) scale(1.12)`) sposta il fuoco del dipinto a destra
  della lastra, così **Platone e Aristotele restano scoperti**; il prezzo è circa l'11% del
  bordo destro. Se preferisci il dipinto integro, togli la `transform` e allarga
  `.lp-hero-copy` a `max-width:700px`: i due filosofi finiranno dietro il vetro smerigliato.
- Sotto i 1000px l'hero si impila (dipinto in fascia, testo su fondo pieno): a quelle larghezze
  la lastra coprirebbe l'intero affresco.
- Il file sorgente è a 1280px: su schermi molto larghi c'è un leggero ingrandimento. Per più
  nitidezza basta sostituire i due file con una scansione più grande, stesso nome e proporzioni.

**Architettura**: sito statico (HTML/CSS/JS) su **Netlify**, backend **Supabase**
(database PostgreSQL + autenticazione + Row Level Security), **pagamenti reali con
Stripe** (Edge Function + webhook). La configurazione viene iniettata in build dalle
variabili d'ambiente: non si modificano file a mano.

```
portal/
├── public/                          → ciò che Netlify pubblica
│   ├── index.html
│   ├── css/styles.css
│   └── js/{config.js, db.js, app.js}
├── scripts/build-config.js          → genera config.js dalle variabili d'ambiente
├── supabase/
│   ├── migrations/
│   │   ├── 0001_init.sql            → profili, seggi, acquisti, proposte (RLS)
│   │   ├── 0002_content.sql         → contenuti gestibili dalla Presidenza
│   │   ├── 0003_payments.sql        → pagamenti, scadenze, prezzi membership
│   │   ├── 0004_campus.sql          → Campus in presenza (Abbazia di Maguzzano)
│   │   ├── 0005_texts.sql           → Biblioteca dei testi (leggi + ascolta)
│   │   ├── 0006_events.sql          → Eventi e mostre (Speculum 2027)
│   │   └── 0007_chapters.sql        → Capitoli strutturati per i testi/libri
│   └── functions/
│       ├── ia/                      → motore IA della Biblioteca (facoltativo)
│       ├── create-checkout/         → crea la sessione di pagamento Stripe
│       └── stripe-webhook/          → attiva l'acquisto dopo l'incasso verificato
├── netlify.toml
├── .env.example
└── README.md
```

In sintesi servono tre cose: **un progetto Supabase**, **un account Stripe**
(facoltativo finché non vuoi incassare), **un sito Netlify**. Sotto, passo per passo.

---


## Livelli di accesso ai video

I livelli **sono dati, non codice**: stanno nella tabella `access_levels` e la
presidenza li crea, li modifica e li spegne dal CMS (Presidenza → Contenuti →
Livelli). Nessuna migrazione per inventare un livello nuovo.

La regola di ogni livello non e' SQL scritto a mano (sarebbe una porta aperta),
ma tre campi dichiarativi:

| campo | significato |
|---|---|
| `ospiti` | il livello vale anche senza account |
| `memberships` | quali abbonamenti lo soddisfano (`free`, `civis`, `academicus`) |
| `ruoli` | quali ruoli lo soddisfano (`iscritto`, `delegato`, `presidenza`) |

Basta **una** condizione soddisfatta. La presidenza vede sempre tutto: un livello
senza nessuna spunta resta visibile solo a lei, ed e' cosi' che si tiene una bozza.

Ruolo e abbonamento sono **assi indipendenti** — un delegato puo' essere `free` —
quindi non esiste una scala unica: servono due elenchi. Verificato: un delegato
gratuito vede i video dei delegati ma non quelli Civis.

### Perche' l'indirizzo del video sta in una tabella a parte

La RLS di Postgres filtra le **righe**, non le colonne. Finche' `url` stava dentro
`videos`, chiunque potesse leggere i metadati poteva leggersi anche il link
chiamando le API a mano: il blocco viveva solo nell'interfaccia. Ora:

- `videos` — metadati e `livello`: **leggibile da tutti**, anche dagli ospiti. Serve
  perche' le vetrine bloccate si vedano e invoglino l'abbonamento.
- `video_sources` — solo `video_id` e `url`: protetta da `puo_vedere_video()`.
  **L'indirizzo non esce dal server** per chi non ha diritto.

Il browser chiede l'url solo al clic su *Guarda* (`DB.videoUrl`). Il controllo in
`playVideo()` serve a disegnare l'interfaccia; la parola definitiva ce l'ha la RLS.

Matrice verificata eseguendo le migrazioni su PostgreSQL 16 (non solo rileggendole):

```
                  pubbl  iscr civis  acad deleg bozza
ospite              SI     .     .     .     .     .
iscritto free       SI    SI     .     .     .     .
civis               SI    SI    SI     .     .     .
academicus          SI    SI    SI    SI     .     .
delegato (free)     SI    SI     .     .    SI     .
presidenza          SI    SI    SI    SI    SI    SI
```

La stessa matrice e' riprodotta lato browser da `test_livelli.mjs`, per garantire
che l'interfaccia non dica cose diverse dal server.

### Migrazione 0008 — cosa cambia nel database

Da applicare in Supabase (SQL Editor o `supabase db push`). E' idempotente.
Attenzione: **rimuove `videos.gratuito` e `videos.url`**. I dati esistenti vengono
travasati prima (`gratuito=true` → livello `pubblico`, altrimenti `civis`; gli `url`
finiscono in `video_sources`). Concede anche l'esecuzione di `is_presidency()` al
ruolo `anon`, che serve alle nuove policy aperte agli ospiti.



## Dossier legislativi europei (Parlamento dei Giovani)

Materia prima per le commissioni: le procedure legislative in corso al Parlamento
europeo, prese dall'**Osservatorio legislativo (OEIL)**. Migrazione `0009_dossier.sql`.

**Non stanno in `proposals`.** Quella tabella pretende `autore_id` verso un profilo
reale: una legge europea non e' la proposta di uno studente. Il legame e' inverso —
`proposals.dossier_id` permette a una proposta di **citare** il dossier che l'ha
ispirata, senza falsificare paternita' ne' voti.

### Si mappa per tema, non per commissione europea

Due ragioni, la seconda decisiva:

1. Le commissioni di questo progetto sono **tematiche** (Pace, Etica, Diritti...),
   quelle europee sono **per materia** (ITRE, LIBE, ENVI). La traduzione e' una
   scelta editoriale, non un dato scaricabile.
2. I dossier appena pubblicati **non hanno ancora una commissione**: dicono
   "Pending final decision on the referral". Il tema invece ce l'hanno dal primo
   giorno. Verificato su `2026/0138(COD)` (*Cloud and AI Development Act*): senza
   commissione UE, ma smistato correttamente a *Conoscenza ed Etica* e *Bene Comune*
   grazie ai temi `3.30.06` e `2.10.02`. Mappando per commissione sarebbe sparito.

### La mappatura tema -> commissione

Costruita sull'albero **reale** dei temi OEIL (443 voci). Verificata per doppia
fonte: i codici `2.10.02`, `3.30.06`, `3.45.01` e `7.30.05` letti a mano sulle schede
OEIL combaciano con l'elenco pubblicato da Parltrack. 49 prefissi su 7 commissioni.

Il confronto e' per **prefisso**: `6.10` cattura `6.10.05` e tutto il ramo. Cambiando
una riga di `commissione_temi` **tutti** i dossier si rimappano: nessuna reimportazione.
La stessa regola e' rispecchiata nel browser (`dossierCommissioni`) e verificata contro
PostgreSQL da `test_dossier.mjs`.

Resta una **scelta editoriale**, non un dato: si modifica dal CMS (Contenuti -> Temi UE)
senza migrazioni. Alcuni innesti sono deliberati e discutibili:

- `3.70.20 Sviluppo sostenibile` -> **Memoria e Futuro** (non Bene Comune): e' il
  "custodire per costruire" del motto.
- `4.20.02.04 Genetica e bioetica` -> **Conoscenza ed Etica** (non Sanita'/Bene Comune).
- `3.30.08 Stampa, liberta' e pluralismo dei media` **non e' mappato**: sta a meta' fra
  Diritti e Conoscenza, la scelta e' vostra.

### Cio' che non si mappa, si segnala

`temi_non_mappati()` elenca i codici che l'import incontra ma nessuno ha assegnato, con
quanti dossier li portano. Il sistema non forza mai un dossier dentro una commissione:
verificato che `3.45.01 Company law` (dossier *EU Inc.*) e `7.30.05 Police cooperation`
(*Europol*) restano **non mappati** invece di finire nel posto sbagliato. La presidenza
decide dal CMS.

### Fonte e licenza

OEIL espone `European Union, 2026 - Source: European Parliament`: riutilizzabile con
attribuzione, che il pannello riporta. Link stabili:
`https://oeil.europarl.europa.eu/oeil/en/procedure-file?reference=2026/0138(COD)`.

### Importazione automatica: fonte candidata

Filtro concordato: **solo le procedure in corso, per tema, ultimi mesi** (non i 22.210
dossier in archivio: una commissione lavora su una manciata di fascicoli vivi).

OEIL non espone un'API JSON documentata e l'indirizzo del suo export XML non e'
pubblico. La fonte candidata e' **Parltrack** (`parltrack.org/dumps`), che raschia OEIL
e ne pubblica i dossier in JSON sotto **ODbL**, con pagine per singolo tema
(`/subject/6.10.05`) che combaciano esattamente col filtro concordato. Da verificare
prima di adottarlo: freschezza del dump e struttura del JSON. In alternativa resta
l'export XML di OEIL, per cui serve un file di esempio.

### Nota storica

La banca dati ha **22.210 procedure**: un riversamento non serve a nessuno, servono i
dossier vivi per commissione. OEIL offre un export **XML** dalla pagina di ricerca, ma
l'indirizzo di quell'export non e' documentato pubblicamente e non e' raggiungibile da
qui. Per scrivere il parser serve **un file di export XML di esempio** (pagina di
ricerca OEIL → Export → xml). Con quello l'importatore si scrive sulla struttura vera
invece che a indovinare.


## Mecenati: formule, impegni, accessi

Migrazione `0010_mecenati.sql`. Percorso: la presidenza definisce le **formule**
("X euro -> X accessi"), il mecenate **sottoscrive un impegno** con i suoi dati e
riceve un riferimento da usare come causale, la presidenza **conferma l'accredito** e
solo allora vengono emessi i **voucher**, che chi li riceve riscatta.

### L'IBAN non sta nel codice

I dati dell'ente (denominazione, CF, P.IVA, sede, intestatario, **IBAN**, banca, PEC,
URL dell'informativa) vivono in `settings` e si compilano dal CMS (Presidenza ->
Contenuti -> Ente). Nessuna coordinata bancaria dentro il repository: si cambia banca
senza un rilascio, e chi legge il codice non trova l'IBAN.

`dati_ente()` espone **solo** quelle dieci chiavi: `settings` puo' contenere altro e
non deve uscire tutta. Finche' l'IBAN e' vuoto, chi sottoscrive riceve un avviso
("ti contatteremo") invece di coordinate vuote o sbagliate.

### Perche' non si riusano i codici dei seggi

`seats` ha `check (n between 1 and 150)` e `generate_codes` si ferma a 150: sono i
seggi del Parlamento. Un mecenate che compra 50 accessi formativi, attingendo da li',
consumerebbe i posti dei delegati. Da qui `voucher`: meccanismo separato, senza tetto,
con codici `PAX-XXXX-XXXX`.

### Cosa e' sigillato (verificato su PostgreSQL 16)

| prova | esito |
|---|---|
| ospite sottoscrive e riceve riferimento + IBAN | riesce |
| ospite legge gli impegni altrui (dati personali) | **0 righe** |
| ospite/iscritto legge i codici voucher | **0 righe** |
| sottoscrizione senza consenso al trattamento | respinta |
| email malformata | respinta |
| iscritto riscatta un voucher | `free` -> `academicus` |
| stesso codice riusato | "Codice gia' utilizzato" |
| iscritto emette accessi da solo | "Riservato alla Presidenza" |
| impegno gia' pagato, secondo tentativo | respinto: **nessuna doppia emissione** |

### La conferma dell'accredito e' manuale, di proposito

Nessun automatismo segna "pagato". Il bonifico lo riconcilia una persona guardando la
causale sul conto: un automatismo che si fida di quanto dichiara chi compila il modulo
regalerebbe 50 accessi a chi non ha versato nulla.

### Da decidere con il commercialista

Le formule sono strutturate come **vendita** ("X euro a fronte di X pacchetti
formativi"), non come erogazione liberale: c'e' una controprestazione. In Italia le due
cose hanno trattamento fiscale diverso, e una donazione con controprestazione non e'
una donazione. La parola "mecenate" nella pagina e' evocativa: se ai sottoscrittori
verra' comunicato un beneficio fiscale, la formulazione va verificata con un
commercialista prima della pubblicazione. Qui non si da' consulenza fiscale.


### Le quattro formule di partenza (migrazione `0011`)

Arrivano **spente** (`attivo = false`): sono proposte, non decisioni. La presidenza le
vede nel CMS, le corregge e le accende. Nessun prezzo va in pagina da solo.

| formula | importo | accessi | concede | EUR/accesso | sotto listino |
|---|---|---|---|---|---|
| Amicus | 1.000 | 12 | Civis | 83,33 | 6,4% |
| Fautor | 3.000 | 10 | Academicus | 300,00 | 6,2% |
| Patronus | 8.000 | 30 | Academicus | 266,67 | 16,7% |
| Mecenas | 20.000 | 80 | Academicus | 250,00 | 21,9% |

Listino di riferimento gia' nel portale: Civis 89 EUR/anno, Civis Academicus 320
EUR/anno. Lo sconto **cresce** con l'importo: la formula piu' grande e' sempre la piu'
conveniente e nessuno scaglione e' dominato da un altro.

Scala dei nomi romana, coerente con Civis / Res Publica / Academicus:
Amicus -> Fautor -> Patronus -> **Mecenas** (Gaio Mecenate, protettore di Virgilio e
Orazio: l'origine della parola "mecenate").

**Due avvertenze prima di accenderle.**

1. *Concorrenza col listino.* A 250 EUR il Patronus/Mecenas costa meno dei 320 EUR al
   pubblico. Per un privato non cambia nulla, ma **una scuola conviene che passi dalla
   formula mecenate invece di comprare 30 abbonamenti**. Se non e' voluto, servono
   scaglioni piu' vicini al listino o una formula dedicata agli istituti.
2. *"Divulgazione" non ha casa.* Le formule sanno dire solo "X accessi". Un mecenate che
   volesse finanziare una serie di video aperti a tutti, o il restauro di un testo, oggi
   non ha una formula che lo esprima: andrebbe aggiunto un tipo diverso da
   `membership`/`pacchetto`.


## Rassegna sulla pace: notizie ed eventi

Migrazioni `0012_rassegna.sql` + Edge Function `rassegna`. Due sezioni separate,
visibili a tutti (anche agli ospiti): **notizie** da feed RSS e **eventi/iniziative**
con data. Voce di menu "La pace oggi" per chi ha l'account, sezione dedicata nella
porta d'ingresso per gli ospiti.

### Le notizie sono automatiche, ma con due freni a mano

Le fonti sono **dati**: la presidenza incolla l'URL del feed nel CMS (Contenuti ->
Rassegna). Parte una fonte candidata SPENTA: `UN News - Peace and Security`. L'URL
esatto di quel feed non e' documentato in forma stabile; la presidenza lo verifica e
accende la fonte. La sincronizzazione avvia la Edge Function, che scarica il feed e fa
un upsert per `(fonte, guid)`: rilanciarla non crea doppioni.

Anche se la pubblicazione e' automatica:
- **`fonti.attiva`** spegne un'intera testata senza cancellare nulla;
- **`notizie.nascosta`** toglie il singolo articolo dalla pagina in un clic (bottone
  "Nascondi" nel CMS).

Su un tema sensibile come la pace, "automatico" non deve voler dire "non posso piu'
intervenire": entrambi i freni sono nel CMS.

### La funzione server non si fida del feed

Il feed e' HTML di terzi. La Edge Function estrae solo titolo, link, data, sommario e
un'eventuale immagine, e **ripulisce tutto da ogni tag** prima di salvarlo: la pagina
non incorpora mai l'HTML del feed. Gli URL sono accettati solo se `http(s)`. Verificato
con feed ostili (16 test): `<script>`, `<img onerror>`, `javascript:`, `data:` ed
entita' doppie vengono neutralizzati. Un caso ha rivelato un bug reale in fase di
collaudo: una notizia con link malevolo veniva **scartata** invece di essere
conservata con l'URL svuotato; corretto (il titolo resta, il link no).

Seconda difesa nel browser: anche se un dato malevolo arrivasse comunque nel database,
`esc()` lo mostra come testo, non come markup attivo. Verificato in `test_rassegna.mjs`.

### Perche' gli eventi sono una tabella a parte

Una marcia o una conferenza ha una data e un luogo, si mette in agenda e si ordina per
data futura: non e' una notizia di cronaca. `eventi_pace` e' curata a mano dalla
presidenza; gli eventi passati e le bozze non compaiono in pagina.

### Backend verificato su PostgreSQL 16

| prova | esito |
|---|---|
| re-import dello stesso feed | nessun doppione; il titolo si aggiorna (upsert) |
| ospite legge le notizie pubbliche | riesce |
| articolo nascosto | sparisce dalla pagina |
| fonte spenta | tutte le sue notizie spariscono |
| un iscritto prova a importare | "Riservato alla Presidenza" |

### Cosa manca per il "ogni giorno" automatico

La sincronizzazione oggi si lancia dal CMS a mano. Per aggiornarla da sola serve uno
**scheduler** (Supabase `pg_cron`, o un cron esterno che chiami la Edge Function una
volta al giorno). E' una riga di configurazione, non altro codice; la lascio a valle
perche' dipende dal piano Supabase.


## Parte 1 — Supabase (database, account, sicurezza)

1. Crea il progetto su [supabase.com](https://supabase.com) → **New project**
   (regione Europe — Frankfurt).
2. **SQL Editor → New query**: esegui, **in ordine**, il contenuto di:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_content.sql`
   - `supabase/migrations/0003_payments.sql`
   - `supabase/migrations/0004_campus.sql`
   - `supabase/migrations/0005_texts.sql`
   - `supabase/migrations/0006_events.sql`
   - `supabase/migrations/0007_chapters.sql`
3. Imposta un **codice di fondazione** tuo e segreto (serve al primo amministratore):
   ```sql
   update public.app_config set value = 'IL-TUO-CODICE-SEGRETO' where key = 'founder_code';
   ```
4. **Authentication → Providers → Email**: attivo. Per le prove puoi disattivare
   temporaneamente *Confirm email* (riattivalo prima del lancio).
5. **Project Settings → API**: annota **Project URL** e chiave **anon public**
   (la chiave anon è pubblica; la sicurezza è data dalle policy RLS — non usare mai
   la `service_role` nel frontend).

---

## Parte 2 — Netlify (pubblicazione, configurazione automatica)

1. Carica la cartella `portal/` su GitHub.
2. Su [netlify.com](https://netlify.com) → **Add new site → Import from Git** →
   seleziona il repository. Netlify legge `netlify.toml` (publish `public`,
   build `node scripts/build-config.js`).
3. **Site settings → Environment variables**: aggiungi
   - `SUPABASE_URL` = l'URL del progetto
   - `SUPABASE_ANON_KEY` = la chiave anon
   - `FUNCTIONS_BASE` = `https://IL-TUO-PROGETTO.supabase.co/functions/v1` *(facoltativa, deriva da sola)*
   - `STRIPE_ENABLED` = `true` *(solo dopo aver fatto la Parte 3; altrimenti ometti)*
4. **Deploy**. La build genera `public/js/config.js` dalle variabili e pubblica il sito.
5. Torna in **Supabase → Authentication → URL Configuration** e metti l'indirizzo
   Netlify in *Site URL* e *Redirect URLs*.

> **Sviluppo in locale** (facoltativo): apri `public/js/config.js`, inserisci i due
> valori Supabase e avvia `npx serve public -l 3000`.

---

## Parte 3 — Stripe (pagamenti reali)

Senza questa parte il portale funziona già: acquisti e abbonamenti si attivano in
modo **dimostrativo** (nessun incasso). Per incassare davvero:

1. Crea un account [stripe.com](https://stripe.com) e prendi la **Secret key**
   (`sk_live_...` o `sk_test_...` per le prove).
2. Installa la CLI Supabase e collega il progetto:
   ```bash
   npm i -g supabase
   supabase login
   supabase link --project-ref IL-TUO-PROJECT-REF
   ```
3. Imposta i segreti (restano sul server, mai nel browser):
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_...
   supabase secrets set SITE_URL=https://pacifica.netlify.app
   ```
4. Pubblica le funzioni:
   ```bash
   supabase functions deploy create-checkout
   supabase functions deploy stripe-webhook --no-verify-jwt
   ```
5. In **Stripe → Developers → Webhooks → Add endpoint**:
   - URL: `https://IL-TUO-PROGETTO.supabase.co/functions/v1/stripe-webhook`
   - Eventi: `checkout.session.completed`, `customer.subscription.deleted`
   - Copia il **Signing secret** e impostalo:
     ```bash
     supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
     ```
6. In Netlify imposta `STRIPE_ENABLED=true` e fai un nuovo deploy.

**Come funziona**: quando l'utente compra, il browser chiama `create-checkout`, che
calcola il prezzo *sul server* (leggendo il catalogo: il prezzo non è falsificabile)
e apre il pagamento Stripe. Solo dopo l'incasso, Stripe chiama `stripe-webhook`, che
con la chiave service-role registra l'acquisto o attiva la membership. I prezzi sono
in euro: corsi/pacchetti = una tantum; **Civis** = abbonamento mensile; **Academicus**
= pagamento annuale. L'annullamento dell'abbonamento Civis riporta automaticamente a Free.

I prezzi (corsi, pacchetti, percorso e membership) si modificano dalla sezione
**Presidenza → Contenuti**, senza toccare il codice.

---

## Parte 4 — Motore IA della Biblioteca (facoltativo)

```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase functions deploy ia
```
Con `FUNCTIONS_BASE` impostata, l'IA viene raggiunta automaticamente su
`FUNCTIONS_BASE/ia`. Senza, la lettura vocale resta attiva (sintesi del browser) e
le analisi IA mostrano un avviso.

---

## Come si usa il portale

- **Iscritto** — registrazione con email e password: parte gratuito.
- **Presidenza** — si registra con il **codice di fondazione**. Da *Presidenza* gestisce
  i **delegati** (genera codici `PRP-XXXX-XXXX`) e i **contenuti** (corsi, video,
  audiolibri, pacchetti, prezzi).
- **Delegato** — si registra con un codice della Presidenza: riceve seggio, commissione
  e accesso completo come borsa di studio.

Membership: **Free**, **Civis** (VOD + Biblioteca + IA), **Civis Academicus** (tutto,
inclusi gli 8 corsi).

---

## Sicurezza (cosa è garantito dal database)

- Nessuno può promuoversi a delegato/Presidenza: avviene solo con codice valido,
  tramite funzioni protette.
- I codici dei seggi sono leggibili **solo dalla Presidenza**.
- Solo delegati e Presidenza depositano proposte e votano; ognuno vede solo i propri
  acquisti e pagamenti.
- I contenuti li modifica **solo la Presidenza**; gli altri leggono i contenuti pubblicati.
- Acquisti e membership si attivano **solo dal webhook Stripe** (incasso verificato),
  mai dal browser. La chiave segreta Stripe e la service-role restano sul server.

---

## Risoluzione problemi

- **"Collega Supabase"**: variabili d'ambiente mancanti o errate (Parte 2).
- **Errore in registrazione**: *Confirm email* attivo → conferma da email o disattivalo
  per le prove.
- **Logout al ricaricamento**: aggiungi l'indirizzo del sito ai *Redirect URLs* in Supabase.
- **Il pagamento non attiva nulla**: webhook non configurato o `STRIPE_WEBHOOK_SECRET`
  errato; controlla i log in Supabase → Edge Functions.
- **IA non risponde**: `FUNCTIONS_BASE` mancante o funzione `ia` non pubblicata.
