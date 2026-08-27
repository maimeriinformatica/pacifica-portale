-- =====================================================================
--  LA PACIFICA RES PUBLICA - TUTTE LE MIGRAZIONI IN UN FILE (20)
--  Da incollare nel SQL Editor di Supabase (New query -> incolla -> Run).
--  RIESEGUIBILE IN SICUREZZA anche su database parzialmente migrato.
--  Novita': l'evento in evidenza diventa ENIGMA ET SPECULUM.
-- =====================================================================


-- ============ 0001_init.sql ============

-- =====================================================================
--  LA PACIFICA RES PUBLICA — Schema iniziale (Supabase / PostgreSQL)
--  Migrazione 0001 — profili, seggi, acquisti, progressi, proposte, voti
--  Sicurezza: Row Level Security su tutte le tabelle + funzioni privilegiate
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. Estensioni
-- ---------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. Configurazione applicativa (solo service role)
--    Qui vive il codice di fondazione. CAMBIALO dopo il primo accesso.
-- ---------------------------------------------------------------------
create table if not exists public.app_config (
  key   text primary key,
  value text not null
);
insert into public.app_config(key, value)
values ('founder_code', 'FONDAZIONE-PACIFICA')
on conflict (key) do nothing;

alter table public.app_config enable row level security;
-- nessuna policy => nessun accesso da client (solo service role / funzioni SECURITY DEFINER)

-- ---------------------------------------------------------------------
-- 2. Profili (1:1 con auth.users)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nome        text not null default 'Delegato',
  ruolo       text not null default 'iscritto'   -- iscritto | delegato | presidenza
              check (ruolo in ('iscritto','delegato','presidenza')),
  membership  text not null default 'free'       -- free | civis | academicus
              check (membership in ('free','civis','academicus')),
  seggio      int,
  commissione text,
  created_at  timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- ogni utente autenticato può leggere i profili (serve per l'elenco delegati e gli autori delle proposte)
drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated" on public.profiles for select to authenticated using (true);

-- nessuna policy di INSERT/UPDATE/DELETE da client:
-- la creazione avviene via trigger; le modifiche privilegiate via funzioni SECURITY DEFINER.

-- Trigger: crea il profilo quando nasce un utente (legge il nome dai metadati)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nome)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', 'Delegato'));
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 2.bis Funzioni di supporto (lette dalle policy delle tabelle seguenti)
-- ---------------------------------------------------------------------
create or replace function public.is_presidency()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and ruolo = 'presidenza');
$$;

create or replace function public.is_delegate()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and ruolo = 'delegato');
$$;

-- ---------------------------------------------------------------------
-- 3. Seggi e codici delegato (150 posti)
-- ---------------------------------------------------------------------
create table if not exists public.seats (
  n           int primary key check (n between 1 and 150),
  codice      text unique not null,
  commissione text not null,
  used        boolean not null default false,
  profile_id  uuid references public.profiles(id),
  created_at  timestamptz not null default now()
);
alter table public.seats enable row level security;

-- i codici sono riservati: solo la Presidenza può leggerli
drop policy if exists "seats_select_presidency" on public.seats;
create policy "seats_select_presidency" on public.seats for select to authenticated
  using (public.is_presidency());

-- ---------------------------------------------------------------------
-- 4. Acquisti (corsi, pacchetti, percorso)
-- ---------------------------------------------------------------------
create table if not exists public.purchases (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  item       text not null,         -- es. 'corso:c1' | 'pacc:p1' | 'percorso'
  created_at timestamptz not null default now(),
  unique (profile_id, item)
);
alter table public.purchases enable row level security;

drop policy if exists "purchases_select_own" on public.purchases;
create policy "purchases_select_own" on public.purchases for select to authenticated
  using (profile_id = auth.uid());
-- inserimenti solo via funzione purchase_item()

-- ---------------------------------------------------------------------
-- 5. Progressi nei corsi
-- ---------------------------------------------------------------------
create table if not exists public.progress (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  course_id  text not null,
  lesson     int  not null check (lesson between 1 and 8),
  done_at    timestamptz not null default now(),
  primary key (profile_id, course_id, lesson)
);
alter table public.progress enable row level security;

drop policy if exists "progress_select_own" on public.progress;
create policy "progress_select_own" on public.progress for select to authenticated using (profile_id = auth.uid());
drop policy if exists "progress_insert_own" on public.progress;
create policy "progress_insert_own" on public.progress for insert to authenticated with check (profile_id = auth.uid());
drop policy if exists "progress_delete_own" on public.progress;
create policy "progress_delete_own" on public.progress for delete to authenticated using (profile_id = auth.uid());

-- ---------------------------------------------------------------------
-- 6. Proposte di legge e voti (Parlamento)
-- ---------------------------------------------------------------------
create table if not exists public.proposals (
  id          uuid primary key default gen_random_uuid(),
  titolo      text not null,
  testo       text not null,
  commissione text not null,
  autore_id   uuid not null references public.profiles(id),
  autore_nome text not null,
  stato       text not null default 'commissione'  -- commissione | aula | chiusa
              check (stato in ('commissione','aula','chiusa')),
  esito       text check (esito in ('approvata','respinta')),
  created_at  timestamptz not null default now()
);
alter table public.proposals enable row level security;

drop policy if exists "proposals_select_authenticated" on public.proposals;
create policy "proposals_select_authenticated" on public.proposals for select to authenticated using (true);
drop policy if exists "proposals_insert_delegate" on public.proposals;
create policy "proposals_insert_delegate" on public.proposals for insert to authenticated
  with check (autore_id = auth.uid() and (public.is_delegate() or public.is_presidency()));
drop policy if exists "proposals_update_presidency" on public.proposals;
create policy "proposals_update_presidency" on public.proposals for update to authenticated
  using (public.is_presidency()) with check (public.is_presidency());

create table if not exists public.votes (
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  voto        text not null check (voto in ('f','c')),
  created_at  timestamptz not null default now(),
  primary key (proposal_id, profile_id)
);
alter table public.votes enable row level security;

drop policy if exists "votes_select_authenticated" on public.votes;
create policy "votes_select_authenticated" on public.votes for select to authenticated using (true);
drop policy if exists "votes_write_delegate" on public.votes;
create policy "votes_write_delegate" on public.votes for all to authenticated
  using (profile_id = auth.uid() and (public.is_delegate() or public.is_presidency()))
  with check (profile_id = auth.uid() and (public.is_delegate() or public.is_presidency()));

-- ---------------------------------------------------------------------
-- 8. Funzioni privilegiate (SECURITY DEFINER) — l'unico modo per
--    promuovere ruoli, attivare membership, registrare acquisti.
-- ---------------------------------------------------------------------

-- 8.1 Riscatta il codice di fondazione -> diventa Presidenza (solo se non esiste già)
create or replace function public.redeem_founder(p_code text)
returns public.profiles language plpgsql security definer set search_path = public as $$
declare v_secret text; v_row public.profiles;
begin
  if auth.uid() is null then raise exception 'Non autenticato'; end if;
  select value into v_secret from public.app_config where key = 'founder_code';
  if p_code is null or p_code <> v_secret then raise exception 'Codice di fondazione non valido'; end if;
  if exists(select 1 from public.profiles where ruolo = 'presidenza') then
    raise exception 'La Presidenza è già stata istituita';
  end if;
  update public.profiles
     set ruolo = 'presidenza', membership = 'academicus'
   where id = auth.uid()
   returning * into v_row;
  return v_row;
end; $$;

-- 8.2 Riscatta un codice delegato -> assegna seggio + commissione + ruolo
create or replace function public.redeem_code(p_code text)
returns public.profiles language plpgsql security definer set search_path = public as $$
declare v_seat public.seats; v_row public.profiles;
begin
  if auth.uid() is null then raise exception 'Non autenticato'; end if;
  select * into v_seat from public.seats
    where codice = upper(p_code) and used = false for update;
  if not found then raise exception 'Codice non valido o già utilizzato'; end if;

  update public.seats set used = true, profile_id = auth.uid() where n = v_seat.n;
  update public.profiles
     set ruolo = 'delegato', membership = 'academicus',
         seggio = v_seat.n, commissione = v_seat.commissione
   where id = auth.uid()
   returning * into v_row;
  return v_row;
end; $$;

-- 8.3 Genera N codici delegato (solo Presidenza)
create or replace function public.generate_codes(p_n int, p_comm text)
returns setof public.seats language plpgsql security definer set search_path = public as $$
declare v_base int; i int; v_n int; v_comm text;
  v_comms text[] := array['pace','etica','diritti','dialogo','arte','bene','memoria'];
begin
  if not public.is_presidency() then raise exception 'Riservato alla Presidenza'; end if;
  select coalesce(max(n),0) into v_base from public.seats;
  for i in 1..p_n loop
    v_n := v_base + i;
    exit when v_n > 150;
    if p_comm = 'rota' then v_comm := v_comms[((v_n - 1) % 7) + 1]; else v_comm := p_comm; end if;
    insert into public.seats(n, codice, commissione)
    values (v_n,
            'PRP-' || upper(substr(encode(gen_random_bytes(3),'hex'),1,4)) || '-' ||
                       upper(substr(encode(gen_random_bytes(3),'hex'),1,4)),
            v_comm);
  end loop;
  return query select * from public.seats where used = false order by n;
end; $$;

-- 8.4 Acquisto dimostrativo di un prodotto (corso/pacchetto/percorso)
--     ATTENZIONE: in produzione il pagamento va verificato lato server
--     (webhook Stripe -> Edge Function), non chiamato direttamente dal client.
create or replace function public.purchase_item(p_item text)
returns public.purchases language plpgsql security definer set search_path = public as $$
declare v_row public.purchases;
begin
  if auth.uid() is null then raise exception 'Non autenticato'; end if;
  insert into public.purchases(profile_id, item)
  values (auth.uid(), p_item)
  on conflict (profile_id, item) do update set item = excluded.item
  returning * into v_row;
  return v_row;
end; $$;

-- 8.5 Attivazione dimostrativa di una membership
--     Stessa avvertenza: in produzione collegare al pagamento verificato.
create or replace function public.activate_membership(p_plan text)
returns public.profiles language plpgsql security definer set search_path = public as $$
declare v_row public.profiles;
begin
  if auth.uid() is null then raise exception 'Non autenticato'; end if;
  if p_plan not in ('free','civis','academicus') then raise exception 'Piano non valido'; end if;
  update public.profiles set membership = p_plan where id = auth.uid() returning * into v_row;
  return v_row;
end; $$;

-- ---------------------------------------------------------------------
-- 9. Permessi di esecuzione per gli utenti autenticati
-- ---------------------------------------------------------------------
grant execute on function public.redeem_founder(text)      to authenticated;
grant execute on function public.redeem_code(text)         to authenticated;
grant execute on function public.generate_codes(int,text)  to authenticated;
grant execute on function public.purchase_item(text)       to authenticated;
grant execute on function public.activate_membership(text) to authenticated;
grant execute on function public.is_presidency()           to authenticated;
grant execute on function public.is_delegate()             to authenticated;

-- ---------------------------------------------------------------------
-- 10. Realtime (facoltativo): abilita gli aggiornamenti live in Aula
-- ---------------------------------------------------------------------
do $pub$ begin alter publication supabase_realtime add table public.proposals; exception when duplicate_object then null; end $pub$;
do $pub$ begin alter publication supabase_realtime add table public.votes; exception when duplicate_object then null; end $pub$;
do $pub$ begin alter publication supabase_realtime add table public.seats; exception when duplicate_object then null; end $pub$;

