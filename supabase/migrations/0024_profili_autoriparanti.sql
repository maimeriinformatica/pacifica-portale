-- Consente a un utente autenticato di creare il PROPRIO profilo, solo come semplice iscritto.
-- Serve all'auto-riparazione del portale quando la riga di profiles manca.
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated
  with check (id = auth.uid() and ruolo = 'iscritto');
