-- =====================================================================
--  LA PACIFICA RES PUBLICA — Migrazione 0005
--  Biblioteca dei TESTI: letture da leggere a schermo e ascoltare (TTS),
--  con le stesse funzioni IA degli audiolibri. Parte del pilastro Biblioteca.
--  Lettura: utenti autenticati (solo pubblicati). Scrittura: Presidenza.
-- =====================================================================

create table if not exists public.texts (
  id          text primary key,
  titolo      text not null,
  autore      text not null default '',
  commissione text not null default '',
  lettura     text not null default '',     -- es. "10 min di lettura"
  testo       text not null default '',
  gratuito    boolean not null default false,
  ordine      int  not null default 0,
  pubblicato  boolean not null default true,
  updated_at  timestamptz not null default now()
);
alter table public.texts enable row level security;
create policy "texts_read"  on public.texts for select to authenticated
  using (pubblicato = true or public.is_presidency());
create policy "texts_write" on public.texts for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());

-- ----- Dati iniziali: letture (pubblico dominio o originali de La Pacifica) -----
insert into public.texts(id,titolo,autore,commissione,lettura,testo,gratuito,ordine) values
('t1',
 $txt$Articolo 11 della Costituzione$txt$, $txt$Costituzione della Repubblica Italiana$txt$,
 'pace', $txt$2 min di lettura$txt$,
 $txt$«L'Italia ripudia la guerra come strumento di offesa alla libertà degli altri popoli e come mezzo di risoluzione delle controversie internazionali; consente, in condizioni di parità con gli altri Stati, alle limitazioni di sovranità necessarie ad un ordinamento che assicuri la pace e la giustizia fra le Nazioni; promuove e favorisce le organizzazioni internazionali rivolte a tale scopo.»

Una sola frase che contiene un'intera visione del mondo: la pace non come assenza di guerra, ma come ordinamento giusto fra i popoli, per cui vale la pena persino limitare la propria sovranità.$txt$,
 true, 1),
('t2',
 $txt$Che cos'è la pace? Una breve introduzione$txt$, $txt$La Pacifica$txt$,
 'pace', $txt$6 min di lettura$txt$,
 $txt$Siamo abituati a pensare la pace come silenzio delle armi. Ma il silenzio delle armi, da solo, è solo una tregua. La pace vera è qualcosa di più esigente: è la presenza della giustizia, del dialogo, del riconoscimento reciproco.

Costruire la pace non è un atto, è un'abitudine: si allena come si allena un muscolo, con esercizi quotidiani di ascolto, di pazienza, di immaginazione. Questo testo introduce il modo in cui La Pacifica intende la pace lungo tutto il suo Percorso: non un ideale astratto, ma una pratica concreta e quotidiana.$txt$,
 true, 2),
('t3',
 $txt$I Sette Principi, spiegati$txt$, $txt$La Pacifica$txt$,
 'memoria', $txt$9 min di lettura$txt$,
 $txt$I Sette Principi del Manifesto non sono dogmi da recitare, ma chiavi per leggere la realtà. La pace come fondamento. La conoscenza unita alla coscienza. La dignità inviolabile della persona. L'unità nella diversità. La bellezza che educa. Il bene comune. La memoria che costruisce il futuro.

Ognuno di essi è una domanda prima ancora che una risposta: come custodire la pace quando è scomoda? Come sapere senza perdere l'umanità? Questo testo accompagna il lettore attraverso i sette principi, uno per uno, con esempi e spunti di riflessione.$txt$,
 false, 3),
('t4',
 $txt$Il dialogo come arte$txt$, $txt$La Pacifica$txt$,
 'dialogo', $txt$7 min di lettura$txt$,
 $txt$Dialogare non è convincere. Chi entra in un dialogo solo per vincere ha già smesso di ascoltare. Il dialogo è un'arte antica che chiede una virtù rara: la disponibilità a cambiare idea.

Questo testo propone alcune pratiche concrete del dialogo: sospendere il giudizio, riformulare ciò che l'altro ha detto prima di rispondere, distinguere la persona dalla posizione. Strumenti semplici, ma capaci di trasformare un conflitto in un incontro.$txt$,
 false, 4),
('t5',
 $txt$Bellezza e nonviolenza$txt$, $txt$La Pacifica$txt$,
 'arte', $txt$5 min di lettura$txt$,
 $txt$Perché un'accademia per la pace si occupa di bellezza? Perché la bellezza disarma. Un'opera d'arte, una musica, un paesaggio custodito ci ricordano che esiste qualcosa che vale la pena proteggere insieme.

La nonviolenza e la bellezza condividono la stessa radice: il rifiuto di distruggere. Questo breve testo esplora il legame tra educazione estetica e cultura di pace.$txt$,
 false, 5)
on conflict (id) do nothing;

-- Fine migrazione 0005
