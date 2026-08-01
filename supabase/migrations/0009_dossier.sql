-- =====================================================================
-- 0009_dossier.sql
--
-- I dossier legislativi europei (fonte: Osservatorio legislativo del
-- Parlamento europeo, OEIL) come materia prima per le commissioni.
--
-- PERCHE' UNA TABELLA A PARTE E NON `proposals`:
-- `proposals` pretende `autore_id` verso un profilo reale. Una legge
-- europea non e' la proposta di uno studente: e' cio' da cui lo studente
-- parte. Infilarla li' falsificherebbe paternita' ed esiti dei voti.
-- Il legame semmai e' inverso: una proposta puo' citare il dossier che
-- l'ha ispirata (`proposals.dossier_id`, in fondo).
--
-- PERCHE' SI MAPPA PER TEMA E NON PER COMMISSIONE EUROPEA:
-- 1. le commissioni di questo progetto sono tematiche (Pace, Etica,
--    Diritti...), quelle europee sono per materia (ITRE, LIBE, ENVI):
--    la traduzione e' una scelta editoriale, non un dato scaricabile;
-- 2. i dossier appena pubblicati NON hanno ancora una commissione
--    assegnata ("Pending final decision on the referral"), mentre il
--    tema ce l'hanno dal primo giorno. Mappare per commissione farebbe
--    sparire proprio i dossier piu' freschi.
--
-- PERCHE' LA MAPPATURA E' DATI:
-- l'albero dei temi OEIL non e' pubblicato in forma leggibile a macchina.
-- Invece di indovinarlo, l'importatore registra i codici che incontra
-- davvero e la presidenza assegna quelli non ancora mappati dal CMS.
-- La tassonomia si costruisce da sola, sui dati veri.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Mappatura tema OEIL -> commissione. Per PREFISSO: '3.30' cattura
-- 3.30, 3.30.06, 3.30.25... Cosi' una riga copre un ramo intero.
-- ---------------------------------------------------------------------
create table if not exists public.commissione_temi (
  id           bigserial primary key,
  commissione  text not null,
  prefisso     text not null,
  nota         text not null default '',
  updated_at   timestamptz not null default now(),
  unique (commissione, prefisso)
);

alter table public.commissione_temi enable row level security;
drop policy if exists "temi_read"  on public.commissione_temi;
create policy "temi_read"  on public.commissione_temi for select to anon, authenticated using (true);
drop policy if exists "temi_write" on public.commissione_temi;
create policy "temi_write" on public.commissione_temi for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());

-- Mappatura sull'albero REALE dei temi OEIL (443 voci, verificato: i codici
-- 2.10.02, 3.30.06, 3.45.01 e 7.30.05 combaciano con le schede OEIL lette a mano).
-- Confronto per prefisso: '6.10' cattura 6.10.05 e tutto il ramo.
-- Resta una scelta editoriale: modificabile dal CMS senza migrazioni.
insert into public.commissione_temi (commissione, prefisso, nota) values
  -- Pace e Risoluzione dei Conflitti
  ('pace','6.10.02','Politica di sicurezza e difesa comune'),
  ('pace','6.10.03','Controllo degli armamenti, non proliferazione nucleare'),
  ('pace','6.10.04','Situazioni politiche e conflitti locali e regionali'),
  ('pace','6.10.05','Mantenimento della pace, compiti umanitari, gestione delle crisi'),
  ('pace','6.50',   'Aiuti d''emergenza, umanitari, ai rifugiati'),
  ('pace','3.40.09','Industria della difesa e degli armamenti'),
  ('pace','7.30.20','Lotta al terrorismo'),
  -- Conoscenza ed Etica
  ('etica','3.30.06','Tecnologie dell''informazione e digitali (verificato su 2026/0138, Cloud and AI Act)'),
  ('etica','3.30.16','Politica dell''informazione etica'),
  ('etica','3.30.07','Cibersicurezza'),
  ('etica','3.30.25','Reti internazionali dell''informazione, internet'),
  ('etica','3.50',   'Ricerca, sviluppo tecnologico e spazio'),
  ('etica','4.20.02.04','Genetica e bioetica'),
  ('etica','3.40.06','Elettronica, ICT, robotica'),
  -- Diritti della Persona
  ('diritti','1.10',   'Diritti fondamentali nell''UE, Carta'),
  ('diritti','1.20',   'Diritti dei cittadini (voto, petizione, privacy)'),
  ('diritti','4.10.03','Protezione dell''infanzia, diritti dei minori'),
  ('diritti','4.10.04','Parità di genere'),
  ('diritti','4.10.06','Persone con disabilità'),
  ('diritti','4.10.08','Parità di trattamento, non discriminazione'),
  ('diritti','4.10.09','Condizione e diritti delle donne'),
  ('diritti','6.10.08','Libertà fondamentali, diritti umani, democrazia'),
  ('diritti','6.10.09','Situazione dei diritti umani nel mondo'),
  ('diritti','7.30.08','Lotta al razzismo e alla xenofobia'),
  ('diritti','7.40',   'Cooperazione giudiziaria'),
  ('diritti','7.10.06','Asilo, rifugiati, sfollati'),
  -- Dialogo Interculturale e Diplomazia
  ('dialogo','6.10.01','Politica estera e diplomatica comune'),
  ('dialogo','6.20',   'Politica commerciale comune'),
  ('dialogo','6.30',   'Cooperazione allo sviluppo'),
  ('dialogo','6.40',   'Relazioni con i paesi terzi'),
  ('dialogo','4.40.08','Apprendimento delle lingue, lingue regionali e locali'),
  -- Arte e Bellezza
  ('arte','4.45',   'Spazio culturale comune, diversità culturale'),
  ('arte','3.30.01','Industria e servizi audiovisivi'),
  -- Bene Comune
  ('bene','3.70',   'Politica ambientale'),
  ('bene','4.10.05','Inclusione sociale, povertà, reddito minimo'),
  ('bene','4.10.10','Protezione sociale, sicurezza sociale'),
  ('bene','4.15',   'Politica dell''occupazione'),
  ('bene','4.20',   'Sanità pubblica'),
  ('bene','4.60',   'Protezione dei consumatori'),
  ('bene','4.70',   'Politica regionale e coesione'),
  ('bene','2.40.02','Servizi pubblici, di interesse generale, servizio universale'),
  ('bene','2.10.02','Appalti pubblici (verificato su 2026/0138)'),
  ('bene','3.45.07','Economia sociale, mutue, cooperative, associazioni'),
  -- Memoria e Futuro
  ('memoria','8.30.10','Principi comuni agli Stati membri, valori dell''UE'),
  ('memoria','8.10',   'Revisione dei trattati'),
  ('memoria','8.20',   'Allargamento dell''Unione'),
  ('memoria','4.40',   'Istruzione, formazione e gioventù'),
  ('memoria','3.70.20','Sviluppo sostenibile — custodire per costruire'),
  ('memoria','8.40.01.01','Elezioni, suffragio universale diretto')
