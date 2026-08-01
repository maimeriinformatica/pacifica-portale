-- =====================================================================
--  LA PACIFICA RES PUBLICA — Migrazione 0006
--  Sesto pilastro: EVENTI organizzati da La Pacifica.
--  La partecipazione dipende dall'accesso collegato:
--    'libero'     -> tutti gli iscritti
--    'civis'      -> incluso con Civis o Academicus
--    'academicus' -> incluso con Academicus
--    'biglietto'  -> a pagamento (prezzo); incluso per Academicus
--  Lettura: utenti autenticati (solo pubblicati). Scrittura: Presidenza.
-- =====================================================================

create table if not exists public.events (
  id          text primary key,
  titolo      text not null,
  sottotitolo text not null default '',
  descrizione text not null default '',
  luogo       text not null default '',
  periodo     text not null default '',
  tipo        text not null default 'Evento',
  accesso     text not null default 'libero'
              check (accesso in ('libero','civis','academicus','biglietto')),
  prezzo      int  not null default 0,
  programma   text not null default '',
  ordine      int  not null default 0,
  pubblicato  boolean not null default true,
  updated_at  timestamptz not null default now()
);
alter table public.events enable row level security;
create policy "events_read"  on public.events for select to authenticated
  using (pubblicato = true or public.is_presidency());
create policy "events_write" on public.events for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());

-- ----- Primo evento: Speculum 2027 -----
insert into public.events(id,titolo,sottotitolo,descrizione,luogo,periodo,tipo,accesso,prezzo,programma,ordine) values
('ev1',
 $txt$Speculum 2027$txt$,
 $txt$Lo specchio del sapere: i fogli vinciani di Leonardo e la Scuola di Atene$txt$,
 $txt$Una mostra lunga un anno, scandita in dodici mesi, che mette faccia a faccia due vertici dello spirito umano: i fogli manoscritti di Leonardo da Vinci, dove arte e scienza si fondono, e la Scuola di Atene di Raffaello, dove la filosofia si fa comunità. «Speculum» è lo specchio: ogni mese un foglio vinciano si riflette in una figura del pensiero antico, mostrando come l'osservazione della natura e la ricerca della verità siano lo stesso gesto. Un itinerario per imparare a guardare — e attraverso lo sguardo, a costruire pace.$txt$,
 $txt$Sede espositiva de La Pacifica — in via di definizione$txt$,
 $txt$gennaio – dicembre 2027 (12 mesi)$txt$,
 $txt$Mostra$txt$, 'biglietto', 30,
 $txt$Gennaio — Il volo e l'aria: i fogli sul volo · l'aspirazione al cielo (Platone)
Febbraio — L'acqua e i vortici · Eraclito e il divenire
Marzo — L'anatomia e il corpo · l'uomo misura di tutte le cose (Protagora)
Aprile — Le proporzioni e l'Uomo Vitruviano · Pitagora e il numero
Maggio — La geometria e la prospettiva · Euclide e la dimostrazione
Giugno — La luce e l'ombra · la caverna e la conoscenza (Platone)
Luglio — Le macchine e l'ingegno · Archimede e la tecnica
Agosto — La botanica e la natura · Aristotele e l'osservazione
Settembre — Gli astri e il cosmo · Tolomeo e l'ordine del cielo
Ottobre — Il volto e l'espressione · Socrate e l'etica del carattere
Novembre — Il diluvio e il limite · Diogene e il distacco
Dicembre — Lo specchio: arte e filosofia si riflettono · la sintesi di Atene e Vinci$txt$,
 1)
on conflict (id) do nothing;

-- Fine migrazione 0006
