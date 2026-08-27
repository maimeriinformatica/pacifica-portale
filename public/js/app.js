/* =====================================================================
   LA PACIFICA RES PUBLICA — Applicazione (frontend)
   Catalogo statico + viste. I dati dinamici arrivano da Supabase (DB.*).
   ===================================================================== */

/* ---------- catalogo: 7 commissioni ---------- */
const COMMISSIONI = [
  {id:'pace',   nome:'Pace e Risoluzione dei Conflitti', pr:'La Pace come fondamento'},
  {id:'etica',  nome:'Conoscenza ed Etica',              pr:'Il sapere con coscienza'},
  {id:'diritti',nome:'Diritti della Persona',            pr:'La dignità di ogni essere umano'},
  {id:'dialogo',nome:'Dialogo Interculturale e Diplomazia',pr:'L’unità nella diversità'},
  {id:'arte',   nome:'Arte e Bellezza',                  pr:'La bellezza che educa'},
  {id:'bene',   nome:'Bene Comune',                      pr:'Il bene di tutti prima del singolo'},
  {id:'memoria',nome:'Memoria e Futuro',                 pr:'Custodire per costruire'},
];
/* ---------- catalogo: corsi/pacchetti/video/audio ----------
   Caricati dal database (gestiti dalla Presidenza). I valori qui sotto
   restano come riserva nel caso il caricamento dal backend fallisca. */
let CORSI = [
  {id:'c1', tit:'Introduzione alla Filosofia', form:'Prof. Roberto Barbessi', comm:'etica', pacc:'Pensiero e Storia', desc:'Le domande fondamentali che hanno acceso il pensiero occidentale: cosa significa conoscere, agire bene, vivere in una comunità giusta.'},
  {id:'c2', tit:'La Scuola di Atene', form:'Prof. Roberto Barbessi', comm:'etica', pacc:'Pensiero e Storia', desc:'Dentro l’affresco di Raffaello: Platone, Aristotele e l’ideale di una comunità di sapienti che dialogano per cercare il vero.'},
  {id:'c3', tit:'Lo sviluppo nella storia dei processi di pace', form:'Prof. Roberto Barbessi', comm:'pace', pacc:'Pensiero e Storia', desc:'Dai trattati antichi alle istituzioni moderne: come l’umanità ha imparato, faticosamente, a trasformare il conflitto in dialogo.'},
  {id:'c4', tit:'Pratiche di consapevolezza e pace interiore', form:'Dott.ssa Pighi', comm:'diritti', pacc:'Pratiche e Culture di Pace', desc:'La pace fuori comincia dalla pace dentro: attenzione, respiro e presenza come fondamento di ogni relazione non violenta.'},
  {id:'c5', tit:'Dialogo interculturale e diplomazia', form:'Dott. Mazzonetto', comm:'dialogo', pacc:'Pratiche e Culture di Pace', desc:'Gli strumenti del negoziato e dell’ascolto: come si costruiscono ponti tra culture, lingue e visioni del mondo diverse.'},
  {id:'c6', tit:'Arte, bellezza e cultura di pace', form:'Dott.ssa Zago', comm:'arte', pacc:'Pratiche e Culture di Pace', desc:'L’arte come linguaggio universale e atto di pace: dalla musica alla pittura, la bellezza che unisce dove le parole dividono.'},
  {id:'c7', tit:'Etica ed economia responsabile', form:'Dott. Bampa', comm:'bene', pacc:'Etica, Economia e Impresa', desc:'Un’economia al servizio della persona: bene comune, sostenibilità e responsabilità nelle scelte produttive e finanziarie.'},
  {id:'c8', tit:'Impresa, lavoro e bene comune', form:'Dott. Cesaro', comm:'bene', pacc:'Etica, Economia e Impresa', desc:'Il lavoro come luogo di dignità e cooperazione: modelli d’impresa che generano valore condiviso e coesione sociale.'},
];
let PACCHETTI = [
  {id:'p1', nome:'Pensiero e Storia', corsi:['c1','c2','c3'], prezzo:169, full:207},
  {id:'p2', nome:'Pratiche e Culture di Pace', corsi:['c4','c5','c6'], prezzo:169, full:207},
  {id:'p3', nome:'Etica, Economia e Impresa', corsi:['c7','c8'], prezzo:119, full:138},
];
let PREZZO_CORSO = 69, PREZZO_PERCORSO = 440;
let CAMPUS = [
  {id:'cmp1', tit:'Campus di Pace — Weekend introduttivo', luogo:'Abbazia di Maguzzano — Casa di Spiritualità e Centro Ecumenico (Lonato del Garda, BS)', desc:'Due giorni immersi nei Sette Principi del Manifesto: laboratori di ascolto, dialogo e costruzione di pace, in un luogo di spiritualità affacciato sul Lago di Garda.', data:'17–18 ottobre 2026', durata:'Weekend · 2 giorni, 1 notte', posti:30, prezzo:120, prezzoSoggiorno:190, comm:'pace'},
  {id:'cmp2', tit:'Campus Scuola di Atene — Filosofia in dialogo', luogo:'Abbazia di Maguzzano — Casa di Spiritualità e Centro Ecumenico (Lonato del Garda, BS)', desc:'Un fine settimana sulle grandi domande del pensiero, guidato dal Prof. Roberto Barbessi: lezioni dialogate, lettura dei classici e passeggiate filosofiche.', data:'14–15 novembre 2026', durata:'Weekend · 2 giorni, 1 notte', posti:25, prezzo:130, prezzoSoggiorno:200, comm:'etica'},
  {id:'cmp3', tit:'Campus Diplomazia e Dialogo — Ritiro residenziale', luogo:'Abbazia di Maguzzano — Casa di Spiritualità e Centro Ecumenico (Lonato del Garda, BS)', desc:'Tre giorni residenziali di pratica diplomatica: simulazioni di negoziato, gestione dei conflitti e dialogo interculturale, con tempi di silenzio e convivialità.', data:'5–7 dicembre 2026', durata:'3 giorni, 2 notti', posti:25, prezzo:180, prezzoSoggiorno:290, comm:'dialogo'},
];
let TESTI = [
  {id:'t1', tit:'Articolo 11 della Costituzione', autore:'Costituzione della Repubblica Italiana', comm:'pace', lettura:'2 min di lettura', free:true, testo:'«L’Italia ripudia la guerra come strumento di offesa alla libertà degli altri popoli e come mezzo di risoluzione delle controversie internazionali; consente, in condizioni di parità con gli altri Stati, alle limitazioni di sovranità necessarie ad un ordinamento che assicuri la pace e la giustizia fra le Nazioni; promuove e favorisce le organizzazioni internazionali rivolte a tale scopo.»\n\nUna sola frase che contiene un’intera visione del mondo: la pace non come assenza di guerra, ma come ordinamento giusto fra i popoli.'},
  {id:'t2', tit:'Che cos’è la pace? Una breve introduzione', autore:'La Pacifica', comm:'pace', lettura:'6 min di lettura', free:true, testo:'Siamo abituati a pensare la pace come silenzio delle armi. Ma il silenzio delle armi, da solo, è solo una tregua. La pace vera è qualcosa di più esigente: è la presenza della giustizia, del dialogo, del riconoscimento reciproco.\n\nCostruire la pace non è un atto, è un’abitudine: si allena come si allena un muscolo, con esercizi quotidiani di ascolto, di pazienza, di immaginazione.'},
  {id:'t3', tit:'I Sette Principi, spiegati', autore:'La Pacifica', comm:'memoria', lettura:'9 min di lettura', free:false, testo:'I Sette Principi del Manifesto non sono dogmi da recitare, ma chiavi per leggere la realtà. La pace come fondamento. La conoscenza unita alla coscienza. La dignità inviolabile della persona. L’unità nella diversità. La bellezza che educa. Il bene comune. La memoria che costruisce il futuro.'},
  {id:'t4', tit:'Il dialogo come arte', autore:'La Pacifica', comm:'dialogo', lettura:'7 min di lettura', free:false, testo:'Dialogare non è convincere. Chi entra in un dialogo solo per vincere ha già smesso di ascoltare. Il dialogo è un’arte antica che chiede una virtù rara: la disponibilità a cambiare idea.'},
  {id:'t5', tit:'Bellezza e nonviolenza', autore:'La Pacifica', comm:'arte', lettura:'5 min di lettura', free:false, testo:'Perché un’accademia per la pace si occupa di bellezza? Perché la bellezza disarma. La nonviolenza e la bellezza condividono la stessa radice: il rifiuto di distruggere.'},
];
let EVENTI = [
  {id:'ev1', tit:'ENIGMA ET SPECULUM', sub:'L\u2019incontro con Leonardo e i suoi amici',
   desc:'Una mostra immersiva che invita a riscoprire la Scuola di Atene come la segreta Accademia Vinciana. Un percorso tra filosofia, memoria e futuro per far rivivere il pensiero che l\u2019ha animata.',
   luogo:'Verona', periodo:'Settembre 2027',
   tipo:'Mostra', accesso:'biglietto', prezzo:30,
   programma:'Gennaio — Il volo e l’aria: i fogli sul volo · l’aspirazione al cielo (Platone)\nFebbraio — L’acqua e i vortici · Eraclito e il divenire\nMarzo — L’anatomia e il corpo · l’uomo misura di tutte le cose (Protagora)\nAprile — Le proporzioni e l’Uomo Vitruviano · Pitagora e il numero\nMaggio — La geometria e la prospettiva · Euclide e la dimostrazione\nGiugno — La luce e l’ombra · la caverna e la conoscenza (Platone)\nLuglio — Le macchine e l’ingegno · Archimede e la tecnica\nAgosto — La botanica e la natura · Aristotele e l’osservazione\nSettembre — Gli astri e il cosmo · Tolomeo e l’ordine del cielo\nOttobre — Il volto e l’espressione · Socrate e l’etica del carattere\nNovembre — Il diluvio e il limite · Diogene e il distacco\nDicembre — Lo specchio: arte e filosofia si riflettono · la sintesi di Atene e Vinci'},
];
/* Livelli di accesso. Sono dati: la presidenza li crea e li modifica dal CMS.
   Questi qui sotto valgono solo se il catalogo non arriva dal server. */
let ANAGRAFICHE = [];
let MODELLI = [];
let S3ACC = [];
let LEZ_CACHE = {};
let TESTI_PAG = {};   // testi delle pagine sovrascritti dal gestionale (contenuti_sito)
function T(k,d){ const v=TESTI_PAG[k]; return (v!==undefined && v!=='') ? v : d; }
/* Stile facoltativo di un testo (salvato come riga 'stile:<chiave>' in contenuti_sito).
   Valori ammessi soltanto da elenchi chiusi: mai CSS libero. */