-- Fine migrazione 0001


-- ============ 0002_content.sql ============

-- =====================================================================
--  LA PACIFICA RES PUBLICA — Migrazione 0002
--  Contenuti gestibili dalla Presidenza:
--  corsi, video, audiolibri, pacchetti, prezzi.
--  Lettura: tutti gli autenticati (solo contenuti pubblicati).
--  Scrittura: solo la Presidenza (is_presidency()).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Corsi
-- ---------------------------------------------------------------------
create table if not exists public.courses (
  id          text primary key,
  titolo      text not null,
  formatore   text not null default '',
  commissione text not null default '',
  pacchetto   text not null default '',
  descrizione text not null default '',
  prezzo      int  not null default 69,
  ordine      int  not null default 0,
  pubblicato  boolean not null default true,
  updated_at  timestamptz not null default now()
);
alter table public.courses enable row level security;
drop policy if exists "courses_read" on public.courses;
create policy "courses_read" on public.courses for select to authenticated
  using (pubblicato = true or public.is_presidency());
drop policy if exists "courses_write" on public.courses;
create policy "courses_write" on public.courses for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());

-- ---------------------------------------------------------------------
-- Video On Demand
-- ---------------------------------------------------------------------
create table if not exists public.videos (
  id          text primary key,
  titolo      text not null,
  tipo        text not null default 'Video',
  durata      text not null default '',
  gratuito    boolean not null default false,
  commissione text not null default '',
  descrizione text not null default '',
  url         text not null default '',
  ordine      int  not null default 0,
  pubblicato  boolean not null default true,
  updated_at  timestamptz not null default now()
);
alter table public.videos enable row level security;
drop policy if exists "videos_read" on public.videos;
create policy "videos_read" on public.videos for select to authenticated
  using (pubblicato = true or public.is_presidency());
drop policy if exists "videos_write" on public.videos;
create policy "videos_write" on public.videos for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());

-- ---------------------------------------------------------------------
-- Audiolibri (Biblioteca)
-- ---------------------------------------------------------------------
create table if not exists public.audiobooks (
  id          text primary key,
  titolo      text not null,
  autore      text not null default '',
  durata      text not null default '',
  gratuito    boolean not null default false,
  commissione text not null default '',
  testo       text not null default '',
  audio_url   text not null default '',
  ordine      int  not null default 0,
  pubblicato  boolean not null default true,
  updated_at  timestamptz not null default now()
);
alter table public.audiobooks enable row level security;
drop policy if exists "audiobooks_read" on public.audiobooks;
create policy "audiobooks_read" on public.audiobooks for select to authenticated
  using (pubblicato = true or public.is_presidency());
drop policy if exists "audiobooks_write" on public.audiobooks;
create policy "audiobooks_write" on public.audiobooks for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());

-- ---------------------------------------------------------------------
-- Pacchetti tematici (insieme di corsi a prezzo agevolato)
-- ---------------------------------------------------------------------
create table if not exists public.packages (
  id         text primary key,
  nome       text not null,
  corsi      jsonb not null default '[]'::jsonb,   -- es. ["c1","c2","c3"]
  prezzo     int  not null default 0,
  ordine     int  not null default 0,
  pubblicato boolean not null default true
);
alter table public.packages enable row level security;
drop policy if exists "packages_read" on public.packages;
create policy "packages_read" on public.packages for select to authenticated
  using (pubblicato = true or public.is_presidency());
drop policy if exists "packages_write" on public.packages;
create policy "packages_write" on public.packages for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());

-- ---------------------------------------------------------------------
-- Impostazioni (prezzi globali e simili)
-- ---------------------------------------------------------------------
create table if not exists public.settings (
  key   text primary key,
  value text not null
);
alter table public.settings enable row level security;
drop policy if exists "settings_read" on public.settings;
create policy "settings_read" on public.settings for select to authenticated using (true);
drop policy if exists "settings_write" on public.settings;
create policy "settings_write" on public.settings for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());

insert into public.settings(key, value) values
  ('prezzo_corso','69'), ('prezzo_percorso','440')
on conflict (key) do nothing;

-- ---------------------------------------------------------------------
-- Dati iniziali (travaso del catalogo esistente) -> vedi sotto
-- ---------------------------------------------------------------------

-- ===== SEED: corsi =====
insert into public.courses(id,titolo,formatore,commissione,pacchetto,descrizione,prezzo,ordine) values ('c1',$txt$Introduzione alla Filosofia$txt$,$txt$Prof. Roberto Barbessi$txt$,'etica',$txt$Pensiero e Storia$txt$,$txt$Le domande fondamentali che hanno acceso il pensiero occidentale: cosa significa conoscere, agire bene, vivere in una comunità giusta.$txt$,69,1) on conflict (id) do nothing;
insert into public.courses(id,titolo,formatore,commissione,pacchetto,descrizione,prezzo,ordine) values ('c2',$txt$La Scuola di Atene$txt$,$txt$Prof. Roberto Barbessi$txt$,'etica',$txt$Pensiero e Storia$txt$,$txt$Dentro l’affresco di Raffaello: Platone, Aristotele e l’ideale di una comunità di sapienti che dialogano per cercare il vero.$txt$,69,2) on conflict (id) do nothing;
insert into public.courses(id,titolo,formatore,commissione,pacchetto,descrizione,prezzo,ordine) values ('c3',$txt$Lo sviluppo nella storia dei processi di pace$txt$,$txt$Prof. Roberto Barbessi$txt$,'pace',$txt$Pensiero e Storia$txt$,$txt$Dai trattati antichi alle istituzioni moderne: come l’umanità ha imparato, faticosamente, a trasformare il conflitto in dialogo.$txt$,69,3) on conflict (id) do nothing;
insert into public.courses(id,titolo,formatore,commissione,pacchetto,descrizione,prezzo,ordine) values ('c4',$txt$Pratiche di consapevolezza e pace interiore$txt$,$txt$Dott.ssa Pighi$txt$,'diritti',$txt$Pratiche e Culture di Pace$txt$,$txt$La pace fuori comincia dalla pace dentro: attenzione, respiro e presenza come fondamento di ogni relazione non violenta.$txt$,69,4) on conflict (id) do nothing;
insert into public.courses(id,titolo,formatore,commissione,pacchetto,descrizione,prezzo,ordine) values ('c5',$txt$Dialogo interculturale e diplomazia$txt$,$txt$Dott. Mazzonetto$txt$,'dialogo',$txt$Pratiche e Culture di Pace$txt$,$txt$Gli strumenti del negoziato e dell’ascolto: come si costruiscono ponti tra culture, lingue e visioni del mondo diverse.$txt$,69,5) on conflict (id) do nothing;
insert into public.courses(id,titolo,formatore,commissione,pacchetto,descrizione,prezzo,ordine) values ('c6',$txt$Arte, bellezza e cultura di pace$txt$,$txt$Dott.ssa Zago$txt$,'arte',$txt$Pratiche e Culture di Pace$txt$,$txt$L’arte come linguaggio universale e atto di pace: dalla musica alla pittura, la bellezza che unisce dove le parole dividono.$txt$,69,6) on conflict (id) do nothing;
insert into public.courses(id,titolo,formatore,commissione,pacchetto,descrizione,prezzo,ordine) values ('c7',$txt$Etica ed economia responsabile$txt$,$txt$Dott. Bampa$txt$,'bene',$txt$Etica, Economia e Impresa$txt$,$txt$Un’economia al servizio della persona: bene comune, sostenibilità e responsabilità nelle scelte produttive e finanziarie.$txt$,69,7) on conflict (id) do nothing;
insert into public.courses(id,titolo,formatore,commissione,pacchetto,descrizione,prezzo,ordine) values ('c8',$txt$Impresa, lavoro e bene comune$txt$,$txt$Dott. Cesaro$txt$,'bene',$txt$Etica, Economia e Impresa$txt$,$txt$Il lavoro come luogo di dignità e cooperazione: modelli d’impresa che generano valore condiviso e coesione sociale.$txt$,69,8) on conflict (id) do nothing;

-- ===== SEED: video =====
do $seed$ begin
insert into public.videos(id,titolo,tipo,durata,gratuito,commissione,descrizione,ordine) values ('v1',$txt$Il Manifesto della Pacifica$txt$,$txt$Documentario$txt$,'24 min',true,'memoria',$txt$Il film che racconta i Sette Principi fondativi e la nascita della Res Publica dei giovani.$txt$,1) on conflict (id) do nothing;
exception when undefined_column then null; end $seed$;
do $seed$ begin
insert into public.videos(id,titolo,tipo,durata,gratuito,commissione,descrizione,ordine) values ('v2',$txt$La prima lezione del Prof. Barbessi$txt$,$txt$Lezione aperta$txt$,'25 min',true,'etica',$txt$Estratto gratuito dal corso di Filosofia: un assaggio del Percorso di Pace.$txt$,2) on conflict (id) do nothing;
exception when undefined_column then null; end $seed$;
do $seed$ begin
insert into public.videos(id,titolo,tipo,durata,gratuito,commissione,descrizione,ordine) values ('v3',$txt$Dentro l’emiciclo: una seduta dei delegati$txt$,$txt$Documento$txt$,'38 min',false,'pace',$txt$Riprese di una seduta plenaria del Parlamento dei Giovani: dibattito, emendamenti, voto.$txt$,3) on conflict (id) do nothing;
exception when undefined_column then null; end $seed$;
do $seed$ begin
insert into public.videos(id,titolo,tipo,durata,gratuito,commissione,descrizione,ordine) values ('v4',$txt$Conferenza: le diplomazie della pace$txt$,$txt$Conferenza$txt$,'52 min',false,'dialogo',$txt$Un dialogo a più voci sui grandi processi di pace contemporanei.$txt$,4) on conflict (id) do nothing;
exception when undefined_column then null; end $seed$;
do $seed$ begin
insert into public.videos(id,titolo,tipo,durata,gratuito,commissione,descrizione,ordine) values ('v5',$txt$La bellezza che disarma$txt$,$txt$Documentario$txt$,'31 min',false,'arte',$txt$Viaggio nei luoghi dove l’arte è diventata strumento di riconciliazione.$txt$,5) on conflict (id) do nothing;
exception when undefined_column then null; end $seed$;
do $seed$ begin
insert into public.videos(id,titolo,tipo,durata,gratuito,commissione,descrizione,ordine) values ('v6',$txt$Economia del bene comune$txt$,$txt$Masterclass$txt$,'44 min',false,'bene',$txt$Una masterclass sui modelli economici al servizio della persona.$txt$,6) on conflict (id) do nothing;
exception when undefined_column then null; end $seed$;
do $seed$ begin
insert into public.videos(id,titolo,tipo,durata,gratuito,commissione,descrizione,ordine) values ('v7',$txt$Memoria e futuro: voci di testimoni$txt$,$txt$Documento$txt$,'40 min',false,'memoria',$txt$Testimonianze raccolte per custodire la memoria e illuminare il futuro.$txt$,7) on conflict (id) do nothing;
exception when undefined_column then null; end $seed$;
do $seed$ begin
insert into public.videos(id,titolo,tipo,durata,gratuito,commissione,descrizione,ordine) values ('v8',$txt$Live mensile — Q&A con i formatori$txt$,$txt$Registrazione live$txt$,'61 min',false,'etica',$txt$La registrazione dell’incontro mensile riservato agli abbonati.$txt$,8) on conflict (id) do nothing;
exception when undefined_column then null; end $seed$;

