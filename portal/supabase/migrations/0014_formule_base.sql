-- =====================================================================
-- 0014_formule_base.sql
-- Due formule d'ingresso per i mecenati, piu' piccole delle precedenti:
--   Sostenitore  100 € -> 1 accesso annuale
--   Benefattore  500 € -> 5 accessi annuali
-- Concedono l'accesso Civis per dodici mesi (la membership a pagamento
-- di base). Sono la porta d'ingresso al mecenatismo: chi vuole aiutare
-- anche solo un ragazzo puo' farlo.
-- =====================================================================
insert into public.mecenati_formule
  (id, nome, importo, quanti, concede, tipo, durata_mesi, descrizione, ordine, attivo)
values
  ('sostenitore', 'Sostenitore', 100, 1, 'civis', 'membership', 12,
   'Un accesso annuale Civis, per un ragazzo. Il primo passo del mecenatismo: aiuti una persona sola, ma per un anno intero.',
   5, true),
  ('benefattore', 'Benefattore', 500, 5, 'civis', 'membership', 12,
   'Cinque accessi annuali Civis. La misura di un piccolo gruppo, di una parrocchia o di un''associazione che adotta qualche studente.',
   8, true)
on conflict (id) do nothing;