function stileDaOggetto(o){
  if(!o) return '';
  const F={serif:"'Cormorant Garamond',Georgia,serif",sans:"'Karla',system-ui,sans-serif"};
  const C={inchiostro:'#22231F',oltremare:'#1B3A6B',oro:'#A9842F',grigio:'#6E6A60',bianco:'#FFFFFF'};
  let st='';
  if(o.al==='left'||o.al==='center'||o.al==='right'){
    st+='text-align:'+o.al+';align-self:'+(o.al==='left'?'flex-start':(o.al==='right'?'flex-end':'center'))+';';
    st+=(o.al==='left'?'margin-right:auto;':(o.al==='right'?'margin-left:auto;':'margin-left:auto;margin-right:auto;'));
  }
  if(F[o.ca]) st+='font-family:'+F[o.ca]+';';
  const d=parseInt(o.di,10); if(d>=60 && d<=220) st+='font-size:'+(d/100)+'em;';
  if(C[o.cl]) st+='color:'+C[o.cl]+';';
  if(o.gr) st+='font-weight:700;';
  if(o.cv) st+='font-style:italic;';
  return st;
}
function stileTesto(k){
  let o=null; try{ o=JSON.parse(TESTI_PAG['stile:'+k]||'null'); }catch(_e){ o=null; }
  const st=stileDaOggetto(o);
  return st ? (' style="'+st+'"') : '';
}
/* Indirizzi ammessi negli elementi aggiuntivi: http(s) o percorsi interni. */
function urlSicuro(u){
  u=String(u||'').trim();
  if(/^https?:\/\//i.test(u)) return u;
  if(/^[a-zA-Z0-9_\-][a-zA-Z0-9_\-.\/]*$/.test(u)) return u;
  return '#';
}
/* Zone della home in cui la Presidenza puo' aggiungere elementi. */
const ZONE_BLOCCHI = [
  ['hero','Riquadro iniziale'],
  ['sezione.Parlamento dei Giovani','Scheda \u201cIl Parlamento dei Giovani\u201d'],
  ['sezione.Accademia','Scheda \u201cL\u2019Accademia\u201d'],
  ['sezione.Video On Demand','Scheda \u201cIl Video On Demand\u201d'],
  ['sezione.Biblioteca Audio','Scheda \u201cLa Biblioteca Audio\u201d'],
  ['sezione.Campus','Scheda \u201cIl Campus\u201d'],
  ['sezione.Eventi','Scheda \u201cGli Eventi\u201d'],
  ['provare','Sezione \u201cPer Provare\u201d'],
  ['manifesto','Manifesto (in home)'],
  ['manifesto-pagina','Pagina del Manifesto']
];
/* Resa pubblica degli elementi aggiuntivi di una zona. */
function blocchiHtml(zona, tema){
  let arr=[]; try{ arr=JSON.parse(TESTI_PAG['blocchi:'+zona]||'[]'); }catch(_e){ arr=[]; }
  if(!Array.isArray(arr) || !arr.length) return '';
  const H = arr.map(b=>{
    if(!b || typeof b!=='object') return '';
    if(b.tipo==='testo'){
      const base=(tema==='scuro' && !b.cl) ? 'color:#EDE7D6;' : '';
      return '<p class="blk-testo" style="'+base+stileDaOggetto(b)+'">'+esc(b.testo||'')+'</p>';
    }
    if(b.tipo==='immagine'){
      const w=[25,40,60,80,100].indexOf(parseInt(b.larg,10))>=0 ? parseInt(b.larg,10) : 60;
      const m=b.al==='left' ? 'margin-right:auto;' : (b.al==='right' ? 'margin-left:auto;' : 'margin-left:auto;margin-right:auto;');
      return '<img class="blk-img" src="'+esc(urlSicuro(b.url))+'" alt="" loading="lazy" style="width:'+w+'%;'+m+'">';
    }
    if(b.tipo==='tasto'){
      const cls=b.st==='oro' ? 'btn oro lp-btn' : (b.st==='contorno' ? 'lp-btn2' : 'btn lp-btn');
      const just=b.al==='left' ? 'flex-start' : (b.al==='right' ? 'flex-end' : 'center');
      return '<div class="blk-cta" style="justify-content:'+just+'"><a class="'+cls+'" style="text-decoration:none" target="_blank" rel="noopener" href="'+esc(urlSicuro(b.link))+'">'+esc(b.testo||'')+'</a></div>';
    }
    return '';
  }).join('');
  return '<div class="blk-zona">'+H+'</div>';
}
/* Elenco dei testi modificabili: [chiave, etichetta, predefinito, righe-textarea] */
const ELENCO_TESTI = (function(){
  const E=[['hero.occhiello','Riquadro iniziale \u2014 occhiello','La Pacifica Res Publica',0],
    ['hero.titolo','Riquadro iniziale \u2014 titolo (ammesso HTML es. <em>)','Accademia Internazionale per la&nbsp;<em>pace</em>.',0],
    ['provare.titolo','Intestazione \u201cPer Provare\u201d','Per Provare',0],
    ['manifesto.titolo','Manifesto \u2014 titolo (in home)','Il Nostro Manifesto',0],
    ['manifesto.titolo-pagina','Manifesto \u2014 titolo della pagina interna','I Sette Principi',0],
    ['manifesto.citazione','Manifesto \u2014 citazione finale','\u00abLa conoscenza senza coscienza non genera futuro.\u00bb',0],
    ['footer.motto','Pi\u00e8 di pagina \u2014 motto','\u00abCustodire per costruire.\u00bb',0]];
  const SR={'Parlamento dei Giovani':['Il Parlamento dei Giovani','Proposte, dibattiti e votazioni.','Seggi, commissioni e aula.','La democrazia si impara praticandola.'],
    'Accademia':['L\u2019Accademia','Corsi tenuti dai formatori.','Lezioni, materiali e quiz.','Il Percorso di Pace, passo dopo passo.'],
    'Video On Demand':['Il Video On Demand','Lezioni e conferenze in video.','Percorsi ordinati per livelli.','La cultura di pace da guardare.'],
    'Biblioteca Audio':['La Biblioteca Audio','Testi da leggere e ascoltare.','Audiolibri con voce IA.','La cultura che si ascolta.'],
    'Campus':['Il Campus','Fine settimana formativi.','All\u2019Abbazia di Maguzzano, sul Garda.','Lo studio come vita condivisa.'],
    'Eventi':['Gli Eventi','Mostre, incontri e forum.','Aperti alla citt\u00e0.','La Pacifica incontra il mondo.']};
  Object.keys(SR).forEach(k=>{
    E.push(['sezione.'+k+'.titolo','Scheda \u201c'+k+'\u201d \u2014 titolo',SR[k][0],0]);
    for(let i=1;i<=3;i++) E.push(['sezione.'+k+'.riga'+i,'Scheda \u201c'+k+'\u201d \u2014 riga '+i,SR[k][i],0]);
  });
  const PR=[['I','La Pace come Stato dell\u2019Essere','La pace \u00e8 uno stato interiore di consapevolezza, che si riflette nella vita sociale e civile promuovendo la risoluzione dei conflitti.'],
    ['II','Conoscenza e Coscienza Unite','Ogni sapere \u00e8 autentico solo quando \u00e8 accompagnato da responsabilit\u00e0 etica e profondit\u00e0 spirituale. La conoscenza senza coscienza non genera futuro.'],
    ['III','Centralit\u00e0 della Persona Umana','L\u2019essere umano \u00e8 al centro come creatura pensante, relazionale e spirituale. Educare significa formare l\u2019intero essere umano.'],
    ['IV','Unit\u00e0 nella Diversit\u00e0','Culture, discipline e tradizioni dialogano senza annullarsi. La pace nasce dall\u2019armonia delle differenze.'],
    ['V','Bellezza come Via Educativa','Arte, parola e bellezza sono strumenti di elevazione, comprensione e trasformazione. La bellezza educa alla pace.'],
    ['VI','Sapere come Servizio','La conoscenza \u00e8 chiamata a diventare servizio al bene comune, custodia della vita e responsabilit\u00e0 verso le generazioni future.'],
    ['VII','Storia Vivente e Futuro Consapevole','Il futuro nasce da radici comprese e rinnovate. La storia \u00e8 una memoria che ritorna vivente.']];
  PR.forEach(p=>{ E.push(['principio.'+p[0]+'.titolo','Principio '+p[0]+' \u2014 titolo',p[1],0]);
                  E.push(['principio.'+p[0]+'.testo','Principio '+p[0]+' \u2014 testo',p[2],3]); });
  return E;
})();
let LEZ_ADMIN = [];
let UTENTI_ADMIN = [];
let CONTRATTI = [];
let FONTI = [];
let NOTIZIE = [];
let EVENTIPACE = [];
let FORMULE = [];   /* formule dei mecenati (dal server) */
let ENTE = {};      /* dati dell'ente: IBAN e simili, MAI nel repository */
let TEMI = [];        /* mappatura tema OEIL -> commissione (arriva dal server) */
let DOSSIER = [];     /* dossier legislativi europei, materia prima delle commissioni */
let LIVELLI = [
  {id:'pubblico',  nome:'Pubblico',         ospiti:true,  memberships:[],                          ruoli:[],           invito:'',                                     cta:'',            ordine:10, attivo:true},
  {id:'iscritti',  nome:'Solo iscritti',    ospiti:false, memberships:['free','civis','academicus'],ruoli:[],          invito:'Registrati per guardarlo',             cta:'registrati',  ordine:20, attivo:true},
  {id:'civis',     nome:'Civis',            ospiti:false, memberships:['civis','academicus'],      ruoli:[],           invito:'Incluso in Civis',                     cta:'abbonamenti', ordine:30, attivo:true},
  {id:'academicus',nome:'Civis Academicus', ospiti:false, memberships:['academicus'],              ruoli:[],           invito:'Incluso in Civis Academicus',          cta:'abbonamenti', ordine:40, attivo:true},
  {id:'delegati',  nome:'Delegati',         ospiti:false, memberships:[],                          ruoli:['delegato'], invito:'Riservato ai delegati del Parlamento', cta:'',            ordine:50, attivo:true},
  {id:'presidenza',nome:'Solo presidenza',  ospiti:false, memberships:[],                          ruoli:[],           invito:'Materiale interno',                    cta:'',            ordine:60, attivo:true},
];
let VOD = [
  {id:'v1', tit:'Il Manifesto della Pacifica', tipo:'Documentario', durata:'24 min', livello:'pubblico', comm:'memoria', desc:'Il film che racconta i Sette Principi fondativi e la nascita della Res Publica dei giovani.'},
  {id:'v2', tit:'La prima lezione del Prof. Barbessi', tipo:'Lezione aperta', durata:'25 min', livello:'pubblico', comm:'etica', desc:'Estratto gratuito dal corso di Filosofia: un assaggio del Percorso di Pace.'},
  {id:'v3', tit:'Dentro l’emiciclo: una seduta dei delegati', tipo:'Documento', durata:'38 min', livello:'civis', comm:'pace', desc:'Riprese di una seduta plenaria del Parlamento dei Giovani: dibattito, emendamenti, voto.'},
  {id:'v4', tit:'Conferenza: le diplomazie della pace', tipo:'Conferenza', durata:'52 min', livello:'civis', comm:'dialogo', desc:'Un dialogo a più voci sui grandi processi di pace contemporanei.'},
  {id:'v5', tit:'La bellezza che disarma', tipo:'Documentario', durata:'31 min', livello:'civis', comm:'arte', desc:'Viaggio nei luoghi dove l’arte è diventata strumento di riconciliazione.'},
  {id:'v6', tit:'Economia del bene comune', tipo:'Masterclass', durata:'44 min', livello:'civis', comm:'bene', desc:'Una masterclass sui modelli economici al servizio della persona.'},
  {id:'v7', tit:'Memoria e futuro: voci di testimoni', tipo:'Documento', durata:'40 min', livello:'civis', comm:'memoria', desc:'Testimonianze raccolte per custodire la memoria e illuminare il futuro.'},
  {id:'v8', tit:'Live mensile — Q&A con i formatori', tipo:'Registrazione live', durata:'61 min', livello:'civis', comm:'etica', desc:'La registrazione dell’incontro mensile riservato agli abbonati.'},
];
let AUDIO = [
  {id:'a1', tit:'Il Manifesto, narrato', autore:'La Pacifica', durata:'18 min', free:true, comm:'memoria',
    testo:'I Sette Principi della Pacifica Res Publica. Primo: la pace come fondamento di ogni convivenza, non assenza di conflitto ma presenza di giustizia. Secondo: la conoscenza unita alla coscienza, perché il sapere senza etica non genera futuro. Terzo: la dignità inviolabile di ogni persona, fondamento di ogni diritto. Quarto: l’unità nella diversità, dove il dialogo tra culture diventa diplomazia. Quinto: la bellezza che educa, l’arte come linguaggio universale di pace. Sesto: il bene comune anteposto all’interesse del singolo. Settimo: la memoria custodita per costruire il futuro.'},
  {id:'a2', tit:'Apologia di Socrate (estratti)', autore:'Platone — pubblico dominio', durata:'42 min', free:false, comm:'etica',
    testo:'So di non sapere: in questa consapevolezza Socrate fonda la sua ricerca. Davanti ai giudici di Atene non si difende per salvarsi, ma per restare fedele alla verità. La vita non esaminata, dice, non è degna di essere vissuta. Meglio subire ingiustizia che commetterla.'},
  {id:'a3', tit:'La pace perpetua (sintesi)', autore:'I. Kant — pubblico dominio', durata:'55 min', free:false, comm:'pace',
    testo:'Kant immagina una pace che non sia tregua tra due guerre, ma condizione duratura fondata sul diritto. Propone una federazione di liberi Stati e un diritto cosmopolitico dell’ospitalità. La pace non è un dono della natura ma un compito della ragione: va istituita.'},
  {id:'a4', tit:'Lettera sulla nonviolenza', autore:'Antologia — pubblico dominio', durata:'29 min', free:false, comm:'diritti',
    testo:'La nonviolenza non è la virtù dei deboli ma la forza dei coraggiosi. Non si tratta di subire, ma di rifiutare di restituire il male con il male, spezzando la catena. Chi la pratica trasforma l’avversario in interlocutore e il conflitto in occasione di verità.'},
  {id:'a5', tit:'Sulla bellezza e l’educazione', autore:'F. Schiller — pubblico dominio', durata:'37 min', free:false, comm:'arte',
    testo:'L’uomo è pienamente uomo solo quando gioca, e gioca solo davanti alla bellezza. L’educazione estetica non è un lusso ma la via attraverso cui la libertà entra nella vita: la bellezza riconcilia sensibilità e ragione, e prepara l’animo alla pace.'},
  {id:'a6', tit:'Dispensa: i processi di pace nel Novecento', autore:'Prof. R. Barbessi', durata:'33 min', free:false, comm:'pace',
    testo:'Il Novecento è il secolo delle guerre totali ma anche delle grandi istituzioni di pace. Dalla Società delle Nazioni alle Nazioni Unite: ogni catastrofe ha generato un tentativo di darsi regole comuni. La storia dei processi di pace è la storia di un’umanità che impara dai propri errori.'},
];

/* ---------- accesso ---------- */
/* Stessa regola del SQL dossier_commissioni(): confronto per PREFISSO,
   cosi' '3.30' cattura 3.30.06 e l'intero ramo. */
function dossierCommissioni(temi){
  const out=[];
  (TEMI||[]).forEach(t=>{
    if((temi||[]).some(c=>String(c).indexOf(t.prefisso)===0) && out.indexOf(t.commissione)<0) out.push(t.commissione);
  });
  return out;
}
function dossierDi(comm){ return (DOSSIER||[]).filter(d=>dossierCommissioni(d.temi).indexOf(comm)>=0); }
function livelloConsentito(id){
  const l = LIVELLI.find(x=>x.id===id);
  if(!l || l.attivo===false) return false;
  if(l.ospiti) return true;                       /* vale anche senza account */
  if(!io) return false;
  if(io.ruolo==='presidenza') return true;        /* amministrazione: vede tutto */
  return (l.memberships||[]).indexOf(io.membership)>=0 || (l.ruoli||[]).indexOf(io.ruolo)>=0;
}
function livello(id){ return LIVELLI.find(x=>x.id===id) || {id:id, nome:id, invito:'', cta:''}; }
function haAccesso(area){
  if(!io) return false;
  if(io.ruolo==='presidenza') return true;
  if(area==='parlamento') return io.ruolo==='delegato' || io.ruolo==='presidenza';
  const m = io.membership;
  if(area==='vod-premium' || area==='audio-premium') return m==='civis' || m==='academicus';
  if(area.startsWith('corso:')){
    const cid = area.split(':')[1];
    if(m==='academicus') return true;
    const a = io.acquisti||[];
    return a.includes('corso:'+cid)
      || a.some(x=>x.startsWith('pacc:') && (PACCHETTI.find(p=>p.id===x.split(':')[1])||{corsi:[]}).corsi.includes(cid))
      || a.includes('percorso');
  }
  return false;
}

/* ---------- stato + utility ---------- */
let io=null, vista='dashboard', ctx={}, authTab='login';
const $ = id => document.getElementById(id);
const esc = s => String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const euro = n => n.toLocaleString('it-IT')+' €';
const initials = n => n.trim().split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase();
const commNome = id => (COMMISSIONI.find(c=>c.id===id)||{}).nome || '';
function toast(msg){
  // errori Supabase "tabella non trovata" -> spiegazione utile in italiano
  const m = String(msg||'').match(/Could not find the table 'public\.([A-Za-z_]+)'/);
  if(m) msg = `La tabella \u00ab${m[1]}\u00bb non esiste ancora nel database online: vanno applicate le migrazioni di supabase/migrations (in ordine, dal SQL Editor di Supabase o con \u201csupabase db push\u201d).`;
  const t=document.createElement('div'); t.className='toast'; t.textContent=msg; $('toast-root').appendChild(t); setTimeout(()=>t.remove(), m?7000:2600);
}
async function refreshMe(){ io = await DB.loadMe(); }
async function loadCatalog(){
  try{
    const cat = await DB.loadCatalog();
    try{ TESTI_PAG = await DB.loadTesti(); }catch(_e){ TESTI_PAG = {}; }
    if(cat.CORSI && cat.CORSI.length) CORSI = cat.CORSI;
    if(cat.LIVELLI && cat.LIVELLI.length) LIVELLI = cat.LIVELLI;
    if(cat.TEMI) TEMI = cat.TEMI;
    if(cat.DOSSIER) DOSSIER = cat.DOSSIER;
    if(cat.ANAGRAFICHE) ANAGRAFICHE = cat.ANAGRAFICHE;
    if(cat.MODELLI) MODELLI = cat.MODELLI;
    if(cat.S3ACC) S3ACC = cat.S3ACC;
    if(cat.CONTRATTI) CONTRATTI = cat.CONTRATTI;
    if(cat.FONTI) FONTI = cat.FONTI;
    if(cat.NOTIZIE) NOTIZIE = cat.NOTIZIE;
    if(cat.EVENTIPACE) EVENTIPACE = cat.EVENTIPACE;
    if(cat.VOD && cat.VOD.length) VOD = cat.VOD;
    if(cat.AUDIO && cat.AUDIO.length) AUDIO = cat.AUDIO;
    if(cat.PACCHETTI) PACCHETTI = cat.PACCHETTI;
    if(cat.CAMPUS && cat.CAMPUS.length) CAMPUS = cat.CAMPUS;
    if(cat.TESTI && cat.TESTI.length) TESTI = cat.TESTI;
    if(cat.EVENTI && cat.EVENTI.length) EVENTI = cat.EVENTI;
    if(cat.PREZZO_CORSO) PREZZO_CORSO = cat.PREZZO_CORSO;
    if(cat.PREZZO_PERCORSO) PREZZO_PERCORSO = cat.PREZZO_PERCORSO;
  }catch(e){ /* in caso di errore restano i valori di riserva */ }
}

/* =====================================================================
   PORTA D'INGRESSO PUBBLICA (landing)
===================================================================== */
/* =====================================================================
   PORTA D'INGRESSO PUBBLICA — landing per chi non ha effettuato l'accesso.
   Vetrina ispirata alla Scuola di Atene: architettura originale in SVG,
   i Sette Principi, i sei pilastri e i servizi realmente gratuiti
   (lettura dei testi e ascolto con voce IA, senza account).
   ===================================================================== */
async function caricaRassegnaLanding(){
  const box=$('lp-rass'); if(!box) return;
  try{ if(!NOTIZIE.length && !EVENTIPACE.length) await loadCatalog(); }catch(e){}
  box.innerHTML = rassegnaHTML();
  osservaReveal();
}
async function caricaMecenati(){
  try{ FORMULE = await DB.formule(); ENTE = await DB.datiEnte(); }catch(e){ FORMULE=[]; }
  const box=$('mec-box'); if(!box) return;
  box.innerHTML = FORMULE.filter(f=>f.attivo!==false).map(f=>`<div class="plan">
      <h4>${esc(f.nome)}</h4><div class="p">${euro(f.importo)}</div>
      <p class="muted small" style="margin:6px 0 12px">${esc(f.descrizione||'')}</p>
      <div class="badge blu">${f.quanti} accessi</div>
      <button class="btn oro full" style="margin-top:14px" onclick="apriImpegno('${esc(f.id)}')">Sottoscrivi l\u2019impegno</button>
    </div>`).join('');
  osservaReveal();
}
function apriImpegno(id){
  const f = FORMULE.find(x=>x.id===id); if(!f) return;
  const priv = ENTE.ente_privacy_url||'';
  openModal(`<h3 style="font-size:23px">${esc(f.nome)}</h3><span class="badge oro">${euro(f.importo)} \u00b7 ${f.quanti} accessi</span>`,
    `<p class="muted small" style="margin-bottom:14px">Sottoscrivendo l\u2019impegno ricevi un riferimento e le coordinate per il bonifico. Gli accessi vengono emessi a pagamento accreditato.</p>
     <div class="field"><label>Ragione sociale o nome *</label><input id="im-rag"></div>
     <div class="grid g2"><div class="field"><label>Referente *</label><input id="im-ref"></div>
       <div class="field"><label>Email *</label><input id="im-mail" type="email"></div></div>
     <div class="grid g2"><div class="field"><label>Telefono</label><input id="im-tel"></div>
       <div class="field"><label>C.F. / P.IVA</label><input id="im-cf"></div></div>
     <div class="field"><label>Indirizzo</label><input id="im-ind"></div>
     <div class="field"><label>Note</label><input id="im-note"></div>
     <label style="display:flex;gap:8px;align-items:flex-start;font-size:13px;margin:4px 0 14px">
       <input type="checkbox" id="im-ok" style="width:auto;margin-top:3px">
       <span>Acconsento al trattamento dei dati per la gestione dell\u2019impegno${priv?` (<a href="${esc(priv)}" target="_blank" rel="noopener noreferrer">informativa</a>)`:''}. *</span></label>
     <button class="btn oro full" onclick="inviaImpegno('${esc(f.id)}')">Sottoscrivi</button>`);
}
async function inviaImpegno(id){
  if(!$('im-ok').checked) return toast('Serve il consenso al trattamento dei dati.');
  try{
    const r = await DB.sottoscriviImpegno({ formula:id, ragione:$('im-rag').value, referente:$('im-ref').value,
      email:$('im-mail').value, telefono:$('im-tel').value, indirizzo:$('im-ind').value,
      cfPiva:$('im-cf').value, note:$('im-note').value, consenso:true });
    if(!r) return toast('Non riesco a registrare l\u2019impegno.');
    openModal(`<h3 style="font-size:23px">Impegno registrato</h3>`,
      `<p style="margin-bottom:14px">Riferimento <b>${esc(r.riferimento)}</b>. Usalo come <b>causale</b> del bonifico: e\u2019 cosi\u2019 che riconosciamo il versamento.</p>
       ${!r.iban?`<div class="card" style="padding:14px;background:#FCEEEE;border-color:#E3B7B7"><b>Coordinate non ancora pubblicate.</b>
           <p class="small" style="margin-top:6px">Ti contatteremo all\u2019indirizzo indicato.</p></div>`
       :`<div class="card" style="padding:14px;background:var(--avorio);border:none">
           <div class="small"><b>Intestatario</b><br>${esc(r.intestatario||r.denominazione||'')}</div>
           <div class="small" style="margin-top:8px"><b>IBAN</b><br><code>${esc(r.iban)}</code></div>
           ${r.banca?`<div class="small" style="margin-top:8px"><b>Banca</b><br>${esc(r.banca)}</div>`:''}
           <div class="small" style="margin-top:8px"><b>Importo</b><br>${euro(r.importo)}</div>
           <div class="small" style="margin-top:8px"><b>Causale</b><br><code>${esc(r.riferimento)}</code></div></div>`}
       <p class="muted small" style="margin-top:12px">Gli accessi vengono emessi a pagamento accreditato.</p>`);
  }catch(e){ toast(String(e.message||e)); }
}
function apriAccesso(tab){ authTab = (tab==='reg' ? 'reg' : 'login'); renderAuth(); }
function tornaHome(){ paginaLanding='home'; renderLanding(); window.scrollTo(0,0); }

/* Tre righe identificative per ogni sezione (schede della home) */
function pillRighe(t){
  const R = {
    'Parlamento dei Giovani': ['Proposte, dibattiti e votazioni.','Seggi, commissioni e aula.','La democrazia si impara praticandola.'],
    'Accademia': ['Corsi tenuti dai formatori.','Lezioni, materiali e quiz.','Il Percorso di Pace, passo dopo passo.'],
    'Video On Demand': ['Lezioni e conferenze in video.','Percorsi ordinati per livelli.','La cultura di pace da guardare.'],
    'Biblioteca Audio': ['Testi da leggere e ascoltare.','Audiolibri con voce IA.','La cultura che si ascolta.'],
    'Campus': ['Fine settimana formativi.','All\u2019Abbazia di Maguzzano, sul Garda.','Lo studio come vita condivisa.'],
    'Eventi': ['Mostre, incontri e forum.','Aperti alla citt\u00e0.','La Pacifica incontra il mondo.']
  };
  return (R[t]||[]).map((r,i)=>({ testo:T('sezione.'+t+'.riga'+(i+1), r), st:stileTesto('sezione.'+t+'.riga'+(i+1)) }));
}

/* Emblemi SVG dei sei pilastri (coerenti col tema, oro su vetro) */
function pillSvg(t){
  const S = b => `<svg viewBox="0 0 40 40" fill="none" stroke="#A9842F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${b}</svg>`;
  const M = {
    'Parlamento dei Giovani': S('<path d="M4 15 20 6l16 9"/><path d="M8 15v13M16 15v13M24 15v13M32 15v13"/><path d="M5 30h30"/>'),
    'Accademia': S('<path d="M20 11c-3-2-7-3-12-3v22c5 0 9 1 12 3 3-2 7-3 12-3V8c-5 0-9 1-12 3z"/><path d="M20 11v22"/>'),
    'Video On Demand': S('<rect x="6" y="9" width="28" height="22" rx="3"/><path d="M17 15l9 6-9 6z" fill="#A9842F" stroke="none"/>'),
    'Biblioteca Audio': S('<path d="M9 8h5v24H9zM17 8h5v24h-5z"/><path d="M26 13c3 3 3 11 0 14M30 10c5 5 5 15 0 20"/>'),
    'Campus': S('<path d="M6 32V17l14-9 14 9v15"/><path d="M16 32v-6a4 4 0 018 0v6"/><path d="M4 32h32"/>'),
    'Eventi': S('<path d="M20 6l3.8 8.1 8.9 1-6.6 6 1.7 8.8L20 33.4l-7.8 4.5 1.7-8.8-6.6-6 8.9-1z"/>')
  };
  return M[t] || S('<circle cx="20" cy="20" r="12"/>');
}

/* Affreschi di sfondo delle sei sezioni (immagini fornite, in img/pilastri) */
function pillImg(t){
  const M={ 'Parlamento dei Giovani':'parlamento', 'Accademia':'accademia',
    'Video On Demand':'vod', 'Biblioteca Audio':'biblioteca', 'Campus':'campus', 'Eventi':'eventi' };
  return 'img/pilastri/'+(M[t]||'accademia')+'.webp';
}

/* Scene illustrate di sfondo per i sei pilastri */
function pillScene(t){
  const M={
    'Parlamento dei Giovani': '<svg viewBox="0 0 400 340" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A4E86"/><stop offset="1" stop-color="#0E1D38"/></linearGradient></defs><rect width="400" height="340" fill="url(#g1)"/><g stroke="#D9C48A" stroke-width="2" fill="none" opacity=".5" stroke-linejoin="round"><path d="M60 44l140-26 140 26"/><path d="M66 46h268"/><path d="M92 50v66M138 50v66M200 50v66M262 50v66M308 50v66"/><path d="M78 118h244"/></g><g fill="none" stroke="#4A6FA8" stroke-width="7" opacity=".55"><path d="M28 312 A186 132 0 0 1 372 312"/><path d="M64 312 A150 108 0 0 1 336 312"/><path d="M100 312 A116 86 0 0 1 300 312"/><path d="M136 312 A82 64 0 0 1 264 312"/></g><rect x="186" y="256" width="28" height="56" rx="3" fill="#D9C48A" opacity=".8"/></svg>',
    'Accademia': '<svg viewBox="0 0 400 340" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#243F70"/><stop offset="1" stop-color="#0E1D38"/></linearGradient></defs><rect width="400" height="340" fill="url(#g2)"/><rect x="34" y="70" width="332" height="238" rx="6" fill="none" stroke="#D9C48A" stroke-width="2" opacity=".35"/><rect x="44" y="98" width="16" height="52" rx="1.5" fill="#A9842F" opacity=".85"/><rect x="63" y="106" width="12" height="44" rx="1.5" fill="#3A5C93" opacity=".85"/><rect x="78" y="110" width="12" height="40" rx="1.5" fill="#3A5C93" opacity=".85"/><rect x="93" y="102" width="12" height="48" rx="1.5" fill="#4A6FA8" opacity=".85"/><rect x="108" y="106" width="12" height="44" rx="1.5" fill="#A9842F" opacity=".85"/><rect x="123" y="106" width="18" height="44" rx="1.5" fill="#4A6FA8" opacity=".85"/><rect x="144" y="102" width="12" height="48" rx="1.5" fill="#A9842F" opacity=".85"/><rect x="159" y="102" width="12" height="48" rx="1.5" fill="#D9C48A" opacity=".85"/><rect x="174" y="102" width="14" height="48" rx="1.5" fill="#D9C48A" opacity=".85"/><rect x="191" y="102" width="10" height="48" rx="1.5" fill="#A9842F" opacity=".85"/><rect x="204" y="98" width="12" height="52" rx="1.5" fill="#D9C48A" opacity=".85"/><rect x="219" y="98" width="10" height="52" rx="1.5" fill="#EDE7DA" opacity=".85"/><rect x="232" y="98" width="18" height="52" rx="1.5" fill="#3A5C93" opacity=".85"/><rect x="253" y="102" width="12" height="48" rx="1.5" fill="#EDE7DA" opacity=".85"/><rect x="268" y="98" width="10" height="52" rx="1.5" fill="#D9C48A" opacity=".85"/><rect x="281" y="102" width="10" height="48" rx="1.5" fill="#4A6FA8" opacity=".85"/><rect x="294" y="106" width="16" height="44" rx="1.5" fill="#3A5C93" opacity=".85"/><rect x="313" y="102" width="12" height="48" rx="1.5" fill="#D9C48A" opacity=".85"/><rect x="328" y="98" width="10" height="52" rx="1.5" fill="#A9842F" opacity=".85"/><rect x="341" y="92" width="10" height="58" rx="1.5" fill="#EDE7DA" opacity=".85"/><rect x="354" y="102" width="18" height="48" rx="1.5" fill="#A9842F" opacity=".85"/><rect x="40" y="150" width="320" height="5" fill="#D9C48A" opacity=".5"/><rect x="44" y="174" width="16" height="40" rx="1.5" fill="#4A6FA8" opacity=".85"/><rect x="63" y="162" width="14" height="52" rx="1.5" fill="#D9C48A" opacity=".85"/><rect x="80" y="174" width="10" height="40" rx="1.5" fill="#3A5C93" opacity=".85"/><rect x="93" y="174" width="18" height="40" rx="1.5" fill="#A9842F" opacity=".85"/><rect x="114" y="166" width="16" height="48" rx="1.5" fill="#D9C48A" opacity=".85"/><rect x="133" y="166" width="12" height="48" rx="1.5" fill="#A9842F" opacity=".85"/><rect x="148" y="174" width="14" height="40" rx="1.5" fill="#4A6FA8" opacity=".85"/><rect x="165" y="156" width="18" height="58" rx="1.5" fill="#D9C48A" opacity=".85"/><rect x="186" y="166" width="12" height="48" rx="1.5" fill="#3A5C93" opacity=".85"/><rect x="201" y="174" width="16" height="40" rx="1.5" fill="#EDE7DA" opacity=".85"/><rect x="220" y="156" width="10" height="58" rx="1.5" fill="#3A5C93" opacity=".85"/><rect x="233" y="170" width="18" height="44" rx="1.5" fill="#D9C48A" opacity=".85"/><rect x="254" y="156" width="16" height="58" rx="1.5" fill="#D9C48A" opacity=".85"/><rect x="273" y="174" width="12" height="40" rx="1.5" fill="#3A5C93" opacity=".85"/><rect x="288" y="174" width="18" height="40" rx="1.5" fill="#A9842F" opacity=".85"/><rect x="309" y="170" width="16" height="44" rx="1.5" fill="#A9842F" opacity=".85"/><rect x="328" y="162" width="16" height="52" rx="1.5" fill="#3A5C93" opacity=".85"/><rect x="347" y="156" width="12" height="58" rx="1.5" fill="#D9C48A" opacity=".85"/><rect x="40" y="214" width="320" height="5" fill="#D9C48A" opacity=".5"/><rect x="44" y="238" width="14" height="40" rx="1.5" fill="#4A6FA8" opacity=".85"/><rect x="61" y="220" width="14" height="58" rx="1.5" fill="#A9842F" opacity=".85"/><rect x="78" y="234" width="18" height="44" rx="1.5" fill="#4A6FA8" opacity=".85"/><rect x="99" y="220" width="18" height="58" rx="1.5" fill="#3A5C93" opacity=".85"/><rect x="120" y="226" width="16" height="52" rx="1.5" fill="#A9842F" opacity=".85"/><rect x="139" y="238" width="10" height="40" rx="1.5" fill="#A9842F" opacity=".85"/><rect x="152" y="220" width="16" height="58" rx="1.5" fill="#4A6FA8" opacity=".85"/><rect x="171" y="234" width="14" height="44" rx="1.5" fill="#4A6FA8" opacity=".85"/><rect x="188" y="226" width="14" height="52" rx="1.5" fill="#4A6FA8" opacity=".85"/><rect x="205" y="220" width="12" height="58" rx="1.5" fill="#3A5C93" opacity=".85"/><rect x="220" y="238" width="14" height="40" rx="1.5" fill="#EDE7DA" opacity=".85"/><rect x="237" y="226" width="12" height="52" rx="1.5" fill="#A9842F" opacity=".85"/><rect x="252" y="238" width="10" height="40" rx="1.5" fill="#3A5C93" opacity=".85"/><rect x="265" y="238" width="10" height="40" rx="1.5" fill="#4A6FA8" opacity=".85"/><rect x="278" y="230" width="10" height="48" rx="1.5" fill="#D9C48A" opacity=".85"/><rect x="291" y="230" width="18" height="48" rx="1.5" fill="#A9842F" opacity=".85"/><rect x="312" y="220" width="18" height="58" rx="1.5" fill="#A9842F" opacity=".85"/><rect x="333" y="220" width="12" height="58" rx="1.5" fill="#A9842F" opacity=".85"/><rect x="348" y="226" width="12" height="52" rx="1.5" fill="#D9C48A" opacity=".85"/><rect x="40" y="278" width="320" height="5" fill="#D9C48A" opacity=".5"/></svg>',
    'Video On Demand': '<svg viewBox="0 0 400 340" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1A2F52"/><stop offset="1" stop-color="#0B1729"/></linearGradient><linearGradient id="beam" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#D9C48A" stop-opacity=".05"/><stop offset="1" stop-color="#D9C48A" stop-opacity=".38"/></linearGradient></defs><rect width="400" height="340" fill="url(#g3)"/><circle cx="372" cy="60" r="7" fill="#D9C48A"/><path d="M372 60 L96 150 L96 250 Z" fill="url(#beam)"/><rect x="40" y="120" width="150" height="112" rx="4" fill="#0B1729" stroke="#D9C48A" stroke-width="2"/><path d="M96 156l40 24-40 24z" fill="#D9C48A"/><g fill="#EDE7DA" opacity=".5"><circle cx="250" cy="120" r="2"/><circle cx="300" cy="160" r="1.6"/><circle cx="220" cy="180" r="1.4"/><circle cx="330" cy="120" r="1.8"/></g></svg>',
    'Biblioteca Audio': '<svg viewBox="0 0 400 340" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g4" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#243F70"/><stop offset="1" stop-color="#0E1D38"/></linearGradient></defs><rect width="400" height="340" fill="url(#g4)"/><path d="M300 150 m-40 0 a40 40 0 0 1 80 0" fill="none" stroke="#4A6FA8" stroke-width="3" opacity=".5"/><path d="M300 150 m-64 0 a64 64 0 0 1 128 0" fill="none" stroke="#4A6FA8" stroke-width="3" opacity=".5"/><path d="M300 150 m-88 0 a88 88 0 0 1 176 0" fill="none" stroke="#4A6FA8" stroke-width="3" opacity=".5"/><rect x="150" y="141" width="4" height="18" rx="2" fill="#D9C48A" opacity=".8"/><rect x="160" y="135" width="4" height="30" rx="2" fill="#D9C48A" opacity=".8"/><rect x="170" y="134" width="4" height="33" rx="2" fill="#D9C48A" opacity=".8"/><rect x="180" y="138" width="4" height="24" rx="2" fill="#D9C48A" opacity=".8"/><rect x="190" y="138" width="4" height="25" rx="2" fill="#D9C48A" opacity=".8"/><rect x="200" y="134" width="4" height="33" rx="2" fill="#D9C48A" opacity=".8"/><rect x="210" y="135" width="4" height="30" rx="2" fill="#D9C48A" opacity=".8"/><rect x="220" y="141" width="4" height="18" rx="2" fill="#D9C48A" opacity=".8"/><rect x="230" y="135" width="4" height="30" rx="2" fill="#D9C48A" opacity=".8"/><rect x="240" y="134" width="4" height="33" rx="2" fill="#D9C48A" opacity=".8"/><rect x="250" y="138" width="4" height="24" rx="2" fill="#D9C48A" opacity=".8"/><rect x="260" y="138" width="4" height="25" rx="2" fill="#D9C48A" opacity=".8"/><g fill="none" stroke="#D9C48A" stroke-width="2.5" opacity=".9"><path d="M120 300c-26-14-52-16-78-10V214c26-6 52-4 78 10 26-14 52-16 78-10v76c-26-6-52-4-78 10z"/><path d="M120 224v76"/></g></svg>',
    'Campus': '<svg viewBox="0 0 400 340" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g5" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8C79A"/><stop offset="1" stop-color="#12294A"/></linearGradient><linearGradient id="hill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#284A7E"/><stop offset="1" stop-color="#12294A"/></linearGradient></defs><rect width="400" height="340" fill="url(#g5)"/><circle cx="120" cy="92" r="30" fill="#D9C48A" opacity=".85"/><path d="M0 200q120-40 400 0v60H0z" fill="url(#hill)"/><path d="M70 214 l7 26 h-14 z" fill="#12294A"/><path d="M86 214 l7 26 h-14 z" fill="#12294A"/><path d="M300 214 l7 26 h-14 z" fill="#12294A"/><path d="M330 214 l7 26 h-14 z" fill="#12294A"/><g fill="#12294A"><rect x="150" y="150" width="120" height="66"/><path d="M150 150l60-30 60 30z"/><rect x="196" y="120" width="20" height="40"/><path d="M196 120l10-14 10 14z"/></g><g fill="#D9C48A" opacity=".9"><path d="M180 190a10 10 0 0 1 20 0v26h-20z"/><path d="M220 190a10 10 0 0 1 20 0v26h-20z"/></g><rect x="0" y="246" width="400" height="94" fill="#0E1D38" opacity=".55"/><path d="M30 256h340" stroke="#4A6FA8" stroke-width="1.5" opacity=".35"/><path d="M30 268h340" stroke="#4A6FA8" stroke-width="1.5" opacity=".35"/><path d="M30 280h340" stroke="#4A6FA8" stroke-width="1.5" opacity=".35"/><path d="M30 292h340" stroke="#4A6FA8" stroke-width="1.5" opacity=".35"/><path d="M30 304h340" stroke="#4A6FA8" stroke-width="1.5" opacity=".35"/></svg>',
    'Eventi': '<svg viewBox="0 0 400 340" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g6" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1E3866"/><stop offset="1" stop-color="#0B1729"/></linearGradient><linearGradient id="spot" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#D9C48A" stop-opacity=".30"/><stop offset="1" stop-color="#D9C48A" stop-opacity="0"/></linearGradient></defs><rect width="400" height="340" fill="url(#g6)"/><circle cx="60" cy="50" r="2" fill="#EDE7DA" opacity=".8"/><circle cx="120" cy="36" r="1.6" fill="#EDE7DA" opacity=".8"/><circle cx="200" cy="54" r="2.2" fill="#EDE7DA" opacity=".8"/><circle cx="280" cy="40" r="1.6" fill="#EDE7DA" opacity=".8"/><circle cx="340" cy="60" r="2" fill="#EDE7DA" opacity=".8"/><circle cx="160" cy="80" r="1.4" fill="#EDE7DA" opacity=".8"/><circle cx="320" cy="96" r="1.6" fill="#EDE7DA" opacity=".8"/><circle cx="90" cy="96" r="1.4" fill="#EDE7DA" opacity=".8"/><path d="M110 340 L60 150 L160 150 Z" fill="url(#spot)"/><path d="M290 340 L240 150 L340 150 Z" fill="url(#spot)"/><path d="M30 70 Q200 96 370 70" fill="none" stroke="#D9C48A" stroke-width="1.5" opacity=".6"/><path d="M30 70 l14 0 l-7 16 z" fill="#D9C48A" opacity=".9"/><path d="M64 76 l14 0 l-7 16 z" fill="#4A6FA8" opacity=".9"/><path d="M98 81 l14 0 l-7 16 z" fill="#A9842F" opacity=".9"/><path d="M132 86 l14 0 l-7 16 z" fill="#EDE7DA" opacity=".9"/><path d="M166 89 l14 0 l-7 16 z" fill="#D9C48A" opacity=".9"/><path d="M200 90 l14 0 l-7 16 z" fill="#4A6FA8" opacity=".9"/><path d="M234 89 l14 0 l-7 16 z" fill="#A9842F" opacity=".9"/><path d="M268 86 l14 0 l-7 16 z" fill="#EDE7DA" opacity=".9"/><path d="M302 81 l14 0 l-7 16 z" fill="#D9C48A" opacity=".9"/><path d="M336 76 l14 0 l-7 16 z" fill="#4A6FA8" opacity=".9"/><path d="M370 70 l14 0 l-7 16 z" fill="#A9842F" opacity=".9"/><path d="M120 300h160v40H120z" fill="#12294A"/><path d="M110 300h180" stroke="#D9C48A" stroke-width="3"/></svg>',
  };
  return M[t]||'';
}


/* Piè di pagina condiviso (home + pagine interne) */
function lpFooter(){
  return `<footer class="lp-foot"><div class="lp-sec-in lp-foot-in">
      <div class="lp-foot-brand"><span class="mark mark-scuro"><img class="logo-img" src="img/logo.png" alt="La Pacifica Res Publica"></span><div><b>La Pacifica Res Publica</b><span${stileTesto('footer.motto')}>${esc(T('footer.motto','\u00abCustodire per costruire.\u00bb'))}</span></div></div>
      <div class="lp-foot-cta">
        <button class="linkbtn" onclick="apriAccesso('login')">Accedi</button>
        <button class="btn small" onclick="apriAccesso('reg')">Entra gratis</button>
      </div>
    </div></footer>`;
}

/* Intestazione condivisa dalle pagine interne della landing */
function lpHeaderPagina(){
  return `<header class="lp-top"><div class="lp-top-in">
      <div class="brand" onclick="tornaHome()"><div class="mark"><img class="logo-img" src="img/logo.png" alt="La Pacifica Res Publica"></div><div><b>La Pacifica</b><span>Res Publica</span></div></div>
      <div class="lp-top-cta">
        <button class="linkbtn" onclick="tornaHome()">\u2190 Home</button>
        <button class="btn small" onclick="apriAccesso('reg')">Entra gratis</button>
      </div>
    </div></header>`;
}

/* =====================================================================
   PAGINA MANIFESTO — i Sette Principi, spiegati (fuori dalla prima pagina)
   ===================================================================== */
function renderManifestoPage(){
  const principi = [
    ['I','La Pace come Stato dell\u2019Essere','La pace \u00e8 uno stato interiore di consapevolezza, che si riflette nella vita sociale e civile promuovendo la risoluzione dei conflitti.'],
    ['II','Conoscenza e Coscienza Unite','Ogni sapere \u00e8 autentico solo quando \u00e8 accompagnato da responsabilit\u00e0 etica e profondit\u00e0 spirituale. La conoscenza senza coscienza non genera futuro.'],
    ['III','Centralit\u00e0 della Persona Umana','L\u2019essere umano \u00e8 al centro come creatura pensante, relazionale e spirituale. Educare significa formare l\u2019intero essere umano.'],
    ['IV','Unit\u00e0 nella Diversit\u00e0','Culture, discipline e tradizioni dialogano senza annullarsi. La pace nasce dall\u2019armonia delle differenze.'],
    ['V','Bellezza come Via Educativa','Arte, parola e bellezza sono strumenti di elevazione, comprensione e trasformazione. La bellezza educa alla pace.'],
    ['VI','Sapere come Servizio','La conoscenza \u00e8 chiamata a diventare servizio al bene comune, custodia della vita e responsabilit\u00e0 verso le generazioni future.'],
    ['VII','Storia Vivente e Futuro Consapevole','Il futuro nasce da radici comprese e rinnovate. La storia \u00e8 una memoria che ritorna vivente.']
  ];
  return `<div class="lp">
    ${lpHeaderPagina()}
    <section class="lp-page-hero"><div class="lp-sec-in">
      <img class="lp-manifesto-logo" src="img/logo.png" alt="La Pacifica Res Publica">
      <h1 class="lp-page-h1"${stileTesto('manifesto.titolo-pagina')}>${esc(T('manifesto.titolo-pagina','I Sette Principi'))}</h1>
      <p class="lp-page-lead">La Pacifica nasce come Accademia Internazionale per la Pace, una <em>Res Publica universale</em> fondata sulla conoscenza, sulla coscienza e sulla dignit\u00e0 dell\u2019essere umano. La nostra iniziativa si riconosce in sette principi fondamentali, che ne costituiscono l\u2019anima e la direzione.</p>
    </div></section>
    <section class="lp-sec"><div class="lp-sec-in">
      <div class="man-list">
        ${principi.map(([n,t,d])=>`<article class="man-item"><div class="man-n">${n}</div>
          <div class="man-b"><h3${stileTesto('principio.'+n+'.titolo')}>${esc(T('principio.'+n+'.titolo',t))}</h3><p${stileTesto('principio.'+n+'.testo')}>${esc(T('principio.'+n+'.testo',d))}</p></div></article>`).join('')}
      </div>
      ${blocchiHtml('manifesto-pagina','chiaro')}
      <div class="man-quote"${stileTesto('manifesto.citazione')}>${esc(T('manifesto.citazione','\u00abLa conoscenza senza coscienza non genera futuro.\u00bb'))}<span>\u2014 dal Manifesto de La Pacifica Res Publica</span></div>
    </div></section>
    ${lpFooter()}
  </div>`;
}

/* =====================================================================
   PAGINA MECENATI — tutte le informazioni (fuori dalla prima pagina)
   ===================================================================== */
function renderMecenatiPage(){
  return `<div class="lp">
    ${lpHeaderPagina()}
    <section class="lp-page-hero"><div class="lp-sec-in">
      <div class="eyebrow" style="color:var(--oro)">Mecenati</div>
      <h1 class="lp-page-h1">Costruttori accademici di pace</h1>
      <p class="lp-page-lead">Chi sostiene La Pacifica non fa una donazione astratta: acquista <b>pacchetti di accessi</b> alla formazione e li destina a studenti e docenti che altrimenti non potrebbero permetterseli. \u00c8 un mecenatismo concreto, che si misura in ragazzi che studiano.</p>
    </div></section>

    <section class="lp-sec"><div class="lp-sec-in">
      <div class="lp-h"><div class="eyebrow">Come funziona</div><h2>Tre passaggi</h2></div>
      <div class="lp-grid lp-g3">
        <div class="mec-step"><span class="mec-sn">1</span><h4>Scegli una formula</h4><p>Ogni formula \u00e8 \u201ctot euro \u2192 tot accessi\u201d. Dal singolo accesso annuale fino a decine, per la misura di una scuola o di un istituto.</p></div>
        <div class="mec-step"><span class="mec-sn">2</span><h4>Sottoscrivi l\u2019impegno</h4><p>Compili i dati e ricevi un riferimento con le coordinate per il bonifico. Nessun addebito automatico: paghi con i tuoi tempi.</p></div>
        <div class="mec-step"><span class="mec-sn">3</span><h4>Distribuisci gli accessi</h4><p>A pagamento accreditato, gli accessi vengono emessi come codici che puoi assegnare a chi vuoi tu.</p></div>
      </div>
    </div></section>

    <section class="lp-sec lp-mec-formule"><div class="lp-sec-in">
      <div class="lp-h"><div class="eyebrow">Le formule</div><h2>Scegli la tua misura</h2>
        <p class="lp-lead">Pi\u00f9 la formula \u00e8 ampia, pi\u00f9 il costo per accesso scende. Ogni accesso \u00e8 un percorso in mano a un ragazzo.</p></div>
      <div id="mec-box" class="lp-plans"></div>
    </div></section>

    <section class="lp-sec"><div class="lp-sec-in">
      <div class="card" style="padding:20px 22px">
        <div class="eyebrow">Trasparenza</div>
        <p class="muted small" style="margin:8px 0 0">Gli accessi si attivano solo dopo l\u2019accredito effettivo del bonifico, confermato manualmente dalla Presidenza. Il trattamento fiscale (erogazione liberale o acquisto con controprestazione) dipende dalla natura del sostegno: per l\u2019inquadramento corretto \u00e8 bene sentire un commercialista. Per aziende ed enti \u00e8 possibile concordare formule dedicate.</p>
      </div>
      <div class="lp-cta" style="justify-content:center;margin-top:24px">
        <button class="lp-btn2" onclick="tornaHome()">\u2190 Torna alla home</button>
      </div>
    </div></section>
    ${lpFooter()}
  </div>`;
}

let paginaLanding='home';
function apriPagina(p){ paginaLanding=p; renderLanding(); window.scrollTo(0,0); }
function renderLanding(){
  $('app').style.display='none';
  const _ar=$('auth-root'); if(_ar) _ar.style.display='block';
  if(paginaLanding==='manifesto'){ TRK.log('pageview','manifesto'); $('auth-root').innerHTML = renderManifestoPage(); osservaReveal(); return; }
  if(paginaLanding==='mecenati'){ TRK.log('pageview','mecenati'); $('auth-root').innerHTML = renderMecenatiPage(); setTimeout(caricaMecenati,0); osservaReveal(); return; }
  TRK.log('pageview','landing');
  setTimeout(caricaMecenati,0);
  setTimeout(caricaRassegnaLanding,0);

  const principi = [
    ['I','La pace come fondamento','Non l\u2019assenza di conflitto, ma la presenza di giustizia.'],
    ['II','Il sapere con coscienza','La conoscenza senza coscienza non genera futuro.'],
    ['III','La dignit\u00e0 della persona','Inviolabile: \u00e8 il fondamento di ogni diritto.'],
    ['IV','L\u2019unit\u00e0 nella diversit\u00e0','Il dialogo tra culture che si fa diplomazia.'],
    ['V','La bellezza che educa','L\u2019arte come linguaggio universale di pace.'],
    ['VI','Il bene comune','Il bene di tutti prima dell\u2019interesse del singolo.'],
    ['VII','Memoria e futuro','Custodire il passato per costruire il domani.'],
  ];

  const pilastri = [
    {n:'I',  ico:'\u2696\uFE0E', t:'Parlamento dei Giovani', tit:'Il Parlamento dei Giovani', d:'150 delegati, sette commissioni, proposte di legge e voto in aula.', free:'Il documentario sull\u2019emiciclo', chiuso:'Seggio e voto \u2014 su invito'},
    {n:'II', ico:'\uD83D\uDCD6', t:'Accademia', tit:'L’Accademia', d:'Il Percorso di Pace in otto corsi tenuti dai formatori.', free:'Lezioni aperte e assaggi', chiuso:'Corsi completi e attestati'},
    {n:'III',ico:'\u25B6', t:'Video On Demand', tit:'Il Video On Demand', d:'Documentari, lezioni aperte e conferenze sulla cultura di pace.', free:'Documentari e lezioni', chiuso:'Catalogo completo con Civis'},
    {n:'IV', ico:'\uD83D\uDCDA', t:'Biblioteca Audio', tit:'La Biblioteca Audio', d:'Testi e audiolibri da leggere e ascoltare, con voce e sintesi IA.', free:'Testi e audiolibri scelti + voce IA', chiuso:'Tutta la biblioteca con Civis'},
    {n:'V',  ico:'\u26EA', t:'Campus', tit:'Il Campus', d:'Fine settimana formativi all\u2019Abbazia di Maguzzano, sul Lago di Garda.', free:'Programmi e calendario', chiuso:'Posti su prenotazione'},
    {n:'VI', ico:'\uD83C\uDFAD', t:'Eventi', tit:'Gli Eventi', d:'Mostre ed incontri de La Pacifica, aperti alla citt\u00e0.', free:'Programma di ENIGMA ET SPECULUM', chiuso:'Ingresso con biglietto'},
  ];

  const clip = (s,n) => { s=String(s||'').replace(/\s+/g,' ').trim(); return s.length>n ? s.slice(0,n).trim()+'\u2026' : s; };
  const liberi = [
    ...TESTI.filter(t=>t.free).map(t=>({tp:'Testo', ico:'\u270E', tit:t.tit, meta:(t.autore+' \u00b7 '+(t.lettura||'')), desc:clip((t.testo||'').split('\n')[0],130), cta:'Leggi e ascolta', fn:"apriTesto('"+t.id+"')"})),
    ...AUDIO.filter(a=>a.free).map(a=>({tp:'Audiolibro', ico:'\u266A', tit:a.tit, meta:(a.autore+' \u00b7 '+a.durata), desc:clip(a.testo,130), cta:'Ascolta', fn:"apriAudio('"+a.id+"')"})),
    ...VOD.filter(v=>livelloConsentito(v.livello)).map(v=>({tp:v.tipo, ico:'\u25B6', tit:v.tit, meta:(v.durata+' \u00b7 '+commNome(v.comm)), desc:clip(v.desc,130), cta:'Guarda', fn:"playVideo('"+v.id+"')"})),
  ];

  const ev = EVENTI[0] || null;


  $('auth-root').innerHTML = `
  <div class="lp">
    <header class="lp-top"><div class="lp-top-in">
      <div class="brand" onclick="tornaHome()"><div class="mark"><img class="logo-img" src="img/logo.png" alt="La Pacifica Res Publica"></div><div><b>La Pacifica</b><span>Res Publica</span></div></div>
      <div class="lp-top-cta">
        <button class="linkbtn" onclick="apriAccesso('login')">Accedi</button>
        <button class="btn small" onclick="apriAccesso('reg')">Entra gratis</button>
      </div>
    </div></header>

    <section class="lp-hero">
      <div class="lp-hero-art">
        <picture>
          <source srcset="img/scuola-di-atene.webp" type="image/webp">
          <img class="lp-fresco" src="img/scuola-di-atene.jpg" width="1280" height="808"
               fetchpriority="high" decoding="async"
               alt="La Scuola di Atene di Raffaello Sanzio: i filosofi riuniti sotto grandi arcate, con Platone che indica il cielo e Aristotele che indica la terra.">
        </picture>
      </div>
      <div class="lp-hero-in"><div class="lp-hero-copy">
        <div class="eyebrow lp-eye"${stileTesto('hero.occhiello')}>${esc(T('hero.occhiello','La Pacifica Res Publica'))}</div>
        <h1 class="lp-h1"${stileTesto('hero.titolo')}>${T('hero.titolo','Accademia Internazionale per la&nbsp;<em>pace</em>.')}</h1>
          ${blocchiHtml('hero','scuro')}
      </div></div>
      <p class="lp-credit">Raffaello Sanzio, <em>La Scuola di Atene</em> (1509\u20131511) \u2014 Musei Vaticani, Stanza della Segnatura</p>
    </section>

    <section class="lp-sec lp-frieze">
      <div class="lp-sec-in">
        <img class="lp-manifesto-logo" src="img/logo.png" alt="La Pacifica Res Publica">
        <div class="lp-h"${stileTesto('manifesto.titolo')}><h2${stileTesto('manifesto.titolo')}>${esc(T('manifesto.titolo','Il Nostro Manifesto'))}</h2></div>
        <div class="lp-cta" style="justify-content:center;margin-top:4px">
          <button class="btn oro lp-btn" onclick="apriPagina('manifesto')">Scopri i Sette Principi \u2192</button>
          <a class="btn lp-btn" href="docs/manifesto.pdf" target="_blank" rel="noopener" style="text-decoration:none">Scarica il Manifesto (PDF)</a>
        </div>
        ${blocchiHtml('manifesto','chiaro')}
      </div>
    </section>

    <section class="lp-sec lp-pillars">
      <div class="lp-sec-in">
        <div class="lp-h"><h2>Le nostre sezioni</h2></div>
        <div class="lp-grid lp-g3">
          ${pilastri.map(p=>`<div class="lp-pill">
            <div class="lp-pill-bg lp-pill-txt">${pillRighe(p.t).map(r=>`<span${r.st}>${r.testo}</span>`).join('')}${blocchiHtml('sezione.'+p.t,'chiaro')}</div>
            <span class="lp-pn">${p.n}</span>
            <div class="lp-pill-c">
              <h3${stileTesto('sezione.'+p.t+'.titolo')}>${esc(T('sezione.'+p.t+'.titolo', p.tit||p.t))}</h3>
            </div></div>`).join('')}
        </div>
      </div>
    </section>

    <section class="lp-sec lp-svc">
      <div class="lp-sec-in">
        <div class="lp-h"${stileTesto('provare.titolo')}><h2${stileTesto('provare.titolo')}>${esc(T('provare.titolo','Per Provare'))}</h2></div>
        ${blocchiHtml('provare','chiaro')}
        <div class="lp-grid lp-g3">
          ${liberi.map(x=>`<article class="tile lp-tile">
            <div class="cover lp-cover"><span class="k">${x.ico}</span><span class="tag">${esc(x.tp)} \u00b7 gratuito</span></div>
            <div class="body"><h4>${esc(x.tit)}</h4><div class="meta">${esc(x.meta)}</div>
              <p class="small muted" style="flex:1">${esc(x.desc)}</p>
              <div class="foot"><span class="badge verde">Gratuito</span>
                <button class="btn small" onclick="${x.fn}">${esc(x.cta)} \u2192</button></div>
            </div></article>`).join('')}
          <article class="tile lp-tile lp-tile-locked">
            <div class="cover lp-cover lp-cover-lock"><span class="k">\u2726</span><span class="tag">Civis</span></div>
            <div class="body"><h4>Tutta la biblioteca, i corsi e i live</h4>
              <div class="meta">Video On Demand completo \u00b7 audio illimitato \u00b7 sintesi IA</div>
              <p class="small muted" style="flex:1">Con la membership Civis sblocchi l\u2019intero catalogo e accompagni il Parlamento dei Giovani.</p>
              <div class="foot"><span class="badge grigio">Riservato</span>
                <button class="btn small ghost" onclick="apriAccesso('reg')">Diventa Civis \u2192</button></div>
            </div></article>
        </div>

        ${ev?`<div class="lp-event">
          <div class="lp-event-art">
            <picture>
              <source srcset="img/scuola-di-atene.webp" type="image/webp">
              <img src="img/scuola-di-atene.jpg" loading="lazy" decoding="async"
                   alt="La Scuola di Atene di Raffaello Sanzio">
            </picture>
          </div>
          <div class="lp-event-body">
            <div class="eyebrow" style="color:var(--oro-chiaro)">Gli Eventi</div>
            <h3>${esc(ev.tit)}</h3>
            <p class="lp-event-sub">${esc(ev.sub||'')}</p>
            <p class="lp-event-desc">${esc(clip(ev.desc,300))}</p>
            <div class="lp-event-meta">${esc(ev.periodo||'')} \u00b7 ${esc(ev.luogo||'')}</div>
            <div class="lp-cta" style="margin-top:20px">
              <button class="btn oro lp-btn" onclick="apriAccesso('reg')">Crea un account per prenotare</button>
            </div>
          </div>
        </div>`:''}
      </div>
    </section>

    <section class="lp-sec lp-rass"><div class="lp-sec-in">
      <div class="eyebrow">Ogni giorno</div>
      <h2 style="font-size:34px;margin:6px 0 8px">La pace, oggi</h2>
      <p class="muted" style="max-width:640px;margin-bottom:22px">Notizie da fonti internazionali e gli appuntamenti da non perdere — aggiornate ogni giorno, aperte a tutti.</p>
      <div id="lp-rass"></div>
    </div></section>
    <section class="lp-sec"><div class="lp-sec-in">
      <h2 style="font-size:34px;margin:6px 0 8px">Costruttori accademici di pace</h2>
      <div class="lp-cta" style="justify-content:center;margin-top:4px"><button class="btn oro lp-btn" onclick="apriPagina('mecenati')">Scopri come sostenere \u2192</button></div>
    </div></section>
    <section class="lp-sec lp-civis">
      <div class="lp-sec-in">
        <div class="lp-h center"><div class="eyebrow" style="color:var(--oro-chiaro)">Civis Pacificae</div>
          <h2 style="color:#fff">Un solo abbonamento, tutto l\u2019ecosistema</h2>
          <p class="lp-lead" style="color:#C7D0E0;margin-left:auto;margin-right:auto">Ogni iscrizione sostiene il Parlamento dei Giovani e le progettualit\u00e0 dell\u2019associazione.</p></div>
        <div class="lp-plans">
          <div class="lp-plan"><h4>Gratuito</h4><div class="lp-pr">0 \u20ac</div>
            <ul><li>Dashboard personale</li><li>1\u00aa lezione di ogni corso</li><li>Video e audiolibri gratuiti</li></ul>
            <button class="lp-btn2" onclick="apriAccesso('reg')">Entra gratis</button></div>
          <div class="lp-plan feat"><span class="lp-tagline">Consigliato</span><h4>Civis</h4><div class="lp-pr">12,50 \u20ac<small>/mese</small></div>
            <ul><li>Video On Demand completo</li><li>Biblioteca illimitata + IA</li><li>Sconto 20% sui corsi</li></ul>
            <button class="btn oro" onclick="apriAccesso('reg')">Attiva Civis</button>
            <p class="lp-fine">oppure 120 \u20ac/anno</p></div>
          <div class="lp-plan"><h4>Academicus</h4><div class="lp-pr">2.500 \u20ac<small>/anno</small></div>
            <ul><li>20 corsi (105 ore di videocorsi)</li><li>Live mensili con i formatori</li><li>Attestati dell\u2019Accademia</li></ul>
            <button class="lp-btn2" onclick="apriAccesso('reg')">Attiva Academicus</button></div>
        </div>
      </div>
    </section>

    ${lpFooter()}
  </div>`;
  $('auth-root').style.display='block';
  window.scrollTo(0,0);
  osservaReveal();
}

/* =====================================================================
   AUTENTICAZIONE
===================================================================== */
function renderAuth(){
  $('app').style.display='none';
  $('auth-root').innerHTML = `
  <div class="auth">
    <div class="auth-art">
      <div>
        <div class="mk"><img class="logo-img" src="img/logo.png" alt="La Pacifica Res Publica"></div>
        <div class="eyebrow" style="color:var(--oro-chiaro)">La Pacifica Res Publica</div>
        <h1>Accademia Internazionale per la&nbsp;<em>Pace</em></h1>
        <p>Un solo accesso a quattro mondi: il Parlamento dei Giovani, l’Accademia di formazione, i video on demand e la biblioteca audio con motore di intelligenza artificiale.</p>
      </div>
      <div class="four">
        <div><span class="d">⚖︎</span> Parlamento dei Giovani — 150 delegati, sette commissioni</div>
        <div><span class="d">📖</span> Accademia — il Percorso di Pace in otto corsi</div>
        <div><span class="d">▶</span> Video On Demand — documentari, lezioni, conferenze</div>
        <div><span class="d">♪</span> Biblioteca Audio — letture e sintesi con IA</div>
      </div>
      <div class="pie">«La conoscenza senza coscienza non genera futuro.» — Dal Manifesto</div>
    </div>
    <div class="auth-form">
      <div class="auth-box">
        <button class="linkbtn lp-back" onclick="tornaHome()" style="margin-bottom:16px;display:inline-flex;gap:6px;align-items:center">← La Pacifica</button>
        <h2 id="auth-title">Bentornato</h2>
        <p class="sub" id="auth-sub">Accedi al tuo account per entrare nell’ecosistema.</p>
        <div class="seg">
          <button id="seg-login" class="${authTab==='login'?'on':''}" onclick="setAuthTab('login')">Accedi</button>
          <button id="seg-reg" class="${authTab==='reg'?'on':''}" onclick="setAuthTab('reg')">Crea account</button>
        </div>
        <div id="auth-fields"></div>
        <div id="auth-msg"></div>
      </div>
    </div>
  </div>`;
  renderAuthFields();
  $('auth-root').style.display='block';
}
function setAuthTab(t){ authTab=t; renderAuth(); }
function renderAuthFields(){
  const reg = authTab==='reg';
  $('auth-title').textContent = reg ? 'Crea il tuo account' : 'Bentornato';
  $('auth-sub').textContent = reg ? 'Un’unica iscrizione per tutto l’ecosistema.' : 'Accedi al tuo account per entrare nell’ecosistema.';
  $('auth-fields').innerHTML = `
    ${reg?`<div class="field"><label>Nome e cognome</label><input id="f-nome" placeholder="Es. Giulia Conti"></div>`:''}
    <div class="field"><label>Email</label><input id="f-email" type="email" placeholder="nome@email.it"></div>
    <div class="field"><label>Password</label><input id="f-pass" type="password" placeholder="Almeno 6 caratteri"></div>
    ${reg?`<div class="field"><label>Codice d’invito <span class="muted small">(facoltativo)</span></label>
       <input id="f-code" placeholder="Codice delegato o della Presidenza"></div>`:''}
    <button class="btn full" id="auth-go" style="margin-top:6px" onclick="${reg?'doRegister()':'doLogin()'}">
      ${reg?'Crea account ed entra':'Accedi'}</button>
    <p class="small muted center" style="margin-top:14px">
      ${reg?'Hai già un account? ':'Non hai un account? '}
      <button class="linkbtn" onclick="setAuthTab('${reg?'login':'reg'}')">${reg?'Accedi':'Registrati'}</button>
    </p>`;
}
function authMsg(html,cls){ $('auth-msg').innerHTML = html?`<div class="notice ${cls}">${html}</div>`:''; }
function busy(on){ const b=$('auth-go'); if(b){ b.disabled=on; b.innerHTML = on?'<span class="spin"></span>':b.dataset.lbl||b.textContent; if(!on&&b.dataset.lbl)b.textContent=b.dataset.lbl; } }

async function doRegister(){
  const nome=($('f-nome').value||'').trim(), email=($('f-email').value||'').trim().toLowerCase(),
        pass=$('f-pass').value||'', code=($('f-code').value||'').trim();
  if(nome.length<2) return authMsg('Inserisci il tuo nome e cognome.','err');
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return authMsg('Inserisci un’email valida.','err');
  if(pass.length<6) return authMsg('La password deve avere almeno 6 caratteri.','err');
  busy(true);
  try{
    await DB.signUp(nome, email, pass);
    // alcune istanze richiedono conferma email: proviamo comunque il login
    try{ await DB.signIn(email, pass); TRK.log('login','registrazione'); }
    catch(e){ busy(false); return authMsg('Account creato. Controlla la tua email per confermarlo, poi accedi.','ok'); }
    if(code){
      try{
        // prova prima come codice di fondazione (Presidenza); se non lo è, come codice delegato
        try { await DB.redeemFounder(code); }
        catch(_) { await DB.redeemCode(code); }
      }catch(e){ toast(e.message||'Codice non valido'); }
    }
    await enterApp();
    toast('Benvenuto in La Pacifica.');
  }catch(e){
    busy(false);
    authMsg(e.message && /already/i.test(e.message) ? 'Esiste già un account con questa email.' : (e.message||'Errore in registrazione.'),'err');
  }
}
async function doLogin(){
  const email=($('f-email').value||'').trim().toLowerCase(), pass=$('f-pass').value||'';
  busy(true);
  try{ await DB.signIn(email, pass); TRK.log('login','login'); await enterApp(); }
  catch(e){ busy(false); authMsg('Email o password non corretti.','err'); }
}
async function logout(){ try{ await DB.signOut(); }catch(e){} io=null; $('app').style.display='none'; closeModal(); renderLanding(); }
/* =====================================================================
   SHELL + NAVIGAZIONE
===================================================================== */
/* =====================================================================
   Tracciamento d'uso — privacy-first.
   Niente IP, niente user-agent grezzo, niente identita': solo categorie
   grossolane + un id di sessione casuale che si azzera a ogni visita.
   Parte SOLO dopo consenso e rispetta Do Not Track / Global Privacy Control.
   ===================================================================== */
const TRK = (function(){
  let sess = Math.random().toString(36).slice(2) + Date.now().toString(36);
  let prov = null, dev = null, consenso = null;
  function store(k,v){ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v); }catch(e){ return null; } }
  function dnt(){ try{ return navigator.doNotTrack==='1' || window.doNotTrack==='1' || navigator.msDoNotTrack==='1' || navigator.globalPrivacyControl===true; }catch(e){ return false; } }
  function device(){
    if(dev) return dev;
    let mob=false; try{ mob = navigator.userAgentData ? !!navigator.userAgentData.mobile : /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent||''); }catch(e){}
    const w = window.innerWidth||1024;
    dev = mob ? (w>700 ? 'tablet' : 'mobile') : (w<600 ? 'mobile' : (w<=1024 ? 'tablet' : 'desktop'));
    return dev;
  }
  function provenienza(){
    if(prov!==null) return prov;
    let r=''; try{ r=document.referrer||''; }catch(e){}
    if(!r){ prov='diretto'; return prov; }
    try{ const h=new URL(r).hostname.replace(/^www\./,'');
      if(h===location.hostname) prov='interno';
      else if(/google\.|bing\.|duckduckgo|yahoo|ecosia|qwant|search/i.test(h)) prov='ricerca';
      else if(/facebook|instagram|twitter|x\.com|t\.co|linkedin|whatsapp|telegram|tiktok|youtube|reddit/i.test(h)) prov='social';
      else prov=h.slice(0,40);
    }catch(e){ prov='altro'; }
    return prov;
  }
  function attivo(){ return consenso===true && !dnt(); }
  function log(tipo, vista, dettaglio){
    if(!attivo()) return;
    try{ DB.traccia({ tipo, vista:vista||'', dettaglio:dettaglio||'', dispositivo:device(),
      provenienza:provenienza(), autenticato: !!io, ruolo: io?io.ruolo:null, sessione: sess }); }catch(e){}
  }
  function decidi(v){ consenso=!!v; store('pacifica_consenso', v?'si':'no'); const b=$('cookie-bar'); if(b) b.remove();
    if(v){ log('pageview', io?vista:'landing'); } }   // registra la pagina corrente appena si accetta
  function init(){
    if(window.__DEMO){ consenso=true; return; }        // nella demo il consenso e' implicito
    if(dnt()){ consenso=false; return; }
    const prec = store('pacifica_consenso');
    if(prec==='si'){ consenso=true; } else if(prec==='no'){ consenso=false; } else { consenso=null; mostraBanner(); }
  }
  function mostraBanner(){
    if($('cookie-bar')) return;
    const b=document.createElement('div'); b.id='cookie-bar';
    b.innerHTML = `<div class="cb-in"><div class="cb-txt">
        Usiamo statistiche <b>anonime</b> per capire come viene usato il portale (pagine viste, dispositivo, provenienza generica). Nessun dato personale, nessun profilo, nessuna pubblicit\u00e0.</div>
      <div class="cb-btn"><button class="btn ghost small" onclick="TRK.decidi(false)">Rifiuta</button>
        <button class="btn oro small" onclick="TRK.decidi(true)">Accetto</button></div></div>`;
    document.body.appendChild(b);
  }
  return { log, decidi, init, attivo, dnt };
})();

