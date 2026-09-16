-- Richieste di informazioni dai moduli del sito (nessuna email: restano nel portale)
create table if not exists public.richieste_info (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null,
  telefono text not null default '',
  progetti text[] not null default '{}',
  note text not null default '',
  created_at timestamptz not null default now()
);
alter table public.richieste_info enable row level security;
drop policy if exists "richieste: inserimento pubblico" on public.richieste_info;
create policy "richieste: inserimento pubblico" on public.richieste_info
  for insert to anon, authenticated with check (true);
drop policy if exists "richieste: lettura presidenza" on public.richieste_info;
create policy "richieste: lettura presidenza" on public.richieste_info
  for select to authenticated using (public.is_presidency());
drop policy if exists "richieste: eliminazione presidenza" on public.richieste_info;
create policy "richieste: eliminazione presidenza" on public.richieste_info
  for delete to authenticated using (public.is_presidency());
