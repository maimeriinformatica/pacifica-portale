-- =====================================================================
--  LA PACIFICA RES PUBLICA — Migrazione 0002
--  Contenuti gestibili dalla Presidenza:
--  corsi, video, audiolibri, pacchetti, prezzi.
--  Lettura: tutti gli autenticati (solo contenuti pubblicati).
--  Scrittura: solo la Presidenza (is_presidency()).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Corsi
-- ---------------------------------------------------------------------
create table if not exists public.courses (
  id          text primary key,
  titolo      text not null,
  formatore   text not null default '',
  commissione text not null default '',
  pacchetto   text not null default '',
  descrizione text not null default '',
  prezzo      int  not null default 69,
  ordine      int  not null default 0,
  pubblicato  boolean not null default true,
  updated_at  timestamptz not null default now()
);
alter table public.courses enable row level security;
create policy "courses_read"  on public.courses for select to authenticated
  using (pubblicato = true or public.is_presidency());
create policy "courses_write" on public.courses for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());

-- ---------------------------------------------------------------------
-- Video On Demand
-- ---------------------------------------------------------------------
create table if not exists public.videos (
  id          text primary key,
  titolo      text not null,
  tipo        text not null default 'Video',
  durata      text not null default '',
  gratuito    boolean not null default false,
  commissione text not null default '',
  descrizione text not null default '',
  url         text not null default '',
  ordine      int  not null default 0,
  pubblicato  boolean not null default true,
  updated_at  timestamptz not null default now()
);
alter table public.videos enable row level security;
create policy "videos_read"  on public.videos for select to authenticated
  using (pubblicato = true or public.is_presidency());
create policy "videos_write" on public.videos for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());

-- ---------------------------------------------------------------------
-- Audiolibri (Biblioteca)
-- ---------------------------------------------------------------------
create table if not exists public.audiobooks (
  id          text primary key,
  titolo      text not null,
  autore      text not null default '',
  durata      text not null default '',
  gratuito    boolean not null default false,
  commissione text not null default '',
  testo       text not null default '',
  audio_url   text not null default '',
  ordine      int  not null default 0,
  pubblicato  boolean not null default true,
  updated_at  timestamptz not null default now()
);
alter table public.audiobooks enable row level security;
create policy "audiobooks_read"  on public.audiobooks for select to authenticated
  using (pubblicato = true or public.is_presidency());
create policy "audiobooks_write" on public.audiobooks for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());

-- ---------------------------------------------------------------------
-- Pacchetti tematici (insieme di corsi a prezzo agevolato)
-- ---------------------------------------------------------------------
create table if not exists public.packages (
  id         text primary key,
  nome       text not null,
  corsi      jsonb not null default '[]'::jsonb,   -- es. ["c1","c2","c3"]
  prezzo     int  not null default 0,
  ordine     int  not null default 0,
  pubblicato boolean not null default true
);
alter table public.packages enable row level security;
create policy "packages_read"  on public.packages for select to authenticated
  using (pubblicato = true or public.is_presidency());
create policy "packages_write" on public.packages for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());

-- ---------------------------------------------------------------------
-- Impostazioni (prezzi globali e simili)
-- ---------------------------------------------------------------------
create table if not exists public.settings (
  key   text primary key,
  value text not null
);
alter table public.settings enable row level security;
create policy "settings_read"  on public.settings for select to authenticated using (true);
create policy "settings_write" on public.settings for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());

insert into public.settings(key, value) values
  ('prezzo_corso','69'), ('prezzo_percorso','440')
on conflict (key) do nothing;

-- ---------------------------------------------------------------------
-- Dati iniziali (travaso del catalogo esistente) -> vedi sotto
-- ---------------------------------------------------------------------