-- ===== SEED: audiolibri =====
insert into public.audiobooks(id,titolo,autore,durata,gratuito,commissione,testo,ordine) values ('a1',$txt$Il Manifesto, narrato$txt$,$txt$La Pacifica$txt$,'18 min',true,'memoria',$txt$I Sette Principi della Pacifica Res Publica. Primo: la pace come fondamento di ogni convivenza, non assenza di conflitto ma presenza di giustizia. Secondo: la conoscenza unita alla coscienza, perché il sapere senza etica non genera futuro. Terzo: la dignità inviolabile di ogni persona, fondamento di ogni diritto. Quarto: l’unità nella diversità, dove il dialogo tra culture diventa diplomazia. Quinto: la bellezza che educa, l’arte come linguaggio universale di pace. Sesto: il bene comune anteposto all’interesse del singolo. Settimo: la memoria custodita per costruire il futuro.$txt$,1) on conflict (id) do nothing;
insert into public.audiobooks(id,titolo,autore,durata,gratuito,commissione,testo,ordine) values ('a2',$txt$Apologia di Socrate (estratti)$txt$,$txt$Platone — pubblico dominio$txt$,'42 min',false,'etica',$txt$So di non sapere: in questa consapevolezza Socrate fonda la sua ricerca. Davanti ai giudici di Atene non si difende per salvarsi, ma per restare fedele alla verità. La vita non esaminata, dice, non è degna di essere vissuta. Meglio subire ingiustizia che commetterla.$txt$,2) on conflict (id) do nothing;
insert into public.audiobooks(id,titolo,autore,durata,gratuito,commissione,testo,ordine) values ('a3',$txt$La pace perpetua (sintesi)$txt$,$txt$I. Kant — pubblico dominio$txt$,'55 min',false,'pace',$txt$Kant immagina una pace che non sia tregua tra due guerre, ma condizione duratura fondata sul diritto. Propone una federazione di liberi Stati e un diritto cosmopolitico dell’ospitalità. La pace non è un dono della natura ma un compito della ragione: va istituita.$txt$,3) on conflict (id) do nothing;
insert into public.audiobooks(id,titolo,autore,durata,gratuito,commissione,testo,ordine) values ('a4',$txt$Lettera sulla nonviolenza$txt$,$txt$Antologia — pubblico dominio$txt$,'29 min',false,'diritti',$txt$La nonviolenza non è la virtù dei deboli ma la forza dei coraggiosi. Non si tratta di subire, ma di rifiutare di restituire il male con il male, spezzando la catena. Chi la pratica trasforma l’avversario in interlocutore e il conflitto in occasione di verità.$txt$,4) on conflict (id) do nothing;
insert into public.audiobooks(id,titolo,autore,durata,gratuito,commissione,testo,ordine) values ('a5',$txt$Sulla bellezza e l’educazione$txt$,$txt$F. Schiller — pubblico dominio$txt$,'37 min',false,'arte',$txt$L’uomo è pienamente uomo solo quando gioca, e gioca solo davanti alla bellezza. L’educazione estetica non è un lusso ma la via attraverso cui la libertà entra nella vita: la bellezza riconcilia sensibilità e ragione, e prepara l’animo alla pace.$txt$,5) on conflict (id) do nothing;
insert into public.audiobooks(id,titolo,autore,durata,gratuito,commissione,testo,ordine) values ('a6',$txt$Dispensa: i processi di pace nel Novecento$txt$,$txt$Prof. R. Barbessi$txt$,'33 min',false,'pace',$txt$Il Novecento è il secolo delle guerre totali ma anche delle grandi istituzioni di pace. Dalla Società delle Nazioni alle Nazioni Unite: ogni catastrofe ha generato un tentativo di darsi regole comuni. La storia dei processi di pace è la storia di un’umanità che impara dai propri errori.$txt$,6) on conflict (id) do nothing;

-- ===== SEED: pacchetti =====
insert into public.packages(id,nome,corsi,prezzo,ordine) values ('p1',$txt$Pensiero e Storia$txt$,'["c1","c2","c3"]'::jsonb,169,1) on conflict (id) do nothing;
insert into public.packages(id,nome,corsi,prezzo,ordine) values ('p2',$txt$Pratiche e Culture di Pace$txt$,'["c4","c5","c6"]'::jsonb,169,2) on conflict (id) do nothing;
insert into public.packages(id,nome,corsi,prezzo,ordine) values ('p3',$txt$Etica, Economia e Impresa$txt$,'["c7","c8"]'::jsonb,119,3) on conflict (id) do nothing;

-- Fine migrazione 0002


-- ============ 0003_payments.sql ============

-- =====================================================================
--  LA PACIFICA RES PUBLICA — Migrazione 0003
--  Pagamenti reali (Stripe): registro pagamenti, scadenza membership,
--  cliente Stripe, prezzi delle membership.
--  L'attivazione avviene SOLO dal webhook Stripe (service role),
--  mai dal browser.
-- =====================================================================

-- Profili: cliente Stripe e scadenza membership
alter table public.profiles add column if not exists stripe_customer_id text;
alter table public.profiles add column if not exists membership_until timestamptz;

-- Registro dei pagamenti completati (scritto solo dal webhook, service role)
create table if not exists public.payments (
  id             uuid primary key default gen_random_uuid(),
  profile_id     uuid references public.profiles(id) on delete set null,
  kind           text not null,        -- 'item' | 'membership'
  ref            text not null,        -- es. 'corso:c1' | 'percorso' | 'civis'
  amount         int,                  -- importo in centesimi
  stripe_session text,
  created_at     timestamptz not null default now()
);
alter table public.payments enable row level security;
-- ognuno vede solo i propri pagamenti; nessun INSERT da client (solo service role)
drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own" on public.payments for select to authenticated using (profile_id = auth.uid());

-- Prezzi delle membership (modificabili dalla Presidenza, in euro)
insert into public.settings(key, value) values
  ('prezzo_civis_mese','9.90'),
  ('prezzo_civis_anno','89'),
  ('prezzo_academicus','320')
on conflict (key) do nothing;

-- Fine migrazione 0003


-- ============ 0004_campus.sql ============

-- =====================================================================
--  LA PACIFICA RES PUBLICA — Migrazione 0004
--  Quinto pilastro: CAMPUS formativi in presenza, con possibilità di
--  soggiorno. Tabella gestibile dalla Presidenza (come gli altri contenuti).
--  Lettura: utenti autenticati (solo pubblicati). Scrittura: Presidenza.
-- =====================================================================

create table if not exists public.campus (
  id               text primary key,
  titolo           text not null,
  luogo            text not null default '',
  descrizione      text not null default '',
  data             text not null default '',     -- es. "17–18 ottobre 2026"
  durata           text not null default '',     -- es. "Weekend · 2 giorni, 1 notte"
  posti            int  not null default 30,
  prezzo           int  not null default 0,       -- partecipazione (senza pernottamento)
  prezzo_soggiorno int  not null default 0,       -- con vitto e alloggio
  commissione      text not null default '',
  ordine           int  not null default 0,
  pubblicato       boolean not null default true,
  updated_at       timestamptz not null default now()
);
alter table public.campus enable row level security;
drop policy if exists "campus_read" on public.campus;
create policy "campus_read" on public.campus for select to authenticated
  using (pubblicato = true or public.is_presidency());
drop policy if exists "campus_write" on public.campus;
create policy "campus_write" on public.campus for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());

-- ----- Dati iniziali: edizioni presso l'Abbazia di Maguzzano -----
-- Casa di Spiritualità e Centro Ecumenico — Abbazia di Maguzzano (Lonato del Garda, Lago di Garda)

insert into public.campus(id,titolo,luogo,descrizione,data,durata,posti,prezzo,prezzo_soggiorno,commissione,ordine) values
('cmp1',
 $txt$Campus di Pace — Weekend introduttivo$txt$,
 $txt$Abbazia di Maguzzano — Casa di Spiritualità e Centro Ecumenico (Lonato del Garda, BS)$txt$,
 $txt$Due giorni immersi nei Sette Principi del Manifesto: laboratori di ascolto, dialogo e costruzione di pace, in un luogo di spiritualità affacciato sul Lago di Garda. Pensato per chi muove i primi passi nel Percorso di Pace.$txt$,
 $txt$17–18 ottobre 2026$txt$, $txt$Weekend · 2 giorni, 1 notte$txt$, 30, 120, 190, 'pace', 1),
('cmp2',
 $txt$Campus Scuola di Atene — Filosofia in dialogo$txt$,
 $txt$Abbazia di Maguzzano — Casa di Spiritualità e Centro Ecumenico (Lonato del Garda, BS)$txt$,
 $txt$Un fine settimana sulle grandi domande del pensiero, guidato dal Prof. Roberto Barbessi: lezioni dialogate, lettura dei classici e passeggiate filosofiche. La Scuola di Atene che prende vita in presenza.$txt$,
 $txt$14–15 novembre 2026$txt$, $txt$Weekend · 2 giorni, 1 notte$txt$, 25, 130, 200, 'etica', 2),
('cmp3',
 $txt$Campus Diplomazia e Dialogo — Ritiro residenziale$txt$,
 $txt$Abbazia di Maguzzano — Casa di Spiritualità e Centro Ecumenico (Lonato del Garda, BS)$txt$,
 $txt$Tre giorni residenziali di pratica diplomatica: simulazioni di negoziato, gestione dei conflitti e dialogo interculturale, con tempi di silenzio e convivialità. Un'esperienza intensiva per delegati e aspiranti tali.$txt$,
 $txt$5–7 dicembre 2026$txt$, $txt$3 giorni, 2 notti$txt$, 25, 180, 290, 'dialogo', 3)
on conflict (id) do nothing;

-- Fine migrazione 0004


-- ============ 0005_texts.sql ============

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
drop policy if exists "texts_read" on public.texts;
create policy "texts_read" on public.texts for select to authenticated
  using (pubblicato = true or public.is_presidency());
drop policy if exists "texts_write" on public.texts;
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


-- ============ 0006_events.sql ============

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
drop policy if exists "events_read" on public.events;
create policy "events_read" on public.events for select to authenticated
  using (pubblicato = true or public.is_presidency());
drop policy if exists "events_write" on public.events;
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


-- ============ 0007_chapters.sql ============

-- =====================================================================
--  LA PACIFICA RES PUBLICA — Migrazione 0007
--  Capitoli strutturati per i testi della Biblioteca.
--  'capitoli' è un array JSON di oggetti { "t": "Titolo capitolo", "c": "Testo..." }.
--  Se vuoto, il lettore usa il campo 'testo' (testo unico, retro-compatibile).
-- =====================================================================

alter table public.texts
  add column if not exists capitoli jsonb not null default '[]'::jsonb;

-- Fine migrazione 0007


-- ============ 0008_livelli_accesso.sql ============

