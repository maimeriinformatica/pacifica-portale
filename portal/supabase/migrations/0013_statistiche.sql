-- =====================================================================
-- 0013_statistiche.sql
--
-- Statistiche d'uso del portale, per la Presidenza: pagine viste (anche da
-- anonimi), accessi, dispositivo e provenienza.
--
-- PROGETTATA PER NON DIVENTARE SORVEGLIANZA (il pubblico include MINORI):
--   NON si registra: indirizzo IP, user-agent grezzo, geolocalizzazione,
--   nessun identificatore che segua la persona, nessun collegamento fra la
--   navigazione e l'identita' dell'utente.
--   Si registra solo: tipo di evento, sezione, categoria di dispositivo
--   (mobile/tablet/desktop), provenienza GROSSOLANA (diretto/ricerca/social/
--   host), se l'utente era autenticato (si/no) e il suo RUOLO (non il nome),
--   e un id di SESSIONE casuale che il browser rigenera a ogni visita.
--
-- La tabella e' CHIUSA: nessuno la legge o scrive direttamente. Si passa
-- solo per funzioni verificate:
--   - traccia(...)  -> inserisce, ripulendo e limitando i valori (anche anon);
--   - stat_*()      -> leggono solo aggregati, e solo la Presidenza.
--
-- Lato pagina il tracciamento parte SOLO dopo consenso e rispetta Do Not
-- Track / Global Privacy Control (vedi app.js). Questo e' l'assetto piu'
-- prudente: per usi piu' estesi va sentito un responsabile privacy (DPO).
-- =====================================================================

create table if not exists public.telemetria (
  id           bigserial primary key,
  ts           timestamptz not null default now(),
  tipo         text not null,                 -- pageview | login | logout | click | azione
  vista        text not null default '',      -- sezione o percorso
  dettaglio    text not null default '',      -- etichetta breve (es. bottone), ripulita
  dispositivo  text not null default 'altro', -- mobile | tablet | desktop | altro
  provenienza  text not null default 'diretto',
  autenticato  boolean not null default false,
  ruolo        text,                          -- iscritto | delegato | presidenza | null (MAI il nome)
  sessione     text not null default ''       -- casuale per-visita, pseudonimo
);
create index if not exists telemetria_ts_idx  on public.telemetria (ts);
create index if not exists telemetria_tv_idx  on public.telemetria (tipo, vista);

alter table public.telemetria enable row level security;
-- Nessuna policy: la tabella non e' accessibile direttamente. Solo le
-- funzioni security definer qui sotto la toccano.

