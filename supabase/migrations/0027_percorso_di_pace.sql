-- =====================================================================
-- 0027_percorso_di_pace.sql — IL PERCORSO DI PACE A LIVELLI
-- Il corso gratuito IEP (Positive Peace Academy) diventa il primo
-- gradino di un percorso che vive dentro La Pacifica:
--   1 · Esploratore di Pace  — registrazione gratuita su lapacifica.org
--   2 · Costruttore di Pace  — corso IEP completato (attestato caricato
--                              o questionario di rientro)
--   3 · Accademico           — corso singolo o abbonamento
--   4 · Ambasciatore di Pace — candidatura, assegnato dalla Presidenza
-- La persona si registra DA NOI prima di andare su IEP: il contatto
-- resta alla Pacifica. I contenuti IEP non vengono ricaricati sul
-- portale: li si raggiunge con un collegamento.
--
-- ATTENZIONE — da fare a mano su Supabase (una volta):
--   Authentication -> Sign In / Providers -> riattivare
--   "Allow new users to sign up" (serve per l'iscrizione gratuita
--   di primo livello; gli account interni restano creabili dalla
--   Presidenza come prima).
-- =====================================================================

-- 1. Il livello del Percorso sul profilo (0 = non iscritto al percorso)
alter table public.profiles add column if not exists livello_pace int not null default 0
  check (livello_pace between 0 and 4);
alter table public.profiles add column if not exists percorso_dal timestamptz;

-- 2. Avvio del percorso: porta il profilo al livello 1 (Esploratore).
--    La chiama il portale al primo accesso dopo la registrazione, o dal
--    bottone «Inizia il Percorso» per chi ha già un account.
create or replace function public.avvia_percorso()
returns int language plpgsql security definer set search_path = public as $$
declare lp int;
begin
  select livello_pace into lp from public.profiles where id = auth.uid();
  if lp is null then raise exception 'Profilo non trovato'; end if;
  if lp < 1 then
    update public.profiles
       set livello_pace = 1, percorso_dal = coalesce(percorso_dal, now())
     where id = auth.uid();
    lp := 1;
  end if;
  return lp;
end $$;
grant execute on function public.avvia_percorso() to authenticated;

-- 3. Passaggio al livello 2 (Costruttore): dopo il corso IEP, con
--    l'attestato caricato oppure il questionario di rientro. Lascia una
--    traccia leggibile dalla Presidenza tra le Richieste.
create or replace function public.completa_costruttore(p_modo text, p_dettaglio text default '')
returns int language plpgsql security definer set search_path = public as $$
declare lp int; v_nome text; v_email text;
begin
  select livello_pace, nome into lp, v_nome from public.profiles where id = auth.uid();
  if lp is null then raise exception 'Profilo non trovato'; end if;
  select email into v_email from auth.users where id = auth.uid();
  if lp < 2 then
    update public.profiles
       set livello_pace = 2, percorso_dal = coalesce(percorso_dal, now())
     where id = auth.uid();
    lp := 2;
  end if;
  insert into public.richieste_info (nome, email, telefono, progetti, note)
  values (coalesce(v_nome,''), coalesce(v_email,''), '',
          array['percorso-di-pace'],
          'Livello 2 — ' || coalesce(p_modo,'') ||
          case when coalesce(p_dettaglio,'')='' then '' else ': ' || p_dettaglio end);
  return lp;
end $$;
grant execute on function public.completa_costruttore(text, text) to authenticated;

-- 4. Deposito privato degli attestati IEP caricati dagli utenti
--    (cartella personale: attestati/<id-utente>/...; li legge anche la
--    Presidenza). Solo su Supabase: il blocco è protetto.
do $$
begin
  insert into storage.buckets (id, name, public) values ('percorso','percorso', false)
    on conflict (id) do nothing;
  execute 'drop policy if exists "percorso_up" on storage.objects';
  execute $p$create policy "percorso_up" on storage.objects for insert to authenticated
    with check (bucket_id = 'percorso' and name like 'attestati/' || auth.uid() || '/%')$p$;
  execute 'drop policy if exists "percorso_read" on storage.objects';
  execute $p$create policy "percorso_read" on storage.objects for select to authenticated
    using (bucket_id = 'percorso' and (public.is_presidency() or name like 'attestati/' || auth.uid() || '/%'))$p$;
exception when undefined_table or invalid_schema_name then
  raise notice 'storage non disponibile in questo ambiente: deposito "percorso" da creare su Supabase';
end $$;
