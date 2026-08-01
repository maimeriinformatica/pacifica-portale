-- =====================================================================
--  LA PACIFICA RES PUBLICA — Migrazione 0004
--  Quinto pilastro: CAMPUS formativi in presenza, con possibilità di
--  soggiorno. Tabella gestibile dalla Presidenza (come gli altri contenuti).
--  Lettura: utenti autenticati (solo pubblicati). Scrittura: Presidenza.
-- =====================================================================

create table if not exists public.campus (
  id               text primary key,
  titolo           text not null,
  luogo            text not null default '',
  descrizione      text not null default '',
  data             text not null default '',     -- es. "17–18 ottobre 2026"
  durata           text not null default '',     -- es. "Weekend · 2 giorni, 1 notte"
  posti            int  not null default 30,
  prezzo           int  not null default 0,       -- partecipazione (senza pernottamento)
  prezzo_soggiorno int  not null default 0,       -- con vitto e alloggio
  commissione      text not null default '',
  ordine           int  not null default 0,
  pubblicato       boolean not null default true,
  updated_at       timestamptz not null default now()
);
alter table public.campus enable row level security;
create policy "campus_read"  on public.campus for select to authenticated
  using (pubblicato = true or public.is_presidency());
create policy "campus_write" on public.campus for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());

-- ----- Dati iniziali: edizioni presso l'Abbazia di Maguzzano -----
-- Casa di Spiritualità e Centro Ecumenico — Abbazia di Maguzzano (Lonato del Garda, Lago di Garda)

insert into public.campus(id,titolo,luogo,descrizione,data,durata,posti,prezzo,prezzo_soggiorno,commissione,ordine) values
('cmp1',
 $txt$Campus di Pace — Weekend introduttivo$txt$,
 $txt$Abbazia di Maguzzano — Casa di Spiritualità e Centro Ecumenico (Lonato del Garda, BS)$txt$,
 $txt$Due giorni immersi nei Sette Principi del Manifesto: laboratori di ascolto, dialogo e costruzione di pace, in un luogo di spiritualità affacciato sul Lago di Garda. Pensato per chi muove i primi passi nel Percorso di Pace.$txt$,
 $txt$17–18 ottobre 2026$txt$, $txt$Weekend · 2 giorni, 1 notte$txt$, 30, 120, 190, 'pace', 1),
('cmp2',
 $txt$Campus Scuola di Atene — Filosofia in dialogo$txt$,
 $txt$Abbazia di Maguzzano — Casa di Spiritualità e Centro Ecumenico (Lonato del Garda, BS)$txt$,
 $txt$Un fine settimana sulle grandi domande del pensiero, guidato dal Prof. Roberto Barbessi: lezioni dialogate, lettura dei classici e passeggiate filosofiche. La Scuola di Atene che prende vita in presenza.$txt$,
 $txt$14–15 novembre 2026$txt$, $txt$Weekend · 2 giorni, 1 notte$txt$, 25, 130, 200, 'etica', 2),
('cmp3',
 $txt$Campus Diplomazia e Dialogo — Ritiro residenziale$txt$,
 $txt$Abbazia di Maguzzano — Casa di Spiritualità e Centro Ecumenico (Lonato del Garda, BS)$txt$,
 $txt$Tre giorni residenziali di pratica diplomatica: simulazioni di negoziato, gestione dei conflitti e dialogo interculturale, con tempi di silenzio e convivialità. Un'esperienza intensiva per delegati e aspiranti tali.$txt$,
 $txt$5–7 dicembre 2026$txt$, $txt$3 giorni, 2 notti$txt$, 25, 180, 290, 'dialogo', 3)
on conflict (id) do nothing;

-- Fine migrazione 0004
