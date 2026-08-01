-- =====================================================================
-- 0008_livelli_accesso.sql
--
-- Due cambiamenti, legati fra loro.
--
-- 1) I LIVELLI DI ACCESSO DIVENTANO DATI, NON CODICE.
--    Prima l'accesso era un booleano `gratuito`: due sole classi, e ogni
--    nuova classe avrebbe richiesto una migrazione. Ora i livelli stanno
--    in una tabella che la presidenza gestisce dal CMS.
--    La regola di ciascun livello non e' SQL scritto a mano (sarebbe una
--    porta aperta), ma tre campi dichiarativi:
--      ospiti      -> il livello vale anche senza account
--      memberships -> quali abbonamenti lo soddisfano  (free|civis|academicus)
--      ruoli       -> quali ruoli lo soddisfano         (iscritto|delegato|presidenza)
--    Ruolo e abbonamento sono assi indipendenti: un delegato puo' essere free.
--    Per questo servono due elenchi e non una scala unica.
--    La presidenza vede sempre tutto: e' il ruolo di amministrazione.
--
-- 2) L'INDIRIZZO DEL VIDEO ESCE DALLA TABELLA `videos`.
--    La RLS di Postgres filtra le righe, non le colonne: finche' `url` sta
--    in `videos`, chiunque possa leggere i metadati puo' leggere anche il
--    link. Spostandolo in `video_sources` si ottengono insieme le due cose
--    che servono: il catalogo visibile a tutti (le vetrine bloccate
--    invogliano l'abbonamento) e il link che non esce dal server per chi
--    non ne ha diritto, nemmeno chiamando le API a mano.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Livelli
-- ---------------------------------------------------------------------
create table if not exists public.access_levels (
  id          text primary key,                      -- es. 'civis'
  nome        text not null,                         -- etichetta mostrata
  descrizione text not null default '',
  ospiti      boolean not null default false,
  memberships text[] not null default '{}',
  ruoli       text[] not null default '{}',
  invito      text not null default '',              -- testo per chi non ha diritto
  cta         text not null default 'abbonamenti',   -- vista dove mandarlo ('' = nessun invito)
  ordine      int  not null default 0,
  attivo      boolean not null default true,
  updated_at  timestamptz not null default now()
);

alter table public.access_levels enable row level security;

-- il catalogo dei livelli e' pubblico: serve anche agli ospiti per capire
-- cosa stanno guardando ("Incluso in Civis")
drop policy if exists "levels_read"  on public.access_levels;
create policy "levels_read"  on public.access_levels for select to anon, authenticated
  using (true);
drop policy if exists "levels_write" on public.access_levels;
create policy "levels_write" on public.access_levels for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());

-- livelli di partenza: modificabili e cancellabili dal CMS.
-- 'presidenza' non ha ne' abbonamenti ne' ruoli: lo soddisfa solo il caso
-- speciale della presidenza qui sotto. E' il livello per le bozze.
insert into public.access_levels (id,nome,descrizione,ospiti,memberships,ruoli,invito,cta,ordine) values
  ('pubblico',   'Pubblico',          'Visibile a chiunque, anche senza account.', true,  '{}',                       '{}',          '',                                     '',            10),
  ('iscritti',   'Solo iscritti',     'Serve un account, anche gratuito.',         false, '{free,civis,academicus}',  '{}',          'Registrati per guardarlo',             'registrati',  20),
  ('civis',      'Civis',             'Incluso nell''abbonamento Civis.',          false, '{civis,academicus}',       '{}',          'Incluso in Civis',                     'abbonamenti', 30),
  ('academicus', 'Civis Academicus',  'Riservato agli Academicus.',                false, '{academicus}',             '{}',          'Incluso in Civis Academicus',          'abbonamenti', 40),
  ('delegati',   'Delegati',          'Riservato ai delegati del Parlamento.',     false, '{}',                       '{delegato}',  'Riservato ai delegati del Parlamento', '',            50),
  ('presidenza', 'Solo presidenza',   'Bozze e materiali interni.',                false, '{}',                       '{}',          'Materiale interno',                    '',            60)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- La regola, in un posto solo
-- ---------------------------------------------------------------------
create or replace function public.livello_consentito(liv text)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.access_levels l
    where l.id = liv
      and l.attivo
      and (
        l.ospiti
        or exists (
          select 1 from public.profiles p
          where p.id = auth.uid()
            and ( p.ruolo = 'presidenza'                -- amministrazione: vede tutto
                  or p.membership = any(l.memberships)
                  or p.ruolo      = any(l.ruoli) )
        )
      )
  );
$$;

-- ---------------------------------------------------------------------
-- videos: da `gratuito` booleano a `livello`
-- ---------------------------------------------------------------------
alter table public.videos add column if not exists livello text
  references public.access_levels(id) on update cascade;

do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema='public' and table_name='videos' and column_name='gratuito') then
    update public.videos set livello = case when gratuito then 'pubblico' else 'civis' end
      where livello is null;
  end if;
end $$;

update public.videos set livello = 'civis' where livello is null;
alter table public.videos alter column livello set default 'civis';
alter table public.videos alter column livello set not null;
alter table public.videos drop column if exists gratuito;

-- definita ora: prima la colonna `livello` non esisteva ancora
create or replace function public.puo_vedere_video(vid text)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.videos v
    where v.id = vid
      and (v.pubblicato or public.is_presidency())
      and public.livello_consentito(v.livello)
  );
$$;

-- ---------------------------------------------------------------------
-- video_sources: l'indirizzo, protetto
-- ---------------------------------------------------------------------
create table if not exists public.video_sources (
  video_id   text primary key references public.videos(id) on delete cascade on update cascade,
  url        text not null default '',
  updated_at timestamptz not null default now()
);

-- travaso dei link gia' inseriti, poi via la colonna dalla tabella aperta
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema='public' and table_name='videos' and column_name='url') then
    insert into public.video_sources (video_id, url)
      select id, coalesce(url,'') from public.videos
      on conflict (video_id) do nothing;
  end if;
end $$;

alter table public.videos drop column if exists url;

alter table public.video_sources enable row level security;

-- QUI il paywall diventa vero: il link non esce se il livello non e' soddisfatto
drop policy if exists "video_sources_read"  on public.video_sources;
create policy "video_sources_read"  on public.video_sources for select to anon, authenticated
  using (public.puo_vedere_video(video_id));
drop policy if exists "video_sources_write" on public.video_sources;
create policy "video_sources_write" on public.video_sources for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());

-- ---------------------------------------------------------------------
-- I metadati dei video diventano pubblici: ora e' sicuro, l'url non e' piu' qui.
-- Serve perche' la porta d'ingresso mostri le vetrine anche a chi non e' entrato.
-- ---------------------------------------------------------------------
drop policy if exists "videos_read" on public.videos;
create policy "videos_read" on public.videos for select to anon, authenticated
  using (pubblicato = true or public.is_presidency());

-- ---------------------------------------------------------------------
-- Permessi: le policy qui sopra valgono anche per gli ospiti, quindi le
-- funzioni che richiamano devono essere eseguibili dal ruolo anon.
-- (in 0001 is_presidency() era concessa solo a authenticated)
-- ---------------------------------------------------------------------
grant execute on function public.is_presidency()             to anon;
grant execute on function public.livello_consentito(text)    to anon, authenticated;
grant execute on function public.puo_vedere_video(text)      to anon, authenticated;
grant select  on public.access_levels                        to anon, authenticated;
grant select  on public.video_sources                        to anon, authenticated;