-- ---------------------------------------------------------------------
-- Inserimento: aperto anche agli anonimi, ma ogni valore e' ripulito e
-- limitato, cosi' il client non puo' iniettare dati liberi (ne' PII).
-- ---------------------------------------------------------------------
create or replace function public.traccia(
  p_tipo text, p_vista text default '', p_dettaglio text default '',
  p_dispositivo text default 'altro', p_provenienza text default 'diretto',
  p_autenticato boolean default false, p_ruolo text default null, p_sessione text default ''
) returns void
language plpgsql security definer set search_path = public as $$
declare v_tipo text; v_disp text; v_ruolo text;
begin
  v_tipo := lower(coalesce(p_tipo,''));
  if v_tipo not in ('pageview','login','logout','click','azione') then return; end if;  -- ignora tipi non previsti
  v_disp := lower(coalesce(p_dispositivo,'altro'));
  if v_disp not in ('mobile','tablet','desktop') then v_disp := 'altro'; end if;
  v_ruolo := lower(coalesce(p_ruolo,''));
  if v_ruolo not in ('iscritto','delegato','presidenza') then v_ruolo := null; end if;
  insert into public.telemetria (tipo, vista, dettaglio, dispositivo, provenienza, autenticato, ruolo, sessione)
  values (
    v_tipo,
    left(regexp_replace(coalesce(p_vista,''),      '[[:cntrl:]]', ' ', 'g'), 40),
    left(regexp_replace(coalesce(p_dettaglio,''),  '[[:cntrl:]@]', ' ', 'g'), 80),  -- via anche '@' per scoraggiare email
    v_disp,
    left(regexp_replace(coalesce(p_provenienza,''),'[[:cntrl:]@]', ' ', 'g'), 40),
    coalesce(p_autenticato,false),
    v_ruolo,
    left(regexp_replace(coalesce(p_sessione,''),   '[^A-Za-z0-9_-]', '', 'g'), 40)  -- solo token opaco
  );
end; $$;

-- ---------------------------------------------------------------------
-- Letture: solo aggregati, solo Presidenza.
-- ---------------------------------------------------------------------
create or replace function public.stat_riepilogo()
returns table (visite_oggi bigint, visite_7g bigint, visite_30g bigint,
               login_30g bigint, sessioni_30g bigint, perc_mobile int, perc_autenticato int)
language sql stable security definer set search_path = public as $$
  select
    count(*) filter (where tipo='pageview' and ts >= date_trunc('day', now())),
    count(*) filter (where tipo='pageview' and ts >= now() - interval '7 days'),
    count(*) filter (where tipo='pageview' and ts >= now() - interval '30 days'),
    count(*) filter (where tipo='login'    and ts >= now() - interval '30 days'),
    count(distinct sessione) filter (where ts >= now() - interval '30 days' and sessione <> ''),
    coalesce(round(100.0 * count(*) filter (where tipo='pageview' and dispositivo='mobile' and ts >= now() - interval '30 days')
             / nullif(count(*) filter (where tipo='pageview' and ts >= now() - interval '30 days'),0)))::int,
    coalesce(round(100.0 * count(*) filter (where tipo='pageview' and autenticato and ts >= now() - interval '30 days')
             / nullif(count(*) filter (where tipo='pageview' and ts >= now() - interval '30 days'),0)))::int
  from public.telemetria
  where public.is_presidency();
$$;

create or replace function public.stat_giorni(p_giorni int default 14)
returns table (giorno date, visite bigint)
language sql stable security definer set search_path = public as $$
  select d::date, count(t.id)
  from generate_series(date_trunc('day', now()) - ((greatest(p_giorni,1)-1) || ' days')::interval,
                       date_trunc('day', now()), '1 day') d
  left join public.telemetria t
    on t.tipo='pageview' and t.ts >= d and t.ts < d + interval '1 day' and public.is_presidency()
  group by d order by d;
$$;

create or replace function public.stat_dispositivi()
returns table (dispositivo text, n bigint)
language sql stable security definer set search_path = public as $$
  select dispositivo, count(*) from public.telemetria
  where tipo='pageview' and ts >= now() - interval '30 days' and public.is_presidency()
  group by dispositivo order by count(*) desc;
$$;

create or replace function public.stat_sezioni()
returns table (vista text, n bigint)
language sql stable security definer set search_path = public as $$
  select vista, count(*) from public.telemetria
  where tipo='pageview' and ts >= now() - interval '30 days' and vista <> '' and public.is_presidency()
  group by vista order by count(*) desc limit 10;
$$;

create or replace function public.stat_provenienze()
returns table (provenienza text, n bigint)
language sql stable security definer set search_path = public as $$
  select provenienza, count(distinct sessione) from public.telemetria
  where ts >= now() - interval '30 days' and public.is_presidency()
  group by provenienza order by count(distinct sessione) desc limit 10;
$$;

grant execute on function public.traccia(text,text,text,text,text,boolean,text,text) to anon, authenticated;
grant execute on function public.stat_riepilogo()      to authenticated;
grant execute on function public.stat_giorni(int)      to authenticated;
grant execute on function public.stat_dispositivi()    to authenticated;
grant execute on function public.stat_sezioni()        to authenticated;
grant execute on function public.stat_provenienze()    to authenticated;
