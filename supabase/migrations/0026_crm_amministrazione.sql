-- =====================================================================
-- 0026_crm_amministrazione.sql — IL GESTIONALE DELL'ASSOCIAZIONE
-- Il lato amministrativo del portale (Presidenza → Amministrazione):
--  · CLIENTI e FORNITORI — vivono nelle anagrafiche (tipo 'cliente' e
--    'fornitore'); il cliente può essere collegato all'account del
--    portale (anagrafiche.user_id) per chi si registra all'accesso.
--  · PRODOTTI — il catalogo: ogni prodotto può appartenere a una
--    FAMIGLIA (es. «Corsi», «Libri», «Serie TV») e rimandare a un
--    contenuto del portale (un corso, un libro, un video, una serie).
--  · PACCHETTI PRODOTTI — ogni pacchetto ha un nome identificativo e
--    raccoglie famiglie intere di prodotti o singoli prodotti (voci).
--    Le modalità dell'abbonamento si definiscono qui, come pacchetti.
--  · ACQUISTI — il cliente sceglie se pagare e con quale modalità;
--    ogni acquisto di un pacchetto può rilasciare una EROGAZIONE
--    LIBERALE NUMERATA (numerazione progressiva per anno).
--  · LIBRI — link diretto di vendita Amazon e lettura online inclusa
--    nell'abbonamento (membership Academicus), oltre all'acquisto.
--  · VIDEO ON DEMAND — i video possono appartenere a una SERIE TV
--    della Pacifica (serie, stagione, episodio).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Anagrafiche: via il vincolo rigido sul tipo (il gestionale usa
--    anche tipi multipli separati da virgola e il nuovo tipo 'cliente')
-- ---------------------------------------------------------------------
alter table public.anagrafiche drop constraint if exists anagrafiche_tipo_check;

-- ---------------------------------------------------------------------
-- 2. PRODOTTI
-- ---------------------------------------------------------------------
create table if not exists public.prodotti (
  id          text primary key default replace(gen_random_uuid()::text,'-',''),
  nome        text not null,
  famiglia    text not null default '',
  tipo        text not null default 'altro'
              check (tipo in ('corso','libro','video','serie','servizio','altro')),
  riferimento text not null default '',   -- id del contenuto collegato (corso, libro, video) o nome della serie
  descrizione text not null default '',
  prezzo      numeric(10,2) not null default 0,
  attivo      boolean not null default true,
  ordine      int not null default 0,
  updated_at  timestamptz not null default now()
);
alter table public.prodotti enable row level security;
drop policy if exists "prodotti_read" on public.prodotti;
create policy "prodotti_read" on public.prodotti for select to authenticated
  using (attivo or public.is_presidency());
drop policy if exists "prodotti_write" on public.prodotti;
create policy "prodotti_write" on public.prodotti for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());
grant select on public.prodotti to authenticated;
grant insert, update, delete on public.prodotti to authenticated;

-- ---------------------------------------------------------------------
-- 3. PACCHETTI DI PRODOTTI e le loro voci
-- ---------------------------------------------------------------------
create table if not exists public.pacchetti_prodotti (
  id          text primary key default replace(gen_random_uuid()::text,'-',''),
  nome        text not null unique,        -- il nome identificativo del pacchetto
  descrizione text not null default '',
  prezzo      numeric(10,2) not null default 0,
  attivo      boolean not null default true,
  ordine      int not null default 0,
  updated_at  timestamptz not null default now()
);
create table if not exists public.pacchetti_voci (
  id           bigserial primary key,
  pacchetto_id text not null references public.pacchetti_prodotti(id) on delete cascade,
  tipo         text not null check (tipo in ('prodotto','famiglia')),
  valore       text not null                -- id del prodotto, oppure il nome della famiglia
);
create index if not exists pacch_voci_idx on public.pacchetti_voci (pacchetto_id);
alter table public.pacchetti_prodotti enable row level security;
alter table public.pacchetti_voci enable row level security;
drop policy if exists "pacchprod_read" on public.pacchetti_prodotti;
create policy "pacchprod_read" on public.pacchetti_prodotti for select to authenticated
  using (attivo or public.is_presidency());
drop policy if exists "pacchprod_write" on public.pacchetti_prodotti;
create policy "pacchprod_write" on public.pacchetti_prodotti for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());
drop policy if exists "pacchvoci_read" on public.pacchetti_voci;
create policy "pacchvoci_read" on public.pacchetti_voci for select to authenticated using (true);
drop policy if exists "pacchvoci_write" on public.pacchetti_voci;
create policy "pacchvoci_write" on public.pacchetti_voci for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());
grant select on public.pacchetti_prodotti, public.pacchetti_voci to authenticated;
grant insert, update, delete on public.pacchetti_prodotti, public.pacchetti_voci to authenticated;

