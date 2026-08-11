-- ATTIVAZIONE DELL'AGGIORNAMENTO AUTOMATICO DELLA RASSEGNA (una volta sola)
-- Sostituisci i tre valori e incolla nel SQL Editor di Supabase.
--  * functions_base: l'indirizzo del progetto + /functions/v1
--  * anon_key: la chiave "anon public" (Settings -> API)
--  * cron_secret: una parola d'ordine lunga inventata da te
-- POI: Dashboard -> Edge Functions -> rassegna -> Secrets ->
--      aggiungi CRON_SECRET con LO STESSO valore, e ripubblica la funzione.
insert into public.cron_config (chiave, valore) values
  ('functions_base', 'https://IL-TUO-PROGETTO.supabase.co/functions/v1'),
  ('anon_key',       'LA-TUA-CHIAVE-ANON-PUBBLICA'),
  ('cron_secret',    'UNA-PAROLA-D-ORDINE-LUNGA-A-TUA-SCELTA')
on conflict (chiave) do update set valore = excluded.valore;
