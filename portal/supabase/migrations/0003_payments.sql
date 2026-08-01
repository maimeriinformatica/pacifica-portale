-- =====================================================================
--  LA PACIFICA RES PUBLICA — Migrazione 0003
--  Pagamenti reali (Stripe): registro pagamenti, scadenza membership,
--  cliente Stripe, prezzi delle membership.
--  L'attivazione avviene SOLO dal webhook Stripe (service role),
--  mai dal browser.
-- =====================================================================

-- Profili: cliente Stripe e scadenza membership
alter table public.profiles add column if not exists stripe_customer_id text;
alter table public.profiles add column if not exists membership_until timestamptz;

-- Registro dei pagamenti completati (scritto solo dal webhook, service role)
create table if not exists public.payments (
  id             uuid primary key default gen_random_uuid(),
  profile_id     uuid references public.profiles(id) on delete set null,
  kind           text not null,        -- 'item' | 'membership'
  ref            text not null,        -- es. 'corso:c1' | 'percorso' | 'civis'
  amount         int,                  -- importo in centesimi
  stripe_session text,
  created_at     timestamptz not null default now()
);
alter table public.payments enable row level security;
-- ognuno vede solo i propri pagamenti; nessun INSERT da client (solo service role)
create policy "payments_select_own"
  on public.payments for select to authenticated using (profile_id = auth.uid());

-- Prezzi delle membership (modificabili dalla Presidenza, in euro)
insert into public.settings(key, value) values
  ('prezzo_civis_mese','9.90'),
  ('prezzo_civis_anno','89'),
  ('prezzo_academicus','320')
on conflict (key) do nothing;

-- Fine migrazione 0003