const NAV = [
  {id:'dashboard', lab:'Dashboard'},
  {id:'parlamento',lab:'Parlamento'},
  {id:'rassegna',  lab:'La pace oggi'},
  {id:'novita',    lab:'Novit\u00e0'},
  {id:'accademia', lab:'Accademia'},
  {id:'vod',       lab:'Video'},
  {id:'audio',     lab:'Biblioteca'},
  {id:'campus',    lab:'Campus'},
  {id:'eventi',    lab:'Eventi'},
  {id:'abbonamenti',lab:'Abbonamenti'},
];
async function enterApp(){
  await refreshMe();
  await loadCatalog();
  $('auth-root').style.display='none';
  $('app').style.display='block';
  go('dashboard');
}
function openMenu(){ document.body.classList.add('menu-open'); const h=$('hamburger'); if(h){ h.classList.add('on'); h.setAttribute('aria-expanded','true'); } }
function closeMenu(){ document.body.classList.remove('menu-open'); const h=$('hamburger'); if(h){ h.classList.remove('on'); h.setAttribute('aria-expanded','false'); } }
function toggleMenu(){ document.body.classList.contains('menu-open') ? closeMenu() : openMenu(); }
function go(v,c={}){ vista=v; ctx=c; closeMenu(); window.scrollTo(0,0); render(); TRK.log('pageview', v); }

function render(){
  $('nav').innerHTML = NAV.map(n=>`<button class="${vista===n.id?'on':''}" onclick="go('${n.id}')">${n.lab}</button>`).join('')
    + (io.ruolo==='formatore'?`<button class="${vista==='formatore'?'on':''}" onclick="go('formatore')">Area formatore</button>`:'')
    + (io.ruolo==='presidenza'?`<button class="${vista==='presidenza'?'on':''}" onclick="go('presidenza')">Presidenza</button>`:'');
  const mb=io.membership;
  const badge = mb==='academicus'?'<span class="badge oro">Academicus</span>'
              : mb==='civis'?'<span class="badge blu">Civis</span>'
              : '<span class="badge grigio">Free</span>';
  $('topbar-right').innerHTML = `${badge}
    <div class="chip"><span class="av">${initials(io.nome)}</span>${esc(io.nome.split(' ')[0])}
      <button class="x" style="font-size:16px;width:auto;height:auto;margin-left:2px" title="Esci" onclick="logout()">⏻</button></div>`;
  const R = { dashboard:renderDashboard, parlamento:renderParlamento, accademia:renderAccademia,
    vod:renderVod, audio:renderAudio, rassegna:renderRassegna, novita:renderNovita, formatore:renderFormatore, campus:renderCampus, eventi:renderEventi, abbonamenti:renderAbbonamenti, presidenza:renderPresidenza, corso:renderCorso };
  $('main').innerHTML = `<div class="view">${(R[vista]||renderDashboard)()}</div>`;
  osservaReveal();
}

/* =====================================================================
   DINAMISMO — comparsa in dissolvenza al primo ingresso nello schermo.
   - Rispetta "riduci animazioni" (accessibilità): se attivo, nulla si muove.
   - Se manca IntersectionObserver o il JS non parte, i contenuti restano
     comunque visibili (l'opacità 0 si applica solo con html.anim).
   - Usa un observer, non listener sullo scroll: leggero.
   ===================================================================== */
let _revObs=null;
function osservaReveal(){
  try{
    if(!('IntersectionObserver' in window)) return;
    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.documentElement.classList.add('anim');
    const sel='.lp-h,.lp-pill,.lp-tile,.lp-plan,.man-item,.mec-step,.mec-step,.news-item,.ev-item,.lp-event,.page-head,.view .card,.view .tile,.view .plan,.nov-item,.g-stat,.rass-col,.lp-rass';
    const nodes=[].slice.call(document.querySelectorAll(sel))
      .filter(el=>!el.classList.contains('reveal') && !(el.closest && el.closest('.lp-hero')));
    if(!nodes.length) return;
    nodes.forEach(el=>el.classList.add('reveal'));
    if(!_revObs) _revObs=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); _revObs.unobserve(e.target); } });
    },{rootMargin:'0px 0px -6% 0px',threshold:.05});
    nodes.forEach(function(el){
      const sibs=[].slice.call(el.parentNode.children).filter(function(c){return c.classList && c.classList.contains('reveal');});
      const idx=Math.max(0,sibs.indexOf(el));
      el.style.transitionDelay=Math.min(idx*70,400)+'ms';
      _revObs.observe(el);
    });
  }catch(e){}
}

function tempoFa(iso){
  if(!iso) return '';
  const d=new Date(iso), min=Math.round((Date.now()-d)/60000);
  if(min<60) return min<=1?'ora':min+' min fa';
  const h=Math.round(min/60); if(h<24) return h+' h fa';
  const g=Math.round(h/24); return g===1?'ieri':g+' giorni fa';
}
function fmtGiorno(iso){ try{ return new Date(iso).toLocaleDateString('it-IT',{day:'numeric',month:'long'}); }catch(e){ return iso; } }

/* =====================================================================
   NOVITA' (lato utenti) — si aggiorna da sola: legge il catalogo e mostra
   le ultime aggiunte in ordine di data. Nessun elenco da mantenere a mano.
   ===================================================================== */
function novitaItems(){
  const out=[]; const ed = (typeof editoreDi==='function');
  const push=(tipo,ico,tit,creato,fn,meta)=>{ if(creato&&tit) out.push({tipo,ico,tit,creato,fn,meta:meta||''}); };
  (typeof CORSI!=='undefined'?CORSI:[]).filter(c=>c.pubblicato!==false).forEach(c=>push('Corso','\u25C8',c.tit,c.creato,"go('accademia')",commNomeSicuro(c.comm)||''));
  (typeof VOD!=='undefined'?VOD:[]).filter(v=>v.pubblicato!==false).forEach(v=>push('Video','\u25B6',v.tit,v.creato,"playVideo('"+v.id+"')",v.tipo));
  (typeof TESTI!=='undefined'?TESTI:[]).filter(t=>t.pubblicato!==false).forEach(t=>push('Testo','\u2749',t.tit,t.creato,"apriTesto('"+t.id+"')",t.autore));
  (typeof AUDIO!=='undefined'?AUDIO:[]).filter(a=>a.pubblicato!==false).forEach(a=>push('Audio','\u266A',a.tit,a.creato,"apriAudio('"+a.id+"')",a.autore));
  (typeof EVENTI!=='undefined'?EVENTI:[]).filter(e=>e.pubblicato!==false).forEach(e=>push('Evento','\u2726',e.tit,e.creato,"go('eventi')",e.periodo||''));
  (typeof DOSSIER!=='undefined'?DOSSIER:[]).forEach(d=>push('Dossier','\u00A7',d.tit,d.creato,"go('parlamento')",d.id));
  (typeof NOTIZIE!=='undefined'?NOTIZIE:[]).filter(n=>!n.nascosta).forEach(n=>push('Notizia','\u25CF',n.tit,n.data,"go('rassegna')",ed?editoreDi(n.fonte):''));
  out.sort((a,b)=> new Date(b.creato)-new Date(a.creato));
  return out;
}
function novitaBadge(t){ return t==='Corso'?'blu':(t==='Video'?'blu':(t==='Notizia'?'verde':(t==='Evento'?'oro':'grigio'))); }
function novitaHTML(limite){
  const items = novitaItems().slice(0, limite||24);
  if(!items.length) return '<div class="empty">Ancora nessuna novit\u00e0: le aggiunte compariranno qui da sole.</div>';
  return `<div class="nov-list">`+items.map(it=>`<button class="nov-item" onclick="${it.fn}">
      <span class="nov-ic">${it.ico}</span>
      <span class="nov-b"><span class="nov-top"><span class="badge ${novitaBadge(it.tipo)}">${esc(it.tipo)}</span><span class="nov-when">${esc(tempoFa(it.creato))}</span></span>
      <span class="nov-tit">${esc(it.tit)}</span>${it.meta?`<span class="nov-meta">${esc(it.meta)}</span>`:''}</span>
      <span class="nov-go">\u203A</span></button>`).join('')+`</div>`;
}
function renderNovita(){
  return `<div class="page-head"><div class="eyebrow">Aggiornato di continuo</div><h1>Novit\u00e0</h1>
    <p class="lead">Le ultime aggiunte al portale \u2014 nuovi corsi, video, testi, eventi e dossier \u2014 in ordine di arrivo. Questa pagina si aggiorna da sola.</p></div>
    ${novitaHTML(30)}`;
}

/* =====================================================================
   GUIDA (lato amministratore) — spiega come caricare, e mostra lo stato
   attuale (conteggi e ultimo aggiornamento) letto dal vivo dai dati.
   ===================================================================== */
function guidaConta(arr){ arr=arr||[];
  const pub=arr.filter(x=>x.pubblicato!==false).length;
  const date=arr.map(x=>x.creato||x.data).filter(Boolean).map(d=>+new Date(d)).filter(n=>!isNaN(n)).sort((a,b)=>a-b);
  return { tot:arr.length, pub, ultimo: date.length?tempoFa(new Date(date[date.length-1]).toISOString()):'\u2014' };
}
function renderGuidaAdmin(){
  const A = (v)=> (typeof v!=='undefined'&&v)?v:[];
  const sez=[['Corsi',A(CORSI)],['Video',A(VOD)],['Audiolibri',A(AUDIO)],['Testi',A(TESTI)],
    ['Pacchetti',A(PACCHETTI)],['Campus',A(CAMPUS)],['Eventi',A(EVENTI)],['Dossier',A(DOSSIER)],
    ['Livelli',A(LIVELLI)],['Formule',A(FORMULE)],['Fonti',A(FONTI)],['Notizie',A(NOTIZIE)],['Anagrafiche',A(ANAGRAFICHE)],['Contratti',A(CONTRATTI)]];
  const stato = sez.map(([nome,arr])=>{ const c=guidaConta(arr);
    return `<div class="g-stat"><b>${esc(nome)}</b><span>${c.tot} element${c.tot===1?'o':'i'}${(c.pub!==c.tot)?` \u00b7 ${c.pub} pubblicat${c.pub===1?'o':'i'}`:''}</span><span class="g-when">agg. ${esc(c.ultimo)}</span></div>`;
  }).join('');
  const passo = (n,t)=>`<li><b>${esc(n)}</b> \u2014 ${t}</li>`;
  return `<div class="page-head" style="padding-top:0"><div class="eyebrow">Guida</div>
      <h2 style="font-size:26px;margin:2px 0 4px">Come caricare i contenuti</h2>
      <p class="lead" style="font-size:15px">Ogni sezione ha lo stesso ritmo: <b>Contenuti \u2192 scegli la scheda \u2192 Aggiungi</b> (o la matita per modificare), compili, e spunti <b>Pubblicato</b> quando vuoi renderlo visibile.</p></div>
    <div class="card" style="padding:18px;margin-bottom:16px">
      <div class="eyebrow">Stato attuale</div>
      <p class="muted small" style="margin:8px 0 12px">Si aggiorna da solo ogni volta che carichi qualcosa.</p>
      <div class="g-stats">${stato}</div></div>
    <div class="card" style="padding:18px;margin-bottom:16px">
      <div class="eyebrow">Passo per passo</div>
      <ol class="g-steps">
        ${passo('Aprire il pannello','sei gia\u2019 qui: <i>Presidenza</i>. La scheda <i>Contenuti</i> raccoglie tutte le sezioni.')}
        ${passo('Aggiungere','in ogni sezione, il bottone <i>+ Aggiungi</i> apre il modulo. L\u2019<i>identificativo</i> \u00e8 un codice breve (es. <code>c9</code>) e non si cambia dopo.')}
        ${passo('Pubblicare o tenere in bozza','finch\u00e9 <i>Pubblicato</i> \u00e8 spento, il contenuto resta invisibile agli utenti: utile per prepararlo con calma.')}
        ${passo('Ordinare','il campo <i>Ordine</i> decide la posizione: numeri pi\u00f9 bassi vengono prima.')}
        ${passo('Modificare o eliminare','la matita modifica, il cestino elimina. Alcune eliminazioni sono protette (es. una formula con impegni gi\u00e0 sottoscritti).')}
      </ol></div>
    <div class="card" style="padding:18px">
      <div class="eyebrow">Note per alcune sezioni</div>
      <ul class="g-steps" style="list-style:disc;padding-left:20px">
        <li><b>Video</b>: incolla l\u2019URL (YouTube, Vimeo o file). Il <i>livello di accesso</i> decide chi lo vede; l\u2019indirizzo resta protetto per chi non ne ha diritto.</li>
        <li><b>Livelli</b>: sono i permessi (Pubblico, Civis, Academicus\u2026). Li crei e li assegni ai contenuti; una spunta qualsiasi basta a soddisfarli.</li>
        <li><b>Rassegna</b>: aggiungi una <i>fonte</i> RSS e premi <i>Sincronizza</i>. Puoi spegnere una fonte o nascondere un singolo articolo in un clic.</li>
        <li><b>Mecenati</b>: le <i>formule</i> definiscono \u201cX euro \u2192 X accessi\u201d. Quando un bonifico risulta accreditato, <i>Segna pagato</i> emette gli accessi.</li>
        <li><b>Ente</b>: qui vivono IBAN e dati dell\u2019ente. Finch\u00e9 l\u2019IBAN \u00e8 vuoto, chi sottoscrive riceve un avviso invece di coordinate.</li>
        <li><b>Anagrafiche e Contratti</b>: il gestionale. Registra formatori e collaboratori in <i>Anagrafiche</i> (col diario dei contatti), poi genera i contratti numerati da <i>Contratti</i>: il testo resta archiviato, si stampa, e si segna firmato/archiviato. Collega l\u2019account del formatore per dargli l\u2019Area formatore.</li>
        <li><b>Statistiche</b>: numeri anonimi e aggregati. Nessun dato personale, nel rispetto del consenso e di \u201cDo Not Track\u201d.</li>
      </ul>
      <p class="muted small" style="margin-top:12px">Le stesse aggiunte compaiono agli utenti nella pagina <b>Novit\u00e0</b>, in ordine di arrivo.</p></div>`;
}
function editoreDi(fonteId){ const f=(FONTI||[]).find(x=>x.id===fonteId); return f?(f.editore||f.nome):''; }
function rassegnaHTML(){
  const nz = (NOTIZIE||[]).filter(n=>!n.nascosta);
  const ev = (EVENTIPACE||[]).filter(e=>e.pubblicato!==false && (!e.fine ? e.inizio>=oggiISO() : e.fine>=oggiISO()));
  const news = nz.length ? nz.slice(0,12).map(n=>`<a class="news-item" href="${esc(n.url||'#')}" ${n.url?'target="_blank" rel="noopener noreferrer"':''}>
      ${n.img?`<div class="news-img" style="background-image:url('${esc(n.img)}')"></div>`:''}
      <div class="news-body"><h4>${esc(n.tit)}</h4>
        ${n.sommario?`<p>${esc(n.sommario)}</p>`:''}
        <div class="news-meta">${esc(editoreDi(n.fonte))}${n.data?' \u00b7 '+esc(tempoFa(n.data)):''}</div></div></a>`).join('')
    : `<div class="empty" style="grid-column:1/-1">Nessuna notizia al momento. Torna piu\u2019 tardi.</div>`;
  const eventi = ev.length ? ev.slice(0,8).map(e=>`<div class="ev-item">
      <div class="ev-date"><b>${new Date(e.inizio).getDate()}</b><span>${new Date(e.inizio).toLocaleDateString('it-IT',{month:'short'})}</span></div>
      <div class="ev-b"><h4>${esc(e.tit)}</h4>
        <div class="news-meta">${esc([fmtGiorno(e.inizio)+(e.fine?(' \u2013 '+fmtGiorno(e.fine)):''), e.luogo].filter(Boolean).join(' \u00b7 '))}</div>
        ${e.desc?`<p class="muted small" style="margin-top:6px">${esc(e.desc)}</p>`:''}
        ${e.url?`<a class="btn small ghost" style="margin-top:8px" href="${esc(e.url)}" target="_blank" rel="noopener noreferrer">Dettagli</a>`:''}</div></div>`).join('')
    : `<div class="empty">Nessun evento in programma.</div>`;
  return `<div class="rassegna">
    <div class="rass-col"><div class="rass-head"><h3>Notizie sulla pace</h3>
      ${nz.length?`<span class="muted small">aggiornata ${tempoFa((nz[0]||{}).data)}</span>`:''}</div>
      <div class="news-grid">${news}</div>
      ${(FONTI||[]).some(f=>f.attiva)?`<p class="muted small" style="margin-top:10px">Fonti: ${esc(Array.from(new Set((FONTI||[]).filter(f=>f.attiva).map(f=>f.editore||f.nome))).join(', '))}. Le notizie rimandano alla fonte originale.</p>`:''}
    </div>
    <div class="rass-col"><div class="rass-head"><h3>Eventi e iniziative</h3></div>
      <div class="ev-list">${eventi}</div></div>
  </div>`;
}
function oggiISO(){ return new Date().toISOString().slice(0,10); }
function renderRassegna(){
  return `<div class="page-head"><div class="eyebrow">Ogni giorno</div><h1>La pace, oggi</h1>
    <p class="lead">Notizie da fonti internazionali e gli appuntamenti da non perdere. Le notizie arrivano dalle fonti selezionate e rimandano all\u2019originale.</p></div>
    ${rassegnaHTML()}`;
}

/* =====================================================================
   DASHBOARD
===================================================================== */
function renderDashboard(){
  const oggi = new Date().toLocaleDateString('it-IT',{weekday:'long',day:'numeric',month:'long'});
  const mb=io.membership;
  const statoAbb = mb==='academicus'?'Civis Academicus — accesso completo'
    : mb==='civis'?'Civis — VOD e Biblioteca illimitati'
    : 'Account gratuito — sblocca tutto con la membership';
  const nCorsi = CORSI.filter(c=>haAccesso('corso:'+c.id)).length;
  const pillars = [
    {id:'parlamento', num:'I', ico:'⚖︎', t:'Parlamento', d:'Simula un parlamento con commissioni, proposte di legge e votazioni.', lock:!(io.ruolo==='delegato'||io.ruolo==='presidenza')},
    {id:'accademia', num:'II', ico:'📖', t:'Accademia', d:'Il Percorso di Pace in otto corsi tenuti dai formatori.', lock:false},
    {id:'vod', num:'III', ico:'▶', t:'Video On Demand', d:'Documentari, lezioni aperte e conferenze sulla cultura di pace.', lock:false},
    {id:'audio', num:'IV', ico:'📚', t:'Biblioteca', d:'Audiolibri e testi da leggere e ascoltare, con sintesi e percorsi su misura.', lock:false},
    {id:'campus', num:'V', ico:'⛪', t:'Campus', d:'Campus formativi in presenza all’Abbazia di Maguzzano, con possibilità di soggiorno.', lock:false},
    {id:'eventi', num:'VI', ico:'🎭', t:'Eventi', d:'Mostre ed eventi de La Pacifica. In arrivo: ENIGMA ET SPECULUM.', lock:false},
  ];
  const corsoAttivo = CORSI.find(c=>haAccesso('corso:'+c.id));
  const audioFree = AUDIO.find(a=>a.free)||AUDIO[0];
  return `
  <div class="page-head">
    <div class="eyebrow">${esc(oggi)}</div>
    <h1>Benvenuto, ${esc(io.nome.split(' ')[0])}.</h1>
    <p class="lead">${statoAbb}. ${mb==='free'?'<button class="linkbtn" onclick="go(\'abbonamenti\')">Vedi i piani →</button>':''}</p>
  </div>
  <div class="temple" style="margin-bottom:26px">
    ${pillars.map(p=>`<button class="pillar" onclick="go('${p.id}')">
      ${p.lock?'<span class="lock">su invito</span>':''}
      <span class="num">${p.num}</span><span class="ico">${p.ico}</span>
      <h3>${p.t}</h3><p>${p.d}</p><span class="go">Entra →</span></button>`).join('')}
  </div>
  <div class="stats" style="margin-bottom:26px">
    <div class="stat"><div class="n">${nCorsi}/8</div><div class="l">Corsi a tua disposizione</div></div>
    <div class="stat"><div class="n">${VOD.filter(v=>v.free||haAccesso('vod-premium')).length}</div><div class="l">Video sbloccati</div></div>
    <div class="stat"><div class="n">${AUDIO.filter(a=>a.free||haAccesso('audio-premium')).length + TESTI.filter(t=>t.free||haAccesso('audio-premium')).length}</div><div class="l">Letture e audiolibri</div></div>
    <div class="stat"><div class="n">${(io.acquisti||[]).filter(a=>a.startsWith('campus:')).length}</div><div class="l">Campus prenotati</div></div>
  </div>
  <div class="grid g2">
    <div class="card" style="padding:22px">
      <div class="eyebrow">Continua</div>
      <h3 style="font-size:24px;margin:4px 0 10px">Riprendi il tuo percorso</h3>
      ${corsoAttivo?`<div class="lesson on" onclick="go('corso',{id:'${corsoAttivo.id}'})">
        <span class="n">${(io.progress[corsoAttivo.id]||[]).length||1}</span>
        <span class="t">${esc(corsoAttivo.tit)}<br><span class="d" style="margin:0">${esc(corsoAttivo.form)} · ${(io.progress[corsoAttivo.id]||[]).length}/8 lezioni</span></span>
        <span class="go" style="margin-left:auto;color:var(--oltremare);font-weight:700">Riprendi →</span></div>`
        :`<p class="muted small">Non hai ancora corsi attivi. Esplora l’Accademia o attiva una membership per cominciare.</p>
          <div style="margin-top:14px"><button class="btn small" onclick="go('accademia')">Esplora l’Accademia</button></div>`}
    </div>
    <div class="card" style="padding:22px">
      <div class="eyebrow">Dalla Biblioteca</div>
      <h3 style="font-size:24px;margin:4px 0 10px">Per cominciare, in ascolto</h3>
      <div class="lesson on" onclick="go('audio',{open:'${audioFree.id}'})">
        <span class="n">♪</span>
        <span class="t">${esc(audioFree.tit)}<br><span class="d" style="margin:0">${esc(audioFree.autore)} · ${audioFree.durata}</span></span>
        <span class="go" style="margin-left:auto;color:var(--oltremare);font-weight:700">Ascolta →</span></div>
      <p class="muted small" style="margin-top:12px">Il motore IA può leggere ad alta voce, riassumere e costruire un percorso di ascolto su misura.</p>
    </div>
  </div>`;
}

/* =====================================================================
   ACCADEMIA + PLAYER
===================================================================== */
function renderAccademia(){
  const tutto = io.membership==='academicus';
  return `
  <div class="page-head"><div class="eyebrow">Pilastro II · Il Percorso di Pace</div>
    <h1>L’Accademia</h1>
    <p class="lead">Otto corsi, sei formatori, ottantaquattro lezioni da venticinque minuti. ${tutto?'Con la membership Academicus hai accesso a tutto il catalogo.':'Acquista i corsi singolarmente, in pacchetti o tutto il Percorso — oppure sblocca tutto con la membership Academicus.'}</p></div>
  ${!tutto?`<div class="card" style="padding:18px 22px;margin-bottom:24px;display:flex;gap:18px;align-items:center;flex-wrap:wrap">
    <div style="flex:1;min-width:220px"><div class="eyebrow">Percorso completo</div>
      <h3 style="font-size:24px">Tutti gli 8 corsi + attestato finale</h3>
      <p class="muted small">Il modo più conveniente per affrontare l’intero Percorso di Pace.</p></div>
    <div style="text-align:right"><div class="price" style="font-size:34px">${euro(PREZZO_PERCORSO)}</div>
      <button class="btn oro" onclick="compra('percorso')">Acquista il Percorso</button></div></div>`:''}
  <div class="grid g3">
    ${CORSI.map(c=>{
      const ok = haAccesso('corso:'+c.id), done=(io.progress[c.id]||[]).length;
      return `<div class="tile">
        <div class="cover"><span class="k">${c.id.slice(1)}</span><span class="tag">${esc(c.pacc)}</span></div>
        <div class="body"><h4>${esc(c.tit)}</h4>
          <div class="meta">${esc(c.form)} · 8 lezioni · 25′</div>
          <p class="small muted" style="flex:1">${esc(c.desc)}</p>
          <div class="foot">
            ${ok?`<span class="badge verde">${done>0?done+'/8 lezioni':'Disponibile'}</span>
                 <button class="btn small" onclick="go('corso',{id:'${c.id}'})">${done>0?'Riprendi':'Inizia'}</button>`
               :`<span class="price">${euro(PREZZO_CORSO)}</span>
                 <button class="btn small ghost" onclick="compra('corso:${c.id}')">Acquista</button>`}
          </div></div></div>`;
    }).join('')}
  </div>
  ${!tutto?`<h2 style="font-size:28px;margin:34px 0 14px">Pacchetti tematici</h2>
  <div class="grid g3">${PACCHETTI.map(p=>`<div class="card" style="padding:20px">
    <div class="eyebrow">Risparmi ${euro(p.full-p.prezzo)}</div>
    <h4 style="font-size:23px;margin:3px 0 6px">${esc(p.nome)}</h4>
    <p class="small muted">${p.corsi.map(id=>esc(CORSI.find(c=>c.id===id).tit)).join(' · ')}</p>
    <div class="foot" style="display:flex;justify-content:space-between;align-items:center;margin-top:14px">
      <span class="price">${euro(p.prezzo)}</span>
      ${p.corsi.every(id=>haAccesso('corso:'+id))?'<span class="badge verde">Già tuo</span>':`<button class="btn small ghost" onclick="compra('pacc:${p.id}')">Acquista pacchetto</button>`}
    </div></div>`).join('')}</div>`:''}`;
}