-- ===== SEED: corsi =====
insert into public.courses(id,titolo,formatore,commissione,pacchetto,descrizione,prezzo,ordine) values ('c1',$txt$Introduzione alla Filosofia$txt$,$txt$Prof. Roberto Barbessi$txt$,'etica',$txt$Pensiero e Storia$txt$,$txt$Le domande fondamentali che hanno acceso il pensiero occidentale: cosa significa conoscere, agire bene, vivere in una comunità giusta.$txt$,69,1) on conflict (id) do nothing;
insert into public.courses(id,titolo,formatore,commissione,pacchetto,descrizione,prezzo,ordine) values ('c2',$txt$La Scuola di Atene$txt$,$txt$Prof. Roberto Barbessi$txt$,'etica',$txt$Pensiero e Storia$txt$,$txt$Dentro l’affresco di Raffaello: Platone, Aristotele e l’ideale di una comunità di sapienti che dialogano per cercare il vero.$txt$,69,2) on conflict (id) do nothing;
insert into public.courses(id,titolo,formatore,commissione,pacchetto,descrizione,prezzo,ordine) values ('c3',$txt$Lo sviluppo nella storia dei processi di pace$txt$,$txt$Prof. Roberto Barbessi$txt$,'pace',$txt$Pensiero e Storia$txt$,$txt$Dai trattati antichi alle istituzioni moderne: come l’umanità ha imparato, faticosamente, a trasformare il conflitto in dialogo.$txt$,69,3) on conflict (id) do nothing;
insert into public.courses(id,titolo,formatore,commissione,pacchetto,descrizione,prezzo,ordine) values ('c4',$txt$Pratiche di consapevolezza e pace interiore$txt$,$txt$Dott.ssa Pighi$txt$,'diritti',$txt$Pratiche e Culture di Pace$txt$,$txt$La pace fuori comincia dalla pace dentro: attenzione, respiro e presenza come fondamento di ogni relazione non violenta.$txt$,69,4) on conflict (id) do nothing;
insert into public.courses(id,titolo,formatore,commissione,pacchetto,descrizione,prezzo,ordine) values ('c5',$txt$Dialogo interculturale e diplomazia$txt$,$txt$Dott. Mazzonetto$txt$,'dialogo',$txt$Pratiche e Culture di Pace$txt$,$txt$Gli strumenti del negoziato e dell’ascolto: come si costruiscono ponti tra culture, lingue e visioni del mondo diverse.$txt$,69,5) on conflict (id) do nothing;
insert into public.courses(id,titolo,formatore,commissione,pacchetto,descrizione,prezzo,ordine) values ('c6',$txt$Arte, bellezza e cultura di pace$txt$,$txt$Dott.ssa Zago$txt$,'arte',$txt$Pratiche e Culture di Pace$txt$,$txt$L’arte come linguaggio universale e atto di pace: dalla musica alla pittura, la bellezza che unisce dove le parole dividono.$txt$,69,6) on conflict (id) do nothing;
insert into public.courses(id,titolo,formatore,commissione,pacchetto,descrizione,prezzo,ordine) values ('c7',$txt$Etica ed economia responsabile$txt$,$txt$Dott. Bampa$txt$,'bene',$txt$Etica, Economia e Impresa$txt$,$txt$Un’economia al servizio della persona: bene comune, sostenibilità e responsabilità nelle scelte produttive e finanziarie.$txt$,69,7) on conflict (id) do nothing;
insert into public.courses(id,titolo,formatore,commissione,pacchetto,descrizione,prezzo,ordine) values ('c8',$txt$Impresa, lavoro e bene comune$txt$,$txt$Dott. Cesaro$txt$,'bene',$txt$Etica, Economia e Impresa$txt$,$txt$Il lavoro come luogo di dignità e cooperazione: modelli d’impresa che generano valore condiviso e coesione sociale.$txt$,69,8) on conflict (id) do nothing;

-- ===== SEED: video =====
insert into public.videos(id,titolo,tipo,durata,gratuito,commissione,descrizione,ordine) values ('v1',$txt$Il Manifesto della Pacifica$txt$,$txt$Documentario$txt$,'24 min',true,'memoria',$txt$Il film che racconta i Sette Principi fondativi e la nascita della Res Publica dei giovani.$txt$,1) on conflict (id) do nothing;
insert into public.videos(id,titolo,tipo,durata,gratuito,commissione,descrizione,ordine) values ('v2',$txt$La prima lezione del Prof. Barbessi$txt$,$txt$Lezione aperta$txt$,'25 min',true,'etica',$txt$Estratto gratuito dal corso di Filosofia: un assaggio del Percorso di Pace.$txt$,2) on conflict (id) do nothing;
insert into public.videos(id,titolo,tipo,durata,gratuito,commissione,descrizione,ordine) values ('v3',$txt$Dentro l’emiciclo: una seduta dei delegati$txt$,$txt$Documento$txt$,'38 min',false,'pace',$txt$Riprese di una seduta plenaria del Parlamento dei Giovani: dibattito, emendamenti, voto.$txt$,3) on conflict (id) do nothing;
insert into public.videos(id,titolo,tipo,durata,gratuito,commissione,descrizione,ordine) values ('v4',$txt$Conferenza: le diplomazie della pace$txt$,$txt$Conferenza$txt$,'52 min',false,'dialogo',$txt$Un dialogo a più voci sui grandi processi di pace contemporanei.$txt$,4) on conflict (id) do nothing;
insert into public.videos(id,titolo,tipo,durata,gratuito,commissione,descrizione,ordine) values ('v5',$txt$La bellezza che disarma$txt$,$txt$Documentario$txt$,'31 min',false,'arte',$txt$Viaggio nei luoghi dove l’arte è diventata strumento di riconciliazione.$txt$,5) on conflict (id) do nothing;
insert into public.videos(id,titolo,tipo,durata,gratuito,commissione,descrizione,ordine) values ('v6',$txt$Economia del bene comune$txt$,$txt$Masterclass$txt$,'44 min',false,'bene',$txt$Una masterclass sui modelli economici al servizio della persona.$txt$,6) on conflict (id) do nothing;
insert into public.videos(id,titolo,tipo,durata,gratuito,commissione,descrizione,ordine) values ('v7',$txt$Memoria e futuro: voci di testimoni$txt$,$txt$Documento$txt$,'40 min',false,'memoria',$txt$Testimonianze raccolte per custodire la memoria e illuminare il futuro.$txt$,7) on conflict (id) do nothing;
insert into public.videos(id,titolo,tipo,durata,gratuito,commissione,descrizione,ordine) values ('v8',$txt$Live mensile — Q&A con i formatori$txt$,$txt$Registrazione live$txt$,'61 min',false,'etica',$txt$La registrazione dell’incontro mensile riservato agli abbonati.$txt$,8) on conflict (id) do nothing;