-- =====================================================================
-- 0008_livelli_accesso.sql
--
-- Due cambiamenti, legati fra loro.
--
-- 1) I LIVELLI DI ACCESSO DIVENTANO DATI, NON CODICE.
--    Prima l'accesso era un booleano `gratuito`: due sole classi, e ogni
--    nuova classe avrebbe richiesto una migrazione. Ora i livelli stanno
--    in una tabella che la presidenza gestisce dal CMS.
--    La regola di ciascun livello non e' SQL scritto a mano (sarebbe una
--    porta aperta), ma tre campi dichiarativi:
--      ospiti      -> il livello vale anche senza account
--      memberships -> quali abbonamenti lo soddisfano  (free|civis|academicus)
--      ruoli       -> quali ruoli lo soddisfano         (iscritto|delegato|presidenza)
--    Ruolo e abbonamento sono assi indipendenti: un delegato puo' essere free.
--    Per questo servono due elenchi e non una scala unica.
--    La presidenza vede sempre tutto: e' il ruolo di amministrazione.
--
-- 2) L'INDIRIZZO DEL VIDEO ESCE DALLA TABELLA `videos`.
--    La RLS di Postgres filtra le righe, non le colonne: finche' `url` sta
--    in `videos`, chiunque possa leggere i metadati puo' leggere anche il
--    link. Spostandolo in `video_sources` si ottengono insieme le due cose
--    che servono: il catalogo visibile a tutti (le vetrine bloccate
--    invogliano l'abbonamento) e il link che non esce dal server per chi
--    non ne ha diritto, nemmeno chiamando le API a mano.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Livelli
-- ---------------------------------------------------------------------
create table if not exists public.access_levels (
  id          text primary key,                      -- es. 'civis'
  nome        text not null,                         -- etichetta mostrata
  descrizione text not null default '',
  ospiti      boolean not null default false,
  memberships text[] not null default '{}',
  ruoli       text[] not null default '{}',
  invito      text not null default '',              -- testo per chi non ha diritto
  cta         text not null default 'abbonamenti',   -- vista dove mandarlo ('' = nessun invito)
  ordine      int  not null default 0,
  attivo      boolean not null default true,
  updated_at  timestamptz not null default now()
);

alter table public.access_levels enable row level security;

-- il catalogo dei livelli e' pubblico: serve anche agli ospiti per capire
-- cosa stanno guardando ("Incluso in Civis")
drop policy if exists "levels_read"  on public.access_levels;
drop policy if exists "levels_read" on public.access_levels;
create policy "levels_read" on public.access_levels for select to anon, authenticated
  using (true);
drop policy if exists "levels_write" on public.access_levels;
drop policy if exists "levels_write" on public.access_levels;
create policy "levels_write" on public.access_levels for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());

-- livelli di partenza: modificabili e cancellabili dal CMS.
-- 'presidenza' non ha ne' abbonamenti ne' ruoli: lo soddisfa solo il caso
-- speciale della presidenza qui sotto. E' il livello per le bozze.
insert into public.access_levels (id,nome,descrizione,ospiti,memberships,ruoli,invito,cta,ordine) values
  ('pubblico',   'Pubblico',          'Visibile a chiunque, anche senza account.', true,  '{}',                       '{}',          '',                                     '',            10),
  ('iscritti',   'Solo iscritti',     'Serve un account, anche gratuito.',         false, '{free,civis,academicus}',  '{}',          'Registrati per guardarlo',             'registrati',  20),
  ('civis',      'Civis',             'Incluso nell''abbonamento Civis.',          false, '{civis,academicus}',       '{}',          'Incluso in Civis',                     'abbonamenti', 30),
  ('academicus', 'Civis Academicus',  'Riservato agli Academicus.',                false, '{academicus}',             '{}',          'Incluso in Civis Academicus',          'abbonamenti', 40),
  ('delegati',   'Delegati',          'Riservato ai delegati del Parlamento.',     false, '{}',                       '{delegato}',  'Riservato ai delegati del Parlamento', '',            50),
  ('presidenza', 'Solo presidenza',   'Bozze e materiali interni.',                false, '{}',                       '{}',          'Materiale interno',                    '',            60)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- La regola, in un posto solo
-- ---------------------------------------------------------------------
create or replace function public.livello_consentito(liv text)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.access_levels l
    where l.id = liv
      and l.attivo
      and (
        l.ospiti
        or exists (
          select 1 from public.profiles p
          where p.id = auth.uid()
            and ( p.ruolo = 'presidenza'                -- amministrazione: vede tutto
                  or p.membership = any(l.memberships)
                  or p.ruolo      = any(l.ruoli) )
        )
      )
  );
$$;

-- ---------------------------------------------------------------------
-- videos: da `gratuito` booleano a `livello`
-- ---------------------------------------------------------------------
alter table public.videos add column if not exists livello text
  references public.access_levels(id) on update cascade;

do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema='public' and table_name='videos' and column_name='gratuito') then
    update public.videos set livello = case when gratuito then 'pubblico' else 'civis' end
      where livello is null;
  end if;
end $$;

update public.videos set livello = 'civis' where livello is null;
alter table public.videos alter column livello set default 'civis';
alter table public.videos alter column livello set not null;
alter table public.videos drop column if exists gratuito;

-- definita ora: prima la colonna `livello` non esisteva ancora
create or replace function public.puo_vedere_video(vid text)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.videos v
    where v.id = vid
      and (v.pubblicato or public.is_presidency())
      and public.livello_consentito(v.livello)
  );
$$;

-- ---------------------------------------------------------------------
-- video_sources: l'indirizzo, protetto
-- ---------------------------------------------------------------------
create table if not exists public.video_sources (
  video_id   text primary key references public.videos(id) on delete cascade on update cascade,
  url        text not null default '',
  updated_at timestamptz not null default now()
);

-- travaso dei link gia' inseriti, poi via la colonna dalla tabella aperta
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema='public' and table_name='videos' and column_name='url') then
    insert into public.video_sources (video_id, url)
      select id, coalesce(url,'') from public.videos
      on conflict (video_id) do nothing;
  end if;
end $$;

alter table public.videos drop column if exists url;

alter table public.video_sources enable row level security;

-- QUI il paywall diventa vero: il link non esce se il livello non e' soddisfatto
drop policy if exists "video_sources_read"  on public.video_sources;
drop policy if exists "video_sources_read" on public.video_sources;
create policy "video_sources_read" on public.video_sources for select to anon, authenticated
  using (public.puo_vedere_video(video_id));
drop policy if exists "video_sources_write" on public.video_sources;
drop policy if exists "video_sources_write" on public.video_sources;
create policy "video_sources_write" on public.video_sources for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());

-- ---------------------------------------------------------------------
-- I metadati dei video diventano pubblici: ora e' sicuro, l'url non e' piu' qui.
-- Serve perche' la porta d'ingresso mostri le vetrine anche a chi non e' entrato.
-- ---------------------------------------------------------------------
drop policy if exists "videos_read" on public.videos;
drop policy if exists "videos_read" on public.videos;
create policy "videos_read" on public.videos for select to anon, authenticated
  using (pubblicato = true or public.is_presidency());

-- ---------------------------------------------------------------------
-- Permessi: le policy qui sopra valgono anche per gli ospiti, quindi le
-- funzioni che richiamano devono essere eseguibili dal ruolo anon.
-- (in 0001 is_presidency() era concessa solo a authenticated)
-- ---------------------------------------------------------------------
grant execute on function public.is_presidency()             to anon;
grant execute on function public.livello_consentito(text)    to anon, authenticated;
grant execute on function public.puo_vedere_video(text)      to anon, authenticated;
grant select  on public.access_levels                        to anon, authenticated;
grant select  on public.video_sources                        to anon, authenticated;


-- ============ 0009_dossier.sql ============

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
drop policy if exists "temi_read" on public.commissione_temi;
create policy "temi_read" on public.commissione_temi for select to anon, authenticated using (true);
drop policy if exists "temi_write" on public.commissione_temi;
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
drop policy if exists "dossier_read" on public.dossier;
create policy "dossier_read" on public.dossier for select to anon, authenticated
  using (attivo and public.livello_consentito(livello));
drop policy if exists "dossier_write" on public.dossier;
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


-- ============ 0010_mecenati.sql ============

-- =====================================================================
-- 0010_mecenati.sql
--
-- Mecenati: formule "X euro -> X accessi formativi", impegno sottoscritto
-- dal mecenate, e accessi emessi quando l'impegno risulta pagato.
--
-- TRE SCELTE CHE VALE LA PENA SPIEGARE.
--
-- 1. I DATI DELL'ENTE (IBAN COMPRESO) NON STANNO QUI.
--    Vivono in `settings`, che la presidenza compila dal CMS. Nessun IBAN
--    finisce dentro il repository o dentro una migrazione: si cambia banca
--    senza un rilascio, e chi legge il codice non trova coordinate bancarie.
--    La funzione `dati_ente()` espone SOLO le chiavi pubbliche: `settings`
--    puo' contenere altro, e non deve uscire tutta.
--
-- 2. NON SI RIUSANO I CODICI DEI SEGGI.
--    `seats` ha `check (n between 1 and 150)` e `generate_codes` si ferma a
--    150: sono i seggi del Parlamento. Un mecenate che compra 50 accessi
--    formativi, se attingesse da li', consumerebbe i posti dei delegati.
--    Quindi `voucher`: meccanismo separato, senza tetto.
--
-- 3. I DATI DEL MECENATE NON SONO LEGGIBILI DA NESSUNO, TRANNE LA PRESIDENZA.
--    Sono dati personali (nome, email, indirizzo, CF/P.IVA). La tabella non
--    ha policy di lettura per anon: si scrive solo attraverso una funzione
--    che restituisce il minimo indispensabile (riferimento e coordinate).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Dati dell'ente: chiavi vuote, da compilare dal CMS.
-- ---------------------------------------------------------------------
insert into public.settings (key, value) values
  ('ente_denominazione',''), ('ente_cf',''), ('ente_piva',''), ('ente_sede',''),
  ('ente_iban',''), ('ente_intestatario',''), ('ente_banca',''),
  ('ente_pec',''), ('ente_email',''), ('ente_privacy_url','')
on conflict (key) do nothing;

create or replace function public.dati_ente()
returns table (key text, value text)
language sql stable security definer set search_path = public as $$
  select s.key, s.value from public.settings s
  where s.key in ('ente_denominazione','ente_cf','ente_piva','ente_sede','ente_iban',
                  'ente_intestatario','ente_banca','ente_pec','ente_email','ente_privacy_url');
$$;

-- ---------------------------------------------------------------------
-- Le formule. Sono dati: la presidenza le crea dal CMS.
-- ---------------------------------------------------------------------
create table if not exists public.mecenati_formule (
  id           text primary key,
  nome         text not null,
  importo      numeric(10,2) not null check (importo > 0),
  quanti       int not null check (quanti > 0),
  concede      text not null,                       -- 'civis' | 'academicus' | id pacchetto
  tipo         text not null default 'membership' check (tipo in ('membership','pacchetto')),
  durata_mesi  int not null default 12 check (durata_mesi > 0),
  descrizione  text not null default '',
  ordine       int not null default 0,
  attivo       boolean not null default true,
  updated_at   timestamptz not null default now()
);
alter table public.mecenati_formule enable row level security;
drop policy if exists "formule_read" on public.mecenati_formule;
drop policy if exists "formule_read" on public.mecenati_formule;
create policy "formule_read" on public.mecenati_formule for select to anon, authenticated
  using (attivo);
drop policy if exists "formule_write" on public.mecenati_formule;
drop policy if exists "formule_write" on public.mecenati_formule;
create policy "formule_write" on public.mecenati_formule for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());

