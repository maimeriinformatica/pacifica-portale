-- =====================================================================
-- 0010_mecenati.sql
--
-- Mecenati: formule "X euro -> X accessi formativi", impegno sottoscritto
-- dal mecenate, e accessi emessi quando l'impegno risulta pagato.
--
-- TRE SCELTE CHE VALE LA PENA SPIEGARE.
--
-- 1. I DATI DELL'ENTE (IBAN COMPRESO) NON STANNO QUI.
--    Vivono in `settings`, che la presidenza compila dal CMS. Nessun IBAN
--    finisce dentro il repository o dentro una migrazione: si cambia banca
--    senza un rilascio, e chi legge il codice non trova coordinate bancarie.
--    La funzione `dati_ente()` espone SOLO le chiavi pubbliche: `settings`
--    puo' contenere altro, e non deve uscire tutta.
--
-- 2. NON SI RIUSANO I CODICI DEI SEGGI.
--    `seats` ha `check (n between 1 and 150)` e `generate_codes` si ferma a
--    150: sono i seggi del Parlamento. Un mecenate che compra 50 accessi
--    formativi, se attingesse da li', consumerebbe i posti dei delegati.
--    Quindi `voucher`: meccanismo separato, senza tetto.
--
-- 3. I DATI DEL MECENATE NON SONO LEGGIBILI DA NESSUNO, TRANNE LA PRESIDENZA.
--    Sono dati personali (nome, email, indirizzo, CF/P.IVA). La tabella non
--    ha policy di lettura per anon: si scrive solo attraverso una funzione
--    che restituisce il minimo indispensabile (riferimento e coordinate).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Dati dell'ente: chiavi vuote, da compilare dal CMS.
-- ---------------------------------------------------------------------
insert into public.settings (key, value) values
  ('ente_denominazione',''), ('ente_cf',''), ('ente_piva',''), ('ente_sede',''),
  ('ente_iban',''), ('ente_intestatario',''), ('ente_banca',''),
  ('ente_pec',''), ('ente_email',''), ('ente_privacy_url','')
on conflict (key) do nothing;

create or replace function public.dati_ente()
returns table (key text, value text)
language sql stable security definer set search_path = public as $$
  select s.key, s.value from public.settings s
  where s.key in ('ente_denominazione','ente_cf','ente_piva','ente_sede','ente_iban',
                  'ente_intestatario','ente_banca','ente_pec','ente_email','ente_privacy_url');
$$;

-- ---------------------------------------------------------------------
-- Le formule. Sono dati: la presidenza le crea dal CMS.
-- ---------------------------------------------------------------------
create table if not exists public.mecenati_formule (
  id           text primary key,
  nome         text not null,
  importo      numeric(10,2) not null check (importo > 0),
  quanti       int not null check (quanti > 0),
  concede      text not null,                       -- 'civis' | 'academicus' | id pacchetto
  tipo         text not null default 'membership' check (tipo in ('membership','pacchetto')),
  durata_mesi  int not null default 12 check (durata_mesi > 0),
  descrizione  text not null default '',
  ordine       int not null default 0,
  attivo       boolean not null default true,
  updated_at   timestamptz not null default now()
);
alter table public.mecenati_formule enable row level security;
drop policy if exists "formule_read" on public.mecenati_formule;
create policy "formule_read"  on public.mecenati_formule for select to anon, authenticated
  using (attivo);
drop policy if exists "formule_write" on public.mecenati_formule;
create policy "formule_write" on public.mecenati_formule for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());

-- ---------------------------------------------------------------------
-- Gli impegni. Dati personali: nessuna lettura pubblica, mai.
-- ---------------------------------------------------------------------
create table if not exists public.mecenati_impegni (
  id              uuid primary key default gen_random_uuid(),
  riferimento     text unique not null,             -- causale del bonifico
  formula_id      text references public.mecenati_formule(id) on update cascade,
  ragione_sociale text not null,
  referente       text not null,
  email           text not null,
  telefono        text not null default '',
  indirizzo       text not null default '',
  cf_piva         text not null default '',
  note            text not null default '',
  importo         numeric(10,2) not null,
  quanti          int not null,
  stato           text not null default 'sottoscritto'
                  check (stato in ('sottoscritto','pagato','annullato')),
  consenso_dati   boolean not null default false,
  pagato_il       timestamptz,
  created_at      timestamptz not null default now()
);
alter table public.mecenati_impegni enable row level security;
-- NESSUNA policy di lettura per anon: solo la presidenza.
drop policy if exists "impegni_presidenza" on public.mecenati_impegni;
create policy "impegni_presidenza" on public.mecenati_impegni for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());

-- ---------------------------------------------------------------------
-- I voucher. Come i seggi: i codici sono segreti, li vede la presidenza.
-- ---------------------------------------------------------------------
create table if not exists public.voucher (
  codice      text primary key,
  impegno_id  uuid references public.mecenati_impegni(id) on delete cascade,
  concede     text not null,
  tipo        text not null,
  durata_mesi int not null default 12,
  used        boolean not null default false,
  profile_id  uuid references public.profiles(id),
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);
alter table public.voucher enable row level security;
drop policy if exists "voucher_presidenza" on public.voucher;
create policy "voucher_presidenza" on public.voucher for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());

