-- =====================================================================
-- 0021_testi_sito.sql — TESTI DELLE PAGINE MODIFICABILI DAL GESTIONALE
-- Ogni testo "fisso" del sito (hero, schede delle sezioni, Manifesto,
-- intestazioni, motto) puo' essere sovrascritto da una riga di questa
-- tabella. Se la riga non c'e', il portale usa il testo predefinito
-- scritto nel codice. La struttura grafica resta nel codice.
--   chiave: es. 'hero.titolo', 'sezione.Campus.riga2', 'principio.IV.testo'
-- Lettura: tutti (anche non registrati: serve alla pagina pubblica).
-- Scrittura: solo la Presidenza, dal gestionale (Contenuti -> Testi
-- delle pagine).
-- =====================================================================
create table if not exists public.contenuti_sito (
  chiave     text primary key,
  valore     text not null,
  updated_at timestamptz not null default now()
);
alter table public.contenuti_sito enable row level security;
drop policy if exists "testi_read" on public.contenuti_sito;
create policy "testi_read" on public.contenuti_sito for select to anon, authenticated using (true);
drop policy if exists "testi_write" on public.contenuti_sito;
create policy "testi_write" on public.contenuti_sito for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());
grant select on public.contenuti_sito to anon, authenticated;
grant insert, update, delete on public.contenuti_sito to authenticated;
