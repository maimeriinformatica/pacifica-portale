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
create policy "profiles_select_authenticated"
  on public.profiles for select to authenticated using (true);

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
create policy "seats_select_presidency"
  on public.seats for select to authenticated
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

create policy "purchases_select_own"
  on public.purchases for select to authenticated
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

create policy "progress_select_own"
  on public.progress for select to authenticated using (profile_id = auth.uid());
create policy "progress_insert_own"
  on public.progress for insert to authenticated with check (profile_id = auth.uid());
create policy "progress_delete_own"
  on public.progress for delete to authenticated using (profile_id = auth.uid());

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

create policy "proposals_select_authenticated"
  on public.proposals for select to authenticated using (true);
create policy "proposals_insert_delegate"
  on public.proposals for insert to authenticated
  with check (autore_id = auth.uid() and (public.is_delegate() or public.is_presidency()));
create policy "proposals_update_presidency"
  on public.proposals for update to authenticated
  using (public.is_presidency()) with check (public.is_presidency());

create table if not exists public.votes (
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  voto        text not null check (voto in ('f','c')),
  created_at  timestamptz not null default now(),
  primary key (proposal_id, profile_id)
);
alter table public.votes enable row level security;

create policy "votes_select_authenticated"
  on public.votes for select to authenticated using (true);
create policy "votes_write_delegate"
  on public.votes for all to authenticated
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
alter publication supabase_realtime add table public.proposals;
alter publication supabase_realtime add table public.votes;
alter publication supabase_realtime add table public.seats;

-- Fine migrazione 0001
