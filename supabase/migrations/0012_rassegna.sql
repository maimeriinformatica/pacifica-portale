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
create policy "fonti_read"  on public.fonti for select to anon, authenticated using (true);
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
create policy "notizie_read"  on public.notizie for select to anon, authenticated
  using (not nascosta and exists (select 1 from public.fonti f where f.id = fonte_id and f.attiva));
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
create policy "eventi_pace_read"  on public.eventi_pace for select to anon, authenticated
  using (pubblicato);
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