const LEZTIT = ['Le domande fondamentali','Il metodo e il dialogo','Concetti e definizioni','Il pensiero in azione','Casi e testimonianze','Pratica guidata','Sintesi e discussione','Verifica e attestato'];
function renderCorso(){
  const c = CORSI.find(x=>x.id===ctx.id);
  if(!c) return renderAccademia();
  if(!haAccesso('corso:'+c.id)){ go('accademia'); return ''; }
  const L = LEZ_CACHE[c.id];
  if(L===undefined){
    LEZ_CACHE[c.id]=null;
    DB.listLezioni(c.id).then(r=>{ LEZ_CACHE[c.id]=r.filter(l=>l.pubblicata!==false);
      if(vista==='corso'&&ctx.id===c.id) render(); }).catch(()=>{ LEZ_CACHE[c.id]=[]; if(vista==='corso'&&ctx.id===c.id) render(); });
  }
  if(L && L.length){
    const tot=L.length, sel=Math.min(ctx.lez||1, tot), lz=L[sel-1], done=io.progress[c.id]||[];
    setTimeout(()=>{ const b=$('lz-st-alg'); if(b){ DB.listAllegati('lezioni', lz.id).then(rows=>{
      b.innerHTML = rows.length ? rows.map(r=>`<div class="alg-item"><a href="${esc(r.url)}" target="_blank" rel="noopener" download>${esc(r.nome)}</a>${r.desc?` <span class="muted small">\u2014 ${esc(r.desc)}</span>`:''}</div>`).join('') : '<span class="muted small">Nessun materiale allegato.</span>';
    }).catch(()=>{ b.textContent='\u2014'; }); } },0);
    const player = lz.video
      ? `<video controls preload="metadata" style="width:100%;border-radius:14px;background:#000;max-height:420px" src="${esc(lz.video)}"></video>`
      : `<div class="player"><div class="play" onclick="completaLezione('${c.id}',${sel})">\u25b6</div>
          <div style="z-index:1;text-align:center"><div class="eyebrow" style="color:var(--oro-chiaro)">Lezione ${sel} di ${tot}</div>
          <h3 style="color:#fff;font-size:26px;margin-top:4px">${esc(lz.tit)}</h3></div></div>`;
    const quiz = (lz.quiz||[]).length ? `<div class="card" style="padding:18px;margin-top:16px">
        <h4 style="font-size:20px">Quiz della lezione</h4>
        <p class="muted small" style="margin-top:4px">Alcune domande possono avere pi\u00f9 di una risposta corretta.</p>
        ${lz.quiz.map((d,qi)=>`<div style="margin-top:14px"><b>${qi+1}. ${esc(d.q)}</b>
          ${d.r.map((r,ri)=>`<label style="display:flex;gap:8px;align-items:center;margin-top:6px;font-size:14.5px"><input type="checkbox" class="st-q${qi}" value="${ri}" style="width:auto"> ${esc(r.t)}</label>`).join('')}</div>`).join('')}
        <button class="btn small oro" style="margin-top:14px" onclick="verificaQuiz('${c.id}',${sel-1})">Verifica le risposte</button>
        <div id="qz-res" class="muted small" style="margin-top:8px"></div></div>` : '';
    return `
  <button class="linkbtn" onclick="go('accademia')">\u2190 Tutti i corsi</button>
  <div class="page-head" style="margin-top:12px"><div class="eyebrow">${esc(c.form)} \u00b7 ${esc(c.pacc)}</div><h1>${esc(c.tit)}</h1></div>
  <div class="grid" style="grid-template-columns:1.6fr 1fr;gap:24px">
    <div>
      ${player}
      <div class="card" style="padding:18px;margin-top:16px">
        <h4 style="font-size:20px">${esc(lz.tit)}</h4>
        <p class="muted small" style="margin-top:6px">${esc(lz.desc||c.desc||'')}</p>
        <div class="eyebrow" style="margin-top:14px">Materiali della lezione (scaricabili e stampabili)</div>
        <div id="lz-st-alg" class="muted small" style="margin-top:6px">Carico\u2026</div>
        <div style="display:flex;gap:10px;margin-top:14px">
          ${sel>1?`<button class="btn small ghost" onclick="go('corso',{id:'${c.id}',lez:${sel-1}})">\u2190 Precedente</button>`:''}
          ${sel<tot?`<button class="btn small" onclick="completaLezione('${c.id}',${sel},true)">Completa e prosegui \u2192</button>`
            :`<button class="btn small oro" onclick="completaLezione('${c.id}',${tot},false,true)">Completa il corso \ud83c\udf93</button>`}
        </div></div>
      ${quiz}
    </div>
    <div class="card" style="padding:16px">
      <div class="eyebrow" style="padding:0 6px">Programma \u00b7 ${done.length}/${tot}</div>
      <div class="lesson-list" style="margin-top:8px">
        ${L.map((t,i2)=>{ const nn=i2+1; return `<div class="lesson ${nn===sel?'on':''} ${done.includes(nn)?'done':''}" onclick="go('corso',{id:'${c.id}',lez:${nn}})">
          <span class="n">${done.includes(nn)?'\u2713':nn}</span><span class="t">${esc(t.tit)}</span><span class="d">${t.video?'\u25b6':''}${(t.quiz||[]).length?' ?':''}</span></div>`;}).join('')}
      </div></div>
  </div>`;
  }
  /* Ripiego dimostrativo: il corso non ha ancora lezioni proprie */
  const sel = ctx.lez||1, done=io.progress[c.id]||[];
  return `
  <button class="linkbtn" onclick="go('accademia')">\u2190 Tutti i corsi</button>
  <div class="page-head" style="margin-top:12px"><div class="eyebrow">${esc(c.form)} \u00b7 ${esc(c.pacc)}</div><h1>${esc(c.tit)}</h1></div>
  <div class="grid" style="grid-template-columns:1.6fr 1fr;gap:24px">
    <div>
      <div class="player"><div class="play" onclick="completaLezione('${c.id}',${sel})">\u25b6</div>
        <div style="z-index:1;text-align:center"><div class="eyebrow" style="color:var(--oro-chiaro)">Lezione ${sel} di 8</div>
          <h3 style="color:#fff;font-size:26px;margin-top:4px">${esc(LEZTIT[sel-1])}</h3>
          <p style="color:#C7D0E0;font-size:13px;margin-top:4px">25 minuti \u00b7 premi play per segnare come completata</p></div></div>
      <div class="card" style="padding:18px;margin-top:16px">
        <h4 style="font-size:20px">Su questa lezione</h4>
        <p class="muted small" style="margin-top:6px">${esc(c.desc)}</p>
        <div style="display:flex;gap:10px;margin-top:14px">
          ${sel>1?`<button class="btn small ghost" onclick="go('corso',{id:'${c.id}',lez:${sel-1}})">\u2190 Precedente</button>`:''}
          ${sel<8?`<button class="btn small" onclick="completaLezione('${c.id}',${sel},true)">Completa e prosegui \u2192</button>`
            :`<button class="btn small oro" onclick="completaLezione('${c.id}',8,false,true)">Completa il corso \ud83c\udf93</button>`}
        </div></div>
    </div>
    <div class="card" style="padding:16px">
      <div class="eyebrow" style="padding:0 6px">Programma \u00b7 ${done.length}/8</div>
      <div class="lesson-list" style="margin-top:8px">
        ${LEZTIT.map((t,i2)=>{ const nn=i2+1; return `<div class="lesson ${nn===sel?'on':''} ${done.includes(nn)?'done':''}" onclick="go('corso',{id:'${c.id}',lez:${nn}})">
          <span class="n">${done.includes(nn)?'\u2713':nn}</span><span class="t">${esc(t)}</span><span class="d">25\u2032</span></div>`;}).join('')}
      </div></div>
  </div>`;
}
function vaiA(cta){
  if(!cta) return;
  if(cta==='registrati'){ if(!io) apriAccesso('reg'); return; }
  if(io) go(cta); else apriAccesso('reg');
}
function renderVod(){
  const bloccati = VOD.filter(v=>!livelloConsentito(v.livello));
  const invito = (bloccati.find(v=>livello(v.livello).cta)||{});
  const Linv = invito.livello?livello(invito.livello):null;
  return `
  <div class="page-head"><div class="eyebrow">Pilastro III \u00b7 La vetrina</div>
    <h1>Video On Demand</h1>
    <p class="lead">Documentari, lezioni aperte, conferenze e le registrazioni dei live. ${bloccati.length?'Alcuni titoli sono aperti a tutti; per gli altri serve il livello indicato su ciascuna scheda.':'Hai accesso a tutto il catalogo.'}</p></div>
  ${Linv?`<div class="card" style="padding:16px 20px;margin-bottom:22px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
    <div><b>${esc(Linv.invito||('Sblocca '+Linv.nome))}</b> <span class="muted small">\u2014 ${bloccati.length} ${bloccati.length===1?'titolo ancora chiuso':'titoli ancora chiusi'}</span></div>
    <button class="btn oro small" onclick="vaiA('${esc(Linv.cta)}')">Sblocca</button></div>`:''}
  <div class="grid g3">
    ${VOD.map(v=>{ const ok=livelloConsentito(v.livello); const L=livello(v.livello); return `<div class="tile">
      <div class="cover" style="background:linear-gradient(135deg,#1B3A6B,#0E1D38)"><span class="k" style="font-size:30px">\u25B6</span><span class="tag">${esc(v.tipo)}${L.ospiti?' \u00b7 gratuito':''}</span></div>
      <div class="body"><h4>${esc(v.tit)}</h4><div class="meta">${v.durata} \u00b7 ${esc(commNome(v.comm))}</div>
        <p class="small muted" style="flex:1">${esc(v.desc)}</p>
        <div class="foot">${ok?`<span class="badge ${L.ospiti?'verde':'blu'}">${esc(L.ospiti?'Gratuito':L.nome)}</span>
          <button class="btn small" onclick="playVideo('${v.id}')">Guarda</button>`
          :`<span class="badge grigio">\ud83d\udd12 ${esc(L.nome)}</span>${L.cta?`<button class="btn small ghost" onclick="vaiA('${esc(L.cta)}')">Sblocca</button>`:''}`}
        </div></div></div>`;}).join('')}
  </div>`;
}
/* Riconosce YouTube, Vimeo e file diretti. L'indirizzo dell'embed viene sempre
   RICOSTRUITO a partire dall'identificativo estratto, mai inoltrato com'e':
   cosi' un valore storto nel database non puo' finire dentro l'HTML.
   Ritorna {tipo:'iframe'|'file'|'link', src} oppure null se l'URL manca. */
function videoSorgente(raw){
  const s = String(raw==null?'':raw).trim();
  if(!s) return null;
  let u; try{ u = new URL(s); }catch(e){ return null; }
  if(u.protocol !== 'https:') return null;            /* blocca http:, javascript:, data: */
  const host = u.hostname.replace(/^www\./,'');
  const path = u.pathname.split('/').filter(Boolean);

  const yt = (id,t) => /^[A-Za-z0-9_-]{11}$/.test(id||'')
    ? { tipo:'iframe', src:'https://www.youtube-nocookie.com/embed/'+id+(/^\d+$/.test(t||'')?'?start='+t:'') }
    : null;
  if(host==='youtu.be') return yt(path[0], u.searchParams.get('t'));
  if(host==='youtube.com' || host==='m.youtube.com' || host==='youtube-nocookie.com'){
    if(path[0]==='watch') return yt(u.searchParams.get('v'), u.searchParams.get('t'));
    if(['embed','shorts','live','v'].indexOf(path[0])>=0)
      return yt(path[1], u.searchParams.get('start') || u.searchParams.get('t'));
  }
  const vm = (id,h) => /^\d+$/.test(id||'')
    ? { tipo:'iframe', src:'https://player.vimeo.com/video/'+id+(/^[A-Za-z0-9]+$/.test(h||'')?'?h='+h:'') }
    : null;
  if(host==='vimeo.com'){ const i=path.findIndex(x=>/^\d+$/.test(x)); if(i>=0) return vm(path[i], path[i+1]); }
  if(host==='player.vimeo.com' && path[0]==='video') return vm(path[1], u.searchParams.get('h'));

  if(/\.(mp4|webm|ogv|ogg|mov|m4v)$/i.test(u.pathname)) return { tipo:'file', src:u.href };
  return { tipo:'link', src:u.href };                 /* riconosciuto ma non incorporabile */
}
let vodTok=0;
async function playVideo(id){
  const v=VOD.find(x=>x.id===id);
  if(!v) return;
  TRK.log('click','vod', v.tit);
  const L=livello(v.livello);
  /* Questo controllo serve solo all'interfaccia: la parola definitiva ce l'ha
     la RLS su video_sources, che a chi non ha diritto l'indirizzo non lo manda. */
  if(!livelloConsentito(v.livello)){ vaiA(L.cta); return; }
  const tok=++vodTok;
  const testa=`<h3 style="font-size:24px">${esc(v.tit)}</h3><span class="badge blu">${esc(v.tipo)}</span>`;
  const coda=`<p class="muted small" style="margin-top:14px">${esc(v.desc)}</p>`;
  const scatola=t=>`<div class="player" style="aspect-ratio:16/9"><div style="z-index:1;text-align:center;padding:0 24px">${t}</div></div>`;
  openModal(testa, scatola('<p style="color:#C7D0E0;font-size:13px">Carico il video\u2026</p>') + coda, null, 'largo');
  let url=null; try{ url = await DB.videoUrl(id); }catch(e){}
  if(tok!==vodTok) return;                       /* l'utente ha gia' aperto altro */
  const cassa=document.querySelector('.modal-b'); if(!cassa) return;
  const src=videoSorgente(url);
  let player;
  if(url===null) player = scatola('<p style="color:#C7D0E0;font-size:13px">Non riesco a recuperare questo video. Se il tuo abbonamento \u00e8 appena cambiato, prova a rientrare.</p>');
  else if(!src)  player = scatola('<div class="play" style="margin:0 auto 12px">\u25B6</div><p style="color:#C7D0E0;font-size:13px">Questo video non ha ancora un indirizzo collegato.</p>');
  else if(src.tipo==='link') player = scatola(`<p style="color:#C7D0E0;font-size:13px;margin-bottom:12px">Questo indirizzo non si pu\u00f2 incorporare.</p><a class="btn oro small" href="${esc(src.src)}" target="_blank" rel="noopener noreferrer">Apri il video</a>`);
  else if(src.tipo==='iframe') player = `<div class="player-frame"><iframe src="${esc(src.src)}" title="${esc(v.tit)}" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`;
  else player = `<div class="player-frame"><video src="${esc(src.src)}" controls preload="metadata" playsinline></video></div>`;
  cassa.innerHTML = player + coda;
}
/* =====================================================================
   BIBLIOTECA AUDIO — MOTORE IA
===================================================================== */
let ttsUtter=null, bibTab='audio';
let readText='', readTitle='', readerCaps=[];
function findMedia(id){ return AUDIO.find(x=>x.id===id) || TESTI.find(x=>x.id===id); }
function renderAudio(){
  const premium = haAccesso('audio-premium');
  if(ctx.open){ const a=AUDIO.find(x=>x.id===ctx.open); const o=ctx.open; ctx.open=null; setTimeout(()=>{ if(a&&(a.free||premium)) apriAudio(o); },50); }
  return `
  <div class="page-head"><div class="eyebrow">Pilastro IV · La biblioteca quotidiana</div>
    <h1>La Biblioteca <span class="muted" style="font-size:24px">audiolibri e testi, con motore IA</span></h1>
    <p class="lead">Leggi e ascolta: audiolibri con voce e testi da leggere a schermo, con riassunti e percorsi su misura. ${premium?'Hai accesso illimitato e a tutte le funzioni IA.':'Alcuni titoli sono gratuiti; la biblioteca completa e l’IA sono incluse in Civis.'}</p></div>
  <div class="seg" style="max-width:360px;margin-bottom:20px">
    <button class="${bibTab==='audio'?'on':''}" onclick="setBibTab('audio')">Audiolibri</button>
    <button class="${bibTab==='testi'?'on':''}" onclick="setBibTab('testi')">Testi</button>
  </div>
  <div id="bib-area">${bibArea(premium)}</div>`;
}
function setBibTab(t){ bibTab=t; const a=$('bib-area'); if(a) a.innerHTML=bibArea(haAccesso('audio-premium')); }
function bibArea(premium){
  if(bibTab==='testi'){
    return `<div class="grid g3">
      ${TESTI.map(t=>{ const ok=t.free||premium; return `<div class="tile">
        <div class="cover" style="background:linear-gradient(135deg,#3A2E1E,#23170A)"><span class="k" style="font-size:30px">📖</span><span class="tag">Testo${t.free?' · gratuito':''}</span></div>
        <div class="body"><h4>${esc(t.tit)}</h4><div class="meta">${esc(t.autore)} · ${(t.capitoli&&t.capitoli.length)?(t.capitoli.length+' capitoli'):esc(t.lettura||'lettura')}</div>
          <div class="foot">${ok?`<span class="badge ${t.free?'verde':'blu'}">${t.free?'Gratuito':'Incluso'}</span>
            <button class="btn small" onclick="apriTesto('${t.id}')">Leggi</button>`
            :`<span class="badge grigio">🔒 Civis</span><button class="btn small ghost" onclick="go('abbonamenti')">Sblocca</button>`}
          </div></div></div>`;}).join('')}
    </div>`;
  }
  return `<div class="ai-panel" style="margin-bottom:24px">
    <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
      <div style="flex:1;min-width:240px"><div class="eyebrow">Percorso su misura</div>
        <h3 style="font-size:22px;margin-top:2px">Chiedi all’IA cosa ascoltare</h3>
        <p class="muted small">Raccontale cosa ti interessa: costruirà un percorso dal catalogo.</p></div>
      ${premium?`<button class="btn oro" onclick="percorsoIA()">✦ Crea il mio percorso</button>`
        :`<button class="btn ghost" onclick="go('abbonamenti')">🔒 Sblocca con Civis</button>`}
    </div>
    <div id="ia-percorso" style="margin-top:14px"></div>
  </div>
  <div class="grid g3">
    ${AUDIO.map(a=>{ const ok=a.free||premium; return `<div class="tile">
      <div class="cover" style="background:linear-gradient(135deg,#2A2440,#15233F)"><span class="k" style="font-size:30px">♪</span><span class="tag">Audiolibro${a.free?' · gratuito':''}</span></div>
      <div class="body"><h4>${esc(a.tit)}</h4><div class="meta">${esc(a.autore)} · ${a.durata}</div>
        <div class="foot">${ok?`<span class="badge ${a.free?'verde':'blu'}">${a.free?'Gratuito':'Incluso'}</span>
          <button class="btn small" onclick="apriAudio('${a.id}')">Apri</button>`
          :`<span class="badge grigio">🔒 Civis</span><button class="btn small ghost" onclick="go('abbonamenti')">Sblocca</button>`}
        </div></div></div>`;}).join('')}
  </div>`;
}
function apriTesto(id){
  const t=TESTI.find(x=>x.id===id);
  const premium = haAccesso('audio-premium') || t.free;
  if(!premium){ go('abbonamenti'); return; }
  const iaOn = haAccesso('audio-premium') && aiUrl();
  const caps=(t.capitoli||[]).filter(c=>c&&((c.c&&c.c.length)||(c.t&&c.t.length)));
  const chaptered=caps.length>0;
  readerCaps=caps;
  readText = chaptered ? (caps[0].c||'') : (t.testo||'');
  readTitle = t.tit + (chaptered && caps[0].t ? ' — '+caps[0].t : '');
  const nav = chaptered ? `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;flex-wrap:wrap">
      <button class="btn small ghost" onclick="capStep(-1)" title="Capitolo precedente">◀</button>
      <select id="reader-sel" onchange="setReaderCap(this.selectedIndex)" style="flex:1;min-width:200px;padding:9px 10px;border:1px solid var(--linea);border-radius:8px;font-family:inherit">
        ${caps.map((c,i)=>`<option value="${i}">${esc((i+1)+'. '+(c.t||('Capitolo '+(i+1))))}</option>`).join('')}
      </select>
      <button class="btn small ghost" onclick="capStep(1)" title="Capitolo successivo">▶</button>
    </div>` : '';
  openModal(
    `<div><h3 style="font-size:25px">${esc(t.tit)}</h3><span class="muted small">${esc(t.autore)} · ${esc(t.lettura||'')}${chaptered?(' · '+caps.length+' capitoli'):''}</span></div>`,
    `<div class="card" style="padding:14px;background:var(--avorio);border:none;margin-bottom:14px">
       <div style="display:flex;align-items:center;gap:14px">
         <button class="btn" id="tts-btn" onclick="toggleTTS('${t.id}')">▶ Ascolta (voce IA)</button>
         <div class="wave hidden" id="tts-wave">${'<span></span>'.repeat(6)}</div>
         <span class="muted small" id="tts-state">${chaptered?'Legge il capitolo selezionato':'Oppure leggi qui sotto'}</span>
       </div></div>
     ${nav}
     ${chaptered?`<div id="reader-ct" class="eyebrow" style="margin-bottom:6px">${esc(caps[0].t||'Capitolo 1')}</div>`:''}
     <div id="reader-body" style="font-family:'Cormorant Garamond',Georgia,serif;font-size:19px;line-height:1.75;white-space:pre-wrap;max-height:46vh;overflow:auto;padding-right:6px">${esc(readText)}</div>
     <div class="divider"></div><div class="eyebrow">Motore IA ${chaptered?'(sul capitolo aperto)':''}</div>
     ${iaOn?`<div style="display:flex;gap:8px;flex-wrap:wrap;margin:10px 0">
        <button class="btn small ghost" onclick="iaAzione('${t.id}','riassunto')">✦ Riassumi in 3 punti</button>
        <button class="btn small ghost" onclick="iaAzione('${t.id}','idea')">✦ L’idea centrale</button>
        <button class="btn small ghost" onclick="iaAzione('${t.id}','collega')">✦ Collega ai corsi</button>
      </div><div class="ai-out" id="ia-out">Scegli un’azione: il motore IA elabora il testo in tempo reale.</div>`
      :`<p class="muted small">Le funzioni IA ${haAccesso('audio-premium')?'richiedono la configurazione dell’Edge Function (vedi README).':'sono incluse nella membership Civis.'}</p>`}
    `, ()=>{ stopTTS(); readText=''; readTitle=''; readerCaps=[]; });
}
function setReaderCap(i){
  const c=readerCaps[i]; if(!c) return;
  stopTTS();
  readText = c.c||''; readTitle = readTitle.split(' — ')[0] + (c.t?' — '+c.t:'');
  const b=$('reader-body'); if(b){ b.innerHTML=esc(readText); b.scrollTop=0; }
  const ct=$('reader-ct'); if(ct) ct.textContent = c.t||('Capitolo '+(i+1));
  const sel=$('reader-sel'); if(sel) sel.selectedIndex=i;
}
function capStep(d){ const sel=$('reader-sel'); if(!sel) return; let i=Math.max(0,Math.min(sel.options.length-1, sel.selectedIndex+d)); setReaderCap(i); }
function apriAudio(id){
  const a=AUDIO.find(x=>x.id===id);
  const premium = haAccesso('audio-premium') || a.free;
  if(!premium){ go('abbonamenti'); return; }
  const iaOn = haAccesso('audio-premium') && aiUrl();
  readText=a.testo||''; readTitle=a.tit; readerCaps=[];
  openModal(
    `<div><h3 style="font-size:25px">${esc(a.tit)}</h3><span class="muted small">${esc(a.autore)} · ${a.durata}</span></div>`,
    `<div class="card" style="padding:16px;background:var(--avorio);border:none">
       <div style="display:flex;align-items:center;gap:14px">
         <button class="btn" id="tts-btn" onclick="toggleTTS('${a.id}')">▶ Ascolta (voce IA)</button>
         <div class="wave hidden" id="tts-wave">${'<span></span>'.repeat(6)}</div>
         <span class="muted small" id="tts-state">Lettura vocale del browser</span>
       </div></div>
     <p style="font-size:14.5px;line-height:1.7;margin:16px 0;max-height:200px;overflow:auto">${esc(a.testo)}</p>
     <div class="divider"></div><div class="eyebrow">Motore IA</div>
     ${iaOn?`<div style="display:flex;gap:8px;flex-wrap:wrap;margin:10px 0">
        <button class="btn small ghost" onclick="iaAzione('${a.id}','riassunto')">✦ Riassumi in 3 punti</button>
        <button class="btn small ghost" onclick="iaAzione('${a.id}','idea')">✦ L’idea centrale</button>
        <button class="btn small ghost" onclick="iaAzione('${a.id}','collega')">✦ Collega ai corsi</button>
      </div><div class="ai-out" id="ia-out">Scegli un’azione: il motore IA elabora il testo in tempo reale.</div>`
      :`<p class="muted small">Le funzioni IA (riassunti, idea centrale, collegamenti) ${haAccesso('audio-premium')?'richiedono la configurazione dell’Edge Function (vedi README).':'sono incluse nella membership Civis.'}</p>`}
    `, ()=>{ stopTTS(); readText=''; readTitle=''; });
}
function toggleTTS(id){
  if(ttsUtter && window.speechSynthesis && speechSynthesis.speaking){ stopTTS(); return; }
  if(!('speechSynthesis' in window)){ toast('Sintesi vocale non disponibile.'); return; }
  const txt = (readText&&readText.length) ? readText : ((findMedia(id)||{}).testo||'');
  if(!txt){ toast('Nessun testo da leggere.'); return; }
  ttsUtter=new SpeechSynthesisUtterance(txt); ttsUtter.lang='it-IT'; ttsUtter.rate=.98;
  const it=speechSynthesis.getVoices().find(v=>v.lang&&v.lang.startsWith('it')); if(it) ttsUtter.voice=it;
  ttsUtter.onend=()=>stopTTS(); speechSynthesis.cancel(); speechSynthesis.speak(ttsUtter);
  const b=$('tts-btn'); if(b) b.textContent='⏸ Pausa';
  $('tts-wave')&&$('tts-wave').classList.remove('hidden'); if($('tts-state')) $('tts-state').textContent='In lettura…';
}
function stopTTS(){
  if('speechSynthesis' in window) speechSynthesis.cancel(); ttsUtter=null;
  const b=$('tts-btn'); if(b) b.textContent='▶ Ascolta (voce IA)';
  $('tts-wave')&&$('tts-wave').classList.add('hidden'); if($('tts-state')) $('tts-state').textContent='Lettura vocale del browser';
}
async function iaAzione(id,tipo){
  const a=findMedia(id), out=$('ia-out'); if(!out) return;
  const body = (readText&&readText.length) ? readText : (a?a.testo:'');
  const titolo = (readTitle&&readTitle.length) ? readTitle : (a?a.tit:'');
  out.innerHTML='<span class="spin"></span> Il motore IA sta elaborando…';
  const sys='Sei il bibliotecario IA de La Pacifica Res Publica, un’accademia per la pace. Rispondi in italiano, colto ma chiaro e conciso.';
  const prompt = tipo==='riassunto'?`Riassumi in 3 punti elenco brevi:\n\n"""${body}"""`
    : tipo==='idea'?`Esprimi in 2-3 frasi l’idea centrale e perché conta per chi studia la pace:\n\n"""${body}"""`
    : `Brano "${titolo}". Collegalo a 2 corsi tra: ${CORSI.map(c=>c.tit).join('; ')}. Una frase per ciascuno.`;
  try{ out.textContent = (await DB.ai(sys,prompt)) || 'Nessuna risposta.'; }
  catch(e){ out.innerHTML='<span style="color:var(--porpora)">Motore IA non disponibile. Configura l’Edge Function (README) o riprova.</span>'; }
}
function percorsoIA(){
  const box=$('ia-percorso'); if(!box) return;
  box.innerHTML=`<div class="field" style="margin:0"><textarea id="ia-desc" rows="2" placeholder="Es. Mi interessano la nonviolenza e la diplomazia, ho 30 minuti al giorno…"></textarea></div>
    <button class="btn small oro" style="margin-top:8px" onclick="generaPercorso()">Genera percorso</button>
    <div class="ai-out hidden" id="ia-perc-out" style="margin-top:12px"></div>`;
}
async function generaPercorso(){
  const desc=($('ia-desc').value||'').trim(), out=$('ia-perc-out');
  if(desc.length<5){ toast('Descrivi cosa ti interessa.'); return; }
  out.classList.remove('hidden'); out.innerHTML='<span class="spin"></span> Costruisco il tuo percorso…';
  const cat=AUDIO.map(a=>`- ${a.tit} (${a.autore}, ${a.durata})`).join('\n');
  const sys='Sei il bibliotecario IA de La Pacifica. Consigli percorsi SOLO tra i titoli forniti. Italiano, conciso, ordine numerato con una frase di motivazione per titolo.';
  try{ out.textContent=(await DB.ai(sys,`Catalogo:\n${cat}\n\nInteressi: "${desc}".\nProponi 3-4 titoli ordinati con motivazione.`))||'Nessuna risposta.'; }
  catch(e){ out.innerHTML='<span style="color:var(--porpora)">Motore IA non disponibile.</span>'; }
}

/* =====================================================================
   PARLAMENTO
===================================================================== */
let cacheProposte=[], occupati=0;
function renderParlamento(){
  caricaParl();
  return `<div id="parl"><div class="empty"><div class="spin" style="width:24px;height:24px;margin:0 auto"></div></div></div>`;
}
async function caricaParl(){
  try{ occupati = await DB.seatsOccupied(); cacheProposte = await DB.proposals(); }catch(e){ cacheProposte=[]; }
  if(vista!=='parlamento') return;
  const box=$('parl'); if(box) box.innerHTML = parlInner(io.ruolo==='delegato'||io.ruolo==='presidenza');
  drawEmiciclo();
}
/* I dossier europei: materia prima, non proposte. Da qui il delegato
   apre la fonte ufficiale e ne trae la SUA proposta. */
function pannelloDossier(){
  if(!DOSSIER.length) return '';
  const righe = COMMISSIONI.map(c=>{
    const ds = dossierDi(c.id);
    if(!ds.length) return '';
    return `<div class="card" style="padding:18px;margin-bottom:12px">
      <div class="eyebrow">${esc(c.nome)}</div>
      ${ds.slice(0,6).map(d=>`<div class="lesson" style="cursor:default">
        <span class="t">${esc(d.tit)}<br><span class="d" style="margin:0">${esc(d.id)}${d.stato?' \u00b7 '+esc(d.stato):''}${d.commUe && d.commUe.length?' \u00b7 '+esc(d.commUe.join(', ')):' \u00b7 referral pendente'}</span></span>
        <span style="margin-left:auto;display:flex;gap:8px">
          <a class="btn small ghost" href="${esc(d.url)}" target="_blank" rel="noopener noreferrer">Scheda ufficiale</a>
          ${d.urlTesto?`<a class="btn small ghost" href="${esc(d.urlTesto)}" target="_blank" rel="noopener noreferrer">Testo</a>`:''}
        </span></div>`).join('')}
      ${ds.length>6?`<p class="muted small" style="margin-top:8px">e altri ${ds.length-6}.</p>`:''}
    </div>`;
  }).filter(Boolean).join('');
  if(!righe) return '';
  return `<h2 style="margin:30px 0 6px;font-size:28px">Dossier europei aperti</h2>
    <p class="muted small" style="margin-bottom:14px">Procedure legislative in corso al Parlamento europeo, smistate alle commissioni per materia. Fonte: Osservatorio legislativo \u2014 \u00a9 Unione europea, Parlamento europeo. Sono materiale di lavoro: la proposta resta tua.</p>
    ${righe}`;
}
function parlInner(accesso){
  if(!accesso){
    return `<div class="page-head"><div class="eyebrow">Pilastro I · su invito</div>
      <h1>Il Parlamento dei Giovani</h1>
      <p class="lead">Centocinquanta giovani menti simulano in tutto e per tutto un parlamento: commissioni, proposte di legge, emendamenti e votazioni. Una palestra per allenarsi a diventare diplomatici e parlamentari.</p></div>
    <div class="grid g2">
      <div class="hemi"><svg id="emiciclo" viewBox="0 0 1000 540"></svg>
        <div class="legend"><span><i style="background:var(--oltremare)"></i>Seggio assegnato</span><span><i style="background:#E7E2D4"></i>Libero</span></div></div>
      <div class="card" style="padding:24px;display:flex;flex-direction:column;justify-content:center">
        <h3 style="font-size:26px">L’accesso è su invito</h3>
        <p class="muted" style="margin:8px 0 16px">Il Parlamento è riservato ai delegati selezionati e alla Presidenza. I delegati ricevono un codice personale e, con esso, l’accesso completo all’ecosistema come borsa di studio.</p>
        <div class="stats" style="grid-template-columns:1fr 1fr">
          <div class="stat"><div class="n">${occupati}/150</div><div class="l">Seggi assegnati</div></div>
          <div class="stat"><div class="n">7</div><div class="l">Commissioni permanenti</div></div></div></div>
    </div>
    ${pannelloDossier()}
    <h2 style="margin:30px 0 14px;font-size:28px">Le sette commissioni</h2>
    <div class="grid g3">${COMMISSIONI.map(c=>`<div class="card" style="padding:18px">
      <div class="eyebrow">${esc(c.pr)}</div><h4 style="font-size:21px;margin-top:4px">${esc(c.nome)}</h4></div>`).join('')}</div>`;
  }
  const inComm=cacheProposte.filter(p=>p.stato==='commissione').length, inAula=cacheProposte.filter(p=>p.stato==='aula').length;
  return `<div class="page-head"><div class="eyebrow">Pilastro I · ${io.ruolo==='presidenza'?'Presidenza':'Delegato — seggio n.'+io.seggio}</div>
    <h1>Il Parlamento dei Giovani</h1>
    <p class="lead">${io.comm?('Sei assegnato alla Commissione <b>'+esc(commNome(io.comm))+'</b>.'):'Presiedi l’Assemblea.'} Deposita proposte, esaminale, portale in Aula e vota.</p></div>
  <div class="grid g2" style="margin-bottom:24px">
    <div class="hemi"><svg id="emiciclo" viewBox="0 0 1000 540"></svg>
      <div class="legend"><span><i style="background:var(--oltremare)"></i>Assegnato</span><span><i style="background:#E7E2D4"></i>Libero</span></div></div>
    <div>
      <div class="stats" style="grid-template-columns:1fr 1fr;margin-bottom:14px">
        <div class="stat"><div class="n">${occupati}/150</div><div class="l">Delegati in Aula</div></div>
        <div class="stat"><div class="n">${cacheProposte.length}</div><div class="l">Proposte depositate</div></div></div>
      <div class="card" style="padding:18px">
        <div class="eyebrow">Deposita una proposta</div>
        <div class="field" style="margin-top:8px"><input id="pr-tit" placeholder="Titolo della proposta di legge"></div>
        <div class="field"><textarea id="pr-txt" rows="3" placeholder="Testo e motivazione…"></textarea></div>
        <button class="btn small" onclick="depositaProposta()">Deposita in commissione</button></div>
    </div></div>
  <h2 style="font-size:26px;margin:6px 0 14px">Iter delle proposte <span class="muted" style="font-size:15px">· ${inComm} in commissione · ${inAula} in Aula</span></h2>
  ${cacheProposte.length===0?`<div class="empty"><div class="ico">⚖︎</div>Nessuna proposta ancora. Deposita la prima qui sopra.</div>`
    :`<div class="grid g2">${cacheProposte.map(propCard).join('')}</div>`}`;
}
function propCard(p){
  const tot=Object.keys(p.voti||{}).length, fav=Object.values(p.voti||{}).filter(v=>v==='f').length, con=Object.values(p.voti||{}).filter(v=>v==='c').length;
  const mioVoto=(p.voti||{})[io.id], pres=io.ruolo==='presidenza';
  const badge = p.stato==='commissione'?'<span class="badge blu">In commissione</span>'
    : p.stato==='aula'?'<span class="badge oro">In votazione</span>'
    : p.esito==='approvata'?'<span class="badge verde">Approvata</span>':'<span class="badge grigio">Respinta</span>';
  let azioni='';
  if(p.stato==='commissione'&&pres) azioni=`<button class="btn small oro" onclick="calendarizza('${p.id}')">Porta in Aula</button>`;
  if(p.stato==='aula') azioni=`<div style="display:flex;gap:7px;flex-wrap:wrap">
    <button class="btn small ${mioVoto==='f'?'':'ghost'}" onclick="vota('${p.id}','f')">Favorevole</button>
    <button class="btn small ghost" style="${mioVoto==='c'?'background:var(--porpora);color:#fff;border-color:var(--porpora)':''}" onclick="vota('${p.id}','c')">Contrario</button>
    ${pres?`<button class="btn small" style="background:var(--inchiostro)" onclick="chiudiVoto('${p.id}')">Chiudi votazione</button>`:''}</div>`;
  return `<div class="card" style="padding:18px">
    <div style="display:flex;justify-content:space-between;align-items:start;gap:10px"><h4 style="font-size:21px">${esc(p.titolo)}</h4>${badge}</div>
    <p class="muted small" style="margin:6px 0 4px">${esc(commNome(p.commissione))} · proposta da ${esc(p.autore_nome)}</p>
    <p style="font-size:14px;margin:8px 0 12px">${esc(p.testo)}</p>
    ${p.stato!=='commissione'?`<p class="small muted" style="margin-bottom:10px">Voti: ${tot} · <b style="color:var(--verde)">${fav} favorevoli</b> · <b style="color:var(--porpora)">${con} contrari</b> · quorum 76</p>`:''}
    ${azioni}</div>`;
}
async function depositaProposta(){
  const tit=($('pr-tit').value||'').trim(), txt=($('pr-txt').value||'').trim();
  if(tit.length<5||txt.length<15) return toast('Servono un titolo e un testo motivato.');
  try{ await DB.createProposal(tit,txt,io.comm||'pace'); await caricaParl(); toast('Proposta depositata.'); }
  catch(e){ toast('Errore: '+(e.message||'')); }
}
async function calendarizza(id){ try{ await DB.setStato(id,'aula'); await caricaParl(); toast('Proposta in Aula.'); }catch(e){ toast('Errore.'); } }
async function vota(id,v){ try{ await DB.vote(id,v); await caricaParl(); }catch(e){ toast('Errore nel voto.'); } }
async function chiudiVoto(id){
  const p=cacheProposte.find(x=>x.id===id);
  const f=Object.values(p.voti||{}).filter(v=>v==='f').length, c=Object.values(p.voti||{}).filter(v=>v==='c').length;
  try{ await DB.setStato(id,'chiusa', f>c?'approvata':'respinta'); await caricaParl(); toast('Votazione chiusa.'); }catch(e){ toast('Errore.'); }
}
function drawEmiciclo(){
  const svg=$('emiciclo'); if(!svg) return;
  const file=[18,22,26,30,34], cx=500, cy=505; let html='', n=0;
  file.forEach((q,riga)=>{ const r=140+riga*44;
    for(let k=0;k<q;k++){ n++; const a=Math.PI-(Math.PI*k/(q-1)); const x=(cx+r*Math.cos(a)).toFixed(1); const y=(cy-r*Math.sin(a)).toFixed(1);
      const assegnato = n<=occupati; const mio = io.seggio===n;
      html+=`<circle cx="${x}" cy="${y}" r="9" fill="${assegnato?'#1B3A6B':'#E7E2D4'}" stroke="${mio?'#A9842F':'#CFC8B4'}" stroke-width="${mio?2.5:1}"></circle>`; }});
  html+=`<rect x="455" y="486" width="90" height="24" rx="2" fill="#122747"/><text x="500" y="502" text-anchor="middle" fill="#D9C48A" font-size="11" font-family="Karla" letter-spacing="2">PRESIDENZA</text>`;
  svg.innerHTML=html;
}

