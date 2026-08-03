-- =====================================================================
-- 0016_contratti_modelli.sql
--
-- MODELLI DI CONTRATTO: la presidenza puo' definire piu' tipi di
-- contratto (titolo + testo), e il testo usa VARIABILI {{cosi}} che
-- vengono sostituite alla generazione con i dati dell'ente,
-- dell'anagrafica e dell'incarico. Il contratto generato conserva il
-- titolo e il testo gia' compilato (l'archivio resta immutabile anche
-- se il modello cambia in seguito).
--
-- Variabili disponibili (sostituite dal portale alla generazione):
--   ente:        {{ente_denominazione}} {{ente_intestatario}} {{ente_email}}
--                {{ente_iban}} {{ente_banca}}
--   anagrafica:  {{nome}} {{cognome}} {{nome_completo}} {{codice_fiscale}}
--                {{partita_iva}} {{email}} {{telefono}} {{indirizzo}}
--                {{residenza}} {{qualifica}}
--   incarico:    {{numero}} {{titolo}} {{oggetto}} {{descrizione}}
--                {{compenso}} {{data_inizio}} {{data_fine}} {{periodo}}
--   data:        {{oggi}} {{anno}}
-- =====================================================================

create table if not exists public.contratti_modelli (
  id         bigserial primary key,
  titolo     text not null,                 -- es. "Contratto di docenza"
  testo      text not null default '',     -- con le variabili {{...}}
  attivo     boolean not null default true,
  ordine     int not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.contratti_modelli enable row level security;
drop policy if exists "modelli_pres" on public.contratti_modelli;
create policy "modelli_pres" on public.contratti_modelli for all to authenticated
  using (public.is_presidency()) with check (public.is_presidency());
grant select, insert, update, delete on public.contratti_modelli to authenticated;

-- il contratto generato ricorda il titolo del modello usato
alter table public.contratti add column if not exists titolo text not null default '';

-- Modello di partenza (l'attuale contratto di incarico, ora modificabile)
insert into public.contratti_modelli (titolo, testo, ordine, attivo)
select 'Contratto di incarico', $tpl$CONTRATTO DI INCARICO N. {{numero}}
{{titolo}}

TRA
{{ente_denominazione}} (di seguito, "l'Ente"), email {{ente_email}}

E
{{nome_completo}}, C.F. {{codice_fiscale}}, {{residenza}} (di seguito, "l'Incaricato/a")

SI CONVIENE E SI STIPULA QUANTO SEGUE

Art. 1 - Oggetto
L'Ente affida all'Incaricato/a il seguente incarico: {{oggetto}}.
Attivita' previste: {{descrizione}}

Art. 2 - Durata
L'incarico si svolge {{periodo}}. Non e' previsto alcun vincolo di subordinazione.

Art. 3 - Compenso
Per l'attivita' di cui all'Art. 1 e' riconosciuto un compenso complessivo di {{compenso}} lordi, corrisposto secondo le modalita' concordate fra le parti, dietro presentazione della documentazione fiscale prevista dalla normativa applicabile.

Art. 4 - Obblighi dell'Incaricato/a
L'Incaricato/a svolge l'attivita' con diligenza e in coerenza con i principi del Manifesto de La Pacifica Res Publica, utilizzando i materiali nel rispetto dei diritti di terzi.

Art. 5 - Riservatezza e protezione dei dati
Le parti si impegnano alla riservatezza sulle informazioni di cui vengano a conoscenza in ragione dell'incarico e trattano i dati personali nel rispetto del Reg. (UE) 2016/679 (GDPR).

Art. 6 - Recesso
Ciascuna parte puo' recedere con comunicazione scritta con congruo preavviso, fatto salvo il compenso per l'attivita' gia' svolta.

Art. 7 - Controversie
Per ogni controversia le parti tenteranno una composizione amichevole; in difetto, e' competente il foro previsto dalla legge.

Luogo e data: ______________________________

L'Ente                                    L'Incaricato/a

______________________________            ______________________________$tpl$, 10, true
where not exists (select 1 from public.contratti_modelli);