-- ---------------------------------------------------------------------
-- 4. ACQUISTI dei pacchetti (il cliente sceglie se e come pagare)
-- ---------------------------------------------------------------------
create table if not exists public.acquisti_pacchetti (
  id            bigserial primary key,
  anagrafica_id bigint not null references public.anagrafiche(id),
  pacchetto_id  text not null references public.pacchetti_prodotti(id),
  data          date not null default current_date,
  importo       numeric(10,2) not null default 0,
  modalita      text not null default 'bonifico'
                check (modalita in ('bonifico','carta','contanti','stripe','altro')),
  note          text not null default '',
  erogazione_id bigint,
  created_at    timestamptz not null default now()
);
create index if not exists acq_anag_idx on public.acquisti_pacchetti (anagrafica_id);
alter table public.acquisti_pacchetti enable row level security;
drop policy if exists "acquisti_rw" on public.acquisti_pacchetti;
create policy "acquisti_rw" on public.acquisti_pacchetti for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());
grant select, insert, update, delete on public.acquisti_pacchetti to authenticated;
grant usage on sequence public.acquisti_pacchetti_id_seq to authenticated;

-- ---------------------------------------------------------------------
-- 5. EROGAZIONI LIBERALI numerate (progressivo per anno)
-- ---------------------------------------------------------------------
create table if not exists public.erogazioni_liberali (
  id            bigserial primary key,
  anno          int  not null,
  numero        int  not null,
  data          date not null default current_date,
  anagrafica_id bigint not null references public.anagrafiche(id),
  acquisto_id   bigint references public.acquisti_pacchetti(id),
  importo       numeric(10,2) not null default 0,
  causale       text not null default '',
  created_at    timestamptz not null default now(),
  unique (anno, numero)
);
alter table public.erogazioni_liberali enable row level security;
drop policy if exists "erogazioni_rw" on public.erogazioni_liberali;
create policy "erogazioni_rw" on public.erogazioni_liberali for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());
grant select, insert, update, delete on public.erogazioni_liberali to authenticated;
grant usage on sequence public.erogazioni_liberali_id_seq to authenticated;

-- Rilascia (una sola volta) l'erogazione liberale per un acquisto:
-- assegna il primo numero libero dell'anno della data dell'acquisto.
create or replace function public.rilascia_erogazione(p_acquisto bigint)
returns public.erogazioni_liberali
language plpgsql security definer set search_path = public as $$
declare
  a   public.acquisti_pacchetti%rowtype;
  er  public.erogazioni_liberali%rowtype;
  pn  text;
  yy  int;
  num int;
begin
  if not public.is_presidency() then
    raise exception 'Riservato alla Presidenza';
  end if;
  select * into a from public.acquisti_pacchetti where id = p_acquisto;
  if not found then raise exception 'Acquisto non trovato'; end if;
  if a.erogazione_id is not null then
    select * into er from public.erogazioni_liberali where id = a.erogazione_id;
    return er;                                  -- già rilasciata: la restituisce
  end if;
  select nome into pn from public.pacchetti_prodotti where id = a.pacchetto_id;
  yy := extract(year from a.data)::int;
  -- blocca le righe dell'anno per evitare due numeri uguali
  perform 1 from public.erogazioni_liberali where anno = yy for update;
  select coalesce(max(numero),0)+1 into num from public.erogazioni_liberali where anno = yy;
  insert into public.erogazioni_liberali (anno, numero, data, anagrafica_id, acquisto_id, importo, causale)
  values (yy, num, a.data, a.anagrafica_id, a.id, a.importo,
          'Erogazione liberale — pacchetto «' || coalesce(pn,'') || '»')
  returning * into er;
  update public.acquisti_pacchetti set erogazione_id = er.id where id = a.id;
  return er;
end $$;
grant execute on function public.rilascia_erogazione(bigint) to authenticated;

-- ---------------------------------------------------------------------
-- 6. LIBRI: link di vendita Amazon + lettura inclusa nell'abbonamento
-- ---------------------------------------------------------------------
alter table public.libri add column if not exists link_amazon   text not null default '';
alter table public.libri add column if not exists in_abbonamento boolean not null default false;

-- chi ha la membership Academicus legge i libri «in abbonamento»
do $$
begin
  execute 'drop policy if exists "diamanti_read" on storage.objects';
  execute $p$create policy "diamanti_read" on storage.objects for select to authenticated
    using (bucket_id = 'diamanti' and (
      public.is_presidency()
      or exists (select 1 from public.purchases pu join public.libri l on pu.item = 'libro:' || l.id
                 where pu.profile_id = auth.uid() and l.pdf_path = storage.objects.name)
      or exists (select 1 from public.libri l join public.profiles pr on pr.id = auth.uid()
                 where l.in_abbonamento and pr.membership = 'academicus'
                   and l.pdf_path = storage.objects.name)))$p$;
exception when undefined_table or invalid_schema_name then
  raise notice 'storage non disponibile in questo ambiente: regola "diamanti_read" da aggiornare su Supabase';
end $$;

-- ---------------------------------------------------------------------
-- 7. VIDEO ON DEMAND: le serie TV della Pacifica
-- ---------------------------------------------------------------------
alter table public.videos add column if not exists serie    text not null default '';
alter table public.videos add column if not exists stagione int  not null default 1;
alter table public.videos add column if not exists episodio int  not null default 0;