-- ---------------------------------------------------------------------
-- Gli impegni. Dati personali: nessuna lettura pubblica, mai.
-- ---------------------------------------------------------------------
create table if not exists public.mecenati_impegni (
  id              uuid primary key default gen_random_uuid(),
  riferimento     text unique not null,             -- causale del bonifico
  formula_id      text references public.mecenati_formule(id) on update cascade,
  ragione_sociale text not null,
  referente       text not null,
  email           text not null,
  telefono        text not null default '',
  indirizzo       text not null default '',
  cf_piva         text not null default '',
  note            text not null default '',
  importo         numeric(10,2) not null,
  quanti          int not null,
  stato           text not null default 'sottoscritto'
                  check (stato in ('sottoscritto','pagato','annullato')),
  consenso_dati   boolean not null default false,
  pagato_il       timestamptz,
  created_at      timestamptz not null default now()
);
alter table public.mecenati_impegni enable row level security;
-- NESSUNA policy di lettura per anon: solo la presidenza.
drop policy if exists "impegni_presidenza" on public.mecenati_impegni;
drop policy if exists "impegni_presidenza" on public.mecenati_impegni;
create policy "impegni_presidenza" on public.mecenati_impegni for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());

-- ---------------------------------------------------------------------
-- I voucher. Come i seggi: i codici sono segreti, li vede la presidenza.
-- ---------------------------------------------------------------------
create table if not exists public.voucher (
  codice      text primary key,
  impegno_id  uuid references public.mecenati_impegni(id) on delete cascade,
  concede     text not null,
  tipo        text not null,
  durata_mesi int not null default 12,
  used        boolean not null default false,
  profile_id  uuid references public.profiles(id),
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);
alter table public.voucher enable row level security;
drop policy if exists "voucher_presidenza" on public.voucher;
drop policy if exists "voucher_presidenza" on public.voucher;
create policy "voucher_presidenza" on public.voucher for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());

-- ---------------------------------------------------------------------
-- Sottoscrizione: chiunque, anche senza account. Restituisce il minimo
-- indispensabile, cosi' la tabella resta chiusa in lettura.
-- ---------------------------------------------------------------------
create or replace function public.sottoscrivi_impegno(
  p_formula text, p_ragione text, p_referente text, p_email text,
  p_telefono text default '', p_indirizzo text default '',
  p_cf_piva text default '', p_note text default '', p_consenso boolean default false
) returns table (riferimento text, importo numeric, quanti int,
                 denominazione text, intestatario text, iban text, banca text)
language plpgsql security definer set search_path = public as $$
declare v_f public.mecenati_formule; v_rif text; v_id uuid;
begin
  if not p_consenso then raise exception 'Serve il consenso al trattamento dei dati'; end if;
  if coalesce(trim(p_ragione),'')   = '' then raise exception 'Ragione sociale obbligatoria'; end if;
  if coalesce(trim(p_referente),'') = '' then raise exception 'Referente obbligatorio'; end if;
  if p_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[a-z]{2,}$' then raise exception 'Email non valida'; end if;

  select * into v_f from public.mecenati_formule where id = p_formula and attivo;
  if not found then raise exception 'Formula non disponibile'; end if;

  v_rif := 'MEC-' || to_char(now(),'YYYY') || '-' ||
           upper(substr(encode(gen_random_bytes(3),'hex'),1,6));
  insert into public.mecenati_impegni
    (riferimento, formula_id, ragione_sociale, referente, email, telefono, indirizzo,
     cf_piva, note, importo, quanti, consenso_dati)
  values (v_rif, v_f.id, trim(p_ragione), trim(p_referente), lower(trim(p_email)),
          trim(p_telefono), trim(p_indirizzo), trim(p_cf_piva), trim(p_note),
          v_f.importo, v_f.quanti, true)
  returning id into v_id;

  return query
    select v_rif, v_f.importo, v_f.quanti,
      (select value from public.settings where key='ente_denominazione'),
      (select value from public.settings where key='ente_intestatario'),
      (select value from public.settings where key='ente_iban'),
      (select value from public.settings where key='ente_banca');
end; $$;

-- ---------------------------------------------------------------------
-- Pagato -> si emettono gli accessi. Solo la presidenza: il bonifico lo
-- riconcilia una persona, guardando la causale.
-- ---------------------------------------------------------------------
create or replace function public.segna_impegno_pagato(p_id uuid)
returns setof public.voucher
language plpgsql security definer set search_path = public as $$
declare v_i public.mecenati_impegni; i int;
begin
  if not public.is_presidency() then raise exception 'Riservato alla Presidenza'; end if;
  select * into v_i from public.mecenati_impegni where id = p_id;
  if not found then raise exception 'Impegno inesistente'; end if;
  if v_i.stato = 'pagato' then raise exception 'Impegno gia'' saldato: gli accessi sono gia'' stati emessi'; end if;
  if v_i.stato = 'annullato' then raise exception 'Impegno annullato'; end if;

  update public.mecenati_impegni set stato='pagato', pagato_il=now() where id=p_id;

  for i in 1..v_i.quanti loop
    insert into public.voucher (codice, impegno_id, concede, tipo, durata_mesi)
    select 'PAX-' || upper(substr(encode(gen_random_bytes(3),'hex'),1,4)) || '-' ||
                     upper(substr(encode(gen_random_bytes(3),'hex'),1,4)),
           p_id, f.concede, f.tipo, f.durata_mesi
    from public.mecenati_formule f where f.id = v_i.formula_id;
  end loop;

  return query select * from public.voucher where impegno_id = p_id order by codice;
end; $$;

-- ---------------------------------------------------------------------
-- Riscatto di un accesso donato.
-- ---------------------------------------------------------------------
create or replace function public.redeem_voucher(p_code text)
returns public.profiles
language plpgsql security definer set search_path = public as $$
declare v_v public.voucher; v_p public.profiles;
begin
  if auth.uid() is null then raise exception 'Non autenticato'; end if;
  select * into v_v from public.voucher where codice = upper(trim(p_code)) for update;
  if not found then raise exception 'Codice inesistente'; end if;
  if v_v.used then raise exception 'Codice gia'' utilizzato'; end if;

  update public.voucher set used=true, profile_id=auth.uid(), used_at=now() where codice=v_v.codice;

  if v_v.tipo = 'membership' then
    update public.profiles set membership = v_v.concede where id = auth.uid() returning * into v_p;
  else
    insert into public.purchases (profile_id, item) values (auth.uid(), v_v.concede)
      on conflict do nothing;
    select * into v_p from public.profiles where id = auth.uid();
  end if;
  return v_p;
end; $$;

grant execute on function public.dati_ente()                               to anon, authenticated;
grant execute on function public.sottoscrivi_impegno(text,text,text,text,text,text,text,text,boolean) to anon, authenticated;
grant execute on function public.segna_impegno_pagato(uuid)                to authenticated;
grant execute on function public.redeem_voucher(text)                      to authenticated;
grant select  on public.mecenati_formule                                   to anon, authenticated;


-- ============ 0011_mecenati_proposte.sql ============

-- =====================================================================
-- 0011_mecenati_proposte.sql
--
-- Quattro formule di partenza, approvate e attive.
-- `on conflict do nothing`: se le hai gia' importate e poi modificate dal
-- CMS, rieseguire questa migrazione NON sovrascrive le tue correzioni.
--
-- La scala dei nomi e' romana e coerente col resto (Civis, Res Publica,
-- Academicus): Amicus -> Fautor -> Patronus -> Mecenas. L'ultimo e' Gaio
-- Mecenate, il protettore di Virgilio e Orazio da cui viene la parola
-- "mecenate": e' l'unico gradino che si spiega da solo.
--
-- I CONTI (listino gia' nel portale: Civis 89 EUR/anno, Academicus 320):
--   Amicus     1.000 EUR / 12 Civis      =  83,33/acc   ->  6,4% sotto listino
--   Fautor     3.000 EUR / 10 Academicus = 300,00/acc   ->  6,2%
--   Patronus   8.000 EUR / 30 Academicus = 266,67/acc   -> 16,7%
--   Mecenas   20.000 EUR / 80 Academicus = 250,00/acc   -> 21,9%
-- Lo sconto cresce con l'importo: la formula piu' grande e' sempre la piu'
-- conveniente, e nessuno scaglione e' dominato da un altro.
-- =====================================================================

insert into public.mecenati_formule
  (id, nome, importo, quanti, concede, tipo, durata_mesi, descrizione, ordine, attivo)
values
  ('amicus', 'Amicus', 1000, 12, 'civis', 'membership', 12,
   'Dodici ragazzi leggono, ascoltano e seguono per un anno intero. E'' il gradino con cui si comincia: costa quanto una gita di classe e dura dodici mesi.',
   10, true),

  ('fautor', 'Fautor', 3000, 10, 'academicus', 'membership', 12,
   'Dieci percorsi accademici completi: gli otto corsi, la biblioteca e i video. Un fautor sostiene una classe intera per un anno.',
   20, true),

  ('patronus', 'Patronus', 8000, 30, 'academicus', 'membership', 12,
   'Trenta percorsi accademici completi. La misura di un istituto, di una fondazione locale o di un club service che adotta una scuola.',
   30, true),

  ('mecenas', 'Mecenas', 20000, 80, 'academicus', 'membership', 12,
   'Ottanta percorsi accademici completi. Gaio Mecenate non scrisse un verso: pago'' Virgilio e Orazio perche'' li scrivessero loro. Custodire per costruire.',
   40, true)
on conflict (id) do nothing;


-- ============ 0012_rassegna.sql ============

-- =====================================================================
-- 0012_rassegna.sql
--
-- Rassegna quotidiana sulla pace: NOTIZIE (da feed RSS) ed EVENTI/iniziative
-- (con data), in due sezioni separate, visibili a tutti.
--
-- SCELTE, in ordine di importanza.
--
-- 1. LE FONTI SONO DATI. La presidenza incolla l'URL del feed nel CMS.
--    L'indirizzo esatto del feed "Peace and Security" di UN News non e'
--    documentato in forma stabile: invece di cablarne uno che potrebbe
--    cambiare, si mette una fonte candidata e si corregge dal CMS.
--
-- 2. AUTOMATICO, MA CON DUE FRENI A MANO.
--    - `fonti.attiva`: spegne un'intera testata senza cancellare nulla.
--    - `notizie.nascosta`: toglie IL SINGOLO articolo dalla pagina in un clic.
--    "Pubblico in automatico" non deve voler dire "non posso piu' intervenire":
--    su un tema sensibile come la pace serve poter togliere un titolo subito.
--
-- 3. LA FUNZIONE SERVER NON SI FIDA DEL FEED (vedi index.ts).
--    Gli articoli sono HTML di terzi. Titolo e sommario si conservano come
--    testo gia' ripulito; la pagina non incorpora mai l'HTML del feed, cosi'
--    un feed compromesso non puo' iniettare nulla sul dominio del portale.
--
-- 4. GLI EVENTI NON SONO NOTIZIE. Una marcia o una conferenza ha una data e
--    un luogo, si mette in agenda e si ordina per data futura. Tabella a parte.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Le fonti dei feed
-- ---------------------------------------------------------------------
create table if not exists public.fonti (
  id          text primary key,
  nome        text not null,
  url         text not null,                       -- URL del feed RSS/Atom
  editore     text not null default '',            -- per l'attribuzione ("Fonte: ...")
  attiva      boolean not null default true,
  ultimo_sync timestamptz,
  ultimo_esito text not null default '',
  updated_at  timestamptz not null default now()
);
alter table public.fonti enable row level security;
drop policy if exists "fonti_read"  on public.fonti;
-- l'elenco fonti serve al pubblico solo per l'attribuzione: niente di sensibile
drop policy if exists "fonti_read" on public.fonti;
create policy "fonti_read" on public.fonti for select to anon, authenticated using (true);
drop policy if exists "fonti_write" on public.fonti;
drop policy if exists "fonti_write" on public.fonti;
create policy "fonti_write" on public.fonti for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());