/* =====================================================================
   CAMPUS — campus formativi in presenza (Abbazia di Maguzzano)
===================================================================== */
function haCampus(id){ return (io.acquisti||[]).some(a=>a==='campus:'+id || a.startsWith('campus:'+id+':')); }
function renderCampus(){
  return `
  <div class="page-head"><div class="eyebrow">Pilastro V · La pace in presenza</div>
    <h1>I Campus</h1>
    <p class="lead">Esperienze formative in presenza, con possibilità di soggiorno, presso luoghi di pace e spiritualità. Per ora ci accoglie la <b>Casa di Spiritualità e Centro Ecumenico — Abbazia di Maguzzano</b>, sul Lago di Garda.</p></div>
  <div class="grid g3">
    ${CAMPUS.map(c=>{
      const prenotato = haCampus(c.id);
      return `<div class="tile">
        <div class="cover" style="background:linear-gradient(135deg,#3F5B3F,#1E3320)"><span class="k" style="font-size:30px">⛪</span><span class="tag">${esc(c.durata||'In presenza')}</span></div>
        <div class="body">
          <h4>${esc(c.tit)}</h4>
          <div class="meta">📍 ${esc(c.luogo)}</div>
          <div class="meta">🗓 ${esc(c.data||'Data in via di definizione')} · ${c.posti} posti</div>
          <p class="small muted" style="flex:1;margin-top:6px">${esc(c.desc)}</p>
          <div class="foot">
            <div><span class="muted small">da</span> <span class="price">${euro(c.prezzo)}</span></div>
            ${prenotato?'<span class="badge verde">Prenotato</span>'
              :`<button class="btn small" onclick="prenotaCampus('${c.id}')">Prenota</button>`}
          </div>
        </div></div>`;
    }).join('')}
  </div>
  <div class="card" style="padding:18px 22px;margin-top:24px;display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap">
    <span style="font-size:22px">⛪</span>
    <div style="flex:1;min-width:240px"><b>La sede: Abbazia di Maguzzano</b>
      <p class="muted small" style="margin:4px 0 0">Casa di Spiritualità e Centro Ecumenico a Lonato del Garda (BS), affacciata sul Lago di Garda: un luogo di accoglienza, silenzio e dialogo, ideale per i nostri campus. La possibilità di soggiorno include vitto e alloggio in pensione completa.</p></div>
  </div>`;
}
function prenotaCampus(id){
  const c = CAMPUS.find(x=>x.id===id); if(!c) return;
  const reale = DB.stripeAttivo();
  openModal(`<div><h3 style="font-size:24px">${esc(c.tit)}</h3><span class="muted small">📍 ${esc(c.luogo)}</span></div>`,
   `<p class="muted small" style="margin-bottom:14px">🗓 ${esc(c.data||'data da definire')} · ${esc(c.durata||'')} · ${c.posti} posti disponibili</p>
    <p style="font-size:14px;margin-bottom:16px">${esc(c.desc)}</p>
    <div class="eyebrow">Scegli la formula</div>
    <div style="display:flex;flex-direction:column;gap:10px;margin:10px 0 16px">
      <button class="btn ghost" style="justify-content:space-between" onclick="confermaCampus('${c.id}',false)">
        <span>Solo partecipazione <span class="muted small">(programma e pasti diurni)</span></span><b>${euro(c.prezzo)}</b></button>
      <button class="btn ghost" style="justify-content:space-between" onclick="confermaCampus('${c.id}',true)">
        <span>Con soggiorno <span class="muted small">(vitto e alloggio, pensione completa)</span></span><b>${euro(c.prezzoSoggiorno)}</b></button>
    </div>
    <p class="muted small">${reale?'Procedendo sarai reindirizzato al pagamento sicuro (Stripe).':'Prenotazione dimostrativa: nessun addebito reale.'}</p>`);
}
async function confermaCampus(id, soggiorno){
  const ref = 'campus:'+id+(soggiorno?':soggiorno':'');
  try{
    if(DB.stripeAttivo()){ closeModal(); toast('Apertura pagamento sicuro…'); await DB.checkout('item', ref); return; }
    await DB.purchase(ref); await refreshMe(); closeModal(); toast('Prenotazione registrata. A presto al Campus!'); render();
  }catch(e){ toast('Errore: '+(e.message||'prenotazione non riuscita')); }
}

/* =====================================================================
   EVENTI — mostre ed eventi de La Pacifica
===================================================================== */
function haEvento(id){ return (io.acquisti||[]).some(a=>a==='evento:'+id); }
function statoEvento(ev){
  if(haEvento(ev.id)) return {stato:'iscritto'};
  if(io.ruolo==='presidenza') return {stato:'ok'};
  if(ev.accesso==='libero') return {stato:'ok'};
  if(ev.accesso==='civis') return (io.membership==='civis'||io.membership==='academicus')?{stato:'ok'}:{stato:'lock',tier:'Civis'};
  if(ev.accesso==='academicus') return (io.membership==='academicus')?{stato:'ok'}:{stato:'lock',tier:'Academicus'};
  if(ev.accesso==='biglietto') return (io.membership==='academicus')?{stato:'ok'}:{stato:'biglietto'};
  return {stato:'lock'};
}
function accessoLabel(ev){
  return ev.accesso==='libero'?'Partecipazione libera'
    : ev.accesso==='civis'?'Incluso con Civis'
    : ev.accesso==='academicus'?'Incluso con Academicus'
    : 'Biglietto '+euro(ev.prezzo)+(' · incluso con Academicus');
}
function ctaEvento(ev){
  const s=statoEvento(ev);
  if(s.stato==='iscritto') return '<span class="badge verde">Partecipi ✓</span>';
  if(s.stato==='ok') return `<button class="btn small" onclick="partecipaEvento('${ev.id}')">Partecipa</button>`;
  if(s.stato==='biglietto') return `<button class="btn small oro" onclick="compraEvento('${ev.id}')">Biglietto ${euro(ev.prezzo)}</button>`;
  return `<button class="btn small ghost" onclick="go('abbonamenti')">🔒 Sblocca con ${esc(s.tier||'membership')}</button>`;
}
function renderEventi(){
  return `
  <div class="page-head"><div class="eyebrow">Pilastro VI · Gli eventi de La Pacifica</div>
    <h1>Eventi</h1>
    <p class="lead">Mostre, incontri ed esperienze culturali organizzate da La Pacifica. La partecipazione dipende dall’accesso collegato a ciascun evento e alla tua membership.</p></div>
  ${EVENTI.length===0?'<div class="empty"><div class="ico">🎭</div>Nessun evento in programma al momento.</div>'
    : EVENTI.map(ev=>{
    const righe = (ev.programma||'').split('\n').filter(Boolean);
    return `<div class="card" style="padding:0;overflow:hidden;margin-bottom:22px">
      <div style="background:linear-gradient(135deg,#1B3A6B,#122747);color:#fff;padding:26px 26px 22px;position:relative">
        <div class="eyebrow" style="color:var(--oro-chiaro)">${esc(ev.tipo)} · ${esc(ev.periodo)}</div>
        <h2 style="color:#fff;font-size:34px;margin:6px 0 4px">${esc(ev.tit)}</h2>
        <p style="color:#C7D0E0;font-size:16px;max-width:680px">${esc(ev.sub||'')}</p>
      </div>
      <div style="padding:22px 26px">
        <p style="font-size:15px;line-height:1.7;margin-bottom:14px">${esc(ev.desc)}</p>
        <div style="display:flex;gap:18px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
          <span class="muted small">📍 ${esc(ev.luogo||'sede da definire')}</span>
          <span class="badge ${ev.accesso==='libero'?'verde':ev.accesso==='biglietto'?'oro':'blu'}">${esc(accessoLabel(ev))}</span>
          <span style="margin-left:auto">${ctaEvento(ev)}</span>
        </div>
        ${righe.length?`<div class="divider"></div>
          <div class="eyebrow">Il programma dei dodici mesi</div>
          <div class="lesson-list" style="margin-top:8px">
            ${righe.map((r,i)=>`<div class="lesson" style="cursor:default"><span class="n">${i+1}</span><span class="t">${esc(r)}</span></div>`).join('')}
          </div>`:''}
      </div>
    </div>`;
  }).join('')}`;
}
async function partecipaEvento(id){
  try{ await DB.purchase('evento:'+id); await refreshMe(); toast('Partecipazione confermata. Ci vediamo all’evento!'); render(); }
  catch(e){ toast('Errore: '+(e.message||'')); }
}
async function compraEvento(id){
  const ref='evento:'+id;
  try{
    if(DB.stripeAttivo()){ toast('Apertura pagamento sicuro…'); await DB.checkout('item', ref); return; }
    await DB.purchase(ref); await refreshMe(); toast('Biglietto acquistato. Ci vediamo all’evento!'); render();
  }catch(e){ toast('Errore: '+(e.message||'')); }
}

/* =====================================================================
   ABBONAMENTI E ACQUISTI
===================================================================== */
function renderAbbonamenti(){
  const m=io.membership;
  return `<div class="page-head center"><div class="eyebrow">Civis Pacificae</div>
    <h1>Un solo abbonamento, tutto l’ecosistema</h1>
    <p class="lead" style="margin:0 auto">Scegli come accompagnare il tuo percorso. Ogni abbonamento sostiene il Parlamento dei Giovani e le progettualità dell’associazione.</p></div>
  <div class="grid g3" style="margin-top:30px;align-items:stretch">
    <div class="plan"><h3>Gratuito</h3><div class="pr">0 €</div>
      <ul><li>Dashboard personale unica</li><li>1ª lezione di ogni corso</li><li>Video e audiolibri gratuiti</li><li>Newsletter dell’Accademia</li></ul>
      <button class="btn ghost full" disabled>${m==='free'?'Piano attuale':'Incluso'}</button></div>
    <div class="plan feat"><h3>Civis</h3><div class="pr">12,50 €<small>/mese</small></div>
      <ul><li>Tutto il livello Gratuito</li><li><b>Video On Demand completo</b></li><li><b>Biblioteca Audio illimitata + IA</b></li><li>Lettura vocale, sintesi, percorsi su misura</li><li>Sconto 20% su tutti i corsi</li></ul>
      ${m==='civis'?'<button class="btn full" disabled>Piano attuale</button>':m==='academicus'?'<button class="btn ghost full" disabled>Incluso in Academicus</button>':'<button class="btn oro full" onclick="attiva(\'civis\')">Attiva Civis</button>'}
      <p class="small muted center" style="margin-top:8px">oppure 120 €/anno</p></div>
    <div class="plan"><h3>Civis Academicus</h3><div class="pr">2.500 €<small>/anno</small></div>
      <ul><li>Tutto il livello Civis</li><li><b>20 corsi (105 ore di videocorsi)</b></li><li>Live mensili con i formatori</li><li>Attestati dell’Accademia</li><li>Nuovi corsi inclusi</li></ul>
      ${m==='academicus'?'<button class="btn full" disabled>Piano attuale</button>':'<button class="btn full" onclick="attiva(\'academicus\')">Attiva Academicus</button>'}</div>
  </div>
  <div class="card" style="padding:18px 22px;margin-top:24px;display:flex;gap:14px;align-items:center;flex-wrap:wrap">
    <span style="font-size:22px">🎓</span>
    <div style="flex:1;min-width:240px"><b>Pagabile con Carta del Docente</b>
      <p class="muted small" style="margin:0">Corsi e membership annuali (Civis 120 € e Academicus 2.500 €) sono acquistabili con la Carta del Docente, previo accreditamento S.O.F.I.A.</p></div></div>
  <p class="center muted small" style="margin-top:18px">${DB.stripeAttivo()?'Pagamenti sicuri gestiti da Stripe. La membership si attiva subito dopo l’incasso.':'Attivazione dimostrativa — nessun addebito reale. Configura Stripe per gli incassi (vedi README).'}</p>`;
}
function attiva(piano){
  const reale=DB.stripeAttivo();
  openModal(`<h3 style="font-size:24px">Attiva ${piano==='civis'?'Civis':'Civis Academicus'}</h3>`,
   `<p class="muted small" style="margin-bottom:16px">${reale?'Sarai reindirizzato al pagamento sicuro gestito da Stripe.':'Attivazione dimostrativa: nessun pagamento reale.'}</p>
    <div class="card" style="padding:16px;background:var(--avorio);border:none;margin-bottom:16px">
      <div style="display:flex;justify-content:space-between"><span>${piano==='civis'?'Civis (12,50 €/mese)':'Civis Academicus (2.500 €/anno)'}</span><b>${piano==='civis'?'12,50 €':'2.500,00 €'}</b></div></div>
    <button class="btn oro full" onclick="confermaAbb('${piano}')">${reale?'Vai al pagamento':'Conferma attivazione'}</button>`);
}
async function confermaAbb(piano){
  try{
    if(DB.stripeAttivo()){ closeModal(); toast('Apertura pagamento sicuro…'); await DB.checkout('membership', piano); return; }
    await DB.activate(piano); await refreshMe(); closeModal(); toast(piano==='civis'?'Civis attivo. Buon ascolto!':'Academicus attivo.'); go('dashboard');
  }
  catch(e){ toast('Errore: '+(e.message||'attivazione non riuscita')); }
}
function compra(what){
  let lab,prezzo;
  if(what==='percorso'){ lab='Percorso di Pace completo (8 corsi)'; prezzo=PREZZO_PERCORSO; }
  else if(what.startsWith('pacc:')){ const p=PACCHETTI.find(x=>x.id===what.split(':')[1]); lab='Pacchetto '+p.nome; prezzo=p.prezzo; }
  else { const c=CORSI.find(x=>x.id===what.split(':')[1]); lab=c.tit; prezzo=PREZZO_CORSO; }
  const sconto=io.membership==='civis', finale=sconto?Math.round(prezzo*0.8):prezzo;
  const reale=DB.stripeAttivo();
  openModal(`<h3 style="font-size:24px">${esc(lab)}</h3>`,
   `<p class="muted small" style="margin-bottom:16px">${reale?'Sarai reindirizzato al pagamento sicuro gestito da Stripe.':'Acquisto dimostrativo: nessun addebito reale.'}</p>
    <div class="card" style="padding:16px;background:var(--avorio);border:none;margin-bottom:16px">
      <div style="display:flex;justify-content:space-between"><span>${esc(lab)}</span><b>${euro(prezzo)}</b></div>
      ${sconto?`<div style="display:flex;justify-content:space-between;color:var(--verde);font-size:14px;margin-top:6px"><span>Sconto Civis −20%</span><b>−${euro(prezzo-finale)}</b></div>`:''}
      <div class="divider" style="margin:12px 0"></div>
      <div style="display:flex;justify-content:space-between;font-size:18px"><b>Totale</b><b class="price" style="font-size:24px">${euro(finale)}</b></div></div>
    <button class="btn oro full" onclick="confermaAcquisto('${what}')">${reale?'Vai al pagamento':'Conferma acquisto'}</button>`);
}
async function confermaAcquisto(what){
  try{
    if(DB.stripeAttivo()){ closeModal(); toast('Apertura pagamento sicuro…'); await DB.checkout('item', what); return; }
    await DB.purchase(what); await refreshMe(); closeModal(); toast('Acquisto completato. Buono studio!'); render();
  }
  catch(e){ toast('Errore: '+(e.message||'acquisto non riuscito')); }
}

/* =====================================================================
   PRESIDENZA
===================================================================== */
let cacheSeggi=[];
let presTab='delegati', cmsTab='corsi';
function renderPresidenza(){
  return `<div class="page-head"><div class="eyebrow">Riservato alla Presidenza</div>
    <h1>Presidenza dell’Assemblea</h1>
    <p class="lead">Gestisci i delegati e tutti i contenuti dell’ecosistema: corsi, video, audiolibri, pacchetti e prezzi.</p></div>
  <div class="seg" style="max-width:420px;margin-bottom:22px">
    <button class="${presTab==='delegati'?'on':''}" onclick="setPresTab('delegati')">Delegati</button>
    <button class="${presTab==='contenuti'?'on':''}" onclick="setPresTab('contenuti')">Contenuti</button>
    <button class="${presTab==='guida'?'on':''}" onclick="setPresTab('guida')">Guida</button>
  </div>
  <div id="pres-body">${presTab==='delegati'?renderDelegati():(presTab==='guida'?renderGuidaAdmin():renderCms())}</div>`;
}
function setPresTab(t){ presTab=t; const b=$('pres-body'); if(b){ b.innerHTML = t==='delegati'?renderDelegati():(t==='guida'?renderGuidaAdmin():renderCms()); if(t==='delegati') caricaSeggi(); } }
function renderDelegati(){
  caricaSeggi();
  return `<div class="grid g2">
    <div class="card" style="padding:22px">
      <div class="eyebrow">Genera codici</div>
      <div class="field" style="margin-top:8px"><label>Quanti delegati</label>
        <select id="gen-n"><option>5</option><option>10</option><option>25</option><option>50</option></select></div>
      <div class="field"><label>Commissione di prima assegnazione</label>
        <select id="gen-comm">${COMMISSIONI.map(c=>`<option value="${c.id}">${esc(c.nome)}</option>`).join('')}<option value="rota">Distribuisci a rotazione</option></select></div>
      <button class="btn" onclick="generaCodici()">Genera codici</button>
      <p class="small muted" id="pres-stat" style="margin-top:12px">—</p></div>
    <div class="card" style="padding:22px"><div class="eyebrow">Codici generati (liberi)</div>
      <div id="lista-codici" style="margin-top:10px;max-height:360px;overflow:auto"><div class="spin"></div></div></div>
  </div>`;
}
async function caricaSeggi(){
  try{ cacheSeggi = await DB.seats(); }catch(e){ cacheSeggi=[]; }
  if(vista==='presidenza') mostraCodici();
}
function mostraCodici(){
  const box=$('lista-codici'); if(!box) return;
  const liberi=cacheSeggi.filter(s=>!s.used);
  if($('pres-stat')) $('pres-stat').textContent=`${cacheSeggi.filter(s=>s.used).length} assegnati · ${cacheSeggi.length} codici generati`;
  box.innerHTML = liberi.length?liberi.map(s=>`<div class="lesson"><span class="n">${s.n}</span>
    <span class="t" style="font-family:monospace;font-size:13px">${esc(s.codice)}</span>
    <span class="d">${esc(commNome(s.commissione).split(' ')[0])}</span></div>`).join('')
    : '<p class="muted small">Nessun codice libero. Generane di nuovi.</p>';
}
async function generaCodici(){
  const n=parseInt($('gen-n').value), comm=$('gen-comm').value;
  try{ await DB.generateCodes(n,comm); await caricaSeggi(); toast(n+' codici generati.'); }
  catch(e){ toast('Errore: '+(e.message||'')); }
}

/* ---------- Gestione contenuti (CMS) ---------- */
/* Menu del gestionale, raggruppato per aree di lavoro */
const CMS_GRUPPI=[
  ['Persone', [['anagrafiche','Anagrafiche'],['contratti','Contratti'],['utenti','Utenti'],['pagamenti','Pagamenti']]],
  ['Contenuti', [['corsi','Corsi'],['video','Video'],['audio','Audiolibri'],['testi','Testi'],['pagine','Testi delle pagine'],['pacchetti','Pacchetti'],['campus','Campus'],['eventi','Eventi']]],
  ['Comunicazione', [['rassegna','Rassegna'],['mecenati','Mecenati'],['statistiche','Statistiche']]],
  ['Impostazioni', [['livelli','Livelli'],['temi','Temi UE'],['archiviazione','Video S3'],['ente','Ente'],['prezzi','Prezzi']]]
];
function renderCms(){
  return `<div class="cms-menu">
    ${CMS_GRUPPI.map(([g,tabs])=>`<div class="cms-grp"><span class="cms-grp-l">${g}</span>
      <div class="cms-grp-tabs">${tabs.map(([k,l])=>`<button class="${cmsTab===k?'on':''}" onclick="setCmsTab('${k}')">${l}</button>`).join('')}</div></div>`).join('')}
  </div>
  <div id="cms-area">${cmsArea()}</div>`;
}
function setCmsTab(t){ cmsTab=t; const a=$('cms-area'); if(a) a.innerHTML=cmsArea();
  document.querySelectorAll('.cms-menu button').forEach(b=>b.classList.toggle('on', (b.getAttribute('onclick')||'').indexOf("'"+t+"'")>=0)); if(t==='temi') caricaOrfani(); if(t==='ente') caricaEnte(); if(t==='mecenati') caricaImpegni(); if(t==='rassegna'){ caricaEventiPaceCms(); caricaNotizieCms(); } if(t==='statistiche') caricaStatistiche(); }
function pubBadge(p){ return p===false?'<span class="badge grigio">Bozza</span>':'<span class="badge verde">Pubblicato</span>'; }
function cmsRow(titolo, sub, badge, onEdit, onDel, extra){
  return `<div class="lesson" style="cursor:default">
    <span class="t">${esc(titolo)}<br><span class="d" style="margin:0">${esc(sub)}</span></span>
    <span style="margin-left:auto;display:flex;gap:8px;align-items:center;flex-wrap:wrap">${badge}${extra||''}
      <button class="btn small ghost" onclick="${onEdit}">Modifica</button>
      <button class="btn small ghost" style="color:var(--porpora);border-color:#ECC9C9" onclick="${onDel}">Elimina</button></span></div>`;
}
function cmsArea(){
  if(cmsTab==='pagine'){
    let ultimoGrp='';
    const campi = ELENCO_TESTI.map(([k,label,def,ml],i)=>{
      const grp = label.split(' \u2014 ')[0];
      const head = grp!==ultimoGrp ? `<div class="eyebrow" style="margin:${i?'20px':'4px'} 0 6px">${esc(grp)}</div>` : '';
      ultimoGrp = grp;
      const val = esc(T(k, def));
      const campo = ml ? `<textarea id="tp-${i}" rows="${ml}">${val}</textarea>` : `<input id="tp-${i}" value="${val}">`;
      let so={}; try{ so=JSON.parse(TESTI_PAG['stile:'+k]||'{}'); }catch(_e){ so={}; }
      const sel=(id,ops,cur)=>`<select id="${id}">`+ops.map(o=>`<option value="${o[0]}"${o[0]===(cur||'')?' selected':''}>${o[1]}</option>`).join('')+`</select>`;
      const stile = `<div class="ts-stile">
        ${sel('tp-al-'+i,[['','Allineamento: predefinito'],['left','A sinistra'],['center','Centrato'],['right','A destra']],so.al)}
        ${sel('tp-ca-'+i,[['','Carattere: predefinito'],['serif','Elegante (titoli)'],['sans','Pulito (testi)']],so.ca)}
        ${sel('tp-di-'+i,[['','Dimensione: predefinita'],['85','Pi\u00f9 piccolo'],['115','Un po\u2019 pi\u00f9 grande'],['130','Grande'],['150','Molto grande'],['175','Enorme']],so.di)}
        ${sel('tp-cl-'+i,[['','Colore: predefinito'],['inchiostro','Inchiostro'],['oltremare','Blu oltremare'],['oro','Oro'],['grigio','Grigio'],['bianco','Bianco']],so.cl)}
        <label class="ts-ck"><input type="checkbox" id="tp-gr-${i}"${so.gr?' checked':''}> Grassetto</label>
        <label class="ts-ck"><input type="checkbox" id="tp-cv-${i}"${so.cv?' checked':''}> Corsivo</label>
      </div>`;
      const mod = ((TESTI_PAG[k]!==undefined && TESTI_PAG[k]!=='') || TESTI_PAG['stile:'+k]) ? ' <span class="badge blu">modificato</span>' : '';
      return `${head}<div class="field"><label>${esc(label.split(' \u2014 ').slice(1).join(' \u2014 ')||label)}${mod}</label>${campo}${stile}</div>`;
    }).join('');
    return `<div class="card" style="padding:22px;max-width:760px">
      <div class="eyebrow">Testi delle pagine</div>
      <p class="muted small" style="margin-top:6px">Qui modifichi i testi del sito pubblico e, per ciascuno, allineamento, carattere, dimensione, colore, grassetto e corsivo. «Predefinito» significa: come disegnato in origine. Se riporti tutto al predefinito, il portale torna all'originale.</p>
      <div style="margin-top:12px">${campi}</div>
      ${blocchiEditorHtml()}
      <button class="btn full" style="margin-top:16px" onclick="salvaTestiPagine()">Salva i testi</button>
    </div>`;
  }
  if(cmsTab==='prezzi'){
    return `<div class="card" style="padding:22px;max-width:460px">
      <div class="eyebrow">Prezzi globali</div>
      <div class="field" style="margin-top:10px"><label>Prezzo corso singolo (€)</label><input id="pz-corso" type="number" value="${PREZZO_CORSO}"></div>
      <div class="field"><label>Prezzo Percorso completo (€)</label><input id="pz-perc" type="number" value="${PREZZO_PERCORSO}"></div>
      <button class="btn" onclick="salvaPrezzi()">Salva prezzi</button>
      <p class="muted small" style="margin-top:10px">I prezzi di corsi e pacchetti singoli si modificano nelle rispettive schede.</p></div>`;
  }
  const add=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
    <div class="eyebrow">${{corsi:'Corsi',video:'Video On Demand',audio:'Audiolibri',testi:'Testi della Biblioteca',pacchetti:'Pacchetti tematici',campus:'Campus in presenza',eventi:'Eventi e mostre',livelli:'Livelli di accesso',temi:'Temi europei → commissioni',anagrafiche:'Anagrafiche \u2014 registro persone',contratti:'Contratti dei formatori',mecenati:'Formule e impegni dei mecenati',archiviazione:'Destinazioni S3 per i video'}[cmsTab]}</div>
    <button class="btn small" onclick="nuovo('${cmsTab}')">+ Aggiungi</button></div>`;
  let rows='';
  if(cmsTab==='corsi') rows = CORSI.map(c=>cmsRow(c.tit, `${c.form||'—'} · ${commNome(c.comm)||c.comm} · ${euro(c.prezzo||PREZZO_CORSO)}`, pubBadge(c.pubblicato), `editCorso('${c.id}')`, `delCont('corso','${c.id}')`)).join('');
  if(cmsTab==='utenti'){
    setTimeout(caricaUtenti,0);
    return `<div style="display:flex;gap:10px;align-items:center;margin-bottom:14px"><div class="eyebrow">Utenti del portale</div>
        <input id="ut-q" placeholder="cerca per nome…" style="max-width:240px;margin-left:auto" onkeydown="if(event.key==='Enter')caricaUtenti()">
        <button class="btn small" onclick="caricaUtenti()">Cerca</button></div>
      <p class="muted small" style="margin-bottom:12px">Da qui aggiorni ruolo, membership e scadenza — anche per attivazioni manuali (bonifico, Carta del Docente). I pagamenti Stripe arrivano da soli via webhook.</p>
      <div id="ut-box" class="muted small">Carico…</div>`;
  }
  if(cmsTab==='pagamenti'){
    setTimeout(caricaPagamenti,0);
    return `<div class="eyebrow" style="margin-bottom:14px">Pagamenti registrati</div>
      <p class="muted small" style="margin-bottom:12px">L’elenco dei pagamenti (Stripe e registrazioni manuali). Per attivare una membership pagata con bonifico usa la scheda <b>Utenti</b>.</p>
      <div id="pg-box" class="muted small">Carico…</div>`;
  }
  if(cmsTab==='archiviazione'){
    const righe = S3ACC.map(a=>cmsRow(a.nome, `${a.endpoint} · bucket ${a.bucket}`,
      a.attivo===false?'<span class="badge grigio">Spenta</span>':'<span class="badge verde">Attiva</span>',
      `editS3('${a.id}')`, `delCont('s3','${a.id}')`)).join('');
    return add + `<p class="muted small" style="margin-bottom:12px">Le destinazioni dove caricare i file video: puoi averne più d’una (account diversi, provider diversi) e scegliere ogni volta dove caricare. Funziona con qualunque servizio compatibile S3.</p>
      ${righe||'<div class="empty">Nessuna destinazione. Aggiungi la prima con “+ Aggiungi”.</div>'}`;
  }
  if(cmsTab==='anagrafiche'){
    const righe = ANAGRAFICHE.map(a=>cmsRow(
      (a.nome+' '+a.cognome).trim(),
      [a.qualifica, a.email, a.tel].filter(Boolean).join(' \u00b7 '),
      `<span class="badge ${(a.tipo||'').includes('formatore')?'blu':'grigio'}">${esc(a.tipo)}</span>${a.userId?' <span class="badge verde">portale</span>':''}${a.attivo===false?' <span class="badge grigio">inattiva</span>':''}`,
      `editAnagrafica('${a.id}')`, `delCont('anagrafica','${a.id}')`,
      `<button class="btn small ghost" onclick="apriContatti('${a.id}')">Contatti</button>`)).join('');
    return add + `<p class="muted small" style="margin-bottom:12px">Il registro di formatori, collaboratori e fornitori. I dati (codice fiscale, indirizzo) li vede solo la Presidenza; i formatori collegati a un account vedono la propria scheda.</p>
      ${righe||'<div class="empty">Nessuna anagrafica. Aggiungi la prima.</div>'}`;
  }
  if(cmsTab==='contratti'){
    const nomeAnag = id => { const a=ANAGRAFICHE.find(x=>String(x.id)===String(id)); return a?(a.nome+' '+a.cognome).trim():'?'; };
    const badge = st => ({bozza:'grigio',inviato:'blu',firmato:'verde',archiviato:'oro'}[st]||'grigio');
    const righe = CONTRATTI.map(c=>`<div class="lesson" style="cursor:default">
        <span class="t"><b>${esc(c.numero)}</b> \u00b7 ${esc(nomeAnag(c.anagId))}${c.titolo?' \u00b7 <i>'+esc(c.titolo)+'</i>':''}<br>
          <span class="d" style="margin:0">${esc(c.oggetto)}${c.compenso?` \u00b7 ${euro(c.compenso)}`:''}</span></span>
        <span style="margin-left:auto;display:flex;gap:6px;align-items:center;flex-wrap:wrap">
          <span class="badge ${badge(c.stato)}">${esc(c.stato)}</span>
          <button class="btn small ghost" onclick="leggiContratto('${c.id}')">Leggi</button>
          <button class="btn small ghost" onclick="stampaContratto('${c.id}')">Stampa</button>
          ${c.stato==='bozza'||c.stato==='inviato'?`<button class="btn small" onclick="firmaContratto('${c.id}')">Segna firmato</button>`:''}
          ${c.stato!=='archiviato'?`<button class="btn small ghost" onclick="archiviaContratto('${c.id}')">Archivia</button>`:''}
          ${c.stato==='bozza'?`<button class="btn small ghost" onclick="delCont('contratto','${c.id}')">Elimina</button>`:''}
        </span></div>`).join('');
    const mod = MODELLI.map(m=>cmsRow(m.titolo, (m.testo||'').replace(/\s+/g,' ').slice(0,90)+'\u2026',
      m.attivo===false?'<span class="badge grigio">Spento</span>':'<span class="badge verde">Attivo</span>',
      `editModello('${m.id}')`, `delCont('modello','${m.id}')`)).join('');
    return add + `<div class="card" style="padding:16px;margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <div class="eyebrow">Modelli di contratto</div>
          <button class="btn small" onclick="editModello()">+ Modello</button></div>
        <p class="muted small" style="margin:0 0 10px">Ogni modello ha un titolo e un testo con variabili come <code>{{nome_completo}}</code> o <code>{{compenso}}</code>: alla generazione vengono sostituite con i dati veri.</p>
        ${mod||'<div class="empty">Nessun modello: creane uno per generare contratti.</div>'}
      </div>` + `<p class="muted small" style="margin-bottom:12px">Ogni contratto \u00e8 numerato (C-anno-progressivo) e il testo generato resta <b>archiviato</b> nel database. \u26a0\ufe0f Il modello \u00e8 generico: prima dell\u2019uso reale fallo verificare a un consulente del lavoro o commercialista.</p>
      ${righe||'<div class="empty">Nessun contratto. Genera il primo con \u201c+ Aggiungi\u201d.</div>'}`;
  }
  if(cmsTab==='rassegna'){
    const fonti = FONTI.map(f=>cmsRow(f.nome, (f.editore||'')+' \u00b7 '+esc(f.url),
      (f.attiva?'<span class="badge verde">Attiva</span>':'<span class="badge grigio">Spenta</span>')+(f.ultimoEsito?` <span class="muted small">\u00b7 ${esc(f.ultimoEsito)}</span>`:''),
      `editFonte('${esc(f.id)}')`, `delCont('fonte','${esc(f.id)}')`,
      `<button class="btn small" onclick="sincronizza('${esc(f.id)}')">Sincronizza</button>`)).join('');
    const nasc = NOTIZIE.filter(n=>n.nascosta).length;
    return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <b>Fonti dei feed</b><button class="btn oro small" onclick="editFonte()">Aggiungi fonte</button></div>
      ${fonti||'<div class="empty">Nessuna fonte. Aggiungine una e incolla l\u2019URL del feed RSS.</div>'}
      <div style="display:flex;justify-content:space-between;align-items:center;margin:22px 0 12px">
        <b>Eventi e iniziative</b><button class="btn oro small" onclick="editEventoPace()">Aggiungi evento</button></div>
      <div id="evp-box" class="muted small">Carico\u2026</div>
      <div class="card" style="padding:16px;margin-top:20px"><div class="eyebrow">Notizie pubblicate</div>
        <p class="muted small" style="margin:8px 0">Automatiche, ma puoi togliere dalla pagina qualsiasi articolo in un clic. ${nasc?nasc+' nascoste.':''}</p>
        <div id="nz-box" class="muted small">Carico\u2026</div></div>`;
  }
  if(cmsTab==='statistiche'){
    return `<p class="muted small" style="margin-bottom:14px">Statistiche <b>anonime</b> e aggregate degli ultimi 30 giorni: nessun dato personale, nessun profilo. Le pagine viste includono chi non ha effettuato l’accesso.</p>
      <div id="stat-box"><div class="empty"><div class="spin" style="width:22px;height:22px;margin:0 auto"></div></div></div>`;
  }
  if(cmsTab==='ente'){
    return `<div class="card" style="padding:20px">
      <div class="eyebrow">Dati dell\u2019ente</div>
      <p class="muted small" style="margin:8px 0 16px">Non stanno nel codice: vivono qui, e si cambiano senza un rilascio. Finche\u2019 l\u2019IBAN e\u2019 vuoto, chi sottoscrive un impegno riceve un avviso invece di coordinate sbagliate.</p>
      <div id="ente-form" class="muted small">Carico\u2026</div></div>`;
  }
  if(cmsTab==='mecenati'){
    setTimeout(caricaImpegni,0);
    const f = FORMULE.map(x=>cmsRow(x.nome, euro(x.importo)+' \u00b7 '+x.quanti+' accessi \u00b7 '+esc(x.concede),
      x.attivo===false?'<span class="badge grigio">Spenta</span>':'<span class="badge verde">Attiva</span>',
      `editFormula('${esc(x.id)}')`, `delCont('formula','${esc(x.id)}')`)).join('');
    return add + (f||'<div class="empty">Nessuna formula.</div>') +
      `<div id="mec-avviso"></div>
       <div class="card" style="padding:18px;margin-top:16px"><div class="eyebrow">Impegni sottoscritti</div>
        <p class="muted small" style="margin:8px 0">Il bonifico lo riconosci tu dalla causale: nessun automatismo segna \u201cpagato\u201d al posto tuo. Alla conferma vengono emessi gli accessi, una volta sola.</p>
        <div id="imp-box" class="muted small">Carico\u2026</div></div>`;
  }
  if(cmsTab==='temi'){
    const el = TEMI.map(t=>cmsRow(t.prefisso+' \u2192 '+commNome(t.commissione), t.nota||'\u2014', '',
      `editTema('${esc(t.commissione)}','${esc(t.prefisso)}')`, `delTema('${esc(t.commissione)}','${esc(t.prefisso)}')`)).join('');
    return add + (el||'<div class="empty">Nessuna mappatura.</div>') +
      `<div class="card" style="padding:18px;margin-top:16px">
         <div class="eyebrow">Temi arrivati dall\u2019import ma non ancora assegnati</div>
         <p class="muted small" style="margin:8px 0">L\u2019albero dei temi europei non e\u2019 pubblicato in forma leggibile a macchina: invece di indovinarlo, qui compaiono i codici che i dossier portano davvero. Assegnali e la mappatura si completa da sola.</p>
         <div id="temi-orfani" class="muted small">Carico\u2026</div></div>`;
  }
  if(cmsTab==='livelli') rows = LIVELLI.map(l=>cmsRow(l.nome, regolaInParole(l),
    l.attivo===false?'<span class="badge grigio">Spento</span>':'<span class="badge verde">Attivo</span>',
    `editLivello('${l.id}')`, `delCont('livello','${l.id}')`)).join('');
  if(cmsTab==='video') rows = VOD.map(v=>cmsRow(v.tit, `${v.tipo} · ${v.durata} · ${livello(v.livello).nome}`, pubBadge(v.pubblicato), `editVideo('${v.id}')`, `delCont('video','${v.id}')`)).join('');
  if(cmsTab==='audio') rows = AUDIO.map(a=>cmsRow(a.tit, `${a.autore} · ${a.durata} · ${a.free?'gratuito':'premium'}`, pubBadge(a.pubblicato), `editAudio('${a.id}')`, `delCont('audio','${a.id}')`)).join('');
  if(cmsTab==='testi') rows = TESTI.map(t=>cmsRow(t.tit, `${t.autore} · ${(t.capitoli&&t.capitoli.length)?(t.capitoli.length+' capitoli'):(t.lettura||'testo unico')} · ${t.free?'gratuito':'premium'}`, pubBadge(t.pubblicato), `editTesto('${t.id}')`, `delCont('testo','${t.id}')`)).join('');
  if(cmsTab==='pacchetti') rows = PACCHETTI.map(p=>cmsRow(p.nome, `${(p.corsi||[]).length} corsi · ${euro(p.prezzo)}`, pubBadge(p.pubblicato), `editPacc('${p.id}')`, `delCont('pacchetto','${p.id}')`)).join('');
  if(cmsTab==='campus') rows = CAMPUS.map(c=>cmsRow(c.tit, `${esc(c.data||'data da definire')} · ${euro(c.prezzo)} / ${euro(c.prezzoSoggiorno)} con soggiorno`, pubBadge(c.pubblicato), `editCampus('${c.id}')`, `delCont('campus','${c.id}')`)).join('');
  if(cmsTab==='eventi') rows = EVENTI.map(e=>cmsRow(e.tit, `${esc(e.tipo)} · ${esc(e.periodo||'')} · ${e.accesso==='biglietto'?('biglietto '+euro(e.prezzo)):e.accesso}`, pubBadge(e.pubblicato), `editEvento('${e.id}')`, `delCont('evento','${e.id}')`)).join('');
  return `<div class="card" style="padding:20px">${add}<div class="lesson-list">${rows||'<p class="muted small">Nessun elemento. Usa “Aggiungi”.</p>'}</div></div>`;
}

