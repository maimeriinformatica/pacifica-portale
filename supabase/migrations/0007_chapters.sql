-- =====================================================================
--  LA PACIFICA RES PUBLICA — Migrazione 0007
--  Capitoli strutturati per i testi della Biblioteca.
--  'capitoli' è un array JSON di oggetti { "t": "Titolo capitolo", "c": "Testo..." }.
--  Se vuoto, il lettore usa il campo 'testo' (testo unico, retro-compatibile).
-- =====================================================================

alter table public.texts
  add column if not exists capitoli jsonb not null default '[]'::jsonb;

-- Fine migrazione 0007