-- Fonte candidata (SPENTA: la presidenza verifica l'URL e la accende).
insert into public.fonti (id, nome, url, editore, attiva) values
  ('un-peace','ONU \u2014 Pace e sicurezza',
   'https://news.un.org/feed/subscribe/en/news/topic/peace-and-security/feed/rss.xml',
   'UN News', false)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Le notizie importate. `guid` unico -> l'import e' idempotente.
-- ---------------------------------------------------------------------
create table if not exists public.notizie (
  id           bigserial primary key,
  fonte_id     text references public.fonti(id) on delete cascade,
  guid         text not null,                      -- link o guid dell'item
  titolo       text not null,
  sommario     text not null default '',           -- testo ripulito, mai HTML del feed
  url          text not null,
  immagine     text not null default '',
  pubblicata_il timestamptz,
  nascosta     boolean not null default false,     -- freno a mano: fuori dalla pagina in un clic
  importata_il timestamptz not null default now(),
  unique (fonte_id, guid)
);
create index if not exists notizie_data_idx on public.notizie (pubblicata_il desc);
alter table public.notizie enable row level security;
drop policy if exists "notizie_read"  on public.notizie;
-- pubbliche, ma solo quelle non nascoste e di fonti attive
drop policy if exists "notizie_read" on public.notizie;
create policy "notizie_read" on public.notizie for select to anon, authenticated
  using (not nascosta and exists (select 1 from public.fonti f where f.id = fonte_id and f.attiva));
drop policy if exists "notizie_write" on public.notizie;
drop policy if exists "notizie_write" on public.notizie;
create policy "notizie_write" on public.notizie for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());

-- ---------------------------------------------------------------------
-- Gli eventi/iniziative per la pace. Curati a mano dalla presidenza.
-- ---------------------------------------------------------------------
create table if not exists public.eventi_pace (
  id          bigserial primary key,
  titolo      text not null,
  descrizione text not null default '',
  luogo       text not null default '',
  url         text not null default '',
  inizio      date not null,
  fine        date,
  pubblicato  boolean not null default true,
  created_at  timestamptz not null default now()
);
create index if not exists eventi_pace_inizio_idx on public.eventi_pace (inizio);
alter table public.eventi_pace enable row level security;
drop policy if exists "eventi_pace_read"  on public.eventi_pace;
drop policy if exists "eventi_pace_read" on public.eventi_pace;
create policy "eventi_pace_read" on public.eventi_pace for select to anon, authenticated
  using (pubblicato);
drop policy if exists "eventi_pace_write" on public.eventi_pace;
drop policy if exists "eventi_pace_write" on public.eventi_pace;
create policy "eventi_pace_write" on public.eventi_pace for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());

-- ---------------------------------------------------------------------
-- Salvataggio in blocco delle notizie (chiamato dalla Edge Function).
-- Riceve un array JSON gia' ripulito e fa upsert per (fonte, guid):
-- reimportare lo stesso feed non crea doppioni.
-- ---------------------------------------------------------------------
create or replace function public.importa_notizie(p_fonte text, p_items jsonb)
returns int
language plpgsql security definer set search_path = public as $$
declare n int := 0;
begin
  if not public.is_presidency() then raise exception 'Riservato alla Presidenza'; end if;
  insert into public.notizie (fonte_id, guid, titolo, sommario, url, immagine, pubblicata_il)
  select p_fonte,
         it->>'guid', it->>'titolo', coalesce(it->>'sommario',''),
         it->>'url', coalesce(it->>'immagine',''),
         nullif(it->>'data','')::timestamptz
  from jsonb_array_elements(p_items) as it
  where coalesce(it->>'guid','') <> '' and coalesce(it->>'titolo','') <> ''
  on conflict (fonte_id, guid) do update
     set titolo = excluded.titolo, sommario = excluded.sommario,
         url = excluded.url, immagine = excluded.immagine,
         pubblicata_il = excluded.pubblicata_il;
  get diagnostics n = row_count;
  update public.fonti set ultimo_sync = now(), ultimo_esito = n || ' voci'
    where id = p_fonte;
  return n;
end; $$;

grant execute on function public.importa_notizie(text, jsonb) to authenticated;
grant select on public.fonti       to anon, authenticated;
grant select on public.notizie     to anon, authenticated;
grant select on public.eventi_pace to anon, authenticated;


-- ============ 0013_statistiche.sql ============

-- =====================================================================
-- 0013_statistiche.sql
--
-- Statistiche d'uso del portale, per la Presidenza: pagine viste (anche da
-- anonimi), accessi, dispositivo e provenienza.
--
-- PROGETTATA PER NON DIVENTARE SORVEGLIANZA (il pubblico include MINORI):
--   NON si registra: indirizzo IP, user-agent grezzo, geolocalizzazione,
--   nessun identificatore che segua la persona, nessun collegamento fra la
--   navigazione e l'identita' dell'utente.
--   Si registra solo: tipo di evento, sezione, categoria di dispositivo
--   (mobile/tablet/desktop), provenienza GROSSOLANA (diretto/ricerca/social/
--   host), se l'utente era autenticato (si/no) e il suo RUOLO (non il nome),
--   e un id di SESSIONE casuale che il browser rigenera a ogni visita.
--
-- La tabella e' CHIUSA: nessuno la legge o scrive direttamente. Si passa
-- solo per funzioni verificate:
--   - traccia(...)  -> inserisce, ripulendo e limitando i valori (anche anon);
--   - stat_*()      -> leggono solo aggregati, e solo la Presidenza.
--
-- Lato pagina il tracciamento parte SOLO dopo consenso e rispetta Do Not
-- Track / Global Privacy Control (vedi app.js). Questo e' l'assetto piu'
-- prudente: per usi piu' estesi va sentito un responsabile privacy (DPO).
-- =====================================================================

create table if not exists public.telemetria (
  id           bigserial primary key,
  ts           timestamptz not null default now(),
  tipo         text not null,                 -- pageview | login | logout | click | azione
  vista        text not null default '',      -- sezione o percorso
  dettaglio    text not null default '',      -- etichetta breve (es. bottone), ripulita
  dispositivo  text not null default 'altro', -- mobile | tablet | desktop | altro
  provenienza  text not null default 'diretto',
  autenticato  boolean not null default false,
  ruolo        text,                          -- iscritto | delegato | presidenza | null (MAI il nome)
  sessione     text not null default ''       -- casuale per-visita, pseudonimo
);
create index if not exists telemetria_ts_idx  on public.telemetria (ts);
create index if not exists telemetria_tv_idx  on public.telemetria (tipo, vista);

alter table public.telemetria enable row level security;
-- Nessuna policy: la tabella non e' accessibile direttamente. Solo le
-- funzioni security definer qui sotto la toccano.

-- ---------------------------------------------------------------------
-- Inserimento: aperto anche agli anonimi, ma ogni valore e' ripulito e
-- limitato, cosi' il client non puo' iniettare dati liberi (ne' PII).
-- ---------------------------------------------------------------------
create or replace function public.traccia(
  p_tipo text, p_vista text default '', p_dettaglio text default '',
  p_dispositivo text default 'altro', p_provenienza text default 'diretto',
  p_autenticato boolean default false, p_ruolo text default null, p_sessione text default ''
) returns void
language plpgsql security definer set search_path = public as $$
declare v_tipo text; v_disp text; v_ruolo text;
begin
  v_tipo := lower(coalesce(p_tipo,''));
  if v_tipo not in ('pageview','login','logout','click','azione') then return; end if;  -- ignora tipi non previsti
  v_disp := lower(coalesce(p_dispositivo,'altro'));
  if v_disp not in ('mobile','tablet','desktop') then v_disp := 'altro'; end if;
  v_ruolo := lower(coalesce(p_ruolo,''));
  if v_ruolo not in ('iscritto','delegato','presidenza') then v_ruolo := null; end if;
  insert into public.telemetria (tipo, vista, dettaglio, dispositivo, provenienza, autenticato, ruolo, sessione)
  values (
    v_tipo,
    left(regexp_replace(coalesce(p_vista,''),      '[[:cntrl:]]', ' ', 'g'), 40),
    left(regexp_replace(coalesce(p_dettaglio,''),  '[[:cntrl:]@]', ' ', 'g'), 80),  -- via anche '@' per scoraggiare email
    v_disp,
    left(regexp_replace(coalesce(p_provenienza,''),'[[:cntrl:]@]', ' ', 'g'), 40),
    coalesce(p_autenticato,false),
    v_ruolo,
    left(regexp_replace(coalesce(p_sessione,''),   '[^A-Za-z0-9_-]', '', 'g'), 40)  -- solo token opaco
  );
end; $$;

-- ---------------------------------------------------------------------
-- Letture: solo aggregati, solo Presidenza.
-- ---------------------------------------------------------------------
create or replace function public.stat_riepilogo()
returns table (visite_oggi bigint, visite_7g bigint, visite_30g bigint,
               login_30g bigint, sessioni_30g bigint, perc_mobile int, perc_autenticato int)
language sql stable security definer set search_path = public as $$
  select
    count(*) filter (where tipo='pageview' and ts >= date_trunc('day', now())),
    count(*) filter (where tipo='pageview' and ts >= now() - interval '7 days'),
    count(*) filter (where tipo='pageview' and ts >= now() - interval '30 days'),
    count(*) filter (where tipo='login'    and ts >= now() - interval '30 days'),
    count(distinct sessione) filter (where ts >= now() - interval '30 days' and sessione <> ''),
    coalesce(round(100.0 * count(*) filter (where tipo='pageview' and dispositivo='mobile' and ts >= now() - interval '30 days')
             / nullif(count(*) filter (where tipo='pageview' and ts >= now() - interval '30 days'),0)))::int,
    coalesce(round(100.0 * count(*) filter (where tipo='pageview' and autenticato and ts >= now() - interval '30 days')
             / nullif(count(*) filter (where tipo='pageview' and ts >= now() - interval '30 days'),0)))::int
  from public.telemetria
  where public.is_presidency();
$$;

create or replace function public.stat_giorni(p_giorni int default 14)
returns table (giorno date, visite bigint)
language sql stable security definer set search_path = public as $$
  select d::date, count(t.id)
  from generate_series(date_trunc('day', now()) - ((greatest(p_giorni,1)-1) || ' days')::interval,
                       date_trunc('day', now()), '1 day') d
  left join public.telemetria t
    on t.tipo='pageview' and t.ts >= d and t.ts < d + interval '1 day' and public.is_presidency()
  group by d order by d;
$$;

create or replace function public.stat_dispositivi()
returns table (dispositivo text, n bigint)
language sql stable security definer set search_path = public as $$
  select dispositivo, count(*) from public.telemetria
  where tipo='pageview' and ts >= now() - interval '30 days' and public.is_presidency()
  group by dispositivo order by count(*) desc;
$$;

create or replace function public.stat_sezioni()
returns table (vista text, n bigint)
language sql stable security definer set search_path = public as $$
  select vista, count(*) from public.telemetria
  where tipo='pageview' and ts >= now() - interval '30 days' and vista <> '' and public.is_presidency()
  group by vista order by count(*) desc limit 10;
$$;

create or replace function public.stat_provenienze()
returns table (provenienza text, n bigint)
language sql stable security definer set search_path = public as $$
  select provenienza, count(distinct sessione) from public.telemetria
  where ts >= now() - interval '30 days' and public.is_presidency()
  group by provenienza order by count(distinct sessione) desc limit 10;
$$;

grant execute on function public.traccia(text,text,text,text,text,boolean,text,text) to anon, authenticated;
grant execute on function public.stat_riepilogo()      to authenticated;
grant execute on function public.stat_giorni(int)      to authenticated;
grant execute on function public.stat_dispositivi()    to authenticated;
grant execute on function public.stat_sezioni()        to authenticated;
grant execute on function public.stat_provenienze()    to authenticated;


-- ============ 0014_formule_base.sql ============

-- =====================================================================
-- 0014_formule_base.sql
-- Due formule d'ingresso per i mecenati, piu' piccole delle precedenti:
--   Sostenitore  100 € -> 1 accesso annuale
--   Benefattore  500 € -> 5 accessi annuali
-- Concedono l'accesso Civis per dodici mesi (la membership a pagamento
-- di base). Sono la porta d'ingresso al mecenatismo: chi vuole aiutare
-- anche solo un ragazzo puo' farlo.
-- =====================================================================
insert into public.mecenati_formule
  (id, nome, importo, quanti, concede, tipo, durata_mesi, descrizione, ordine, attivo)