on conflict (commissione, prefisso) do nothing;

-- ---------------------------------------------------------------------
-- I dossier
-- ---------------------------------------------------------------------
create table if not exists public.dossier (
  id             text primary key,                  -- riferimento OEIL: '2026/0138(COD)'
  titolo         text not null,
  tipo           text not null default '',          -- COD, INI, NLE...
  stato          text not null default '',          -- fase raggiunta
  temi           text[] not null default '{}',      -- codici: {'2.10.02','3.30.06'}
  temi_nomi      text[] not null default '{}',      -- etichette leggibili
  commissioni_ue text[] not null default '{}',      -- puo' essere vuoto: referral pendente
  relatore       text not null default '',
  url            text not null,                     -- scheda OEIL
  url_testo      text not null default '',          -- COM in pdf / EUR-Lex
  data_evento    date,
  livello        text not null default 'iscritti'
                 references public.access_levels(id) on update cascade,
  attivo         boolean not null default true,
  aggiornato_il  timestamptz not null default now()
);
create index if not exists dossier_temi_idx on public.dossier using gin (temi);

-- La regola di mappatura in un posto solo. Cambi una riga di
-- commissione_temi e TUTTI i dossier si rimappano: nessuna reimportazione.
create or replace function public.dossier_commissioni(temi text[])
returns text[]
language sql stable as $$
  select coalesce(array_agg(distinct ct.commissione), '{}'::text[])
  from public.commissione_temi ct
  where exists (select 1 from unnest(temi) t where t like ct.prefisso || '%');
$$;

alter table public.dossier enable row level security;

-- Riusa i livelli di accesso gia' esistenti (0008): chi vede i dossier
-- si decide dal CMS come per i video, senza toccare lo schema.
drop policy if exists "dossier_read"  on public.dossier;
create policy "dossier_read"  on public.dossier for select to anon, authenticated
  using (attivo and public.livello_consentito(livello));
drop policy if exists "dossier_write" on public.dossier;
create policy "dossier_write" on public.dossier for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());

-- ---------------------------------------------------------------------
-- Il legame giusto: la proposta dello studente CITA il dossier.
-- Nessuna legge europea viene mai spacciata per proposta di qualcuno.
-- ---------------------------------------------------------------------
alter table public.proposals add column if not exists dossier_id text
  references public.dossier(id) on delete set null on update cascade;

-- ---------------------------------------------------------------------
-- Quali temi sono arrivati dall'import ma nessuno ha ancora assegnato?
-- E' l'elenco di lavoro della presidenza: la tassonomia si scopre qui.
-- ---------------------------------------------------------------------
create or replace function public.temi_non_mappati()
returns table (codice text, nome text, quanti bigint)
language sql stable security definer set search_path = public as $$
  with esplosi as (
    select unnest(d.temi) as codice, unnest(d.temi_nomi) as nome
    from public.dossier d where d.attivo
  )
  select e.codice, min(e.nome) as nome, count(*) as quanti
  from esplosi e
  where not exists (
    select 1 from public.commissione_temi ct where e.codice like ct.prefisso || '%'
  )
  group by e.codice
  order by count(*) desc, e.codice;
$$;

grant execute on function public.dossier_commissioni(text[]) to anon, authenticated;
grant execute on function public.temi_non_mappati()          to authenticated;
grant select  on public.commissione_temi                     to anon, authenticated;
grant select  on public.dossier                              to anon, authenticated;