-- ===== SEED: audiolibri =====
insert into public.audiobooks(id,titolo,autore,durata,gratuito,commissione,testo,ordine) values ('a1',$txt$Il Manifesto, narrato$txt$,$txt$La Pacifica$txt$,'18 min',true,'memoria',$txt$I Sette Principi della Pacifica Res Publica. Primo: la pace come fondamento di ogni convivenza, non assenza di conflitto ma presenza di giustizia. Secondo: la conoscenza unita alla coscienza, perché il sapere senza etica non genera futuro. Terzo: la dignità inviolabile di ogni persona, fondamento di ogni diritto. Quarto: l’unità nella diversità, dove il dialogo tra culture diventa diplomazia. Quinto: la bellezza che educa, l’arte come linguaggio universale di pace. Sesto: il bene comune anteposto all’interesse del singolo. Settimo: la memoria custodita per costruire il futuro.$txt$,1) on conflict (id) do nothing;
insert into public.audiobooks(id,titolo,autore,durata,gratuito,commissione,testo,ordine) values ('a2',$txt$Apologia di Socrate (estratti)$txt$,$txt$Platone — pubblico dominio$txt$,'42 min',false,'etica',$txt$So di non sapere: in questa consapevolezza Socrate fonda la sua ricerca. Davanti ai giudici di Atene non si difende per salvarsi, ma per restare fedele alla verità. La vita non esaminata, dice, non è degna di essere vissuta. Meglio subire ingiustizia che commetterla.$txt$,2) on conflict (id) do nothing;
insert into public.audiobooks(id,titolo,autore,durata,gratuito,commissione,testo,ordine) values ('a3',$txt$La pace perpetua (sintesi)$txt$,$txt$I. Kant — pubblico dominio$txt$,'55 min',false,'pace',$txt$Kant immagina una pace che non sia tregua tra due guerre, ma condizione duratura fondata sul diritto. Propone una federazione di liberi Stati e un diritto cosmopolitico dell’ospitalità. La pace non è un dono della natura ma un compito della ragione: va istituita.$txt$,3) on conflict (id) do nothing;
insert into public.audiobooks(id,titolo,autore,durata,gratuito,commissione,testo,ordine) values ('a4',$txt$Lettera sulla nonviolenza$txt$,$txt$Antologia — pubblico dominio$txt$,'29 min',false,'diritti',$txt$La nonviolenza non è la virtù dei deboli ma la forza dei coraggiosi. Non si tratta di subire, ma di rifiutare di restituire il male con il male, spezzando la catena. Chi la pratica trasforma l’avversario in interlocutore e il conflitto in occasione di verità.$txt$,4) on conflict (id) do nothing;
insert into public.audiobooks(id,titolo,autore,durata,gratuito,commissione,testo,ordine) values ('a5',$txt$Sulla bellezza e l’educazione$txt$,$txt$F. Schiller — pubblico dominio$txt$,'37 min',false,'arte',$txt$L’uomo è pienamente uomo solo quando gioca, e gioca solo davanti alla bellezza. L’educazione estetica non è un lusso ma la via attraverso cui la libertà entra nella vita: la bellezza riconcilia sensibilità e ragione, e prepara l’animo alla pace.$txt$,5) on conflict (id) do nothing;
insert into public.audiobooks(id,titolo,autore,durata,gratuito,commissione,testo,ordine) values ('a6',$txt$Dispensa: i processi di pace nel Novecento$txt$,$txt$Prof. R. Barbessi$txt$,'33 min',false,'pace',$txt$Il Novecento è il secolo delle guerre totali ma anche delle grandi istituzioni di pace. Dalla Società delle Nazioni alle Nazioni Unite: ogni catastrofe ha generato un tentativo di darsi regole comuni. La storia dei processi di pace è la storia di un’umanità che impara dai propri errori.$txt$,6) on conflict (id) do nothing;

-- ===== SEED: pacchetti =====
insert into public.packages(id,nome,corsi,prezzo,ordine) values ('p1',$txt$Pensiero e Storia$txt$,'["c1","c2","c3"]'::jsonb,169,1) on conflict (id) do nothing;
insert into public.packages(id,nome,corsi,prezzo,ordine) values ('p2',$txt$Pratiche e Culture di Pace$txt$,'["c4","c5","c6"]'::jsonb,169,2) on conflict (id) do nothing;
insert into public.packages(id,nome,corsi,prezzo,ordine) values ('p3',$txt$Etica, Economia e Impresa$txt$,'["c7","c8"]'::jsonb,119,3) on conflict (id) do nothing;

-- Fine migrazione 0002
