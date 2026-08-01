-- =====================================================================
-- 0011_mecenati_proposte.sql
--
-- Quattro formule di partenza, approvate e attive.
-- `on conflict do nothing`: se le hai gia' importate e poi modificate dal
-- CMS, rieseguire questa migrazione NON sovrascrive le tue correzioni.
--
-- La scala dei nomi e' romana e coerente col resto (Civis, Res Publica,
-- Academicus): Amicus -> Fautor -> Patronus -> Mecenas. L'ultimo e' Gaio
-- Mecenate, il protettore di Virgilio e Orazio da cui viene la parola
-- "mecenate": e' l'unico gradino che si spiega da solo.
--
-- I CONTI (listino gia' nel portale: Civis 89 EUR/anno, Academicus 320):
--   Amicus     1.000 EUR / 12 Civis      =  83,33/acc   ->  6,4% sotto listino
--   Fautor     3.000 EUR / 10 Academicus = 300,00/acc   ->  6,2%
--   Patronus   8.000 EUR / 30 Academicus = 266,67/acc   -> 16,7%
--   Mecenas   20.000 EUR / 80 Academicus = 250,00/acc   -> 21,9%
-- Lo sconto cresce con l'importo: la formula piu' grande e' sempre la piu'
-- conveniente, e nessuno scaglione e' dominato da un altro.
-- =====================================================================

insert into public.mecenati_formule
  (id, nome, importo, quanti, concede, tipo, durata_mesi, descrizione, ordine, attivo)
values
  ('amicus', 'Amicus', 1000, 12, 'civis', 'membership', 12,
   'Dodici ragazzi leggono, ascoltano e seguono per un anno intero. E'' il gradino con cui si comincia: costa quanto una gita di classe e dura dodici mesi.',
   10, true),

  ('fautor', 'Fautor', 3000, 10, 'academicus', 'membership', 12,
   'Dieci percorsi accademici completi: gli otto corsi, la biblioteca e i video. Un fautor sostiene una classe intera per un anno.',
   20, true),

  ('patronus', 'Patronus', 8000, 30, 'academicus', 'membership', 12,
   'Trenta percorsi accademici completi. La misura di un istituto, di una fondazione locale o di un club service che adotta una scuola.',
   30, true),

  ('mecenas', 'Mecenas', 20000, 80, 'academicus', 'membership', 12,
   'Ottanta percorsi accademici completi. Gaio Mecenate non scrisse un verso: pago'' Virgilio e Orazio perche'' li scrivessero loro. Custodire per costruire.',
   40, true)
on conflict (id) do nothing;