values
  ('sostenitore', 'Sostenitore', 100, 1, 'civis', 'membership', 12,
   'Un accesso annuale Civis, per un ragazzo. Il primo passo del mecenatismo: aiuti una persona sola, ma per un anno intero.',
   5, true),
  ('benefattore', 'Benefattore', 500, 5, 'civis', 'membership', 12,
   'Cinque accessi annuali Civis. La misura di un piccolo gruppo, di una parrocchia o di un''associazione che adotta qualche studente.',
   8, true)
on conflict (id) do nothing;


-- ============ 0015_gestionale.sql ============

-- =====================================================================
-- 0015_gestionale.sql
--
-- GESTIONALE AMMINISTRATIVO (solo backend/Presidenza; la parte pubblica
-- del portale non cambia):
--   1. ANAGRAFICHE  — registro di formatori, collaboratori, fornitori.
--      Dati personali (CF, indirizzo): li legge SOLO la presidenza, e la
--      persona stessa se collegata a un utente del portale.
--   2. CONTATTI     — diario dei contatti per ogni anagrafica (chi, quando,
--      su cosa). Solo presidenza.
--   3. CONTRATTI    — contratti dei formatori: numerazione progressiva
--      annuale, testo generato e ARCHIVIATO nel database (il documento
--      resta anche se il modello cambia), stati bozza -> inviato ->
--      firmato -> archiviato. Il formatore vede i PROPRI contratti.
--   4. RUOLO "formatore" — un formatore accede al portale e gestisce i
--      SOLI corsi a lui assegnati (courses.formatore_id).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Ruolo formatore
-- ---------------------------------------------------------------------
alter table public.profiles drop constraint if exists profiles_ruolo_check;
alter table public.profiles add constraint profiles_ruolo_check
  check (ruolo in ('iscritto','delegato','presidenza','formatore'));

-- ---------------------------------------------------------------------
-- I corsi hanno un formatore assegnato (utente del portale)
-- ---------------------------------------------------------------------
alter table public.courses add column if not exists formatore_id uuid references public.profiles(id);

-- il formatore vede anche i propri corsi non pubblicati...
drop policy if exists "courses_formatore_read" on public.courses;
drop policy if exists "courses_formatore_read" on public.courses;
create policy "courses_formatore_read" on public.courses for select to authenticated
  using (formatore_id = auth.uid());
-- ...e puo' aggiornarli (titolo, descrizione, ordine dei contenuti)
drop policy if exists "courses_formatore_update" on public.courses;
drop policy if exists "courses_formatore_update" on public.courses;
create policy "courses_formatore_update" on public.courses for update to authenticated
  using (formatore_id = auth.uid()) with check (formatore_id = auth.uid());

-- ---------------------------------------------------------------------
-- 1. ANAGRAFICHE
-- ---------------------------------------------------------------------
create table if not exists public.anagrafiche (
  id             bigserial primary key,
  tipo           text not null default 'formatore'
                 check (tipo in ('formatore','collaboratore','fornitore','ente','altro')),
  nome           text not null,
  cognome        text not null default '',
  codice_fiscale text not null default '',
  partita_iva    text not null default '',
  email          text not null default '',
  telefono       text not null default '',
  indirizzo      text not null default '',
  citta          text not null default '',
  cap            text not null default '',
  provincia      text not null default '',
  qualifica      text not null default '',   -- es. "Docente di bioetica"
  note           text not null default '',
  user_id        uuid references auth.users(id),  -- collega all'account del portale (per formatori)
  attivo         boolean not null default true,
  updated_at     timestamptz not null default now()
);
alter table public.anagrafiche enable row level security;
drop policy if exists "anagrafiche_pres" on public.anagrafiche;
drop policy if exists "anagrafiche_pres" on public.anagrafiche;
create policy "anagrafiche_pres" on public.anagrafiche for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());
drop policy if exists "anagrafiche_self" on public.anagrafiche;
drop policy if exists "anagrafiche_self" on public.anagrafiche;
create policy "anagrafiche_self" on public.anagrafiche for select to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- 2. CONTATTI (diario per anagrafica) — solo presidenza
-- ---------------------------------------------------------------------
create table if not exists public.contatti (
  id            bigserial primary key,
  anagrafica_id bigint not null references public.anagrafiche(id) on delete cascade,
  data          date not null default current_date,
  canale        text not null default 'email'
                check (canale in ('email','telefono','incontro','videochiamata','altro')),
  oggetto       text not null,
  note          text not null default '',
  created_at    timestamptz not null default now()
);
alter table public.contatti enable row level security;
drop policy if exists "contatti_pres" on public.contatti;
drop policy if exists "contatti_pres" on public.contatti;
create policy "contatti_pres" on public.contatti for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());

-- ---------------------------------------------------------------------
-- 3. CONTRATTI — numerati, con testo archiviato nel database
-- ---------------------------------------------------------------------
create table if not exists public.contratti (
  id            bigserial primary key,
  numero        text not null unique,               -- es. C-2026-001
  anagrafica_id bigint not null references public.anagrafiche(id) on delete restrict,
  tipo          text not null default 'docenza'
                check (tipo in ('docenza','collaborazione','consulenza','altro')),
  oggetto       text not null,
  descrizione   text not null default '',
  compenso      numeric(10,2) not null default 0 check (compenso >= 0),
  data_inizio   date,
  data_fine     date,
  stato         text not null default 'bozza'
                check (stato in ('bozza','inviato','firmato','archiviato')),
  testo         text not null default '',           -- il documento generato, conservato
  note          text not null default '',
  firmato_il    date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
alter table public.contratti enable row level security;
drop policy if exists "contratti_pres" on public.contratti;
drop policy if exists "contratti_pres" on public.contratti;
create policy "contratti_pres" on public.contratti for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());
-- il formatore legge i PROPRI contratti (tramite l'anagrafica collegata al suo utente)
drop policy if exists "contratti_own" on public.contratti;
drop policy if exists "contratti_own" on public.contratti;
create policy "contratti_own" on public.contratti for select to authenticated
  using (exists (select 1 from public.anagrafiche a
                 where a.id = anagrafica_id and a.user_id = auth.uid()));

-- Numerazione progressiva per anno (C-2026-001, C-2026-002, ...)
create or replace function public.genera_numero_contratto()
returns text language plpgsql security definer set search_path = public as $$
declare y text := to_char(now(),'YYYY'); n int;
begin
  if not public.is_presidency() then raise exception 'Riservato alla Presidenza'; end if;
  select count(*) + 1 into n from public.contratti where numero like 'C-'||y||'-%';
  return 'C-'||y||'-'||lpad(n::text, 3, '0');
end; $$;

grant execute on function public.genera_numero_contratto() to authenticated;
grant select on public.anagrafiche to authenticated;
grant select, insert, update, delete on public.anagrafiche to authenticated;
grant select, insert, update, delete on public.contatti    to authenticated;
grant select, insert, update, delete on public.contratti   to authenticated;
grant usage on all sequences in schema public to authenticated;


-- ============ 0016_contratti_modelli.sql ============

-- =====================================================================
-- 0016_contratti_modelli.sql
--
-- MODELLI DI CONTRATTO: la presidenza puo' definire piu' tipi di
-- contratto (titolo + testo), e il testo usa VARIABILI {{cosi}} che
-- vengono sostituite alla generazione con i dati dell'ente,
-- dell'anagrafica e dell'incarico. Il contratto generato conserva il
-- titolo e il testo gia' compilato (l'archivio resta immutabile anche
-- se il modello cambia in seguito).
--
-- Variabili disponibili (sostituite dal portale alla generazione):
--   ente:        {{ente_denominazione}} {{ente_intestatario}} {{ente_email}}
--                {{ente_iban}} {{ente_banca}}
--   anagrafica:  {{nome}} {{cognome}} {{nome_completo}} {{codice_fiscale}}
--                {{partita_iva}} {{email}} {{telefono}} {{indirizzo}}
--                {{residenza}} {{qualifica}}
--   incarico:    {{numero}} {{titolo}} {{oggetto}} {{descrizione}}
--                {{compenso}} {{data_inizio}} {{data_fine}} {{periodo}}
--   data:        {{oggi}} {{anno}}
-- =====================================================================

create table if not exists public.contratti_modelli (
  id         bigserial primary key,
  titolo     text not null,                 -- es. "Contratto di docenza"
  testo      text not null default '',     -- con le variabili {{...}}
  attivo     boolean not null default true,
  ordine     int not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.contratti_modelli enable row level security;
drop policy if exists "modelli_pres" on public.contratti_modelli;
drop policy if exists "modelli_pres" on public.contratti_modelli;
create policy "modelli_pres" on public.contratti_modelli for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());
grant select, insert, update, delete on public.contratti_modelli to authenticated;

-- il contratto generato ricorda il titolo del modello usato
alter table public.contratti add column if not exists titolo text not null default '';