/* campi riutilizzabili */
function fId(v,dis){ return `<div class="field"><label>Identificativo (codice breve, es. c9)</label><input id="cf-id" value="${esc(v||'')}" ${dis?'disabled':''}></div>`; }
function fSelComm(v){ return `<div class="field"><label>Commissione</label><select id="cf-comm">${COMMISSIONI.map(c=>`<option value="${c.id}" ${v===c.id?'selected':''}>${esc(c.nome)}</option>`).join('')}</select></div>`; }
function fPub(v){ return `<label style="display:flex;gap:8px;align-items:center;font-size:14px;margin:6px 0 14px"><input type="checkbox" id="cf-pub" ${v!==false?'checked':''} style="width:auto"> Pubblicato (visibile agli utenti)</label>`; }
function getId(edit){ return edit || ($('cf-id').value||'').trim(); }

/* CORSI */
function nuovo(t){ if(t==='archiviazione')editS3(); else if(t==='anagrafiche')editAnagrafica(); else if(t==='contratti')editContratto(); else if(t==='rassegna')editFonte(); else if(t==='mecenati')editFormula(); else if(t==='ente')return; else if(t==='temi')editTema(); else if(t==='livelli')editLivello(); else if(t==='corsi')editCorso(); else if(t==='video')editVideo(); else if(t==='audio')editAudio(); else if(t==='testi')editTesto(); else if(t==='pacchetti')editPacc(); else if(t==='campus')editCampus(); else if(t==='eventi')editEvento(); }
function editCorso(id){
  const c = id?CORSI.find(x=>x.id===id):{};
  openModal(`<h3 style="font-size:23px">${id?'Modifica corso':'Nuovo corso'}</h3>`,
    `${fId(c.id, !!id)}
     <div class="field"><label>Titolo</label><input id="cf-tit" value="${esc(c.tit||'')}"></div>
     <div class="field"><label>Formatore (nome mostrato)</label><input id="cf-form" value="${esc(c.form||'')}"></div>
     <div class="field"><label>Account formatore (per l\u2019Area formatore)</label>
       <select id="cf-formid"><option value="">\u2014 nessuno \u2014</option>
       ${ANAGRAFICHE.filter(a=>a.tipo==='formatore'&&a.userId).map(a=>`<option value="${esc(a.userId)}" ${c.formatoreId===a.userId?'selected':''}>${esc(a.nome+' '+a.cognome)}</option>`).join('')}</select></div>
     ${fSelComm(c.comm)}
     <div class="field"><label>Pacchetto (etichetta)</label><input id="cf-pacc" value="${esc(c.pacc||'')}"></div>
     <div class="field"><label>Descrizione</label><textarea id="cf-desc" rows="7">${esc(c.desc||'')}</textarea></div>
     <div class="grid g2"><div class="field"><label>Prezzo (€)</label><input id="cf-prezzo" type="number" value="${c.prezzo||PREZZO_CORSO}"></div>
       <div class="field"><label>Ordine</label><input id="cf-ord" type="number" value="${c.ordine||(CORSI.length+1)}"></div></div>
     ${fPub(c.pubblicato)}
     ${id?`<div class="field"><label>Lezioni del corso</label><button type="button" class="btn small oro" onclick="apriLezioni('${id}')">Gestisci le lezioni</button></div>`:`<p class="muted small">Salva il corso: potrai poi aggiungere le lezioni.</p>`}
     ${allegatiHtml('courses', id)}
     <button class="btn full" onclick="salvaCorso('${id||''}')">Salva corso</button>`);
}
async function salvaCorso(edit){
  const id=getId(edit); if(!id) return toast('Inserisci un identificativo.');
  const o={ id, tit:$('cf-tit').value.trim(), form:$('cf-form').value.trim(), formatoreId:($('cf-formid')&&$('cf-formid').value)||null, comm:$('cf-comm').value,
    pacc:$('cf-pacc').value.trim(), desc:$('cf-desc').value.trim(), prezzo:parseInt($('cf-prezzo').value||PREZZO_CORSO,10),
    ordine:parseInt($('cf-ord').value||0,10), pubblicato:$('cf-pub').checked };
  if(o.tit.length<2) return toast('Il titolo è obbligatorio.');
  try{ await DB.saveCourse(o); await loadCatalog(); closeModal(); go('presidenza'); presTab='contenuti'; setPresTab('contenuti'); toast('Corso salvato.'); }
  catch(e){ toast('Errore: '+(e.message||'')); }
}
/* VIDEO */
function editVideo(id){
  const v = id?VOD.find(x=>x.id===id):{};
  openModal(`<h3 style="font-size:23px">${id?'Modifica video':'Nuovo video'}</h3>`,
    `${fId(v.id, !!id)}
     <div class="field"><label>Titolo</label><input id="cf-tit" value="${esc(v.tit||'')}"></div>
     <div class="grid g2"><div class="field"><label>Tipo</label><input id="cf-tipo" value="${esc(v.tipo||'Documentario')}"></div>
       <div class="field"><label>Durata</label><input id="cf-dur" value="${esc(v.durata||'')}" placeholder="es. 24 min"></div></div>
     ${fSelComm(v.comm)}
     <div class="field"><label>Descrizione</label><textarea id="cf-desc" rows="7">${esc(v.desc||'')}</textarea></div>
     <div class="field"><label>URL del video (facoltativo)</label><input id="cf-url" value="${esc(v.url||'')}" placeholder="https://…"></div>
     ${S3ACC.filter(x=>x.attivo!==false).length?`<div class="s3-box"><div class="eyebrow">Carica il file video su una destinazione S3</div>
       <div class="grid g2" style="margin-top:8px"><div class="field"><label>Destinazione</label><select id="s3-acc">${S3ACC.filter(x=>x.attivo!==false).map(x=>`<option value="${x.id}">${esc(x.nome)} (${esc(x.bucket)})</option>`).join('')}</select></div>
       <div class="field"><label>File video</label><input type="file" id="s3-file" accept="video/*"></div></div>
       <button type="button" class="btn small oro" onclick="caricaVideoS3()">Carica e usa come URL</button>
       <span id="s3-prog" class="muted small" style="margin-left:10px"></span>
       <p class="muted small" style="margin:8px 0 0">Un caricamento firmato regge file fino a 5 GB. Le chiavi non passano mai dal browser.</p></div>`:`<p class="muted small">Per caricare i file video su S3, aggiungi prima una destinazione in <b>Impostazioni \u2192 Video S3</b>.</p>`}
     <div class="grid g2"><div class="field"><label>Ordine</label><input id="cf-ord" type="number" value="${v.ordine||(VOD.length+1)}"></div>
       <div class="field"><label>Livello di accesso</label><select id="cf-liv">${LIVELLI.filter(l=>l.attivo!==false).map(l=>`<option value="${l.id}" ${(v.livello||'civis')===l.id?'selected':''}>${esc(l.nome)}</option>`).join('')}</select></div></div>
     ${fPub(v.pubblicato)}
     ${allegatiHtml('videos', id)}
     <button class="btn full" onclick="salvaVideo('${id||''}')">Salva video</button>`);
}
async function salvaVideo(edit){
  const id=getId(edit); if(!id) return toast('Inserisci un identificativo.');
  const o={ id, tit:$('cf-tit').value.trim(), tipo:$('cf-tipo').value.trim()||'Video', durata:$('cf-dur').value.trim(),
    comm:$('cf-comm').value, desc:$('cf-desc').value.trim(), url:$('cf-url').value.trim(),
    ordine:parseInt($('cf-ord').value||0,10), livello:$('cf-liv').value, pubblicato:$('cf-pub').checked };
  if(o.tit.length<2) return toast('Il titolo è obbligatorio.');
  try{ await DB.saveVideo(o); await loadCatalog(); closeModal(); setPresTab('contenuti'); toast('Video salvato.'); }
  catch(e){ toast('Errore: '+(e.message||'')); }
}
/* STATISTICHE */
function svgBarreOrizz(dati, colore){
  if(!dati || !dati.length) return '<p class="muted small">Nessun dato.</p>';
  const max = Math.max(1, ...dati.map(d=>d.n));
  return `<div class="stat-bars">` + dati.map(d=>{
    const w = Math.round(100*d.n/max);
    return `<div class="sb-row"><span class="sb-lab" title="${esc(d.lab)}">${esc(d.lab)}</span>
      <span class="sb-track"><span class="sb-fill" style="width:${w}%;background:${colore||'var(--oltremare)'}"></span></span>
      <span class="sb-val">${d.n}</span></div>`;
  }).join('') + `</div>`;
}
function svgGiorni(dati){
  if(!dati || !dati.length) return '';
  const W=640, H=140, pad=22, max=Math.max(1, ...dati.map(d=>d.n));
  const bw = (W-pad*2)/dati.length;
  const barre = dati.map((d,i)=>{
    const h = Math.round((H-pad*2) * d.n/max);
    const x = pad + i*bw, y = H-pad-h;
    return `<rect x="${(x+2).toFixed(1)}" y="${y}" width="${(bw-4).toFixed(1)}" height="${h}" rx="2" fill="var(--oltremare)"></rect>`;
  }).join('');
  const etich = dati.map((d,i)=>{ if(dati.length>10 && i%2) return ''; const x=pad+i*bw+bw/2;
    const gg=new Date(d.giorno); const lab=gg.getDate()+'/'+(gg.getMonth()+1);
    return `<text x="${x.toFixed(1)}" y="${H-6}" font-size="9" text-anchor="middle" fill="#8A93A0">${lab}</text>`; }).join('');
  return `<svg viewBox="0 0 ${W} ${H}" class="stat-svg" role="img" aria-label="Visite per giorno">
    <line x1="${pad}" y1="${H-pad}" x2="${W-pad}" y2="${H-pad}" stroke="#E7E1D4"></line>${barre}${etich}</svg>`;
}
async function caricaStatistiche(){
  const box=$('stat-box'); if(!box) return;
  let r=null, giorni=[], disp=[], sez=[], prov=[];
  try{ [r,giorni,disp,sez,prov] = await Promise.all([
    DB.statRiepilogo(), DB.statGiorni(14), DB.statDispositivi(), DB.statSezioni(), DB.statProvenienze()
  ]); }catch(e){}
  if(!box) return;
  const kpi=(v,l)=>`<div class="stat-kpi"><b>${v==null?'\u2013':v}</b><span>${l}</span></div>`;
  const nomeSez = v => (v==='landing'?'Porta d\u2019ingresso':(commNomeSicuro(v)||v));
  box.innerHTML = `
    <div class="stat-kpis">
      ${kpi(r?r.visite_oggi:null,'visite oggi')}
      ${kpi(r?r.visite_7g:null,'ultimi 7 giorni')}
      ${kpi(r?r.visite_30g:null,'ultimi 30 giorni')}
      ${kpi(r?r.sessioni_30g:null,'visitatori (sessioni)')}
      ${kpi(r?r.login_30g:null,'accessi')}
      ${kpi(r?(r.perc_mobile+'%'):null,'da smartphone')}
      ${kpi(r?(r.perc_autenticato+'%'):null,'da utenti autenticati')}
    </div>
    <div class="stat-card"><h4>Visite per giorno</h4>${svgGiorni(giorni)||'<p class="muted small">Nessun dato.</p>'}</div>
    <div class="grid g2">
      <div class="stat-card"><h4>Dispositivo</h4>${svgBarreOrizz(disp.map(d=>({lab:d.dispositivo,n:+d.n})),'var(--oltremare)')}</div>
      <div class="stat-card"><h4>Provenienza (visitatori)</h4>${svgBarreOrizz(prov.map(d=>({lab:d.provenienza,n:+d.n})),'var(--oro)')}</div>
    </div>
    <div class="stat-card"><h4>Sezioni pi\u00f9 viste</h4>${svgBarreOrizz(sez.map(d=>({lab:nomeSez(d.vista),n:+d.n})),'var(--oltremare)')}</div>
    <p class="muted small" style="margin-top:8px">Dati aggregati e anonimi. Il tracciamento rispetta il consenso e \u201cDo Not Track\u201d. Nessun IP, user-agent o identit\u00e0 viene registrato.</p>`;
}
function commNomeSicuro(id){ try{ const c=COMMISSIONI.find(x=>x.id===id); return c?c.nome:null; }catch(e){ return null; } }
/* =====================================================================
   GESTIONALE — Anagrafiche
   ===================================================================== */
function editAnagrafica(id){
  const a = id?ANAGRAFICHE.find(x=>String(x.id)===String(id)):{};
  openModal(`<h3 style="font-size:23px">${id?'Modifica anagrafica':'Nuova anagrafica'}</h3>`,
    `<div class="grid g2"><div class="field"><label>Nome</label><input id="an-nome" value="${esc(a.nome||'')}"></div>
       <div class="field"><label>Cognome</label><input id="an-cogn" value="${esc(a.cognome||'')}"></div></div>
     <div class="field"><label>Tipo (puoi sceglierne pi\u00f9 d\u2019uno)</label>
       <div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:4px">
         ${['formatore','collaboratore','fornitore','ente','altro'].map(t=>`<label style="display:flex;gap:6px;align-items:center;font-size:14px"><input type="checkbox" class="an-tipo-cb" value="${t}" ${(a.tipo||'').split(',').map(x=>x.trim()).includes(t)?'checked':''} style="width:auto"> ${t}</label>`).join('')}
       </div></div>
     <div class="field"><label>Qualifiche (scelta multipla)</label>
       <div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:4px">
         ${['docente','relatore','consulente','tecnico','artista','volontario'].map(q=>`<label style="display:flex;gap:6px;align-items:center;font-size:14px"><input type="checkbox" class="an-qual-cb" value="${q}" ${(a.qualifica||'').split(',').map(x=>x.trim().toLowerCase()).includes(q)?'checked':''} style="width:auto"> ${q}</label>`).join('')}
       </div>
       <input id="an-qual" value="${esc((a.qualifica||'').split(',').map(x=>x.trim()).filter(x=>!['docente','relatore','consulente','tecnico','artista','volontario'].includes(x.toLowerCase())).join(', '))}" placeholder="altre qualifiche libere, separate da virgola (es. Docente di bioetica)" style="margin-top:8px"></div>
     <div class="grid g2"><div class="field"><label>Codice fiscale</label><input id="an-cf" value="${esc(a.cf||'')}"></div>
       <div class="field"><label>Partita IVA</label><input id="an-piva" value="${esc(a.piva||'')}"></div></div>
     <div class="grid g2"><div class="field"><label>Email</label><input id="an-email" value="${esc(a.email||'')}"></div>
       <div class="field"><label>Telefono</label><input id="an-tel" value="${esc(a.tel||'')}"></div></div>
     <div class="field"><label>Indirizzo</label><input id="an-ind" value="${esc(a.indirizzo||'')}"></div>
     <div class="grid g3"><div class="field"><label>Citt\u00e0</label><input id="an-citta" value="${esc(a.citta||'')}"></div>
       <div class="field"><label>CAP</label><input id="an-cap" value="${esc(a.cap||'')}"></div>
       <div class="field"><label>Prov.</label><input id="an-prov" value="${esc(a.prov||'')}"></div></div>
     <div class="field"><label>Account del portale (ID utente, per formatori)</label><input id="an-uid" value="${esc(a.userId||'')}" placeholder="incolla l\u2019ID utente Supabase, facoltativo"></div>
     <div class="field"><label>Note</label><textarea id="an-note" rows="2">${esc(a.note||'')}</textarea></div>
     <label style="display:flex;gap:8px;align-items:center;font-size:14px;margin:4px 0 14px"><input type="checkbox" id="an-att" ${a.attivo!==false?'checked':''} style="width:auto"> Attiva</label>
     <button class="btn full" onclick="salvaAnagrafica('${id||''}')">Salva anagrafica</button>`);
}
async function salvaAnagrafica(id){
  const o={ id:id||undefined, nome:$('an-nome').value.trim(), cognome:$('an-cogn').value.trim(),
    tipo:[].slice.call(document.querySelectorAll('.an-tipo-cb:checked')).map(x=>x.value).join(', '),
    qualifica:[].slice.call(document.querySelectorAll('.an-qual-cb:checked')).map(x=>x.value).concat($('an-qual').value.split(',').map(x=>x.trim()).filter(Boolean)).join(', '), cf:$('an-cf').value.trim().toUpperCase(),
    piva:$('an-piva').value.trim(), email:$('an-email').value.trim(), tel:$('an-tel').value.trim(),
    indirizzo:$('an-ind').value.trim(), citta:$('an-citta').value.trim(), cap:$('an-cap').value.trim(),
    prov:$('an-prov').value.trim().toUpperCase(), userId:$('an-uid').value.trim()||null,
    note:$('an-note').value.trim(), attivo:$('an-att').checked };
  if(!o.nome) return toast('Il nome \u00e8 obbligatorio.');
  try{ await DB.saveAnagrafica(o); await loadCatalog(); closeModal(); setPresTab('contenuti'); toast('Anagrafica salvata.'); }
  catch(e){ toast('Errore: '+(e.message||'')); }
}

/* Diario contatti dell'anagrafica */
async function apriContatti(anagId){
  const a=ANAGRAFICHE.find(x=>String(x.id)===String(anagId)); if(!a) return;
  openModal(`<h3 style="font-size:23px">Contatti \u2014 ${esc((a.nome+' '+a.cognome).trim())}</h3>`,
    `<div id="ctt-list" class="muted small">Carico\u2026</div>
     <div style="border-top:1px solid var(--linea);margin-top:14px;padding-top:14px">
       <div class="grid g2"><div class="field"><label>Data</label><input id="ct-data" type="date" value="${new Date().toISOString().slice(0,10)}"></div>
         <div class="field"><label>Canale</label><select id="ct-can">${['email','telefono','incontro','videochiamata','altro'].map(c=>`<option>${c}</option>`).join('')}</select></div></div>
       <div class="field"><label>Oggetto</label><input id="ct-ogg" placeholder="es. Accordi sul calendario del corso"></div>
       <div class="field"><label>Note</label><textarea id="ct-note" rows="2"></textarea></div>
       <button class="btn full" onclick="salvaContatto('${anagId}')">Registra contatto</button>
     </div>`);
  caricaContattiModal(anagId);
}
async function caricaContattiModal(anagId){
  const box=$('ctt-list'); if(!box) return;
  try{
    const rows = await DB.listContatti(anagId);
    box.innerHTML = rows.length ? rows.map(r=>`<div class="lesson" style="cursor:default">
        <span class="t">${esc(r.oggetto)}<br><span class="d" style="margin:0">${esc(fmtGiorno(r.data))} \u00b7 ${esc(r.canale)}${r.note?' \u00b7 '+esc(r.note):''}</span></span>
        <button class="btn small ghost" style="margin-left:auto" onclick="eliminaContatto('${r.id}','${anagId}')">Elimina</button></div>`).join('')
      : 'Nessun contatto registrato.';
  }catch(e){ box.textContent='Errore nel caricamento.'; }
}
async function salvaContatto(anagId){
  const o={ anagId, data:$('ct-data').value, canale:$('ct-can').value, oggetto:$('ct-ogg').value.trim(), note:$('ct-note').value.trim() };
  if(!o.oggetto) return toast('L\u2019oggetto \u00e8 obbligatorio.');
  try{ await DB.saveContatto(o); $('ct-ogg').value=''; $('ct-note').value=''; caricaContattiModal(anagId); toast('Contatto registrato.'); }
  catch(e){ toast('Errore: '+(e.message||'')); }
}
async function eliminaContatto(id,anagId){
  try{ await DB.deleteContatto(id); caricaContattiModal(anagId); }catch(e){ toast('Errore: '+(e.message||'')); }
}

/* =====================================================================
   GESTIONALE — Contratti: genera, stampa, archivia
   ===================================================================== */
/* Variabili disponibili nei modelli: sostituite alla generazione */
const VARIABILI_CONTRATTO = [
  ['numero','numero progressivo (C-2026-001)'],['titolo','titolo del modello'],
  ['oggetto','oggetto dell\u2019incarico'],['descrizione','attivit\u00e0 previste'],
  ['compenso','compenso in euro'],['data_inizio','data di inizio'],['data_fine','data di fine'],
  ['periodo','\u201cdal \u2026 al \u2026\u201d gi\u00e0 composto'],
  ['nome','nome'],['cognome','cognome'],['nome_completo','nome e cognome'],
  ['codice_fiscale','codice fiscale'],['partita_iva','partita IVA'],['email','email'],
  ['telefono','telefono'],['indirizzo','indirizzo'],['residenza','indirizzo completo'],
  ['qualifica','qualifica'],
  ['ente_denominazione','denominazione dell\u2019ente'],['ente_intestatario','intestatario conto'],
  ['ente_email','email dell\u2019ente'],['ente_iban','IBAN'],['ente_banca','banca'],
  ['oggi','data odierna'],['anno','anno corrente']
];
function sostituisciVariabili(testo, ctx){
  return String(testo||'').replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (tutto, k) => {
    k=k.toLowerCase();
    return (k in ctx && ctx[k]!==null && ctx[k]!==undefined && String(ctx[k])!=='') ? String(ctx[k]) : '__________';
  });
}

function editModello(id){
  const m = id?MODELLI.find(x=>String(x.id)===String(id)):{};
  const legenda = VARIABILI_CONTRATTO.map(([v,d])=>`<button type="button" class="var-chip" title="${esc(d)}" onclick="inserisciVar('${v}')">{{${v}}}</button>`).join('');
  openModal(`<h3 style="font-size:23px">${id?'Modifica modello':'Nuovo modello di contratto'}</h3>`,
    `<div class="field"><label>Titolo del contratto</label><input id="mo-tit" value="${esc(m.titolo||'')}" placeholder="es. Contratto di docenza"></div>
     <div class="field"><label>Testo del contratto</label>
       <textarea id="mo-testo" rows="14" style="font:12.5px/1.6 ui-monospace,monospace">${esc(m.testo||'')}</textarea></div>
     <div class="field"><label>Variabili disponibili (clicca per inserire)</label>
       <div class="var-legend">${legenda}</div></div>
     <div class="grid g2">
       <div class="field"><label>Ordine</label><input id="mo-ord" type="number" value="${m.ordine||((MODELLI.length+1)*10)}"></div>
       <label style="display:flex;gap:8px;align-items:center;font-size:14px;margin-top:24px"><input type="checkbox" id="mo-att" ${m.attivo!==false?'checked':''} style="width:auto"> Attivo</label></div>
     <button class="btn full" onclick="salvaModello('${id||''}')">Salva modello</button>`);
}
function inserisciVar(v){
  const t=$('mo-testo'); if(!t) return;
  const ins='{{'+v+'}}';
  const a=t.selectionStart||t.value.length, b=t.selectionEnd||a;
  t.value = t.value.slice(0,a)+ins+t.value.slice(b);
  t.focus(); t.selectionStart=t.selectionEnd=a+ins.length;
}
async function salvaModello(id){
  const o={ id:id||undefined, titolo:$('mo-tit').value.trim(), testo:$('mo-testo').value,
    ordine:parseInt($('mo-ord').value||0,10), attivo:$('mo-att').checked };
  if(!o.titolo) return toast('Il titolo \u00e8 obbligatorio.');
  if(!o.testo.trim()) return toast('Il testo del contratto \u00e8 vuoto.');
  try{ await DB.saveModello(o); await loadCatalog(); closeModal(); setPresTab('contenuti'); toast('Modello salvato.'); }
  catch(e){ toast('Errore: '+(e.message||'')); }
}

