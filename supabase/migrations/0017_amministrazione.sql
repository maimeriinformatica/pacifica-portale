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
create policy "allegati_read" on public.allegati for select to anon, authenticated using (true);
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
create policy "s3_pres" on public.s3_accounts for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());
grant select, insert, update, delete on public.s3_accounts to authenticated;

-- ---------------------------------------------------------------------
-- 3. UTENTI e PAGAMENTI (amministrazione)
-- ---------------------------------------------------------------------
drop policy if exists "profiles_update_presidency" on public.profiles;
create policy "profiles_update_presidency" on public.profiles for update to authenticated
  using (public.is_presidency()) with check (public.is_presidency());

drop policy if exists "payments_select_presidency" on public.payments;
create policy "payments_select_presidency" on public.payments for select to authenticated
  using (public.is_presidency());

grant usage on all sequences in schema public to authenticated;
