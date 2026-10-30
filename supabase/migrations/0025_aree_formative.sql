-- =====================================================================
-- 0025_aree_formative.sql — LE SETTE AREE FORMATIVE E I VENTI CORSI
-- L'Accademia si riordina secondo il canone del progetto: sette aree
-- formative e venti corsi tematici (16 lezioni ciascuno, 159 € l'uno).
--  · courses.area  — l'area formativa di appartenenza (testo libero,
--    il portale la riconosce per nome; si gestisce dal gestionale).
--  · gli otto corsi esistenti (c1..c8) vengono RINOMINATI sul titolo
--    canonico più vicino, conservando lezioni, acquisti e progressi;
--  · i dodici corsi mancanti (c9..c20) vengono creati come BOZZE
--    (pubblicato = false): si completano e si pubblicano dal gestionale.
-- =====================================================================

alter table public.courses add column if not exists area text not null default '';

-- Prezzo canonico del corso singolo: 159 € (brochure del Portale).
update public.courses set prezzo = 159;
insert into public.settings(key, value) values ('prezzo_corso','159')
  on conflict (key) do update set value = excluded.value;

-- ---------------------------------------------------------------------
-- Gli otto corsi esistenti -> titoli canonici (si conservano lezioni,
-- acquisti e progressi perché l'id non cambia).
-- ---------------------------------------------------------------------
update public.courses set titolo=$t$La Scuola di Atene: il pensiero che unisce$t$,
  area=$t$Filosofia e pensiero critico$t$, ordine=1,
  descrizione=$t$Dentro l’affresco di Raffaello: Platone, Aristotele e l’ideale di una comunità di sapienti che dialogano per cercare il vero.$t$
  where id='c2';
update public.courses set titolo=$t$L’arte del dialogo e del pensiero critico$t$,
  area=$t$Filosofia e pensiero critico$t$, ordine=2,
  descrizione=$t$Ascoltare, argomentare, distinguere: gli strumenti del pensiero critico e del dialogo che costruisce invece di dividere.$t$
  where id='c1';
update public.courses set titolo=$t$Costruttori di pace: cooperare oltre i confini$t$,
  area=$t$Leadership e cooperazione internazionale$t$, ordine=20,
  descrizione=$t$Dai trattati antichi alle istituzioni moderne: come si trasforma il conflitto in dialogo e la cooperazione in pace duratura.$t$
  where id='c3';
update public.courses set titolo=$t$Mindfulness: il primo passo$t$,
  area=$t$Mindfulness e pratica della presenza$t$, ordine=13,
  descrizione=$t$La pace fuori comincia dalla pace dentro: attenzione, respiro e presenza come fondamento di ogni relazione non violenta.$t$
  where id='c4';
update public.courses set titolo=$t$La presenza nelle relazioni$t$,
  area=$t$Mindfulness e pratica della presenza$t$, ordine=14,
  descrizione=$t$L’ascolto e la presenza negli incontri di ogni giorno: come si costruiscono ponti tra persone, culture e visioni diverse.$t$
  where id='c5';
update public.courses set titolo=$t$Simboli e miti dell’umanità$t$,
  area=$t$Teosofia e tradizione spirituale$t$, ordine=5,
  descrizione=$t$Il linguaggio universale dei simboli e dei miti: la bellezza e il racconto che uniscono dove le parole dividono.$t$
  where id='c6';
update public.courses set titolo=$t$Dare è Avere: l’economia a servizio dell’uomo$t$,
  area=$t$Cultura d’impresa etica e sostenibile$t$, ordine=16,
  descrizione=$t$Un’economia al servizio della persona: bene comune, sostenibilità e responsabilità nelle scelte produttive e finanziarie.$t$
  where id='c7';
update public.courses set titolo=$t$L’impresa come comunità$t$,
  area=$t$Cultura d’impresa etica e sostenibile$t$, ordine=17,
  descrizione=$t$Il lavoro come luogo di dignità e cooperazione: modelli d’impresa che generano valore condiviso e coesione sociale.$t$
  where id='c8';

-- ---------------------------------------------------------------------
-- I dodici corsi mancanti (bozze da completare e pubblicare)
-- ---------------------------------------------------------------------
insert into public.courses(id,titolo,formatore,commissione,pacchetto,descrizione,prezzo,ordine,area,pubblicato) values
 ('c9', $t$Etica per il tempo presente$t$,$t$Prof. Roberto Barbessi$t$,'etica','',
  $t$Le grandi domande morali davanti alle sfide di oggi: libertà, giustizia e responsabilità nella vita personale e civile.$t$,159,3,$t$Filosofia e pensiero critico$t$,false),
 ('c10',$t$Le grandi tradizioni sapienziali$t$,$t$Prof. Roberto Barbessi$t$,'etica','',
  $t$Dalle Upanishad ai Vangeli, dal Tao ai presocratici: le vie della sapienza che l’umanità ha percorso cercando il senso.$t$,159,4,$t$Teosofia e tradizione spirituale$t$,false),
 ('c11',$t$La ricerca interiore fra Oriente e Occidente$t$,$t$Prof. Roberto Barbessi$t$,'dialogo','',
  $t$Mistici, filosofi e maestri a confronto: il cammino interiore come terreno d’incontro fra le civiltà.$t$,159,6,$t$Teosofia e tradizione spirituale$t$,false),
 ('c12',$t$Invito alla visione quantistica$t$,$t$Claudio Bernabè$t$,'etica','',
  $t$Che cosa dice davvero la fisica quantistica: un invito senza formule a ripensare materia, osservatore e realtà.$t$,159,7,$t$Fisica quantistica e visione della realtà$t$,false),
 ('c13',$t$Materia, energia, informazione$t$,$t$Claudio Bernabè$t$,'etica','',
  $t$I tre volti del reale secondo la scienza contemporanea, raccontati con chiarezza: dalla particella al bit.$t$,159,8,$t$Fisica quantistica e visione della realtà$t$,false),
 ('c14',$t$Scienza e coscienza: un dialogo$t$,$t$Claudio Bernabè$t$,'etica','',
  $t$Dove la fisica incontra la filosofia: il mistero della coscienza e il posto dell’uomo nell’universo.$t$,159,9,$t$Fisica quantistica e visione della realtà$t$,false),
 ('c15',$t$La casa comune: fondamenti di ecologia$t$,$t$Claudio Bernabè$t$,'bene','',
  $t$Il pianeta come casa comune: i fondamenti dell’ecologia e il legame fra ambiente, giustizia e pace.$t$,159,10,$t$Ecologia e responsabilità planetaria$t$,false),
 ('c16',$t$Stili di vita ed economia circolare$t$,$t$Claudio Bernabè$t$,'bene','',
  $t$Dalle scelte quotidiane ai modelli di produzione: come si vive — e si produce — senza consumare il futuro.$t$,159,11,$t$Ecologia e responsabilità planetaria$t$,false),
 ('c17',$t$Custodire la Terra: etica dell’ambiente$t$,$t$Claudio Bernabè$t$,'bene','',
  $t$La responsabilità verso le generazioni che verranno: un’etica della custodia per la Terra e per chi la abita.$t$,159,12,$t$Ecologia e responsabilità planetaria$t$,false),
 ('c18',$t$Lo stress e l’equilibrio interiore$t$,$t$Dott. Renato Mazzonetto$t$,'diritti','',
  $t$Riconoscere lo stress e ritrovare l’equilibrio: pratiche di presenza per la vita quotidiana e il lavoro.$t$,159,15,$t$Mindfulness e pratica della presenza$t$,false),
 ('c19',$t$Sostenibilità e valore condiviso$t$,$t$Dott. Albert Pighi Schram$t$,'bene','',
  $t$Oltre il profitto: come imprese e comunità creano insieme valore che dura, per l’economia e per le persone.$t$,159,18,$t$Cultura d’impresa etica e sostenibile$t$,false),
 ('c20',$t$La leadership gentile$t$,$t$Alessandro Bordini$t$,'dialogo','',
  $t$Guidare senza imporsi: l’autorevolezza che nasce dall’ascolto, dall’esempio e dalla cura delle persone.$t$,159,19,$t$Leadership e cooperazione internazionale$t$,false)
on conflict (id) do nothing;
