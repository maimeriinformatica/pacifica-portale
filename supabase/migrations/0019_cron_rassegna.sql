-- =====================================================================
-- 0019_cron_rassegna.sql — AGGIORNAMENTO AUTOMATICO DELLA RASSEGNA
-- Ogni ora (al minuto 12) pg_cron chiama la Edge Function "rassegna"
-- in modalita' "tutte le fonti attive". La chiamata usa una chiave
-- segreta condivisa (CRON_SECRET), conservata in una tabella SENZA
-- alcuna policy di lettura: nessun utente del sito puo' vederla.
--
-- DOPO questa migrazione servono due cose (una volta sola):
--   1) inserire i tre valori in cron_config (vedi
--      supabase/attiva-cron-rassegna.sql)
--   2) impostare lo stesso CRON_SECRET nei "Secrets" della funzione
--      rassegna e ripubblicarla.
-- In locale pg_cron/pg_net non esistono: i blocchi sotto lo tollerano.
-- =====================================================================
create table if not exists public.cron_config (
  chiave text primary key,
  valore text not null
);
alter table public.cron_config enable row level security;  -- nessuna policy: invisibile a tutti i ruoli del sito
revoke all on public.cron_config from anon, authenticated;

create or replace function public.rassegna_cron()
returns void language plpgsql security definer set search_path = public as $fn$
declare
  v_base   text; v_anon text; v_secret text;
begin
  select valore into v_base   from public.cron_config where chiave='functions_base';
  select valore into v_anon   from public.cron_config where chiave='anon_key';
  select valore into v_secret from public.cron_config where chiave='cron_secret';
  if v_base is null or v_anon is null or v_secret is null then
    raise notice 'rassegna_cron: configura cron_config (functions_base, anon_key, cron_secret)';
    return;
  end if;
  perform net.http_post(
    url     := rtrim(v_base,'/') || '/rassegna',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'Authorization','Bearer '||v_anon,
      'x-cron-key', v_secret),
    body    := '{"tutte":true}'::jsonb
  );
end $fn$;

do $$ begin
  create extension if not exists pg_net;
exception when others then raise notice 'pg_net non disponibile (normale fuori da Supabase)'; end $$;
do $$ begin
  create extension if not exists pg_cron;
exception when others then raise notice 'pg_cron non disponibile (normale fuori da Supabase)'; end $$;
do $$ begin
  perform cron.unschedule('rassegna-ogni-ora');
exception when others then null; end $$;
do $$ begin
  perform cron.schedule('rassegna-ogni-ora', '12 * * * *', $c$select public.rassegna_cron()$c$);
  raise notice 'rassegna: aggiornamento automatico pianificato ogni ora (minuto 12)';
exception when others then raise notice 'cron non pianificato (normale fuori da Supabase)'; end $$;
