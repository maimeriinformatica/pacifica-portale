-- =====================================================================
-- 0022_diamanti.sql — I DIAMANTI DELLA PACIFICA (libri a pagamento)
-- Libri in PDF leggibili SOLO online, dopo l'acquisto (item 'libro:<id>'
-- nella tabella purchases). Il PDF vive in un deposito PRIVATO
-- ('diamanti'): nessun indirizzo pubblico; il portale chiede un
-- collegamento firmato di breve durata, che il database concede solo
-- a chi ha acquistato quel libro (o alla Presidenza).
-- Facoltativo: collegamento all'edizione cartacea (link_cartaceo).
-- =====================================================================
create table if not exists public.libri (
  id             text primary key default replace(gen_random_uuid()::text,'-',''),
  titolo         text not null,
  autore         text not null default '',
  descrizione    text not null default '',
  prezzo         numeric(10,2) not null default 0,
  copertina_url  text not null default '',
  pdf_path       text not null default '',
  link_cartaceo  text not null default '',
  ordine         int  not null default 0,
  pubblicato     boolean not null default true,
  created_at     timestamptz not null default now()
);
alter table public.libri enable row level security;
drop policy if exists "libri_read" on public.libri;
create policy "libri_read" on public.libri for select to anon, authenticated
  using (pubblicato or public.is_presidency());
drop policy if exists "libri_write" on public.libri;
create policy "libri_write" on public.libri for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());
grant select on public.libri to anon, authenticated;
grant insert, update, delete on public.libri to authenticated;

-- Deposito privato + regole d'accesso ai file (solo su Supabase: qui il
-- blocco e' protetto, cosi' il file resta rieseguibile ovunque).
do $$
begin
  insert into storage.buckets (id, name, public) values ('diamanti','diamanti', false)
    on conflict (id) do nothing;
  execute 'drop policy if exists "diamanti_read" on storage.objects';
  execute $p$create policy "diamanti_read" on storage.objects for select to authenticated
    using (bucket_id = 'diamanti' and (
      public.is_presidency()
      or exists (select 1 from public.purchases pu join public.libri l on pu.item = 'libro:' || l.id
                 where pu.profile_id = auth.uid() and l.pdf_path = storage.objects.name)))$p$;
  execute 'drop policy if exists "diamanti_write" on storage.objects';
  execute $p$create policy "diamanti_write" on storage.objects for all to authenticated
    using (bucket_id = 'diamanti' and public.is_presidency())
    with check (bucket_id = 'diamanti' and public.is_presidency())$p$;
exception when undefined_table or invalid_schema_name then
  raise notice 'storage non disponibile in questo ambiente: deposito "diamanti" da creare su Supabase';
end $$;
