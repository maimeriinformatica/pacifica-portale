-- =====================================================================
-- 0020_evento_enigma.sql — L'evento in evidenza cambia veste
-- "Speculum 2027" diventa "ENIGMA ET SPECULUM": l'incontro con
-- Leonardo e i suoi amici. Aggiorna la scheda esistente (se presente)
-- ovunque sia mostrata: banner della home e pagina Eventi.
-- Rieseguibile: se il titolo e' gia' aggiornato non tocca nulla.
-- =====================================================================
update public.events set
  titolo      = 'ENIGMA ET SPECULUM',
  sottotitolo = 'L''incontro con Leonardo e i suoi amici',
  descrizione = 'Una mostra immersiva che invita a riscoprire la Scuola di Atene come la segreta Accademia Vinciana. Un percorso tra filosofia, memoria e futuro per far rivivere il pensiero che l''ha animata.',
  periodo     = 'Settembre 2027',
  luogo       = 'Verona'
where titolo = 'Speculum 2027';
