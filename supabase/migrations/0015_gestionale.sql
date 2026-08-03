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
create policy "courses_formatore_read" on public.courses for select to authenticated
  using (formatore_id = auth.uid());
-- ...e puo' aggiornarli (titolo, descrizione, ordine dei contenuti)
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
create policy "anagrafiche_pres" on public.anagrafiche for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());
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
create policy "contratti_pres" on public.contratti for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());
-- il formatore legge i PROPRI contratti (tramite l'anagrafica collegata al suo utente)
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
