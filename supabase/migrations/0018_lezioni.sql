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
create policy "lessons_read" on public.course_lessons for select to authenticated
  using (pubblicata = true or public.is_presidency()
         or exists (select 1 from public.courses c where c.id = course_id and c.formatore_id = auth.uid()));
-- scrittura: presidenza o il formatore del corso
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
create policy "allegati_formatore" on public.allegati for all to authenticated
  using (tabella = 'lezioni' and exists (select 1 from public.course_lessons l join public.courses c on c.id=l.course_id
         where l.id::text = record_id and c.formatore_id = auth.uid()))
  with check (tabella = 'lezioni' and exists (select 1 from public.course_lessons l join public.courses c on c.id=l.course_id
         where l.id::text = record_id and c.formatore_id = auth.uid()));
grant usage on all sequences in schema public to authenticated;