-- Modello di partenza (l'attuale contratto di incarico, ora modificabile)
insert into public.contratti_modelli (titolo, testo, ordine, attivo)
select 'Contratto di incarico', $tpl$CONTRATTO DI INCARICO N. {{numero}}
{{titolo}}

TRA
{{ente_denominazione}} (di seguito, "l'Ente"), email {{ente_email}}

E
{{nome_completo}}, C.F. {{codice_fiscale}}, {{residenza}} (di seguito, "l'Incaricato/a")

SI CONVIENE E SI STIPULA QUANTO SEGUE

Art. 1 - Oggetto
L'Ente affida all'Incaricato/a il seguente incarico: {{oggetto}}.
Attivita' previste: {{descrizione}}

Art. 2 - Durata
L'incarico si svolge {{periodo}}. Non e' previsto alcun vincolo di subordinazione.

Art. 3 - Compenso
Per l'attivita' di cui all'Art. 1 e' riconosciuto un compenso complessivo di {{compenso}} lordi, corrisposto secondo le modalita' concordate fra le parti, dietro presentazione della documentazione fiscale prevista dalla normativa applicabile.

Art. 4 - Obblighi dell'Incaricato/a
L'Incaricato/a svolge l'attivita' con diligenza e in coerenza con i principi del Manifesto de La Pacifica Res Publica, utilizzando i materiali nel rispetto dei diritti di terzi.

Art. 5 - Riservatezza e protezione dei dati
Le parti si impegnano alla riservatezza sulle informazioni di cui vengano a conoscenza in ragione dell'incarico e trattano i dati personali nel rispetto del Reg. (UE) 2016/679 (GDPR).

Art. 6 - Recesso
Ciascuna parte puo' recedere con comunicazione scritta con congruo preavviso, fatto salvo il compenso per l'attivita' gia' svolta.

Art. 7 - Controversie
Per ogni controversia le parti tenteranno una composizione amichevole; in difetto, e' competente il foro previsto dalla legge.

Luogo e data: ______________________________

L'Ente                                    L'Incaricato/a

______________________________            ______________________________$tpl$, 10, true
where not exists (select 1 from public.contratti_modelli);


-- ============ 0017_amministrazione.sql ============

-- =====================================================================
-- 0017_amministrazione.sql
--
-- 1. ALLEGATI: file allegabili ai contenuti (corsi, testi, campus,
--    eventi, video, audiolibri). I file vivono nello Storage di
--    Supabase (bucket "allegati", pubblico in lettura); questa tabella
--    tiene il registro. Scrive solo la presidenza.
-- 2. ACCOUNT S3: piu' destinazioni compatibili S3 (AWS S3, Cloudflare
--    R2, Backblaze B2, Wasabi...) per i file video pesanti. Le chiavi
--    stanno SOLO qui, protette da RLS presidenza; la firma dei
--    caricamenti avviene nella Edge Function "s3-presign".
-- 3. UTENTI e PAGAMENTI: la presidenza puo' aggiornare ruolo,
--    membership e scadenza degli utenti, e vedere tutti i pagamenti
--    (per riconciliare bonifici e gestire i casi manuali).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. ALLEGATI
-- ---------------------------------------------------------------------
create table if not exists public.allegati (
  id         bigserial primary key,
  tabella    text not null check (tabella in ('courses','texts','campus','events','videos','audiobooks')),
  record_id  text not null,
  nome       text not null,
  url        text not null,
  dimensione bigint not null default 0,
  updated_at timestamptz not null default now()
);
create index if not exists allegati_rec_idx on public.allegati (tabella, record_id);
alter table public.allegati enable row level security;
drop policy if exists "allegati_read" on public.allegati;
drop policy if exists "allegati_read" on public.allegati;
create policy "allegati_read" on public.allegati for select to anon, authenticated using (true);
drop policy if exists "allegati_write" on public.allegati;
drop policy if exists "allegati_write" on public.allegati;
create policy "allegati_write" on public.allegati for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());
grant select on public.allegati to anon;
grant select, insert, update, delete on public.allegati to authenticated;

-- Bucket Storage "allegati" + regole (esiste solo su Supabase: in locale
-- lo schema storage manca, quindi il blocco e' protetto)
do $stor$ begin
  insert into storage.buckets (id, name, public) values ('allegati','allegati', true)
    on conflict (id) do nothing;
  begin
    drop policy if exists "allegati_public_read" on storage.objects;
    create policy "allegati_public_read" on storage.objects for select
      using (bucket_id = 'allegati');
    drop policy if exists "allegati_pres_write" on storage.objects;
    create policy "allegati_pres_write" on storage.objects for insert to authenticated
      with check (bucket_id = 'allegati' and public.is_presidency());
    drop policy if exists "allegati_pres_delete" on storage.objects;
    create policy "allegati_pres_delete" on storage.objects for delete to authenticated
      using (bucket_id = 'allegati' and public.is_presidency());
  exception when insufficient_privilege then null;
  end;
exception when undefined_table then null;
end $stor$;

-- ---------------------------------------------------------------------
-- 2. ACCOUNT S3 (piu' destinazioni)
-- ---------------------------------------------------------------------
create table if not exists public.s3_accounts (
  id                bigserial primary key,
  nome              text not null,            -- es. "R2 principale", "Backblaze video 2026"
  endpoint          text not null,            -- es. https://<accountid>.r2.cloudflarestorage.com
  region            text not null default 'auto',
  bucket            text not null,
  access_key_id     text not null,
  secret_access_key text not null,
  public_base_url   text not null default '', -- URL pubblico dei file (CDN o bucket pubblico)
  attivo            boolean not null default true,
  updated_at        timestamptz not null default now()
);
alter table public.s3_accounts enable row level security;
drop policy if exists "s3_pres" on public.s3_accounts;
drop policy if exists "s3_pres" on public.s3_accounts;
create policy "s3_pres" on public.s3_accounts for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());
grant select, insert, update, delete on public.s3_accounts to authenticated;

-- ---------------------------------------------------------------------
-- 3. UTENTI e PAGAMENTI (amministrazione)
-- ---------------------------------------------------------------------
drop policy if exists "profiles_update_presidency" on public.profiles;
drop policy if exists "profiles_update_presidency" on public.profiles;
create policy "profiles_update_presidency" on public.profiles for update to authenticated
  using (public.is_presidency()) with check (public.is_presidency());

drop policy if exists "payments_select_presidency" on public.payments;
drop policy if exists "payments_select_presidency" on public.payments;
create policy "payments_select_presidency" on public.payments for select to authenticated
  using (public.is_presidency());

grant usage on all sequences in schema public to authenticated;


-- ============ 0018_lezioni.sql ============

-- =====================================================================
-- 0018_lezioni.sql — LEZIONI DEI CORSI
-- Ogni corso e' composto da lezioni: titolo, breve descrizione, video,
-- allegati (scaricabili e stampabili) e un QUIZ a risposta multipla
-- (una o piu' risposte corrette), salvato in JSON:
--   [ { "q":"domanda", "r":[ {"t":"risposta","ok":true}, ... ] }, ... ]
-- Le gestisce la Presidenza e il FORMATORE assegnato al corso.
-- Una lezione puo' avere tutto, o anche solo il video: i campi extra
-- sono facoltativi.
-- =====================================================================
create table if not exists public.course_lessons (
  id          bigserial primary key,
  course_id   text not null references public.courses(id) on delete cascade,
  titolo      text not null,
  descrizione text not null default '',
  video_url   text not null default '',
  quiz        jsonb not null default '[]'::jsonb,
  ordine      int not null default 1,
  pubblicata  boolean not null default true,
  updated_at  timestamptz not null default now()
);
create index if not exists lessons_course_idx on public.course_lessons (course_id, ordine);
alter table public.course_lessons enable row level security;
-- lettura: utenti autenticati, lezioni pubblicate; chi la gestisce vede anche le bozze
drop policy if exists "lessons_read" on public.course_lessons;
drop policy if exists "lessons_read" on public.course_lessons;
create policy "lessons_read" on public.course_lessons for select to authenticated
  using (pubblicata = true or public.is_presidency()
         or exists (select 1 from public.courses c where c.id = course_id and c.formatore_id = auth.uid()));
-- scrittura: presidenza o il formatore del corso
drop policy if exists "lessons_write" on public.course_lessons;
drop policy if exists "lessons_write" on public.course_lessons;
create policy "lessons_write" on public.course_lessons for all to authenticated
  using (public.is_presidency() or exists (select 1 from public.courses c where c.id = course_id and c.formatore_id = auth.uid()))
  with check (public.is_presidency() or exists (select 1 from public.courses c where c.id = course_id and c.formatore_id = auth.uid()));
grant select, insert, update, delete on public.course_lessons to authenticated;

-- Allegati: ora anche per le lezioni, con una descrizione
alter table public.allegati add column if not exists descrizione text not null default '';
alter table public.allegati drop constraint if exists allegati_tabella_check;
alter table public.allegati add constraint allegati_tabella_check
  check (tabella in ('courses','texts','campus','events','videos','audiobooks','lezioni'));
-- il formatore puo' allegare alle SUE lezioni
drop policy if exists "allegati_formatore" on public.allegati;
drop policy if exists "allegati_formatore" on public.allegati;
create policy "allegati_formatore" on public.allegati for all to authenticated
  using (tabella = 'lezioni' and exists (select 1 from public.course_lessons l join public.courses c on c.id=l.course_id
         where l.id::text = record_id and c.formatore_id = auth.uid()))
  with check (tabella = 'lezioni' and exists (select 1 from public.course_lessons l join public.courses c on c.id=l.course_id
         where l.id::text = record_id and c.formatore_id = auth.uid()));
grant usage on all sequences in schema public to authenticated;


-- ============ 0019_cron_rassegna.sql ============

-- =====================================================================
-- 0019_cron_rassegna.sql — AGGIORNAMENTO AUTOMATICO DELLA RASSEGNA
-- Ogni ora (al minuto 12) pg_cron chiama la Edge Function "rassegna"
-- in modalita' "tutte le fonti attive". La chiamata usa una chiave
-- segreta condivisa (CRON_SECRET), conservata in una tabella SENZA
-- alcuna policy di lettura: nessun utente del sito puo' vederla.
--
-- DOPO questa migrazione servono due cose (una volta sola):
--   1) inserire i tre valori in cron_config (vedi
--      supabase/attiva-cron-rassegna.sql)
--   2) impostare lo stesso CRON_SECRET nei "Secrets" della funzione
--      rassegna e ripubblicarla.
-- In locale pg_cron/pg_net non esistono: i blocchi sotto lo tollerano.
-- =====================================================================
create table if not exists public.cron_config (
  chiave text primary key,
  valore text not null
);
alter table public.cron_config enable row level security;  -- nessuna policy: invisibile a tutti i ruoli del sito
revoke all on public.cron_config from anon, authenticated;

create or replace function public.rassegna_cron()
returns void language plpgsql security definer set search_path = public as $fn$
declare
  v_base   text; v_anon text; v_secret text;
begin
  select valore into v_base   from public.cron_config where chiave='functions_base';
  select valore into v_anon   from public.cron_config where chiave='anon_key';
  select valore into v_secret from public.cron_config where chiave='cron_secret';
  if v_base is null or v_anon is null or v_secret is null then
    raise notice 'rassegna_cron: configura cron_config (functions_base, anon_key, cron_secret)';
    return;
  end if;
  perform net.http_post(
    url     := rtrim(v_base,'/') || '/rassegna',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'Authorization','Bearer '||v_anon,
      'x-cron-key', v_secret),
    body    := '{"tutte":true}'::jsonb
  );
end $fn$;

do $$ begin
  create extension if not exists pg_net;
exception when others then raise notice 'pg_net non disponibile (normale fuori da Supabase)'; end $$;
do $$ begin
  create extension if not exists pg_cron;
exception when others then raise notice 'pg_cron non disponibile (normale fuori da Supabase)'; end $$;
do $$ begin
  perform cron.unschedule('rassegna-ogni-ora');
exception when others then null; end $$;
do $$ begin
  perform cron.schedule('rassegna-ogni-ora', '12 * * * *', $c$select public.rassegna_cron()$c$);
  raise notice 'rassegna: aggiornamento automatico pianificato ogni ora (minuto 12)';
exception when others then raise notice 'cron non pianificato (normale fuori da Supabase)'; end $$;


-- ============ 0020_evento_enigma.sql ============

-- =====================================================================
-- 0020_evento_enigma.sql — L'evento in evidenza cambia veste
-- "Speculum 2027" diventa "ENIGMA ET SPECULUM": l'incontro con
-- Leonardo e i suoi amici. Aggiorna la scheda esistente (se presente)
-- ovunque sia mostrata: banner della home e pagina Eventi.
-- Rieseguibile: se il titolo e' gia' aggiornato non tocca nulla.
-- =====================================================================
update public.events set
  titolo      = 'ENIGMA ET SPECULUM',
  sottotitolo = 'L''incontro con Leonardo e i suoi amici',
  descrizione = 'Una mostra immersiva che invita a riscoprire la Scuola di Atene come la segreta Accademia Vinciana. Un percorso tra filosofia, memoria e futuro per far rivivere il pensiero che l''ha animata.',
  periodo     = 'Settembre 2027',
  luogo       = 'Verona'
where titolo = 'Speculum 2027';