function editContratto(){
  const persone = ANAGRAFICHE.filter(a=>a.attivo!==false);
  if(!persone.length) return toast('Prima crea un\u2019anagrafica nella scheda Anagrafiche.');
  const attivi = MODELLI.filter(m=>m.attivo!==false);
  if(!attivi.length) return toast('Prima crea (o riattiva) un modello di contratto.');
  openModal(`<h3 style="font-size:23px">Genera contratto</h3>`,
    `<div class="field"><label>Modello</label><select id="co-mod">
       ${attivi.map(m=>`<option value="${m.id}">${esc(m.titolo)}</option>`).join('')}</select></div>
     <div class="field"><label>Incaricato/a (dalle anagrafiche)</label><select id="co-anag">
       ${persone.map(a=>`<option value="${a.id}">${esc((a.nome+' '+a.cognome).trim())}${a.qualifica?' \u2014 '+esc(a.qualifica):''}</option>`).join('')}</select></div>
     <div class="grid g2"><div class="field"><label>Tipo</label><select id="co-tipo">
         ${['docenza','collaborazione','consulenza','altro'].map(t=>`<option>${t}</option>`).join('')}</select></div>
       <div class="field"><label>Compenso complessivo (\u20ac)</label><input id="co-comp" type="number" min="0" step="0.01" value="0"></div></div>
     <div class="field"><label>Oggetto dell\u2019incarico</label><input id="co-ogg" placeholder="es. Docenza del corso \u201cEtica dell\u2019IA\u201d"></div>
     <div class="field"><label>Descrizione dell\u2019attivit\u00e0</label><textarea id="co-desc" rows="3" placeholder="lezioni, materiali, presenze richieste\u2026"></textarea></div>
     <div class="grid g2"><div class="field"><label>Inizio</label><input id="co-in" type="date"></div>
       <div class="field"><label>Fine</label><input id="co-fin" type="date"></div></div>
     <div class="field"><label>Note interne (non entrano nel contratto)</label><input id="co-note"></div>
     <p class="muted small" style="margin:2px 0 12px">Le variabili del modello vengono sostituite con questi dati; le variabili senza valore diventano <code>__________</code> da completare a penna. Modello generico: <b>da far verificare a un consulente</b> prima della firma.</p>
     <button class="btn full" onclick="salvaContratto()">Genera e salva</button>`);
}
async function salvaContratto(){
  const a=ANAGRAFICHE.find(x=>String(x.id)===String($('co-anag').value)); if(!a) return toast('Scegli un\u2019anagrafica.');
  const m=MODELLI.find(x=>String(x.id)===String($('co-mod').value)); if(!m) return toast('Scegli un modello.');
  const d={ tipo:$('co-tipo').value, oggetto:$('co-ogg').value.trim(), desc:$('co-desc').value.trim(),
    compenso:parseFloat($('co-comp').value||'0'), inizio:$('co-in').value||null, fine:$('co-fin').value||null,
    note:$('co-note').value.trim() };
  if(!d.oggetto) return toast('L\u2019oggetto dell\u2019incarico \u00e8 obbligatorio.');
  try{
    const num = await DB.numeroContratto();
    let ente={}; try{ ente = (await DB.datiEnte())||{}; }catch(e){}
    const residenza=[a.indirizzo,[a.cap,a.citta,a.prov?'('+a.prov+')':''].filter(Boolean).join(' ')].filter(Boolean).join(', ');
    const ctx = {
      numero:num, titolo:m.titolo, oggetto:d.oggetto, descrizione:d.desc,
      compenso: d.compenso?euro(d.compenso):'', data_inizio:d.inizio?fmtGiorno(d.inizio):'', data_fine:d.fine?fmtGiorno(d.fine):'',
      periodo:(d.inizio||d.fine)?`dal ${d.inizio?fmtGiorno(d.inizio):'\u2014'} al ${d.fine?fmtGiorno(d.fine):'\u2014'}`:'da concordare per iscritto fra le parti',
      nome:a.nome, cognome:a.cognome, nome_completo:(a.nome+' '+a.cognome).trim(),
      codice_fiscale:a.cf, partita_iva:a.piva, email:a.email, telefono:a.tel,
      indirizzo:a.indirizzo, residenza, qualifica:a.qualifica,
      ente_denominazione:ente.ente_denominazione, ente_intestatario:ente.ente_intestatario,
      ente_email:ente.ente_email, ente_iban:ente.ente_iban, ente_banca:ente.ente_banca,
      oggi:fmtGiorno(new Date().toISOString()), anno:String(new Date().getFullYear())
    };
    const testo = sostituisciVariabili(m.testo, ctx);
    await DB.saveContratto({ numero:num, titolo:m.titolo, anagId:a.id, tipo:d.tipo, oggetto:d.oggetto, desc:d.desc,
      compenso:d.compenso, inizio:d.inizio, fine:d.fine, stato:'bozza', testo, note:d.note });
    await loadCatalog(); closeModal(); setPresTab('contenuti'); toast('Contratto '+num+' generato.');
  }catch(e){ toast('Errore: '+(e.message||'')); }
}
function leggiContratto(id){
  const c=CONTRATTI.find(x=>String(x.id)===String(id)); if(!c) return;
  openModal(`<h3 style="font-size:23px">${esc(c.numero)}</h3>`,
    `<pre style="white-space:pre-wrap;font:13.5px/1.65 Georgia,serif;background:var(--avorio);border:1px solid var(--linea);border-radius:10px;padding:16px;max-height:56vh;overflow:auto">${esc(c.testo||'(testo non disponibile)')}</pre>
     <div class="lp-cta" style="margin-top:14px"><button class="btn oro" onclick="stampaContratto('${c.id}')">Stampa</button>
       <button class="lp-btn2" onclick="closeModal()">Chiudi</button></div>`);
}
function stampaContratto(id){
  const c=CONTRATTI.find(x=>String(x.id)===String(id)); if(!c) return;
  let w=null; try{ w=window.open('','_blank','width=820,height=940'); }catch(e){}
  if(!w){ toast('Consenti le finestre pop-up per stampare.'); return; }
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(c.numero)}</title>
    <style>body{font:14px/1.7 Georgia,'Times New Roman',serif;color:#1a1a1a;max-width:700px;margin:48px auto;padding:0 24px}
    pre{white-space:pre-wrap;font:inherit;margin:0}@media print{body{margin:12mm auto}}</style></head>
    <body><pre>${esc(c.testo)}</pre><script>window.onload=function(){window.print()}<\/script></body></html>`);
  w.document.close();
}
async function firmaContratto(id){
  try{ await DB.statoContratto(id,'firmato', new Date().toISOString().slice(0,10)); await loadCatalog(); setPresTab('contenuti'); toast('Contratto segnato come firmato.'); }
  catch(e){ toast('Errore: '+(e.message||'')); }
}
async function archiviaContratto(id){
  const c=CONTRATTI.find(x=>String(x.id)===String(id));
  try{ await DB.statoContratto(id,'archiviato', c&&c.firmatoIl||null); await loadCatalog(); setPresTab('contenuti'); toast('Contratto archiviato.'); }
  catch(e){ toast('Errore: '+(e.message||'')); }
}

/* =====================================================================
   AREA FORMATORE — i propri corsi e i propri contratti
   ===================================================================== */
function renderFormatore(){
  const miei = (CORSI||[]).filter(c=>c.formatoreId===io.id);
  const corsi = miei.length ? miei.map(c=>`<div class="lesson" style="cursor:default">
      <span class="t">${esc(c.tit)}${c.pubblicato===false?' <span class="badge grigio">bozza</span>':''}<br>
        <span class="d" style="margin:0">${esc(c.desc||'')}</span></span>
      <button class="btn small ghost" style="margin-left:auto" onclick="editCorsoDocente('${c.id}')">Modifica</button></div>`).join('')
    : '<div class="empty">Nessun corso ti \u00e8 ancora stato assegnato dalla Presidenza.</div>';
  const contr = (CONTRATTI||[]).length ? CONTRATTI.map(c=>`<div class="lesson" style="cursor:default">
      <span class="t"><b>${esc(c.numero)}</b> \u00b7 ${esc(c.oggetto)}<br>
        <span class="d" style="margin:0">${esc(c.stato)}${c.compenso?' \u00b7 '+euro(c.compenso):''}${c.firmatoIl?' \u00b7 firmato il '+esc(fmtGiorno(c.firmatoIl)):''}</span></span>
      <span style="margin-left:auto;display:flex;gap:6px"><button class="btn small ghost" onclick="leggiContratto('${c.id}')">Leggi</button>
        <button class="btn small ghost" onclick="stampaContratto('${c.id}')">Stampa</button></span></div>`).join('')
    : '<div class="empty">Nessun contratto a tuo nome.</div>';
  return `<div class="page-head"><div class="eyebrow">Area formatore</div><h1>Benvenuto, ${esc(io.nome||'')}</h1>
      <p class="lead">Da qui gestisci i corsi che ti sono stati affidati e consulti i tuoi contratti.</p></div>
    <div class="card" style="padding:18px;margin-bottom:16px"><div class="eyebrow">I miei corsi</div><div style="margin-top:10px">${corsi}</div></div>
    <div class="card" style="padding:18px"><div class="eyebrow">I miei contratti</div><div style="margin-top:10px">${contr}</div></div>`;
}
function editCorsoDocente(id){
  const c=(CORSI||[]).find(x=>x.id===id); if(!c||c.formatoreId!==io.id) return;
  openModal(`<h3 style="font-size:23px">Modifica \u2014 ${esc(c.tit)}</h3>`,
    `<div class="field"><label>Titolo</label><input id="fd-tit" value="${esc(c.tit)}"></div>
     <div class="field"><label>Descrizione</label><textarea id="fd-desc" rows="4">${esc(c.desc||'')}</textarea></div>
     <p class="muted small" style="margin:2px 0 12px">Prezzo, pubblicazione e assegnazione restano alla Presidenza.</p>
     <div class="field"><label>Lezioni del corso</label><button type="button" class="btn small oro" onclick="apriLezioni('${c.id}')">Gestisci le lezioni</button></div>
     <button class="btn full" onclick="salvaCorsoDocente('${c.id}')">Salva</button>`);
}
async function salvaCorsoDocente(id){
  const o={ tit:$('fd-tit').value.trim(), desc:$('fd-desc').value.trim() };
  if(o.tit.length<2) return toast('Il titolo \u00e8 obbligatorio.');
  try{ await DB.saveCorsoDocente(id,o); await loadCatalog(); closeModal(); go('formatore'); toast('Corso aggiornato.'); }
  catch(e){ toast('Errore: '+(e.message||'')); }
}

/* =====================================================================
   ALLEGATI dei contenuti (bucket Storage "allegati")
   ===================================================================== */
function allegatiHtml(tabella, id){
  if(!id) return `<p class="muted small" style="margin:4px 0 12px">Salva prima l\u2019elemento: potrai poi riaprirlo per aggiungere gli allegati.</p>`;
  setTimeout(()=>caricaAllegati(tabella,id),0);
  return `<div class="field"><label>Allegati</label><div id="alg-box" class="muted small">Carico\u2026</div>
    <input type="file" id="alg-file" style="margin-top:6px">
    <input id="alg-desc" placeholder="descrizione dell\u2019allegato (facoltativa)" style="margin-top:6px">
    <button type="button" class="btn small ghost" style="margin-top:6px" onclick="aggiungiAllegato('${tabella}','${id}')">Aggiungi allegato</button></div>`;
}
async function caricaAllegati(tabella,id){
  const box=$('alg-box'); if(!box) return;
  try{
    const rows=await DB.listAllegati(tabella,id);
    box.innerHTML = rows.length ? rows.map(r=>`<div class="alg-item"><a href="${esc(r.url)}" target="_blank" rel="noopener" download>${esc(r.nome)}</a>${r.desc?` <span class="muted small">\u2014 ${esc(r.desc)}</span>`:''}
        <span class="muted small">${r.dim?Math.round(r.dim/1024)+' KB':''}</span>
        <button type="button" class="linkbtn" onclick="eliminaAllegato('${r.id}','${tabella}','${id}','${esc(r.url)}')">togli</button></div>`).join('')
      : 'Nessun allegato.';
  }catch(e){ box.textContent='Allegati non disponibili (applica la migrazione 0017).'; }
}
async function aggiungiAllegato(tabella,id){
  const inp=$('alg-file'); const f=inp&&inp.files&&inp.files[0];
  if(!f) return toast('Scegli prima un file.');
  try{ const dsc=($('alg-desc')&&$('alg-desc').value.trim())||''; await DB.uploadAllegato(tabella,id,f,dsc); inp.value=''; if($('alg-desc'))$('alg-desc').value=''; caricaAllegati(tabella,id); toast('Allegato caricato.'); }
  catch(e){ toast('Errore: '+(e.message||'')); }
}
async function eliminaAllegato(aid,tabella,id,url){
  try{ await DB.deleteAllegato(aid,url); caricaAllegati(tabella,id); }catch(e){ toast('Errore: '+(e.message||'')); }
}

/* =====================================================================
   VIDEO -> caricamento su destinazione S3 (URL firmato dalla funzione)
   ===================================================================== */
function s3Box(accept, tabella, recId){
  if(!S3ACC.filter(x=>x.attivo!==false).length) return `<p class="muted small">Per caricare su S3 aggiungi una destinazione in <b>Impostazioni \u2192 Video S3</b>.</p>`;
  if(!recId) return `<p class="muted small" style="margin:4px 0 12px">Salva prima l\u2019elemento: potrai poi riaprirlo per caricare il file su S3.</p>`;
  return `<div class="s3-box"><div class="eyebrow">Carica il file su una destinazione S3</div>
    <div class="grid g2" style="margin-top:8px"><div class="field"><label>Destinazione</label><select id="s3-acc">${S3ACC.filter(x=>x.attivo!==false).map(x=>`<option value="${x.id}">${esc(x.nome)} (${esc(x.bucket)})</option>`).join('')}</select></div>
    <div class="field"><label>File</label><input type="file" id="s3-file" accept="${accept}"></div></div>
    <button type="button" class="btn small oro" onclick="caricaS3('','${tabella}','${recId}')">Carica su S3 (diventa allegato)</button>
    <span id="s3-prog" class="muted small" style="margin-left:10px"></span></div>`;
}
async function caricaS3(targetId, tabella, recId){
  const accId=$('s3-acc')&&$('s3-acc').value; const f=$('s3-file')&&$('s3-file').files&&$('s3-file').files[0];
  if(!accId) return toast('Scegli una destinazione.');
  if(!f) return toast('Scegli il file.');
  const prog=$('s3-prog');
  try{
    prog.textContent='Preparo il caricamento\u2026';
    const p = await DB.presignS3(accId, f.name, f.type||'application/octet-stream');
    if(!p.demo){
      await new Promise((res,rej)=>{
        const x=new XMLHttpRequest(); x.open('PUT', p.upload_url);
        x.setRequestHeader('Content-Type', p.content_type||f.type||'application/octet-stream');
        x.upload.onprogress=e=>{ if(e.lengthComputable) prog.textContent='Carico\u2026 '+Math.round(e.loaded/e.total*100)+'%'; };
        x.onload=()=> (x.status>=200&&x.status<300)?res():rej(new Error('HTTP '+x.status));
        x.onerror=()=>rej(new Error('rete/CORS: configura il CORS del bucket per questo dominio'));
        x.send(f);
      });
    }
    if(targetId && $(targetId)){ $(targetId).value=p.public_url; prog.textContent=(p.demo?'(demo) ':'')+'URL impostato \u2713'; }
    else { await DB.saveAllegatoEsterno(tabella, recId, f.name, p.public_url, f.size||0, ($('alg-desc')&&$('alg-desc').value.trim())||''); if($('alg-desc'))$('alg-desc').value=''; caricaAllegati(tabella, recId); prog.textContent=(p.demo?'(demo) ':'')+'Caricato: \u00e8 fra gli allegati \u2713'; }
    toast(p.demo?'In demo il caricamento \u00e8 simulato.':'File caricato su S3.');
  }catch(e){ prog.textContent=''; toast('Errore: '+(e.message||'')); }
}
async function caricaVideoS3(){ return caricaS3('cf-url','',''); }


/* =====================================================================
   UTENTI e PAGAMENTI (amministrazione)
   ===================================================================== */
async function caricaUtenti(){
  const box=$('ut-box'); if(!box) return;
  try{ UTENTI_ADMIN = await DB.listUtenti(($('ut-q')&&$('ut-q').value.trim())||''); }
  catch(e){ box.textContent='Errore nel caricamento.'; return; }
  const B={presidenza:'oro',formatore:'blu',delegato:'verde',iscritto:'grigio'};
  box.innerHTML = UTENTI_ADMIN.length ? UTENTI_ADMIN.map(u=>`<div class="lesson" style="cursor:default">
      <span class="t">${esc(u.nome||'(senza nome)')}<br><span class="d" style="margin:0">${esc(u.membership)}${u.scadenza?' fino al '+esc(fmtGiorno(u.scadenza)):''}${u.seggio?' \u00b7 seggio '+u.seggio:''}</span></span>
      <span style="margin-left:auto;display:flex;gap:8px;align-items:center">
        <span class="badge ${B[u.ruolo]||'grigio'}">${esc(u.ruolo)}</span>
        <button class="btn small ghost" onclick="editUtente('${u.id}')">Modifica</button></span></div>`).join('')
    : '<div class="empty">Nessun utente trovato.</div>';
}
function editUtente(id){
  const u=UTENTI_ADMIN.find(x=>x.id===id); if(!u) return;
  openModal(`<h3 style="font-size:23px">${esc(u.nome||'Utente')}</h3>`,
    `<div class="grid g2">
       <div class="field"><label>Ruolo</label><select id="ut-ruolo">${['iscritto','delegato','formatore','presidenza'].map(r=>`<option ${u.ruolo===r?'selected':''}>${r}</option>`).join('')}</select></div>
       <div class="field"><label>Membership</label><select id="ut-mem">${['free','civis','academicus'].map(m=>`<option ${u.membership===m?'selected':''}>${m}</option>`).join('')}</select></div></div>
     <div class="field"><label>Valida fino al (per attivazioni manuali, es. bonifico)</label><input id="ut-scad" type="date" value="${(u.scadenza||'').slice(0,10)}"></div>
     <p class="muted small" style="margin:2px 0 12px">Usalo per attivare o prorogare una membership pagata fuori da Stripe. Il ruolo \u201cformatore\u201d attiva l\u2019Area formatore.</p>
     <button class="btn full" onclick="salvaUtente('${u.id}')">Salva</button>`);
}
async function salvaUtente(id){
  try{ await DB.saveUtente(id,{ ruolo:$('ut-ruolo').value, membership:$('ut-mem').value, scadenza:$('ut-scad').value||null });
    closeModal(); caricaUtenti(); toast('Utente aggiornato.'); }
  catch(e){ toast('Errore: '+(e.message||'')); }
}
async function caricaPagamenti(){
  const box=$('pg-box'); if(!box) return;
  try{
    const rows=await DB.listPagamenti();
    let nomi={}; try{ (await DB.listUtenti('')).forEach(u=>nomi[u.id]=u.nome); }catch(e){}
    box.innerHTML = rows.length ? rows.map(r=>`<div class="lesson" style="cursor:default">
        <span class="t">${esc(nomi[r.profileId]||r.profileId||'?')}<br><span class="d" style="margin:0">${esc(r.kind)} \u00b7 ${esc(r.ref)} \u00b7 ${esc(fmtGiorno(r.creato))}</span></span>
        <b style="margin-left:auto">${((r.amount||0)/100).toFixed(2).replace('.',',')} \u20ac</b></div>`).join('')
      : '<div class="empty">Nessun pagamento registrato.</div>';
  }catch(e){ box.textContent='Errore nel caricamento (serve la migrazione 0017).'; }
}

/* =====================================================================
   ARCHIVIAZIONE — destinazioni S3 (piu' account)
   ===================================================================== */
function editS3(id){
  // Nuova destinazione: precompilata per Cloudflare R2 (bucket verificato: pacifica-portale)
  const a=id?S3ACC.find(x=>String(x.id)===String(id)):{ nome:'Cloudflare R2 \u2014 video', region:'auto', bucket:'pacifica-portale' };
  openModal(`<h3 style="font-size:23px">${id?'Modifica destinazione':'Nuova destinazione S3'}</h3>`,
    `<div class="field"><label>Nome (per riconoscerla)</label><input id="s3-nome" value="${esc(a.nome||'')}" placeholder="es. Cloudflare R2 \\u2014 video 2026"></div>
     <div class="field"><label>Endpoint</label><input id="s3-end" value="${esc(a.endpoint||'')}" placeholder="https://<account>.r2.cloudflarestorage.com"><small class="muted" style="display:block;margin-top:4px">Lo trovi nella STESSA schermata delle chiavi: R2 \u2192 Manage API tokens \u2192 crea il token \u2192 copia \u201cendpoint S3\u201d, Access Key ID e Secret.</small></div>
     <div class="grid g2"><div class="field"><label>Region</label><input id="s3-reg" value="${esc(a.region||'auto')}"></div>
       <div class="field"><label>Bucket</label><input id="s3-buc" value="${esc(a.bucket||'')}"></div></div>
     <div class="grid g2"><div class="field"><label>Access Key ID</label><input id="s3-ak" value="${esc(a.accessKeyId||'')}"></div>
       <div class="field"><label>Secret Access Key</label><input id="s3-sk" type="password" value="${esc(a.secretKey||'')}"></div></div>
     <div class="field"><label>URL pubblico di base (CDN o bucket pubblico)</label><input id="s3-pub" value="${esc(a.baseUrl||'')}" placeholder="https://video.tuodominio.it"></div>
     <label style="display:flex;gap:8px;align-items:center;font-size:14px;margin:4px 0 12px"><input type="checkbox" id="s3-att" ${a.attivo!==false?'checked':''} style="width:auto"> Attiva</label>
     <p class="muted small" style="margin:0 0 12px">Compatibile con AWS S3, Cloudflare R2, Backblaze B2, Wasabi. Le chiavi restano nel database (visibili solo alla Presidenza) e la firma avviene sul server.</p>
     <button class="btn full" onclick="salvaS3('${id||''}')">Salva destinazione</button>`);
}
async function salvaS3(id){
  const o={ id:id||undefined, nome:$('s3-nome').value.trim(), endpoint:$('s3-end').value.trim(),
    region:$('s3-reg').value.trim()||'auto', bucket:$('s3-buc').value.trim(),
    accessKeyId:$('s3-ak').value.trim(), secretKey:$('s3-sk').value.trim(),
    baseUrl:$('s3-pub').value.trim(), attivo:$('s3-att').checked };
  if(!o.nome||!o.endpoint||!o.bucket||!o.accessKeyId||!o.secretKey) return toast('Compila nome, endpoint, bucket e le due chiavi.');
  try{ await DB.saveS3(o); await loadCatalog(); closeModal(); setPresTab('contenuti'); toast('Destinazione salvata.'); }
  catch(e){ toast('Errore: '+(e.message||'')); }
}

/* =====================================================================
   LEZIONI DEI CORSI — gestione (presidenza e formatore del corso)
   ===================================================================== */
let BLOCCHI_EDIT=null;
function blocchiCarica(){
  BLOCCHI_EDIT={};
  ZONE_BLOCCHI.forEach(([z])=>{ let a=[]; try{ a=JSON.parse(TESTI_PAG['blocchi:'+z]||'[]'); }catch(_e){ a=[]; }
    BLOCCHI_EDIT[z]=Array.isArray(a)?a:[]; });
}
function leggiBlocchiDalDom(){
  if(!BLOCCHI_EDIT) return;
  ZONE_BLOCCHI.forEach(([z],zi)=>{
    (BLOCCHI_EDIT[z]||[]).forEach((b,i)=>{
      const g=c=>{ const el=$('bk-'+zi+'-'+i+'-'+c); return el ? (el.type==='checkbox'?el.checked:el.value) : undefined; };
      if(b.tipo==='testo'){ b.testo=g('testo')||''; b.al=g('al')||''; b.di=g('di')||''; b.cl=g('cl')||''; b.gr=!!g('gr'); b.cv=!!g('cv'); }
      if(b.tipo==='immagine'){ b.url=g('url')||''; b.larg=g('larg')||''; b.al=g('al')||''; }
      if(b.tipo==='tasto'){ b.testo=g('testo')||''; b.link=g('link')||''; b.st=g('st')||''; b.al=g('al')||''; }
    });
  });
}
function aggiungiBlocco(zi,tipo){
  leggiBlocchiDalDom();
  const z=ZONE_BLOCCHI[zi][0];
  const b= tipo==='immagine' ? {tipo:'immagine',url:'',larg:'60',al:''} :
           tipo==='tasto' ? {tipo:'tasto',testo:'',link:'',st:'',al:''} :
           {tipo:'testo',testo:'',al:'',di:'',cl:'',gr:false,cv:false};
  (BLOCCHI_EDIT[z]=BLOCCHI_EDIT[z]||[]).push(b);
  setCmsTab('pagine');
}
function rimuoviBlocco(zi,i){
  leggiBlocchiDalDom();
  const z=ZONE_BLOCCHI[zi][0];
  BLOCCHI_EDIT[z].splice(i,1);
  setCmsTab('pagine');
}
function spostaBlocco(zi,i,dir){
  leggiBlocchiDalDom();
  const z=ZONE_BLOCCHI[zi][0], a=BLOCCHI_EDIT[z], j=i+dir;
  if(j<0||j>=a.length) return;
  const t=a[i]; a[i]=a[j]; a[j]=t;
  setCmsTab('pagine');
}
function blocchiEditorHtml(){
  if(!BLOCCHI_EDIT) blocchiCarica();
  const selB=(id,ops,cur)=>`<select id="${id}">`+ops.map(o=>`<option value="${o[0]}"${o[0]===(cur||'')?' selected':''}>${o[1]}</option>`).join('')+`</select>`;
  const OPS_AL=[['','Posizione: centro'],['left','A sinistra'],['right','A destra']];
  const zone = ZONE_BLOCCHI.map(([z,titolo],zi)=>{
    const righe=(BLOCCHI_EDIT[z]||[]).map((b,i)=>{
      const pre=`bk-${zi}-${i}-`;
      const nav=`<span class="bk-nav"><button class="linkbtn" title="Su" onclick="spostaBlocco(${zi},${i},-1)">\u2191</button><button class="linkbtn" title="Gi\u00f9" onclick="spostaBlocco(${zi},${i},1)">\u2193</button><button class="linkbtn" title="Rimuovi" onclick="rimuoviBlocco(${zi},${i})">\u2715 rimuovi</button></span>`;
      if(b.tipo==='immagine') return `<div class="bk-riga"><div class="bk-testa"><b>Immagine</b>${nav}</div>
        <input id="${pre}url" placeholder="Indirizzo dell\u2019immagine (https\u2026 oppure img/\u2026)" value="${esc(b.url||'')}">
        <div class="ts-stile">${selB(pre+'larg',[['25','Larghezza: 25%'],['40','40%'],['60','60%'],['80','80%'],['100','100%']],String(b.larg||'60'))}${selB(pre+'al',OPS_AL,b.al)}</div></div>`;
      if(b.tipo==='tasto') return `<div class="bk-riga"><div class="bk-testa"><b>Tasto</b>${nav}</div>
        <input id="${pre}testo" placeholder="Scritta del tasto" value="${esc(b.testo||'')}">
        <input id="${pre}link" placeholder="Collegamento (https\u2026 oppure docs/\u2026)" value="${esc(b.link||'')}" style="margin-top:6px">
        <div class="ts-stile">${selB(pre+'st',[['','Aspetto: blu'],['oro','Oro'],['contorno','A contorno']],b.st)}${selB(pre+'al',OPS_AL,b.al)}</div></div>`;
      return `<div class="bk-riga"><div class="bk-testa"><b>Riga di testo</b>${nav}</div>
        <input id="${pre}testo" placeholder="Il testo da mostrare" value="${esc(b.testo||'')}">
        <div class="ts-stile">${selB(pre+'al',[['','Allineamento: predefinito'],['left','A sinistra'],['center','Centrato'],['right','A destra']],b.al)}${selB(pre+'di',[['','Dimensione: predefinita'],['85','Pi\u00f9 piccolo'],['115','Un po\u2019 pi\u00f9 grande'],['130','Grande'],['150','Molto grande']],b.di)}${selB(pre+'cl',[['','Colore: predefinito'],['inchiostro','Inchiostro'],['oltremare','Blu oltremare'],['oro','Oro'],['grigio','Grigio'],['bianco','Bianco']],b.cl)}
        <label class="ts-ck"><input type="checkbox" id="${pre}gr"${b.gr?' checked':''}> Grassetto</label>
        <label class="ts-ck"><input type="checkbox" id="${pre}cv"${b.cv?' checked':''}> Corsivo</label></div></div>`;
    }).join('');
    const add=`<div class="bk-add"><button class="linkbtn" onclick="aggiungiBlocco(${zi},'testo')">+ Riga di testo</button><button class="linkbtn" onclick="aggiungiBlocco(${zi},'immagine')">+ Immagine</button><button class="linkbtn" onclick="aggiungiBlocco(${zi},'tasto')">+ Tasto</button></div>`;
    return `<div class="eyebrow" style="margin:18px 0 4px">${esc(titolo)}</div>${righe||'<div class="muted small">Nessun elemento aggiunto.</div>'}${add}`;
  }).join('');
  return `<div style="margin-top:26px;border-top:1px solid var(--linea);padding-top:14px">
    <div class="eyebrow">Elementi aggiuntivi delle sezioni</div>
    <p class="muted small" style="margin-top:6px">Qui aggiungi, in coda a ogni sezione, righe di testo, immagini (da indirizzo web o del sito) e tasti con collegamento. Le frecce ordinano, \u2715 rimuove. Ricorda di premere \u00abSalva i testi\u00bb.</p>
    ${zone}
  </div>`;
}
async function salvaTestiPagine(){
  const upsert=[], cancella=[];
  ELENCO_TESTI.forEach(([k,label,def],i)=>{
    const el=$('tp-'+i); if(!el) return;
    const v=el.value.trim();
    if(v && v!==def) upsert.push({ chiave:k, valore:v });
    else if(TESTI_PAG[k]!==undefined) cancella.push(k);
    const o={};
    const al=$('tp-al-'+i), ca=$('tp-ca-'+i), di=$('tp-di-'+i), cl=$('tp-cl-'+i), gr=$('tp-gr-'+i), cv=$('tp-cv-'+i);
    if(al && al.value) o.al=al.value;
    if(ca && ca.value) o.ca=ca.value;
    if(di && di.value) o.di=di.value;
    if(cl && cl.value) o.cl=cl.value;
    if(gr && gr.checked) o.gr=1;
    if(cv && cv.checked) o.cv=1;
    if(Object.keys(o).length) upsert.push({ chiave:'stile:'+k, valore:JSON.stringify(o) });
    else if(TESTI_PAG['stile:'+k]!==undefined) cancella.push('stile:'+k);
  });
  leggiBlocchiDalDom();
  ZONE_BLOCCHI.forEach(([z])=>{
    const validi=((BLOCCHI_EDIT&&BLOCCHI_EDIT[z])||[]).filter(b=>{
      if(!b) return false;
      if(b.tipo==='testo') return (b.testo||'').trim()!=='';
      if(b.tipo==='immagine') return (b.url||'').trim()!=='';
      if(b.tipo==='tasto') return (b.testo||'').trim()!=='' && (b.link||'').trim()!=='';
      return false;
    });
    if(validi.length) upsert.push({ chiave:'blocchi:'+z, valore:JSON.stringify(validi) });
    else if(TESTI_PAG['blocchi:'+z]!==undefined) cancella.push('blocchi:'+z);
  });
  try{
    if(upsert.length) await DB.saveTesti(upsert);
    for(const k of cancella) await DB.deleteTesto(k);
    upsert.forEach(r=>{ TESTI_PAG[r.chiave]=r.valore; });
    cancella.forEach(k=>{ delete TESTI_PAG[k]; });
    BLOCCHI_EDIT=null;
    setCmsTab('pagine');
    toast('Testi salvati: il sito pubblico li usa da subito.');
  }catch(e){ toast('Errore: '+(e.message||'')); }
}
async function apriLezioni(courseId){
  openModal(`<h3 style="font-size:23px">Lezioni del corso</h3>`,
    `<div id="lz-list" class="muted small">Carico\u2026</div>
     <button class="btn small" style="margin-top:12px" onclick="editLezione('${courseId}')">+ Lezione</button>`);
  caricaLezioniAdmin(courseId);
}
async function caricaLezioniAdmin(courseId){
  const box=$('lz-list'); if(!box) return;
  try{ LEZ_ADMIN = await DB.listLezioni(courseId); }
  catch(e){ box.textContent='Lezioni non disponibili (applica la migrazione 0018).'; return; }
  delete LEZ_CACHE[courseId];
  box.innerHTML = LEZ_ADMIN.length ? LEZ_ADMIN.map(l=>`<div class="lesson" style="cursor:default">
      <span class="t">${l.ordine}. ${esc(l.tit)}${l.pubblicata===false?' <span class="badge grigio">bozza</span>':''}<br>
        <span class="d" style="margin:0">${l.video?'\u25b6 video':''}${(l.quiz||[]).length?' \u00b7 quiz ('+l.quiz.length+' domande)':''}</span></span>
      <span style="margin-left:auto;display:flex;gap:6px">
        <button class="btn small ghost" onclick="editLezione('${courseId}','${l.id}')">Modifica</button>
        <button class="btn small ghost" style="color:var(--porpora)" onclick="eliminaLezione('${courseId}','${l.id}')">Elimina</button></span></div>`).join('')
    : 'Nessuna lezione. Aggiungi la prima.';
}
function qzRispostaRow(t, ok){
  return `<div class="qz-r" style="display:flex;gap:8px;align-items:center;margin-top:6px">
    <input class="qz-t" value="${esc(t||'')}" placeholder="testo della risposta" style="flex:1">
    <label class="muted small" style="display:flex;gap:5px;align-items:center;white-space:nowrap"><input type="checkbox" class="qz-ok" ${ok?'checked':''} style="width:auto"> corretta</label>
    <button type="button" class="linkbtn" onclick="this.parentNode.remove()">togli</button></div>`;
}
function qzDomandaBlock(q){
  q=q||{q:'',r:[{t:'',ok:true},{t:'',ok:false}]};
  return `<div class="qz-q" style="border:1px solid var(--linea);border-radius:10px;padding:12px;margin-top:10px;background:var(--avorio)">
    <div style="display:flex;gap:8px;align-items:center"><input class="qz-domanda" value="${esc(q.q||'')}" placeholder="Domanda" style="flex:1;font-weight:600">
      <button type="button" class="linkbtn" style="color:var(--porpora)" onclick="this.closest('.qz-q').remove()">elimina domanda</button></div>
    <div class="qz-rs">${(q.r||[]).map(r=>qzRispostaRow(r.t,r.ok)).join('')}</div>
    <button type="button" class="btn small ghost" style="margin-top:8px" onclick="this.previousElementSibling.insertAdjacentHTML('beforeend', qzRispostaRow('',false))">+ risposta</button>
  </div>`;
}
function addDomanda(){ $('qz-box').insertAdjacentHTML('beforeend', qzDomandaBlock()); }
function editLezione(courseId, id){
  const l = id ? LEZ_ADMIN.find(x=>String(x.id)===String(id)) : {};
  openModal(`<h3 style="font-size:23px">${id?'Modifica lezione':'Nuova lezione'}</h3>`,
    `<div class="grid g2"><div class="field"><label>Titolo della lezione</label><input id="lz-tit" value="${esc(l.tit||'')}"></div>
       <div class="field"><label>Ordine</label><input id="lz-ord" type="number" value="${l.ordine||LEZ_ADMIN.length+1}"></div></div>
     <div class="field"><label>Breve descrizione</label><textarea id="lz-desc" rows="3">${esc(l.desc||'')}</textarea></div>
     <div class="field"><label>URL del video della lezione (facoltativo)</label><input id="lz-video" value="${esc(l.video||'')}" placeholder="https://\u2026"></div>
     ${S3ACC.filter(x=>x.attivo!==false).length?`<div class="s3-box"><div class="eyebrow">Carica il video su S3</div>
       <div class="grid g2" style="margin-top:8px"><div class="field"><label>Destinazione</label><select id="s3-acc">${S3ACC.filter(x=>x.attivo!==false).map(x=>`<option value="${x.id}">${esc(x.nome)}</option>`).join('')}</select></div>
       <div class="field"><label>File video</label><input type="file" id="s3-file" accept="video/*"></div></div>
       <button type="button" class="btn small oro" onclick="caricaS3('lz-video','','')">Carica e usa come URL</button>
       <span id="s3-prog" class="muted small" style="margin-left:10px"></span></div>`:''}
     ${id?allegatiHtml('lezioni', id):`<p class="muted small">Salva la lezione: potrai poi allegare dispense e materiali (scaricabili e stampabili).</p>`}
     <div class="field"><label>Quiz (una o pi\u00f9 risposte corrette per domanda \u2014 facoltativo)</label>
       <div id="qz-box">${(l.quiz||[]).map(q=>qzDomandaBlock(q)).join('')}</div>
       <button type="button" class="btn small ghost" style="margin-top:8px" onclick="addDomanda()">+ domanda</button></div>
     <label style="display:flex;gap:8px;align-items:center;font-size:14px;margin:8px 0 12px"><input type="checkbox" id="lz-pub" ${l.pubblicata!==false?'checked':''} style="width:auto"> Pubblicata (visibile agli iscritti)</label>
     <button class="btn full" onclick="salvaLezione('${courseId}','${id||''}')">Salva lezione</button>`);
}
async function salvaLezione(courseId, id){
  const quiz=[];
  document.querySelectorAll('#qz-box .qz-q').forEach(qb=>{
    const q=(qb.querySelector('.qz-domanda')||{}).value||''; if(!q.trim()) return;
    const r=[]; qb.querySelectorAll('.qz-r').forEach(rr=>{
      const t=(rr.querySelector('.qz-t')||{}).value||''; if(!t.trim()) return;
      r.push({ t:t.trim(), ok: !!(rr.querySelector('.qz-ok')||{}).checked });
    });
    if(r.length) quiz.push({ q:q.trim(), r });
  });
  for(const d of quiz){ if(!d.r.some(x=>x.ok)) return toast('Ogni domanda deve avere almeno una risposta corretta.'); }
  const o={ id:id||undefined, courseId, tit:$('lz-tit').value.trim(), desc:$('lz-desc').value.trim(),
    video:$('lz-video').value.trim(), ordine:parseInt($('lz-ord').value||'1',10), pubblicata:$('lz-pub').checked, quiz };
  if(!o.tit) return toast('Il titolo della lezione \u00e8 obbligatorio.');
  try{ await DB.saveLezione(o); apriLezioni(courseId); toast('Lezione salvata.'); }
  catch(e){ toast('Errore: '+(e.message||'')); }
}
async function eliminaLezione(courseId, id){
  try{ await DB.deleteLezione(id); caricaLezioniAdmin(courseId); }catch(e){ toast('Errore: '+(e.message||'')); }
}
/* Verifica del quiz lato studente */
function verificaQuiz(courseId, li){
  const L=(LEZ_CACHE[courseId]||[])[li]; if(!L) return;
  let giuste=0;
  L.quiz.forEach((d,qi)=>{
    const okSet = d.r.map((r,ri)=>r.ok?ri:-1).filter(x=>x>=0).join(',');
    const sel = [].slice.call(document.querySelectorAll('.st-q'+qi+':checked')).map(x=>x.value).join(',');
    if(sel===okSet) giuste++;
  });
  const box=$('qz-res'); if(box){ box.innerHTML = `<b>${giuste} su ${L.quiz.length} corrette</b>${giuste===L.quiz.length?' \u2014 ottimo! \ud83c\udf93':' \u2014 riprova, puoi correggere le risposte.'}`; }
}

/* RASSEGNA */
function editFonte(id){
  const f = id?FONTI.find(x=>x.id===id):{};
  openModal(`<h3 style="font-size:23px">${id?'Modifica fonte':'Nuova fonte'}</h3>`,
    `${fId(f.id,!!id)}
     <div class="field"><label>Nome</label><input id="fo-nome" value="${esc(f.nome||'')}" placeholder="ONU \u2014 Pace e sicurezza"></div>
     <div class="field"><label>URL del feed RSS/Atom</label><input id="fo-url" value="${esc(f.url||'')}" placeholder="https://news.un.org/.../rss.xml"></div>
     <div class="field"><label>Editore (per l\u2019attribuzione)</label><input id="fo-ed" value="${esc(f.editore||'')}" placeholder="UN News"></div>
     <label style="display:flex;gap:8px;align-items:center;font-size:14px;margin:6px 0 14px"><input type="checkbox" id="fo-att" ${f.attiva!==false?'checked':''} style="width:auto"> Attiva (le sue notizie compaiono in pagina)</label>
     <button class="btn full" onclick="salvaFonte('${id||''}')">Salva fonte</button>`);
}
async function salvaFonte(edit){
  const id=getId(edit); if(!id) return toast('Inserisci un identificativo.');
  const o={ id, nome:$('fo-nome').value.trim(), url:$('fo-url').value.trim(), editore:$('fo-ed').value.trim(), attiva:$('fo-att').checked };
  if(!o.nome||!/^https?:\/\//i.test(o.url)) return toast('Nome e URL (http/https) sono obbligatori.');
  try{ await DB.saveFonte(o); await loadCatalog(); closeModal(); setPresTab('contenuti'); toast('Fonte salvata.'); }
  catch(e){ toast('Errore: '+(e.message||'')); }
}
async function sincronizza(id){
  toast('Sincronizzo\u2026');
  try{ const r = await DB.sincronizzaFonte(id); await loadCatalog(); setPresTab('contenuti');
    toast('Importate '+(r.importate||0)+' voci.'); }
  catch(e){ toast(String(e.message||e)); }
}
async function caricaNotizieCms(){
  const box=$('nz-box'); if(!box) return;
  box.innerHTML = NOTIZIE.length ? NOTIZIE.slice(0,40).map(n=>`<div class="lesson" style="cursor:default">
      <span class="t" style="${n.nascosta?'opacity:.5':''}">${esc(n.tit)}<br><span class="d" style="margin:0">${esc(editoreDi(n.fonte))}${n.data?' \u00b7 '+esc(fmtGiorno(n.data)):''}${n.nascosta?' \u00b7 nascosta':''}</span></span>
      <button class="btn small ghost" style="margin-left:auto" onclick="toggleNotizia('${n.id}',${n.nascosta?'false':'true'})">${n.nascosta?'Ripristina':'Nascondi'}</button>
    </div>`).join('') : 'Nessuna notizia importata.';
}
async function toggleNotizia(id,nascondi){
  try{ await DB.setNotiziaNascosta(id, nascondi==='true'||nascondi===true); await loadCatalog(); setPresTab('contenuti'); }
  catch(e){ toast('Errore: '+(e.message||'')); }
}
async function caricaEventiPaceCms(){
  const box=$('evp-box'); if(!box) return;
  box.innerHTML = EVENTIPACE.length ? EVENTIPACE.map(e=>`<div class="lesson" style="cursor:default">
      <span class="t">${esc(e.tit)}<br><span class="d" style="margin:0">${esc(fmtGiorno(e.inizio))}${e.luogo?' \u00b7 '+esc(e.luogo):''}${e.pubblicato===false?' \u00b7 bozza':''}</span></span>
      <span style="margin-left:auto;display:flex;gap:8px"><button class="btn small ghost" onclick="editEventoPace('${e.id}')">Modifica</button>
        <button class="btn small ghost" onclick="delCont('eventopace','${e.id}')">Elimina</button></span></div>`).join('') : 'Nessun evento.';
}
function editEventoPace(id){
  const e = id?EVENTIPACE.find(x=>String(x.id)===String(id)):{};
  openModal(`<h3 style="font-size:23px">${id?'Modifica evento':'Nuovo evento'}</h3>`,
    `<div class="field"><label>Titolo</label><input id="ep-tit" value="${esc(e.tit||'')}"></div>
     <div class="field"><label>Descrizione</label><input id="ep-desc" value="${esc(e.desc||'')}"></div>
     <div class="grid g2"><div class="field"><label>Inizio</label><input id="ep-in" type="date" value="${esc(e.inizio||'')}"></div>
       <div class="field"><label>Fine (facoltativa)</label><input id="ep-fin" type="date" value="${esc(e.fine||'')}"></div></div>
     <div class="field"><label>Luogo</label><input id="ep-luo" value="${esc(e.luogo||'')}"></div>
     <div class="field"><label>Link (facoltativo)</label><input id="ep-url" value="${esc(e.url||'')}"></div>
     <label style="display:flex;gap:8px;align-items:center;font-size:14px;margin:6px 0 14px"><input type="checkbox" id="ep-pub" ${e.pubblicato!==false?'checked':''} style="width:auto"> Pubblicato</label>
     <button class="btn full" onclick="salvaEventoPace('${id||''}')">Salva evento</button>`);
}
async function salvaEventoPace(edit){
  const o={ id:edit||undefined, tit:$('ep-tit').value.trim(), desc:$('ep-desc').value.trim(),
    inizio:$('ep-in').value, fine:$('ep-fin').value||null, luogo:$('ep-luo').value.trim(),
    url:$('ep-url').value.trim(), pubblicato:$('ep-pub').checked };
  if(!o.tit||!o.inizio) return toast('Titolo e data di inizio sono obbligatori.');
  try{ await DB.saveEventoPace(o); await loadCatalog(); closeModal(); setPresTab('contenuti'); toast('Evento salvato.'); }
  catch(e){ toast('Errore: '+(e.message||'')); }
}
/* MECENATI */
const CAMPI_ENTE=[['ente_denominazione','Denominazione'],['ente_cf','Codice fiscale'],['ente_piva','Partita IVA'],
  ['ente_sede','Sede legale'],['ente_intestatario','Intestatario del conto'],['ente_iban','IBAN'],
  ['ente_banca','Banca'],['ente_pec','PEC'],['ente_email','Email'],['ente_privacy_url','URL informativa privacy']];
async function caricaEnte(){
  const box=$('ente-form'); if(!box) return;
  try{ ENTE = await DB.datiEnte(); }catch(e){ ENTE={}; }
  box.innerHTML = CAMPI_ENTE.map(([k,n])=>`<div class="field"><label>${n}${k==='ente_iban'?' \u2014 controllalo due volte':''}</label>
      <input id="en-${k}" value="${esc(ENTE[k]||'')}"></div>`).join('') +
    `<button class="btn full" onclick="salvaEnte()">Salva i dati dell\u2019ente</button>`;
}
async function salvaEnte(){
  try{
    for(const [k] of CAMPI_ENTE){ const el=$('en-'+k); if(el) await DB.saveSetting(k, el.value.trim()); }
    ENTE = await DB.datiEnte(); toast('Dati salvati.');
  }catch(e){ toast('Errore: '+(e.message||'')); }
}
async function caricaImpegni(){
  try{ ENTE = await DB.datiEnte(); }catch(e){}
  const att = FORMULE.filter(f=>f.attivo!==false).length;
  const av = $('mec-avviso');
  if(av) av.innerHTML = (att && !(ENTE.ente_iban||'').trim())
    ? `<div class="card" style="padding:14px 16px;background:#FCEEEE;border-color:#E3B7B7;margin-bottom:14px">
         <b>${att} ${att===1?'formula \u00e8 pubblicata':'formule sono pubblicate'}, ma l\u2019IBAN \u00e8 vuoto.</b>
         <p class="small" style="margin-top:6px">Chi sottoscrive ora riceve \u201cti contatteremo\u201d invece delle coordinate. Compila i dati in <b>Ente</b>.</p></div>` : '';
  const box=$('imp-box'); if(!box) return;
  let l=[]; try{ l = await DB.impegni(); }catch(e){}
  box.innerHTML = l.length ? l.map(i=>`<div class="lesson" style="cursor:default">
      <span class="t">${esc(i.ragione_sociale)}<br><span class="d" style="margin:0">${esc(i.riferimento)} \u00b7 ${euro(i.importo)} \u00b7 ${i.quanti} accessi \u00b7 ${esc(i.referente)} \u00b7 ${esc(i.email)}</span></span>
      <span style="margin-left:auto;display:flex;gap:8px;align-items:center">
        <span class="badge ${i.stato==='pagato'?'verde':(i.stato==='annullato'?'grigio':'blu')}">${esc(i.stato)}</span>
        ${i.stato==='sottoscritto'?`<button class="btn small" onclick="confermaPagato('${i.id}','${esc(i.riferimento)}')">Segna pagato</button>`:''}
        ${i.stato==='pagato'?`<button class="btn small ghost" onclick="vediVoucher('${i.id}')">Codici</button>`:''}
      </span></div>`).join('') : 'Nessun impegno.';
}
function confermaPagato(id, rif){
  openModal(`<h3 style="font-size:22px">Confermi l\u2019accredito?</h3>`,
    `<p class="muted" style="margin-bottom:6px">Stai dichiarando che il bonifico con causale <b>${esc(rif)}</b> risulta accreditato sul conto.</p>
     <p class="muted small" style="margin-bottom:16px">Alla conferma gli accessi vengono emessi. L\u2019operazione non si ripete e non si annulla.</p>
     <button class="btn full" onclick="eseguiPagato('${id}')">S\u00ec, l\u2019accredito c\u2019\u00e8</button>`);
}
async function eseguiPagato(id){
  try{ const v = await DB.segnaPagato(id); closeModal(); setPresTab('contenuti');
    toast('Emessi '+v.length+' accessi.'); }
  catch(e){ toast(String(e.message||e)); }
}
async function vediVoucher(id){
  let l=[]; try{ const { data } = await DB.rawVoucher(id); l=data||[]; }catch(e){}
  openModal(`<h3 style="font-size:22px">Codici emessi</h3>`,
    l.length? `<p class="muted small" style="margin-bottom:10px">Consegnali al mecenate. Chi li riscatta ottiene l\u2019accesso.</p>
      <div style="max-height:340px;overflow:auto"><textarea readonly style="width:100%;height:300px;font-family:monospace;font-size:13px">${esc(l.map(v=>v.codice+(v.used?'  (usato)':'')).join('\n'))}</textarea></div>`
      : '<p class="muted">Nessun codice.</p>');
}
function editFormula(id){
  const f = id?FORMULE.find(x=>x.id===id):{};
  openModal(`<h3 style="font-size:23px">${id?'Modifica formula':'Nuova formula'}</h3>`,
    `${fId(f.id,!!id)}
     <div class="field"><label>Nome</label><input id="fm-nome" value="${esc(f.nome||'')}" placeholder="Costruttore Accademico di Pace"></div>
     <div class="grid g2"><div class="field"><label>Importo (\u20ac)</label><input id="fm-imp" type="number" step="0.01" value="${f.importo||''}"></div>
       <div class="field"><label>Quanti accessi</label><input id="fm-qta" type="number" value="${f.quanti||''}"></div></div>
     <div class="grid g2"><div class="field"><label>Tipo</label><select id="fm-tipo">
         <option value="membership" ${f.tipo!=='pacchetto'?'selected':''}>Abbonamento</option>
         <option value="pacchetto" ${f.tipo==='pacchetto'?'selected':''}>Pacchetto tematico</option></select></div>
       <div class="field"><label>Concede</label><input id="fm-conc" value="${esc(f.concede||'academicus')}" placeholder="civis | academicus | pacc:p1"></div></div>
     <div class="field"><label>Descrizione</label><input id="fm-desc" value="${esc(f.descrizione||'')}"></div>
     <div class="grid g2"><div class="field"><label>Durata (mesi)</label><input id="fm-dur" type="number" value="${f.durata_mesi||12}"></div>
       <div class="field"><label>Ordine</label><input id="fm-ord" type="number" value="${f.ordine||(FORMULE.length+1)*10}"></div></div>
     <label style="display:flex;gap:8px;align-items:center;font-size:14px;margin:6px 0 14px"><input type="checkbox" id="fm-att" ${f.attivo!==false?'checked':''} style="width:auto"> Attiva</label>
     <button class="btn full" onclick="salvaFormula('${id||''}')">Salva formula</button>`);
}
async function salvaFormula(edit){
  const id=getId(edit); if(!id) return toast('Inserisci un identificativo.');
  const o={ id, nome:$('fm-nome').value.trim(), importo:parseFloat($('fm-imp').value||0),
    quanti:parseInt($('fm-qta').value||0,10), tipo:$('fm-tipo').value, concede:$('fm-conc').value.trim(),
    desc:$('fm-desc').value.trim(), durata:parseInt($('fm-dur').value||12,10),
    ordine:parseInt($('fm-ord').value||0,10), attivo:$('fm-att').checked };
  if(!(o.importo>0) || !(o.quanti>0)) return toast('Importo e numero di accessi devono essere maggiori di zero.');
  if(o.tipo==='membership' && ['civis','academicus'].indexOf(o.concede)<0) return toast('Un abbonamento concede civis o academicus.');
  try{ await DB.saveFormula(o); FORMULE = await DB.formule(); closeModal(); setPresTab('contenuti'); toast('Formula salvata.'); }
  catch(e){ toast('Errore: '+(e.message||'')); }
}
/* TEMI EUROPEI -> COMMISSIONI */
async function caricaOrfani(){
  const box=$('temi-orfani'); if(!box) return;
  let l=[]; try{ l = await DB.temiNonMappati(); }catch(e){}
  box.innerHTML = l.length
    ? l.map(t=>`<div style="display:flex;gap:8px;align-items:center;margin:6px 0">
        <b>${esc(t.codice)}</b> ${esc(t.nome||'')} <span class="muted">(${t.quanti})</span>
        <button class="btn small ghost" style="margin-left:auto" onclick="editTema('','${esc(t.codice)}')">Assegna</button></div>`).join('')
    : 'Nessuno: ogni tema incontrato ha una commissione.';
}
function editTema(comm, prefisso){
  const esiste = !!(comm && prefisso);
  const t = esiste ? TEMI.find(x=>x.commissione===comm && x.prefisso===prefisso) : {prefisso:prefisso||'', nota:''};
  openModal(`<h3 style="font-size:23px">${esiste?'Modifica mappatura':'Nuova mappatura'}</h3>`,
    `<div class="field"><label>Prefisso del tema OEIL</label><input id="tm-pre" value="${esc((t&&t.prefisso)||'')}" placeholder="es. 6.10"></div>
     <p class="muted small" style="margin:-8px 0 12px">Si confronta per prefisso: <b>3.30</b> cattura 3.30.06 e tutto il ramo.</p>
     <div class="field"><label>Commissione</label><select id="tm-comm">${COMMISSIONI.map(c=>`<option value="${c.id}" ${comm===c.id?'selected':''}>${esc(c.nome)}</option>`).join('')}</select></div>
     <div class="field"><label>Nota</label><input id="tm-nota" value="${esc((t&&t.nota)||'')}" placeholder="perche' questo ramo va qui"></div>
     <button class="btn full" onclick="salvaTema('${esc(comm||'')}','${esc(prefisso||'')}')">Salva</button>`);
}
async function salvaTema(vc, vp){
  const o={ commissione:$('tm-comm').value, prefisso:$('tm-pre').value.trim(), nota:$('tm-nota').value.trim() };
  if(!o.prefisso) return toast('Inserisci il prefisso.');
  try{
    if(vc && vp && (vc!==o.commissione || vp!==o.prefisso)) await DB.deleteTema(vc,vp);   /* spostato */
    await DB.saveTema(o); await loadCatalog(); closeModal(); setPresTab('contenuti'); toast('Mappatura salvata.');
  }catch(e){ toast('Errore: '+(e.message||'')); }
}
async function delTema(c,p){
  try{ await DB.deleteTema(c,p); await loadCatalog(); setPresTab('contenuti'); toast('Mappatura rimossa.'); }
  catch(e){ toast('Errore: '+(e.message||'')); }
}
/* LIVELLI DI ACCESSO */
const MEMBERSHIPS=[['free','Gratuito'],['civis','Civis'],['academicus','Academicus']];
const RUOLI_UT=[['iscritto','Iscritto'],['delegato','Delegato'],['presidenza','Presidenza']];
function regolaInParole(l){
  const p=[];
  if(l.ospiti) p.push('anche senza account');
  if((l.memberships||[]).length) p.push('abbonamenti: '+l.memberships.join(', '));
  if((l.ruoli||[]).length) p.push('ruoli: '+l.ruoli.join(', '));
  return p.length ? p.join(' \u00b7 ') : 'solo presidenza';
}
function editLivello(id){
  const l = id?LIVELLI.find(x=>x.id===id):{memberships:[],ruoli:[]};
  const usato = id?VOD.filter(v=>v.livello===id).length:0;
  const spunte=(cls,elenco,sel)=>elenco.map(([k,n])=>`<label style="display:flex;gap:6px;align-items:center;font-size:14px"><input type="checkbox" class="${cls}" value="${k}" ${(sel||[]).indexOf(k)>=0?'checked':''} style="width:auto"> ${n}</label>`).join('');
  openModal(`<h3 style="font-size:23px">${id?'Modifica livello':'Nuovo livello'}</h3>`,
    `${fId(l.id, !!id)}
     <div class="field"><label>Nome mostrato</label><input id="lv-nome" value="${esc(l.nome||'')}" placeholder="es. Sostenitori"></div>
     <div class="field"><label>Descrizione</label><input id="lv-desc" value="${esc(l.desc||'')}"></div>
     <div class="card" style="padding:14px 16px;background:var(--avorio);border:none;margin-bottom:14px">
       <div class="eyebrow">Chi lo soddisfa</div>
       <label style="display:flex;gap:8px;align-items:center;font-size:14px;margin:10px 0"><input type="checkbox" id="lv-osp" ${l.ospiti?'checked':''} style="width:auto"> Anche senza account</label>
       <div class="muted small" style="margin-bottom:6px">Abbonamenti</div>
       <div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:10px">${spunte('lv-m',MEMBERSHIPS,l.memberships)}</div>
       <div class="muted small" style="margin-bottom:6px">Ruoli</div>
       <div style="display:flex;gap:14px;flex-wrap:wrap">${spunte('lv-r',RUOLI_UT,l.ruoli)}</div>
       <p class="muted small" style="margin-top:10px">Basta una spunta qualsiasi perche' il livello sia soddisfatto. La presidenza vede sempre tutto: un livello senza nessuna spunta resta visibile solo a lei, ed e' il modo per tenere una bozza.</p>
     </div>
     <div class="field"><label>Invito per chi non ha diritto</label><input id="lv-inv" value="${esc(l.invito||'')}" placeholder="es. Incluso in Civis"></div>
     <div class="grid g2">
       <div class="field"><label>Il bottone \u201cSblocca\u201d porta a</label><select id="lv-cta">
         <option value="" ${!l.cta?'selected':''}>Nessun bottone</option>
         <option value="abbonamenti" ${l.cta==='abbonamenti'?'selected':''}>Abbonamenti</option>
         <option value="registrati" ${l.cta==='registrati'?'selected':''}>Registrazione</option></select></div>
       <div class="field"><label>Ordine</label><input id="lv-ord" type="number" value="${l.ordine||(LIVELLI.length+1)*10}"></div>
     </div>
     <label style="display:flex;gap:8px;align-items:center;font-size:14px;margin:6px 0 14px"><input type="checkbox" id="lv-att" ${l.attivo!==false?'checked':''} style="width:auto"> Attivo</label>
     ${usato?`<p class="muted small" style="margin-bottom:10px">Usato da ${usato} ${usato===1?'video':'video'}.</p>`:''}
     <button class="btn full" onclick="salvaLivello('${id||''}')">Salva livello</button>`);
}
async function salvaLivello(edit){
  const id=getId(edit); if(!id) return toast('Inserisci un identificativo.');
  const prese=c=>Array.from(document.querySelectorAll('.'+c)).filter(x=>x.checked).map(x=>x.value);
  const o={ id, nome:$('lv-nome').value.trim(), desc:$('lv-desc').value.trim(), ospiti:$('lv-osp').checked,
    memberships:prese('lv-m'), ruoli:prese('lv-r'), invito:$('lv-inv').value.trim(), cta:$('lv-cta').value,
    ordine:parseInt($('lv-ord').value||0,10), attivo:$('lv-att').checked };
  if(o.nome.length<2) return toast('Il nome e\u2019 obbligatorio.');
  try{ await DB.saveLevel(o); await loadCatalog(); closeModal(); setPresTab('contenuti'); toast('Livello salvato.'); }
  catch(e){ toast('Errore: '+(e.message||'')); }
}
/* AUDIO */
function editAudio(id){
  const a = id?AUDIO.find(x=>x.id===id):{};
  openModal(`<h3 style="font-size:23px">${id?'Modifica audiolibro':'Nuovo audiolibro'}</h3>`,
    `${fId(a.id, !!id)}
     <div class="field"><label>Titolo</label><input id="cf-tit" value="${esc(a.tit||'')}"></div>
     <div class="grid g2"><div class="field"><label>Autore</label><input id="cf-aut" value="${esc(a.autore||'')}"></div>
       <div class="field"><label>Durata</label><input id="cf-dur" value="${esc(a.durata||'')}" placeholder="es. 18 min"></div></div>
     ${fSelComm(a.comm)}
     <div class="field"><label>Testo (letto dalla voce IA e usato per le sintesi)</label><textarea id="cf-testo" rows="5">${esc(a.testo||'')}</textarea></div>
     <div class="grid g2"><div class="field"><label>Ordine</label><input id="cf-ord" type="number" value="${a.ordine||(AUDIO.length+1)}"></div>
       <div class="field"><label style="margin-top:30px"><input type="checkbox" id="cf-free" ${a.free?'checked':''} style="width:auto"> Gratuito</label></div></div>
     ${fPub(a.pubblicato)}
     ${s3Box('audio/*,.mp3,.m4a','audiobooks', id)}
     ${allegatiHtml('audiobooks', id)}
     <button class="btn full" onclick="salvaAudio('${id||''}')">Salva audiolibro</button>`);
}
async function salvaAudio(edit){
  const id=getId(edit); if(!id) return toast('Inserisci un identificativo.');
  const o={ id, tit:$('cf-tit').value.trim(), autore:$('cf-aut').value.trim(), durata:$('cf-dur').value.trim(),
    comm:$('cf-comm').value, testo:$('cf-testo').value.trim(),
    ordine:parseInt($('cf-ord').value||0,10), free:$('cf-free').checked, pubblicato:$('cf-pub').checked };
  if(o.tit.length<2) return toast('Il titolo è obbligatorio.');
  try{ await DB.saveAudio(o); await loadCatalog(); closeModal(); setPresTab('contenuti'); toast('Audiolibro salvato.'); }
  catch(e){ toast('Errore: '+(e.message||'')); }
}
/* PACCHETTI */
function editPacc(id){
  const p = id?PACCHETTI.find(x=>x.id===id):{corsi:[]};
  openModal(`<h3 style="font-size:23px">${id?'Modifica pacchetto':'Nuovo pacchetto'}</h3>`,
    `${fId(p.id, !!id)}
     <div class="field"><label>Nome</label><input id="cf-nome" value="${esc(p.nome||'')}"></div>
     <div class="field"><label>Corsi inclusi</label>
       <div style="display:flex;flex-direction:column;gap:6px;max-height:180px;overflow:auto;border:1px solid var(--linea);border-radius:10px;padding:10px">
       ${CORSI.map(c=>`<label style="display:flex;gap:8px;align-items:center;font-size:14px"><input type="checkbox" class="cf-pcorso" value="${c.id}" ${(p.corsi||[]).includes(c.id)?'checked':''} style="width:auto"> ${esc(c.tit)}</label>`).join('')}</div></div>
     <div class="grid g2"><div class="field"><label>Prezzo (€)</label><input id="cf-prezzo" type="number" value="${p.prezzo||0}"></div>
       <div class="field"><label>Ordine</label><input id="cf-ord" type="number" value="${p.ordine||(PACCHETTI.length+1)}"></div></div>
     ${fPub(p.pubblicato)}
     <button class="btn full" onclick="salvaPacc('${id||''}')">Salva pacchetto</button>`);
}
async function salvaPacc(edit){
  const id=getId(edit); if(!id) return toast('Inserisci un identificativo.');
  const corsi=[...document.querySelectorAll('.cf-pcorso:checked')].map(e=>e.value);
  const o={ id, nome:$('cf-nome').value.trim(), corsi, prezzo:parseInt($('cf-prezzo').value||0,10),
    ordine:parseInt($('cf-ord').value||0,10), pubblicato:$('cf-pub').checked };
  if(o.nome.length<2) return toast('Il nome è obbligatorio.');
  if(corsi.length===0) return toast('Seleziona almeno un corso.');
  try{ await DB.savePackage(o); await loadCatalog(); closeModal(); setPresTab('contenuti'); toast('Pacchetto salvato.'); }
  catch(e){ toast('Errore: '+(e.message||'')); }
}
/* TESTI */
function editTesto(id){
  const t = id?TESTI.find(x=>x.id===id):{};
  const caps = (t.capitoli||[]);
  openModal(`<h3 style="font-size:23px">${id?'Modifica testo / libro':'Nuovo testo / libro'}</h3>`,
    `${fId(t.id, !!id)}
     <div class="field"><label>Titolo</label><input id="cf-tit" value="${esc(t.tit||'')}"></div>
     <div class="grid g2"><div class="field"><label>Autore / fonte</label><input id="cf-aut" value="${esc(t.autore||'')}"></div>
       <div class="field"><label>Tempo di lettura</label><input id="cf-lett" value="${esc(t.lettura||'')}" placeholder="es. 45 min di lettura"></div></div>
     ${fSelComm(t.comm)}

     <div class="card" style="padding:14px;background:var(--avorio);border:none;margin:6px 0 14px">
       <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px">
         <div class="eyebrow" style="margin:0">Contenuto in capitoli</div>
         <div style="display:flex;gap:8px;flex-wrap:wrap">
           <label class="btn small ghost" style="cursor:pointer;margin:0">📄 Importa da PDF
             <input type="file" accept="application/pdf" onchange="importaPdf(this)" style="display:none"></label>
           <button class="btn small ghost" onclick="capAdd()">+ Capitolo</button>
         </div>
       </div>
       <p class="muted small" id="pdf-status" style="margin:0 0 10px">Carica un PDF (solo testi di pubblico dominio o di cui hai i diritti): verrà diviso in capitoli, che potrai correggere qui sotto. Oppure aggiungi i capitoli a mano.</p>
       <div id="cap-list">${caps.map(c=>capRowInner(c.t||'', c.c||'')).join('')}</div>
     </div>

     <div class="field"><label>Oppure — testo unico <span class="muted small">(usato solo se non ci sono capitoli)</span></label>
       <textarea id="cf-testo" rows="4">${esc(t.testo||'')}</textarea></div>
     <div class="grid g2"><div class="field"><label>Ordine</label><input id="cf-ord" type="number" value="${t.ordine||(TESTI.length+1)}"></div>
       <div class="field"><label style="margin-top:30px"><input type="checkbox" id="cf-free" ${t.free?'checked':''} style="width:auto"> Gratuito</label></div></div>
     ${fPub(t.pubblicato)}
     ${s3Box('.pdf,application/pdf,.mp4,video/mp4,.mp3,.m4a,audio/*','texts', id)}
     ${allegatiHtml('texts', id)}
     <button class="btn full" onclick="salvaTesto('${id||''}')">Salva testo</button>`);
}
function capRowInner(t,c){
  return `<div class="cap-row" style="border:1px solid var(--linea);border-radius:10px;padding:10px;margin-bottom:8px;background:var(--marmo)">
    <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px">
      <span style="cursor:grab" title="Trascina per riordinare">⋮⋮</span>
      <input class="cap-t" value="${esc(t||'')}" placeholder="Titolo del capitolo" style="flex:1;padding:7px 9px;border:1px solid var(--linea);border-radius:8px;font-family:inherit">
      <button class="btn small ghost" onclick="capDel(this)" title="Rimuovi">✕</button>
    </div>
    <textarea class="cap-c" rows="3" placeholder="Testo del capitolo…" style="width:100%">${esc(c||'')}</textarea>
  </div>`;
}
function capAdd(t,c){
  const list=$('cap-list'); if(!list) return;
  const wrap=document.createElement('div'); wrap.innerHTML=capRowInner(typeof t==='string'?t:'', typeof c==='string'?c:'');
  list.appendChild(wrap.firstElementChild);
}
function capDel(btn){ const r=btn.closest('.cap-row'); if(r) r.remove(); }
function capCollect(){
  return [...document.querySelectorAll('#cap-list .cap-row')].map(r=>({
    t:(r.querySelector('.cap-t')?.value||'').trim(),
    c:(r.querySelector('.cap-c')?.value||'').trim()
  })).filter(x=>x.t||x.c);
}
function splitIntoChapters(raw){
  let text=(raw||'').replace(/\r/g,'');
  text=text.replace(/(\w)-\n(\w)/g,'$1$2');                 // ricongiungi sillabazione
  const lines=text.split('\n').map(l=>l.replace(/[ \t]+/g,' ').trim());
  const isHead=(l)=>{
    if(!l||l.length>80) return false;
    if(/^(capitolo|cap\.?|parte|libro|canto|sezione|prologo|epilogo|introduzione|premessa|prefazione)\b/i.test(l)) return true;
    if(/^[IVXLCDM]+\.?\s+\S/i.test(l)) return true;          // "IV. Titolo"
    if(/^\d{1,3}[.)]\s+\S/.test(l)) return true;             // "3. Titolo"
    return false;
  };
  const caps=[]; let cur=null;
  for(const l of lines){
    if(isHead(l)){ if(cur) caps.push(cur); cur={t:l, c:''}; }
    else { if(!cur) cur={t:'', c:''}; cur.c += (cur.c?'\n':'')+l; }
  }
  if(cur) caps.push(cur);
  caps.forEach(c=>{ c.c=c.c.replace(/\n{3,}/g,'\n\n').trim(); });
  const conTitolo=caps.filter(c=>c.t);
  if(conTitolo.length===0){ const uni=lines.filter(Boolean).join('\n').trim(); return uni?[{t:'', c:uni}]:[]; }
  if(caps.length && !caps[0].t && caps[0].c) caps[0].t='Introduzione';
  return caps.filter(c=>c.t||c.c);
}
async function importaPdf(input){
  const file=input.files&&input.files[0]; if(!file) return;
  const st=$('pdf-status');
  if(!window.pdfjsLib){ if(st) st.textContent='Libreria PDF non caricata: serve la connessione a internet.'; return; }
  try{
    if(st) st.textContent='Estrazione del testo dal PDF in corso…';
    pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const buf=await file.arrayBuffer();
    const pdf=await pdfjsLib.getDocument({data:buf}).promise;
    let full='';
    for(let p=1;p<=pdf.numPages;p++){
      const page=await pdf.getPage(p);
      const tc=await page.getTextContent();
      let last=null, line='';
      for(const it of tc.items){
        const y=it.transform&&it.transform[5];
        if(last!==null && Math.abs(y-last)>3){ full+=line.trim()+'\n'; line=''; }
        line+=it.str+(it.hasEOL?'':' '); last=y;
      }
      full+=line.trim()+'\n\n';
    }
    const caps=splitIntoChapters(full);
    const list=$('cap-list'); if(list) list.innerHTML='';
    if(caps.length){ caps.forEach(c=>capAdd(c.t,c.c)); }
    else { capAdd('',''); }
    if(st) st.textContent='Trovati '+caps.length+' capitoli da '+pdf.numPages+' pagine. Controlla e correggi prima di salvare.';
  }catch(e){ if(st) st.textContent='Impossibile leggere il PDF ('+(e.message||'errore')+'). Se è una scansione (immagini) serve prima un OCR.'; }
  finally{ input.value=''; }
}
async function salvaTesto(edit){
  const id=getId(edit); if(!id) return toast('Inserisci un identificativo.');
  const capitoli=capCollect();
  const o={ id, tit:$('cf-tit').value.trim(), autore:$('cf-aut').value.trim(), lettura:$('cf-lett').value.trim(),
    comm:$('cf-comm').value, testo:$('cf-testo').value.trim(), capitoli,
    ordine:parseInt($('cf-ord').value||0,10), free:$('cf-free').checked, pubblicato:$('cf-pub').checked };
  if(o.tit.length<2) return toast('Il titolo è obbligatorio.');
  if(!o.testo && capitoli.length===0) return toast('Aggiungi almeno un capitolo o il testo unico.');
  try{ await DB.saveText(o); await loadCatalog(); closeModal(); setPresTab('contenuti'); toast('Testo salvato'+(capitoli.length?(' · '+capitoli.length+' capitoli'):'')+'.'); }
  catch(e){ toast('Errore: '+(e.message||'')); }
}
/* CAMPUS */
function editCampus(id){
  const c = id?CAMPUS.find(x=>x.id===id):{};
  openModal(`<h3 style="font-size:23px">${id?'Modifica campus':'Nuovo campus'}</h3>`,
    `${fId(c.id, !!id)}
     <div class="field"><label>Titolo</label><input id="cf-tit" value="${esc(c.tit||'')}"></div>
     <div class="field"><label>Luogo</label><input id="cf-luogo" value="${esc(c.luogo||'Abbazia di Maguzzano — Casa di Spiritualità e Centro Ecumenico (Lonato del Garda, BS)')}"></div>
     <div class="grid g2"><div class="field"><label>Data</label><input id="cf-data" value="${esc(c.data||'')}" placeholder="es. 17–18 ottobre 2026"></div>
       <div class="field"><label>Durata</label><input id="cf-dur" value="${esc(c.durata||'')}" placeholder="es. Weekend · 2 giorni, 1 notte"></div></div>
     ${fSelComm(c.comm)}
     <div class="field"><label>Descrizione</label><textarea id="cf-desc" rows="7">${esc(c.desc||'')}</textarea></div>
     <div class="grid g2"><div class="field"><label>Prezzo partecipazione (€)</label><input id="cf-prezzo" type="number" value="${c.prezzo||120}"></div>
       <div class="field"><label>Prezzo con soggiorno (€)</label><input id="cf-sogg" type="number" value="${c.prezzoSoggiorno||190}"></div></div>
     <div class="grid g2"><div class="field"><label>Posti</label><input id="cf-posti" type="number" value="${c.posti||30}"></div>
       <div class="field"><label>Ordine</label><input id="cf-ord" type="number" value="${c.ordine||(CAMPUS.length+1)}"></div></div>
     ${fPub(c.pubblicato)}
     ${allegatiHtml('campus', id)}
     <button class="btn full" onclick="salvaCampus('${id||''}')">Salva campus</button>`);
}
async function salvaCampus(edit){
  const id=getId(edit); if(!id) return toast('Inserisci un identificativo.');
  const o={ id, tit:$('cf-tit').value.trim(), luogo:$('cf-luogo').value.trim(), data:$('cf-data').value.trim(),
    durata:$('cf-dur').value.trim(), comm:$('cf-comm').value, desc:$('cf-desc').value.trim(),
    prezzo:parseInt($('cf-prezzo').value||0,10), prezzoSoggiorno:parseInt($('cf-sogg').value||0,10),
    posti:parseInt($('cf-posti').value||30,10), ordine:parseInt($('cf-ord').value||0,10), pubblicato:$('cf-pub').checked };
  if(o.tit.length<2) return toast('Il titolo è obbligatorio.');
  try{ await DB.saveCampus(o); await loadCatalog(); closeModal(); setPresTab('contenuti'); toast('Campus salvato.'); }
  catch(e){ toast('Errore: '+(e.message||'')); }
}
/* EVENTI */
function editEvento(id){
  const e = id?EVENTI.find(x=>x.id===id):{};
  const acc = e.accesso||'libero';
  const opt=(v,l)=>`<option value="${v}" ${acc===v?'selected':''}>${l}</option>`;
  openModal(`<h3 style="font-size:23px">${id?'Modifica evento':'Nuovo evento'}</h3>`,
    `${fId(e.id, !!id)}
     <div class="field"><label>Titolo</label><input id="cf-tit" value="${esc(e.tit||'')}"></div>
     <div class="field"><label>Sottotitolo</label><input id="cf-sub" value="${esc(e.sub||'')}"></div>
     <div class="grid g2"><div class="field"><label>Tipo</label><input id="cf-tipo" value="${esc(e.tipo||'Mostra')}"></div>
       <div class="field"><label>Periodo</label><input id="cf-periodo" value="${esc(e.periodo||'')}" placeholder="es. gennaio – dicembre 2027"></div></div>
     <div class="field"><label>Luogo</label><input id="cf-luogo" value="${esc(e.luogo||'')}"></div>
     <div class="field"><label>Descrizione</label><textarea id="cf-desc" rows="7">${esc(e.desc||'')}</textarea></div>
     <div class="grid g2">
       <div class="field"><label>Accesso</label><select id="cf-acc">
         ${opt('libero','Partecipazione libera')}${opt('civis','Incluso con Civis')}${opt('academicus','Incluso con Academicus')}${opt('biglietto','Biglietto a pagamento')}</select></div>
       <div class="field"><label>Prezzo biglietto (€)</label><input id="cf-prezzo" type="number" value="${e.prezzo||0}"></div>
     </div>
     <div class="field"><label>Programma <span class="muted small">(una riga per voce/mese)</span></label><textarea id="cf-prog" rows="6">${esc(e.programma||'')}</textarea></div>
     <div class="field"><label>Ordine</label><input id="cf-ord" type="number" value="${e.ordine||(EVENTI.length+1)}"></div>
     ${fPub(e.pubblicato)}
     ${allegatiHtml('events', id)}
     <button class="btn full" onclick="salvaEvento('${id||''}')">Salva evento</button>`);
}
async function salvaEvento(edit){
  const id=getId(edit); if(!id) return toast('Inserisci un identificativo.');
  const o={ id, tit:$('cf-tit').value.trim(), sub:$('cf-sub').value.trim(), tipo:$('cf-tipo').value.trim()||'Evento',
    periodo:$('cf-periodo').value.trim(), luogo:$('cf-luogo').value.trim(), desc:$('cf-desc').value.trim(),
    accesso:$('cf-acc').value, prezzo:parseInt($('cf-prezzo').value||0,10), programma:$('cf-prog').value,
    ordine:parseInt($('cf-ord').value||0,10), pubblicato:$('cf-pub').checked };
  if(o.tit.length<2) return toast('Il titolo è obbligatorio.');
  try{ await DB.saveEvent(o); await loadCatalog(); closeModal(); setPresTab('contenuti'); toast('Evento salvato.'); }
  catch(e){ toast('Errore: '+(e.message||'')); }
}
/* PREZZI */
async function salvaPrezzi(){
  try{
    await DB.saveSetting('prezzo_corso', parseInt($('pz-corso').value||69,10));
    await DB.saveSetting('prezzo_percorso', parseInt($('pz-perc').value||440,10));
    await loadCatalog(); setPresTab('contenuti'); toast('Prezzi aggiornati.');
  }catch(e){ toast('Errore: '+(e.message||'')); }
}
/* ELIMINA (con conferma) */
function delCont(tipo,id){
  const nomi={s3:'la destinazione S3',anagrafica:'l\u2019anagrafica',contratto:'il contratto',modello:'il modello',fonte:'la fonte',eventopace:'l\u2019evento',formula:'la formula',livello:'il livello',corso:'il corso',video:'il video',audio:'l’audiolibro',testo:'il testo',pacchetto:'il pacchetto',campus:'il campus',evento:'l’evento'};
  openModal(`<h3 style="font-size:22px">Elimina contenuto</h3>`,
    `<p>Vuoi eliminare definitivamente ${nomi[tipo]} <b>${esc(id)}</b>?</p>
     <div style="display:flex;gap:10px;margin-top:18px">
       <button class="btn ghost" onclick="closeModal()">Annulla</button>
       <button class="btn" style="background:var(--porpora)" onclick="confermaDel('${tipo}','${id}')">Elimina</button></div>`);
}
async function confermaDel(tipo,id){
  try{
    if(tipo==='s3') await DB.deleteS3(id);
    if(tipo==='anagrafica') await DB.deleteAnagrafica(id);
    if(tipo==='modello') await DB.deleteModello(id);
    if(tipo==='contratto') await DB.deleteContratto(id);
    if(tipo==='fonte') await DB.deleteFonte(id);
    if(tipo==='eventopace') await DB.deleteEventoPace(id);
    if(tipo==='formula'){
      /* Il vincolo protegge gli impegni gia' sottoscritti: giusto, ma da solo
         parla in postgrese. Qui si traduce. */
      try{ await DB.deleteFormula(id); }
      catch(err){
        if(String(err.code||'')==='23503' || /foreign key|violates/i.test(err.message||''))
          throw new Error('ci sono impegni sottoscritti su questa formula: spegnila invece di eliminarla, gli impegni devono restare tracciati');
        throw err;
      }
    }
    if(tipo==='livello'){
      const usato = VOD.filter(v=>v.livello===id).length;
      if(usato) throw new Error('lo usano ancora '+usato+' video: spostali prima su un altro livello');
      await DB.deleteLevel(id);
    }
    if(tipo==='corso') await DB.deleteCourse(id);
    if(tipo==='video') await DB.deleteVideo(id);
    if(tipo==='audio') await DB.deleteAudio(id);
    if(tipo==='testo') await DB.deleteText(id);
    if(tipo==='pacchetto') await DB.deletePackage(id);
    if(tipo==='campus') await DB.deleteCampus(id);
    if(tipo==='evento') await DB.deleteEvent(id);
    await loadCatalog(); closeModal(); setPresTab('contenuti'); toast('Contenuto eliminato.');
  }catch(e){ toast('Errore: '+(e.message||'')); }
}

/* =====================================================================
   MODALI + AVVIO
===================================================================== */
let onClose=null;
function openModal(headHtml,bodyHtml,cb,cls){
  onClose=cb||null;
  if(!cls && typeof vista!=='undefined' && (vista==='presidenza'||vista==='formatore')) cls='wide';
  $('modal-root').innerHTML=`<div class="modal-bg" onclick="if(event.target===this)closeModal()">
    <div class="modal ${cls||''}"><div class="modal-h"><div>${headHtml}</div><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-b">${bodyHtml}</div></div></div>`;
}
function closeModal(){ if(onClose){onClose();onClose=null;} $('modal-root').innerHTML=''; }