-- ---------------------------------------------------------------------
-- Sottoscrizione: chiunque, anche senza account. Restituisce il minimo
-- indispensabile, cosi' la tabella resta chiusa in lettura.
-- ---------------------------------------------------------------------
create or replace function public.sottoscrivi_impegno(
  p_formula text, p_ragione text, p_referente text, p_email text,
  p_telefono text default '', p_indirizzo text default '',
  p_cf_piva text default '', p_note text default '', p_consenso boolean default false
) returns table (riferimento text, importo numeric, quanti int,
                 denominazione text, intestatario text, iban text, banca text)
language plpgsql security definer set search_path = public as $$
declare v_f public.mecenati_formule; v_rif text; v_id uuid;
begin
  if not p_consenso then raise exception 'Serve il consenso al trattamento dei dati'; end if;
  if coalesce(trim(p_ragione),'')   = '' then raise exception 'Ragione sociale obbligatoria'; end if;
  if coalesce(trim(p_referente),'') = '' then raise exception 'Referente obbligatorio'; end if;
  if p_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[a-z]{2,}$' then raise exception 'Email non valida'; end if;

  select * into v_f from public.mecenati_formule where id = p_formula and attivo;
  if not found then raise exception 'Formula non disponibile'; end if;

  v_rif := 'MEC-' || to_char(now(),'YYYY') || '-' ||
           upper(substr(encode(gen_random_bytes(3),'hex'),1,6));
  insert into public.mecenati_impegni
    (riferimento, formula_id, ragione_sociale, referente, email, telefono, indirizzo,
     cf_piva, note, importo, quanti, consenso_dati)
  values (v_rif, v_f.id, trim(p_ragione), trim(p_referente), lower(trim(p_email)),
          trim(p_telefono), trim(p_indirizzo), trim(p_cf_piva), trim(p_note),
          v_f.importo, v_f.quanti, true)
  returning id into v_id;

  return query
    select v_rif, v_f.importo, v_f.quanti,
      (select value from public.settings where key='ente_denominazione'),
      (select value from public.settings where key='ente_intestatario'),
      (select value from public.settings where key='ente_iban'),
      (select value from public.settings where key='ente_banca');
end; $$;

-- ---------------------------------------------------------------------
-- Pagato -> si emettono gli accessi. Solo la presidenza: il bonifico lo
-- riconcilia una persona, guardando la causale.
-- ---------------------------------------------------------------------
create or replace function public.segna_impegno_pagato(p_id uuid)
returns setof public.voucher
language plpgsql security definer set search_path = public as $$
declare v_i public.mecenati_impegni; i int;
begin
  if not public.is_presidency() then raise exception 'Riservato alla Presidenza'; end if;
  select * into v_i from public.mecenati_impegni where id = p_id;
  if not found then raise exception 'Impegno inesistente'; end if;
  if v_i.stato = 'pagato' then raise exception 'Impegno gia'' saldato: gli accessi sono gia'' stati emessi'; end if;
  if v_i.stato = 'annullato' then raise exception 'Impegno annullato'; end if;

  update public.mecenati_impegni set stato='pagato', pagato_il=now() where id=p_id;

  for i in 1..v_i.quanti loop
    insert into public.voucher (codice, impegno_id, concede, tipo, durata_mesi)
    select 'PAX-' || upper(substr(encode(gen_random_bytes(3),'hex'),1,4)) || '-' ||
                     upper(substr(encode(gen_random_bytes(3),'hex'),1,4)),
           p_id, f.concede, f.tipo, f.durata_mesi
    from public.mecenati_formule f where f.id = v_i.formula_id;
  end loop;

  return query select * from public.voucher where impegno_id = p_id order by codice;
end; $$;

-- ---------------------------------------------------------------------
-- Riscatto di un accesso donato.
-- ---------------------------------------------------------------------
create or replace function public.redeem_voucher(p_code text)
returns public.profiles
language plpgsql security definer set search_path = public as $$
declare v_v public.voucher; v_p public.profiles;
begin
  if auth.uid() is null then raise exception 'Non autenticato'; end if;
  select * into v_v from public.voucher where codice = upper(trim(p_code)) for update;
  if not found then raise exception 'Codice inesistente'; end if;
  if v_v.used then raise exception 'Codice gia'' utilizzato'; end if;

  update public.voucher set used=true, profile_id=auth.uid(), used_at=now() where codice=v_v.codice;

  if v_v.tipo = 'membership' then
    update public.profiles set membership = v_v.concede where id = auth.uid() returning * into v_p;
  else
    insert into public.purchases (profile_id, item) values (auth.uid(), v_v.concede)
      on conflict do nothing;
    select * into v_p from public.profiles where id = auth.uid();
  end if;
  return v_p;
end; $$;

grant execute on function public.dati_ente()                               to anon, authenticated;
grant execute on function public.sottoscrivi_impegno(text,text,text,text,text,text,text,text,boolean) to anon, authenticated;
grant execute on function public.segna_impegno_pagato(uuid)                to authenticated;
grant execute on function public.redeem_voucher(text)                      to authenticated;
grant select  on public.mecenati_formule                                   to anon, authenticated;