async function gestisciRitornoPagamento(){
  const p = new URLSearchParams(location.search);
  if(p.get('paid')==='1'){
    toast('Pagamento ricevuto. Attivazione in corso…');
    // il webhook attiva entro pochi secondi: aggiorniamo un paio di volte
    for(let i=0;i<4;i++){ await new Promise(r=>setTimeout(r,1500)); await refreshMe(); render();
      if(io && io.membership!=='free') break; }
    toast('Tutto pronto. Buon percorso!');
  } else if(p.get('canceled')==='1'){ toast('Pagamento annullato.'); }
  if(p.get('paid')||p.get('canceled')) history.replaceState({},'',location.pathname);
}
async function avvio(){
  if(!sb){
    $('loader').style.display='none';
    $('auth-root').style.display='block';
    $('auth-root').innerHTML=`<div style="max-width:560px;margin:80px auto;padding:0 24px">
      <div class="card" style="padding:30px"><div class="eyebrow">Configurazione richiesta</div>
      <h1 style="font-size:30px;margin:6px 0 10px">Collega Supabase</h1>
      <p class="muted">Il portale non è ancora collegato al backend. Apri <code>js/config.js</code> e inserisci l’URL del progetto e la chiave <b>anon</b> di Supabase. Le istruzioni complete sono nel file <b>README.md</b>.</p></div></div>`;
    return;
  }
  if('speechSynthesis' in window) speechSynthesis.getVoices();
  TRK.init();
  try{
    const s = await DB.session();
    if(s){ await refreshMe(); await loadCatalog(); }
    else { await loadCatalog(); }   /* la porta d'ingresso mostra il catalogo vero */
  }catch(e){}
  $('loader').style.display='none';
  if(io){ $('auth-root').style.display='none'; $('app').style.display='block'; go('dashboard'); await gestisciRitornoPagamento(); }
  else renderLanding();
  // mantieni la sessione sincronizzata
  if(sb) sb.auth.onAuthStateChange((_e,sess)=>{ if(!sess){ io=null; } });
}
window.addEventListener('load', avvio);
if('speechSynthesis' in window) speechSynthesis.onvoiceschanged=()=>{};
