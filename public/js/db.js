/* =====================================================================
   STRATO DATI — client Supabase e operazioni
   Tutte le operazioni privilegiate passano da funzioni RPC del database
   (SECURITY DEFINER): il client non può promuovere ruoli o aggirare i prezzi.
   ===================================================================== */
const CFG = window.PACIFICA_CONFIG || {};
let sb = null;
function configurato(){
  return CFG.SUPABASE_URL && !CFG.SUPABASE_URL.includes('IL-TUO-PROGETTO')
      && CFG.SUPABASE_ANON_KEY && !CFG.SUPABASE_ANON_KEY.includes('LA-TUA-CHIAVE');
}
function funcBase(){ return (CFG.FUNCTIONS_BASE||'').replace(/\/+$/,''); }
function stripeOn(){ return !!(CFG.STRIPE_ENABLED && funcBase()); }
function aiUrl(){ return CFG.AI_FUNCTION_URL || (funcBase()? funcBase()+'/ia' : ''); }
if (configurato() && window.supabase) {
  sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY);
}

const DB = {
  /* ---------- RICHIESTE DI INFORMAZIONI ---------- */
  async inviaRichiestaInfo(o){
    if(window.__DEMO){ (window.__RICHIESTE=window.__RICHIESTE||[]).push({ ...o, created_at:new Date().toISOString() }); return; }
    const { error } = await sb.from('richieste_info').insert({
      nome:o.nome, email:o.email, telefono:o.telefono||'', progetti:o.progetti||[], note:o.note||'' });
    if(error) throw error;
  },
  async elencoRichieste(){
    if(window.__DEMO) return (window.__RICHIESTE||[]).slice().reverse();
    const { data, error } = await sb.from('richieste_info').select('*').order('created_at', { ascending:false });
    if(error) throw error; return data||[];
  },

  /* ---------- AUTENTICAZIONE ---------- */
  async signIn(email, password){
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },
  async signOut(){ await sb.auth.signOut(); },
  async session(){ const { data } = await sb.auth.getSession(); return data.session; },

  /* ---------- PERCORSO DI PACE (v1.92) ---------- */
  async signUpPercorso(nome, email, password){
    const { data, error } = await sb.auth.signUp({ email, password, options:{ data:{ nome, percorso:'1' } } });
    if (error) throw error;
    return { confermaRichiesta: !(data && data.session) }; // true = serve confermare l'email
  },
  async avviaPercorso(){ const { data, error } = await sb.rpc('avvia_percorso'); if (error) throw error; return data; },
  async completaCostruttore(modo, dettaglio){
    const { error } = await sb.rpc('completa_costruttore', { p_modo:modo, p_dettaglio:dettaglio||'' });
    if (error) throw error;
  },
  async uploadAttestatoIEP(file){
    const { data:{ user } } = await sb.auth.getUser(); if(!user) throw new Error('Non sei collegato.');
    const nomeFile = Date.now() + '-' + (file.name||'attestato').replace(/[^a-zA-Z0-9._-]/g,'_');
    const path = 'attestati/' + user.id + '/' + nomeFile;
    const { error } = await sb.storage.from('percorso').upload(path, file, { upsert:false });
    if (error) throw error; return path;
  },

  /* ---------- PROFILO (carica tutto ciò che serve a `io`) ---------- */
  async loadMe(){
    const { data:{ user } } = await sb.auth.getUser();
    if (!user) return null;
    // Auto-riparazione: se il profilo manca (utente creato a mano o da vecchie versioni), lo creiamo qui.
    const q = sb.from('profiles').select('*').eq('id', user.id);
    let r = q.maybeSingle ? await q.maybeSingle() : await q.single();
    let prof = r.data || null;
    if (r.error && r.error.code !== 'PGRST116') throw new Error('Profilo non leggibile: ' + r.error.message);
    if (!prof){
      const nome = (user.user_metadata && user.user_metadata.nome) || (user.email||'').split('@')[0];
      const nuovo = { id:user.id, nome, ruolo:'iscritto', membership:'civis' };
      const ins = await sb.from('profiles').insert(nuovo).select('*').maybeSingle();
      if (ins.error) throw new Error('Impossibile creare il profilo: ' + ins.error.message);
      prof = ins.data || nuovo;
    }
    const acquisti = await this.myPurchases();
    const progress = await this.myProgress();
    return {
      id:prof.id, nome:prof.nome, email:user.email,
      ruolo:prof.ruolo, membership:prof.membership,
      seggio:prof.seggio, comm:prof.commissione,
      livelloPace: prof.livello_pace||0, percorsoDal: prof.percorso_dal||null,
      metaPercorso: !!(user.user_metadata && user.user_metadata.percorso),
      acquisti, progress
    };
  },

  /* ---------- CODICI (riscatto) ---------- */
  async redeemFounder(code){ const { error } = await sb.rpc('redeem_founder', { p_code: code }); if (error) throw error; },
  async redeemCode(code){ const { error } = await sb.rpc('redeem_code', { p_code: code }); if (error) throw error; },

  /* ---------- ACQUISTI E MEMBERSHIP (dimostrativi via RPC) ---------- */
  async myPurchases(){
    const { data, error } = await sb.from('purchases').select('item');
    if (error) throw error;
    return (data||[]).map(r=>r.item);
  },
  async purchase(item){ const { error } = await sb.rpc('purchase_item', { p_item:item }); if (error) throw error; },
  async activate(plan){ const { error } = await sb.rpc('activate_membership', { p_plan:plan }); if (error) throw error; },

  /* ---------- PROGRESSI ---------- */
  async myProgress(){
    const { data, error } = await sb.from('progress').select('course_id,lesson');
    if (error) throw error;
    const m = {};
    (data||[]).forEach(r=>{ (m[r.course_id]=m[r.course_id]||[]).push(r.lesson); });
    return m;
  },
  async markLesson(course, lesson){
    const { data:{ user } } = await sb.auth.getUser();
    const { error } = await sb.from('progress')
      .upsert({ profile_id:user.id, course_id:course, lesson }, { onConflict:'profile_id,course_id,lesson' });
    if (error) throw error;
  },

  /* ---------- PARLAMENTO ---------- */
  async proposals(){
    const { data, error } = await sb.from('proposals').select('*').order('created_at',{ascending:false});
    if (error) throw error;
    const { data:votes } = await sb.from('votes').select('proposal_id,profile_id,voto');
    const byProp = {};
    (votes||[]).forEach(v=>{ (byProp[v.proposal_id]=byProp[v.proposal_id]||{})[v.profile_id]=v.voto; });
    return (data||[]).map(p=>({ ...p, voti: byProp[p.id]||{} }));
  },
  async createProposal(titolo, testo, commissione){
    const { data:{ user } } = await sb.auth.getUser();
    const { data:prof } = await sb.from('profiles').select('nome').eq('id',user.id).single();
    const { error } = await sb.from('proposals').insert({
      titolo, testo, commissione, autore_id:user.id, autore_nome:prof.nome
    });
    if (error) throw error;
  },
  async setStato(id, stato, esito){
    const patch = { stato }; if (esito) patch.esito = esito;
    const { error } = await sb.from('proposals').update(patch).eq('id', id);
    if (error) throw error;
  },
  async vote(proposalId, voto){
    const { data:{ user } } = await sb.auth.getUser();
    // toggle: se voto identico esiste, rimuovi
    const { data:ex } = await sb.from('votes').select('voto')
      .eq('proposal_id',proposalId).eq('profile_id',user.id).maybeSingle();
    if (ex && ex.voto===voto){
      const { error } = await sb.from('votes').delete().eq('proposal_id',proposalId).eq('profile_id',user.id);
      if (error) throw error;
    } else {
      const { error } = await sb.from('votes')
        .upsert({ proposal_id:proposalId, profile_id:user.id, voto }, { onConflict:'proposal_id,profile_id' });
      if (error) throw error;
    }
  },
  async seatsOccupied(){
    // numero di seggi assegnati: leggibile solo dalla Presidenza (RLS).
    // Per il pubblico usiamo il conteggio dei profili con seggio.
    const { count } = await sb.from('profiles').select('id',{count:'exact',head:true}).not('seggio','is',null);
    return count||0;
  },

  /* ---------- PRESIDENZA ---------- */
  async seats(){ const { data, error } = await sb.from('seats').select('*').order('n'); if (error) throw error; return data||[]; },
  async generateCodes(n, comm){ const { error } = await sb.rpc('generate_codes', { p_n:n, p_comm:comm }); if (error) throw error; },

  /* ---------- CONTENUTI (catalogo gestibile dalla Presidenza) ---------- */
  async loadCatalog(){
    const [c,v,a,p,cm,tx,ev,s,lv,tm,ds,fo,nz,ep,ag,ct,md,s3] = await Promise.all([
      sb.from('courses').select('*').order('ordine'),
      sb.from('videos').select('*').order('ordine'),
      sb.from('audiobooks').select('*').order('ordine'),
      sb.from('packages').select('*').order('ordine'),
      sb.from('campus').select('*').order('ordine'),
      sb.from('texts').select('*').order('ordine'),
      sb.from('events').select('*').order('ordine'),
      sb.from('settings').select('*'),
      sb.from('access_levels').select('*').order('ordine'),
      sb.from('commissione_temi').select('*'),
      sb.from('dossier').select('*').order('data_evento',{ascending:false}),
      sb.from('fonti').select('*'),
      sb.from('notizie').select('*').order('pubblicata_il',{ascending:false}).limit(30),
      sb.from('eventi_pace').select('*').order('inizio'),
      sb.from('anagrafiche').select('*').order('cognome'),
      sb.from('contratti').select('*').order('id',{ascending:false}),
      sb.from('contratti_modelli').select('*').order('ordine'),
      sb.from('s3_accounts').select('*').order('id')
    ]);
    const set = {}; (s.data||[]).forEach(r=>set[r.key]=r.value);
    const prezzoCorso = parseInt(set.prezzo_corso||'69',10);
    const prezzoPercorso = parseInt(set.prezzo_percorso||'440',10);
    return {
      CORSI: (c.data||[]).map(r=>({ id:r.id, tit:r.titolo, form:r.formatore, comm:r.commissione,
        pacc:r.pacchetto, area:r.area||'', desc:r.descrizione, prezzo:r.prezzo, ordine:r.ordine, pubblicato:r.pubblicato, creato:r.updated_at, formatoreId:r.formatore_id })),
      VOD: (v.data||[]).map(r=>({ id:r.id, tit:r.titolo, tipo:r.tipo, durata:r.durata, livello:r.livello,
        comm:r.commissione, desc:r.descrizione, ordine:r.ordine, pubblicato:r.pubblicato, creato:r.updated_at,
        serie:r.serie||'', stagione:r.stagione||1, episodio:r.episodio||0 })),
      TEMI: (tm.data||[]).map(r=>({commissione:r.commissione, prefisso:r.prefisso, nota:r.nota})),
      ANAGRAFICHE: (ag.data||[]).map(r=>({ id:r.id, tipo:r.tipo, nome:r.nome, cognome:r.cognome,
        cf:r.codice_fiscale, piva:r.partita_iva, email:r.email, tel:r.telefono, indirizzo:r.indirizzo,
        citta:r.citta, cap:r.cap, prov:r.provincia, qualifica:r.qualifica, note:r.note,
        userId:r.user_id, attivo:r.attivo, creato:r.updated_at })),
      CONTRATTI: (ct.data||[]).map(r=>({ id:r.id, numero:r.numero, titolo:r.titolo||'', anagId:r.anagrafica_id, tipo:r.tipo,
        oggetto:r.oggetto, desc:r.descrizione, compenso:r.compenso, inizio:r.data_inizio, fine:r.data_fine,
        stato:r.stato, testo:r.testo, note:r.note, firmatoIl:r.firmato_il, creato:r.updated_at })),
      S3ACC: (s3.data||[]).map(r=>({ id:r.id, nome:r.nome, endpoint:r.endpoint, region:r.region,
        bucket:r.bucket, accessKeyId:r.access_key_id, secretKey:r.secret_access_key,
        baseUrl:r.public_base_url, attivo:r.attivo })),
      MODELLI: (md.data||[]).map(r=>({ id:r.id, titolo:r.titolo, testo:r.testo, attivo:r.attivo, ordine:r.ordine })),
      FONTI: (fo.data||[]).map(r=>({id:r.id, nome:r.nome, url:r.url, editore:r.editore, attiva:r.attiva, ultimoSync:r.ultimo_sync, ultimoEsito:r.ultimo_esito})),
      NOTIZIE: (nz.data||[]).map(r=>({id:r.id, fonte:r.fonte_id, tit:r.titolo, sommario:r.sommario, url:r.url, img:r.immagine, data:r.pubblicata_il, nascosta:r.nascosta})),
      EVENTIPACE: (ep.data||[]).map(r=>({id:r.id, tit:r.titolo, desc:r.descrizione, luogo:r.luogo, url:r.url, inizio:r.inizio, fine:r.fine, pubblicato:r.pubblicato})),
      DOSSIER: (ds.data||[]).map(r=>({ id:r.id, tit:r.titolo, tipo:r.tipo, stato:r.stato, temi:r.temi||[],
        temiNomi:r.temi_nomi||[], commUe:r.commissioni_ue||[], relatore:r.relatore, url:r.url,
        urlTesto:r.url_testo, data:r.data_evento, livello:r.livello, creato:r.aggiornato_il })),
      LIVELLI: (lv.data||[]).map(r=>({ id:r.id, nome:r.nome, desc:r.descrizione, ospiti:r.ospiti,
        memberships:r.memberships||[], ruoli:r.ruoli||[], invito:r.invito, cta:r.cta,
        ordine:r.ordine, attivo:r.attivo })),
      AUDIO: (a.data||[]).map(r=>({ id:r.id, tit:r.titolo, autore:r.autore, durata:r.durata, free:r.gratuito,
        comm:r.commissione, testo:r.testo, ordine:r.ordine, pubblicato:r.pubblicato, creato:r.updated_at })),
      PACCHETTI: (p.data||[]).map(r=>({ id:r.id, nome:r.nome, corsi:r.corsi||[], prezzo:r.prezzo,
        full:(r.corsi||[]).length*prezzoCorso, ordine:r.ordine, pubblicato:r.pubblicato })),
      CAMPUS: (cm.data||[]).map(r=>({ id:r.id, tit:r.titolo, luogo:r.luogo, desc:r.descrizione, data:r.data,
        durata:r.durata, posti:r.posti, prezzo:r.prezzo, prezzoSoggiorno:r.prezzo_soggiorno,
        comm:r.commissione, ordine:r.ordine, pubblicato:r.pubblicato, creato:r.updated_at })),
      TESTI: (tx.data||[]).map(r=>({ id:r.id, tit:r.titolo, autore:r.autore, comm:r.commissione,
        lettura:r.lettura, testo:r.testo, capitoli:r.capitoli||[], free:r.gratuito, ordine:r.ordine, pubblicato:r.pubblicato, creato:r.updated_at })),
      EVENTI: (ev.data||[]).map(r=>({ id:r.id, tit:r.titolo, sub:r.sottotitolo, desc:r.descrizione, luogo:r.luogo,
        periodo:r.periodo, tipo:r.tipo, accesso:r.accesso, prezzo:r.prezzo, programma:r.programma,
        ordine:r.ordine, pubblicato:r.pubblicato, creato:r.updated_at })),
      PREZZO_CORSO: prezzoCorso, PREZZO_PERCORSO: prezzoPercorso
    };
  },
  async saveCourse(o){ const { error } = await sb.from('courses').upsert({
      id:o.id, titolo:o.tit, formatore:o.form, formatore_id:o.formatoreId||null, commissione:o.comm, pacchetto:o.pacc, area:o.area||'',
      descrizione:o.desc, prezzo:o.prezzo, ordine:o.ordine, pubblicato:o.pubblicato, updated_at:new Date().toISOString()
    }, { onConflict:'id' }); if (error) throw error; },
  async deleteCourse(id){ const { error } = await sb.from('courses').delete().eq('id',id); if (error) throw error; },
  async videoUrl(id){
    const { data, error } = await sb.from('video_sources').select('url').eq('video_id',id).maybeSingle();
    if(error) return null;
    return data ? (data.url||'') : null;   /* null = nessun diritto (o riga assente) */
  },
  async datiEnte(){ const { data, error } = await sb.rpc('dati_ente'); if(error) return {};
    const o={}; (data||[]).forEach(r=>o[r.key]=r.value); return o; },
  async formule(){ const { data } = await sb.from('mecenati_formule').select('*').order('ordine'); return data||[]; },
  async saveFormula(o){ const { error } = await sb.from('mecenati_formule').upsert({
      id:o.id, nome:o.nome, importo:o.importo, quanti:o.quanti, concede:o.concede, tipo:o.tipo,
      durata_mesi:o.durata||12, descrizione:o.desc||'', ordine:o.ordine||0, attivo:o.attivo!==false,
      updated_at:new Date().toISOString() }, { onConflict:'id' }); if(error) throw error; },
  async deleteFormula(id){ const { error } = await sb.from('mecenati_formule').delete().eq('id',id); if(error) throw error; },
  async sottoscriviImpegno(o){ const { data, error } = await sb.rpc('sottoscrivi_impegno', {
      p_formula:o.formula, p_ragione:o.ragione, p_referente:o.referente, p_email:o.email,
      p_telefono:o.telefono||'', p_indirizzo:o.indirizzo||'', p_cf_piva:o.cfPiva||'',
      p_note:o.note||'', p_consenso:!!o.consenso });
    if(error) throw error; return (data&&data[0])||null; },
  async impegni(){ const { data } = await sb.from('mecenati_impegni').select('*').order('created_at',{ascending:false}); return data||[]; },
  async segnaPagato(id){ const { data, error } = await sb.rpc('segna_impegno_pagato',{p_id:id}); if(error) throw error; return data||[]; },
  async saveSetting(k,v){ const { error } = await sb.from('settings').upsert({key:k,value:v},{onConflict:'key'}); if(error) throw error; },
  async redeemVoucher(c){ const { data, error } = await sb.rpc('redeem_voucher',{p_code:c}); if(error) throw error; return data; },
  async listAllegati(tabella, recordId){ const { data, error } = await sb.from('allegati').select('*')
      .eq('tabella',tabella).eq('record_id',String(recordId)).order('id'); if(error) throw error;
      return (data||[]).map(r=>({id:r.id, nome:r.nome, url:r.url, dim:r.dimensione, desc:r.descrizione||''})); },
  async uploadAllegato(tabella, recordId, file){
      const path = `${tabella}/${recordId}/${Date.now().toString(36)}-${String(file.name||'file').replace(/[^A-Za-z0-9._-]+/g,'-')}`;
      const up = await sb.storage.from('allegati').upload(path, file);
      if(up.error) throw up.error;
      const pub = sb.storage.from('allegati').getPublicUrl(path);
      const url = (pub && pub.data && pub.data.publicUrl) || '';
      const { error } = await sb.from('allegati').insert({ tabella, record_id:String(recordId),
        nome:file.name||'file', url, dimensione:file.size||0, descrizione:(arguments[3]||'') }); if(error) throw error; return url; },
  async deleteAllegato(id, url){ const { error } = await sb.from('allegati').delete().eq('id',id); if(error) throw error;
      try{ const p=(url||'').split('/allegati/')[1]; if(p) await sb.storage.from('allegati').remove([p]); }catch(e){} },
  /* ---------- I DIAMANTI (libri) ---------- */
  async loadLibri(){ const { data, error } = await sb.from('libri').select('*').order('ordine'); if(error) throw error; return data||[]; },
  async saveLibro(row){ const { error } = await sb.from('libri').upsert(row, { onConflict:'id' }); if(error) throw error; },
  async deleteLibro(id){ const { error } = await sb.from('libri').delete().eq('id', id); if(error) throw error; },
  /* ---- Gestionale amministrativo (Presidenza -> Amministrazione) ---- */
  async listProdotti(){ const { data, error } = await sb.from('prodotti').select('*').order('ordine'); if(error) throw error; return data||[]; },
  async saveProdotto(row){ const { error } = await sb.from('prodotti').upsert({...row, updated_at:new Date().toISOString()}, { onConflict:'id' }); if(error) throw error; },
  async deleteProdotto(id){ const { error } = await sb.from('prodotti').delete().eq('id', id); if(error) throw error; },
  async listPacchettiProd(){
      const [p,v] = await Promise.all([
        sb.from('pacchetti_prodotti').select('*').order('ordine'),
        sb.from('pacchetti_voci').select('*').order('id')]);
      if(p.error) throw p.error;
      const voci={}; ((v.data)||[]).forEach(r=>{ (voci[r.pacchetto_id]=voci[r.pacchetto_id]||[]).push(r); });
      return ((p.data)||[]).map(r=>({ ...r, voci: voci[r.id]||[] })); },
  async savePacchettoProd(row){ const { error } = await sb.from('pacchetti_prodotti').upsert({...row, updated_at:new Date().toISOString()}, { onConflict:'id' }); if(error) throw error; },
  async deletePacchettoProd(id){ const { error } = await sb.from('pacchetti_prodotti').delete().eq('id', id); if(error) throw error; },
  async addVoce(pacchettoId, tipo, valore){ const { error } = await sb.from('pacchetti_voci').insert({ pacchetto_id:pacchettoId, tipo, valore }); if(error) throw error; },
  async deleteVoce(id){ const { error } = await sb.from('pacchetti_voci').delete().eq('id', id); if(error) throw error; },
  async listAcquisti(){ const { data, error } = await sb.from('acquisti_pacchetti').select('*').order('id',{ascending:false}).limit(400); if(error) throw error; return data||[]; },
  async saveAcquisto(row){ const { data, error } = await sb.from('acquisti_pacchetti').upsert(row, { onConflict:'id' }).select().single(); if(error) throw error; return data; },
  async deleteAcquisto(id){ const { error } = await sb.from('acquisti_pacchetti').delete().eq('id', id); if(error) throw error; },
  async rilasciaErogazione(acquistoId){ const { data, error } = await sb.rpc('rilascia_erogazione', { p_acquisto: acquistoId }); if(error) throw error; return data; },
  async listErogazioni(){ const { data, error } = await sb.from('erogazioni_liberali').select('*').order('anno',{ascending:false}).order('numero',{ascending:false}).limit(400); if(error) throw error; return data||[]; },
  async uploadLibroPdf(id, file){
    if(!sb.storage) throw new Error('Il caricamento dei PDF funziona solo sul portale online.');
    const nome = (file.name||'libro.pdf').replace(/[^a-zA-Z0-9._-]/g,'_');
    const path = id + '/' + Date.now() + '-' + nome;
    const { error } = await sb.storage.from('diamanti').upload(path, file, { upsert:true, contentType:'application/pdf' });
    if(error) throw error; return path; },
  async signedPdfUrl(path){
    if(!sb.storage || !path) return null;
    const b = sb.storage.from('diamanti'); if(!b || typeof b.createSignedUrl!=='function') return null;
    const { data, error } = await b.createSignedUrl(path, 120);
    if(error) throw error; return data && data.signedUrl; },
  async loadTesti(){ const { data, error } = await sb.from('contenuti_sito').select('chiave,valore');
      if(error) throw error; const m={}; (data||[]).forEach(r=>{ m[r.chiave]=r.valore; }); return m; },
  async saveTesti(righe){ if(!righe.length) return; const { error } = await sb.from('contenuti_sito')
      .upsert(righe.map(r=>({ chiave:r.chiave, valore:r.valore, updated_at:new Date().toISOString() })), { onConflict:'chiave' });
      if(error) throw error; },
  async deleteTesto(chiave){ const { error } = await sb.from('contenuti_sito').delete().eq('chiave',chiave); if(error) throw error; },
  async listLezioni(courseId){ const { data, error } = await sb.from('course_lessons').select('*')
      .eq('course_id',courseId).order('ordine'); if(error) throw error;
      return (data||[]).map(r=>({ id:r.id, courseId:r.course_id, tit:r.titolo, desc:r.descrizione,
        video:r.video_url, quiz:r.quiz||[], ordine:r.ordine, pubblicata:r.pubblicata })); },
  async saveLezione(o){ const { error } = await sb.from('course_lessons').upsert({ id:o.id||undefined,
      course_id:o.courseId, titolo:o.tit, descrizione:o.desc||'', video_url:o.video||'',
      quiz:o.quiz||[], ordine:o.ordine||1, pubblicata:o.pubblicata!==false,
      updated_at:new Date().toISOString() }, { onConflict:'id' }); if(error) throw error; },
  async deleteLezione(id){ const { error } = await sb.from('course_lessons').delete().eq('id',id); if(error) throw error; },
  async saveAllegatoEsterno(tabella, recordId, nome, url, size, descrizione){
      const { error } = await sb.from('allegati').insert({ tabella, record_id:String(recordId),
        nome, url, dimensione:size||0, descrizione:descrizione||'' }); if(error) throw error; },
  async saveS3(o){ const { error } = await sb.from('s3_accounts').upsert({ id:o.id||undefined, nome:o.nome,
      endpoint:o.endpoint, region:o.region||'auto', bucket:o.bucket, access_key_id:o.accessKeyId,
      secret_access_key:o.secretKey, public_base_url:o.baseUrl||'', attivo:o.attivo!==false,
      updated_at:new Date().toISOString() }, { onConflict:'id' }); if(error) throw error; },
  async deleteS3(id){ const { error } = await sb.from('s3_accounts').delete().eq('id',id); if(error) throw error; },
  async presignS3(accountId, filename, contentType){
      if(window.__DEMO) return { demo:true, upload_url:'', public_url:'https://video.demo.local/'+encodeURIComponent(filename) };
      const base=(window.PACIFICA_CONFIG&&window.PACIFICA_CONFIG.FUNCTIONS_BASE)||'';
      if(!base) throw new Error('FUNCTIONS_BASE non configurato');
      const { data:{ session } } = await sb.auth.getSession();
      let r;
      try{
        r = await fetch(base+'/s3-presign', { method:'POST',
          headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+(session&&session.access_token||'') },
          body: JSON.stringify({ account_id:accountId, filename, content_type:contentType }) });
      }catch(_e){ throw new Error('La funzione non risponde (failed to fetch): quasi sempre significa che le Edge Function non sono ancora pubblicate su Supabase, o che FUNCTIONS_BASE \u00e8 sbagliato. Controlla: Dashboard \u2192 Edge Functions \u2192 deve esserci \u201cs3-presign\u201d; e FUNCTIONS_BASE deve essere https://TUO-PROGETTO.supabase.co/functions/v1'); }
      const j = await r.json(); if(!r.ok) throw new Error(j.error||('HTTP '+r.status)); return j; },
  async creaUtente(o){
      const base=funcBase(); if(!base) throw new Error('FUNCTIONS_BASE non configurato');
      const { data:{ session } } = await sb.auth.getSession();
      let r;
      try{
        r = await fetch(base+'/crea-utente', { method:'POST',
          headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+(session&&session.access_token||'') },
          body: JSON.stringify(o) });
      }catch(_e){ throw new Error('La funzione non risponde (failed to fetch): quasi sempre significa che la Edge Function \u201ccrea-utente\u201d non \u00e8 ancora pubblicata su Supabase, o che FUNCTIONS_BASE \u00e8 sbagliato.'); }
      const j = await r.json(); if(!r.ok||j.error) throw new Error(j.error||('HTTP '+r.status)); return j; },
  async listUtenti(q){ let sel = sb.from('profiles').select('*').order('nome').limit(200);
      if(q) sel = sel.ilike('nome','%'+q+'%');
      const { data, error } = await sel; if(error) throw error;
      return (data||[]).map(r=>({ id:r.id, nome:r.nome, ruolo:r.ruolo, membership:r.membership,
        scadenza:r.membership_until, seggio:r.seggio, commissione:r.commissione, livello:r.livello_pace||0 })); },
  async saveUtente(id, o){
    const upd = { ruolo:o.ruolo, membership:o.membership, membership_until:o.scadenza||null };
    if (o.livelloPace!=null && !isNaN(o.livelloPace)) upd.livello_pace = o.livelloPace;
    const { error } = await sb.from('profiles').update(upd).eq('id',id); if(error) throw error; },
  async listPagamenti(){ const { data, error } = await sb.from('payments').select('*')
      .order('created_at',{ascending:false}).limit(200); if(error) throw error;
      return (data||[]).map(r=>({ id:r.id, profileId:r.profile_id, kind:r.kind, ref:r.ref,
        amount:r.amount, creato:r.created_at })); },
  async saveAnagrafica(o){ const { error } = await sb.from('anagrafiche').upsert({ id:o.id||undefined,
      tipo:o.tipo||'formatore', nome:o.nome, cognome:o.cognome||'', codice_fiscale:o.cf||'', partita_iva:o.piva||'',
      email:o.email||'', telefono:o.tel||'', indirizzo:o.indirizzo||'', citta:o.citta||'', cap:o.cap||'',
      provincia:o.prov||'', qualifica:o.qualifica||'', note:o.note||'', user_id:o.userId||null,
      attivo:o.attivo!==false, updated_at:new Date().toISOString() }, { onConflict:'id' }); if(error) throw error; },
  async deleteAnagrafica(id){ const { error } = await sb.from('anagrafiche').delete().eq('id',id); if(error) throw error; },
  async listContatti(anagId){ const { data, error } = await sb.from('contatti').select('*')
      .eq('anagrafica_id',anagId).order('data',{ascending:false}); if(error) throw error;
      return (data||[]).map(r=>({id:r.id, data:r.data, canale:r.canale, oggetto:r.oggetto, note:r.note})); },
  async saveContatto(o){ const { error } = await sb.from('contatti').insert({ anagrafica_id:o.anagId,
      data:o.data||undefined, canale:o.canale||'email', oggetto:o.oggetto, note:o.note||'' }); if(error) throw error; },
  async deleteContatto(id){ const { error } = await sb.from('contatti').delete().eq('id',id); if(error) throw error; },
  async saveModello(o){ const { error } = await sb.from('contratti_modelli').upsert({ id:o.id||undefined,
      titolo:o.titolo, testo:o.testo||'', attivo:o.attivo!==false, ordine:o.ordine||0,
      updated_at:new Date().toISOString() }, { onConflict:'id' }); if(error) throw error; },
  async deleteModello(id){ const { error } = await sb.from('contratti_modelli').delete().eq('id',id); if(error) throw error; },
  async numeroContratto(){ const { data, error } = await sb.rpc('genera_numero_contratto'); if(error) throw error; return data; },
  async saveContratto(o){ const { error } = await sb.from('contratti').upsert({ id:o.id||undefined, numero:o.numero, titolo:o.titolo||'',
      anagrafica_id:o.anagId, tipo:o.tipo||'docenza', oggetto:o.oggetto, descrizione:o.desc||'',
      compenso:o.compenso||0, data_inizio:o.inizio||null, data_fine:o.fine||null, stato:o.stato||'bozza',
      testo:o.testo||'', note:o.note||'', firmato_il:o.firmatoIl||null,
      updated_at:new Date().toISOString() }, { onConflict:'id' }); if(error) throw error; },
  async statoContratto(id, stato, firmatoIl){ const { error } = await sb.from('contratti')
      .update({ stato, firmato_il:firmatoIl||null, updated_at:new Date().toISOString() }).eq('id',id); if(error) throw error; },
  async deleteContratto(id){ const { error } = await sb.from('contratti').delete().eq('id',id); if(error) throw error; },
  async saveCorsoDocente(id,o){ const { error } = await sb.from('courses')
      .update({ titolo:o.tit, descrizione:o.desc, updated_at:new Date().toISOString() }).eq('id',id); if(error) throw error; },
  async saveFonte(o){ const { error } = await sb.from('fonti').upsert({ id:o.id, nome:o.nome, url:o.url,
      editore:o.editore||'', attiva:o.attiva!==false, updated_at:new Date().toISOString() }, { onConflict:'id' }); if(error) throw error; },
  async deleteFonte(id){ const { error } = await sb.from('fonti').delete().eq('id',id); if(error) throw error; },
  async setNotiziaNascosta(id,v){ const { error } = await sb.from('notizie').update({nascosta:v}).eq('id',id); if(error) throw error; },
  async sincronizzaFonte(id){
    const base = (window.PACIFICA_CONFIG&&PACIFICA_CONFIG.FUNCTIONS_BASE)||'';
    if(!base) throw new Error('FUNCTIONS_BASE non configurato');
    const { data:{ session } } = await sb.auth.getSession();
    let r;
    try{
      r = await fetch(base.replace(/\/+$/,'')+'/rassegna', { method:'POST',
        headers:{ 'content-type':'application/json', authorization:'Bearer '+(session&&session.access_token||'') },
        body: JSON.stringify({ fonte_id:id }) });
    }catch(_e){ throw new Error('La funzione non risponde (failed to fetch): quasi sempre significa che le Edge Function non sono ancora pubblicate su Supabase, o che FUNCTIONS_BASE \u00e8 sbagliato. Controlla: Dashboard \u2192 Edge Functions \u2192 deve esserci \u201crassegna\u201d; e FUNCTIONS_BASE deve essere https://TUO-PROGETTO.supabase.co/functions/v1'); }
    const d = await r.json(); if(!r.ok) throw new Error(d.error||('HTTP '+r.status)); return d;
  },
  async saveEventoPace(o){ const { error } = await sb.from('eventi_pace').upsert({ id:o.id||undefined, titolo:o.tit,
      descrizione:o.desc||'', luogo:o.luogo||'', url:o.url||'', inizio:o.inizio, fine:o.fine||null,
      pubblicato:o.pubblicato!==false }, { onConflict:'id' }); if(error) throw error; },
  async deleteEventoPace(id){ const { error } = await sb.from('eventi_pace').delete().eq('id',id); if(error) throw error; },
  async traccia(o){ try{ await sb.rpc('traccia', {
      p_tipo:o.tipo, p_vista:o.vista||'', p_dettaglio:o.dettaglio||'', p_dispositivo:o.dispositivo||'altro',
      p_provenienza:o.provenienza||'diretto', p_autenticato:!!o.autenticato, p_ruolo:o.ruolo||null, p_sessione:o.sessione||'' }); }catch(e){} },
  async statRiepilogo(){ const { data } = await sb.rpc('stat_riepilogo'); return (data&&data[0])||null; },
  async statGiorni(g){ const { data } = await sb.rpc('stat_giorni',{p_giorni:g||14}); return data||[]; },
  async statDispositivi(){ const { data } = await sb.rpc('stat_dispositivi'); return data||[]; },
  async statSezioni(){ const { data } = await sb.rpc('stat_sezioni'); return data||[]; },
  async statProvenienze(){ const { data } = await sb.rpc('stat_provenienze'); return data||[]; },
  async rawVoucher(id){ return await sb.from('voucher').select('*').eq('impegno_id',id).order('codice'); },
  async saveTema(o){ const { error } = await sb.from('commissione_temi').upsert({
      commissione:o.commissione, prefisso:o.prefisso, nota:o.nota||'', updated_at:new Date().toISOString()
    }, { onConflict:'commissione,prefisso' }); if (error) throw error; },
  async deleteTema(commissione,prefisso){ const { error } = await sb.from('commissione_temi').delete()
    .eq('commissione',commissione).eq('prefisso',prefisso); if (error) throw error; },
  async temiNonMappati(){ const { data, error } = await sb.rpc('temi_non_mappati'); if(error) return []; return data||[]; },
  async saveVideo(o){
    const { error } = await sb.from('videos').upsert({
      id:o.id, titolo:o.tit, tipo:o.tipo, durata:o.durata, livello:o.livello, commissione:o.comm,
      descrizione:o.desc, ordine:o.ordine, pubblicato:o.pubblicato,
      serie:o.serie||'', stagione:parseInt(o.stagione||1,10)||1, episodio:parseInt(o.episodio||0,10)||0,
      updated_at:new Date().toISOString()
    }, { onConflict:'id' }); if (error) throw error;
    const { error: e2 } = await sb.from('video_sources').upsert({
      video_id:o.id, url:o.url||'', updated_at:new Date().toISOString()
    }, { onConflict:'video_id' }); if (e2) throw e2;
  },
  async saveLevel(o){ const { error } = await sb.from('access_levels').upsert({
      id:o.id, nome:o.nome, descrizione:o.desc||'', ospiti:!!o.ospiti, memberships:o.memberships||[],
      ruoli:o.ruoli||[], invito:o.invito||'', cta:o.cta||'', ordine:o.ordine||0, attivo:o.attivo!==false,
      updated_at:new Date().toISOString()
    }, { onConflict:'id' }); if (error) throw error; },
  async deleteLevel(id){ const { error } = await sb.from('access_levels').delete().eq('id',id); if (error) throw error; },
  async deleteVideo(id){ const { error } = await sb.from('videos').delete().eq('id',id); if (error) throw error; },
  async saveAudio(o){ const { error } = await sb.from('audiobooks').upsert({
      id:o.id, titolo:o.tit, autore:o.autore, durata:o.durata, gratuito:o.free, commissione:o.comm,
      testo:o.testo, ordine:o.ordine, pubblicato:o.pubblicato, updated_at:new Date().toISOString()
    }, { onConflict:'id' }); if (error) throw error; },
  async deleteAudio(id){ const { error } = await sb.from('audiobooks').delete().eq('id',id); if (error) throw error; },
  async savePackage(o){ const { error } = await sb.from('packages').upsert({
      id:o.id, nome:o.nome, corsi:o.corsi, prezzo:o.prezzo, ordine:o.ordine, pubblicato:o.pubblicato
    }, { onConflict:'id' }); if (error) throw error; },
  async deletePackage(id){ const { error } = await sb.from('packages').delete().eq('id',id); if (error) throw error; },
  async saveCampus(o){ const { error } = await sb.from('campus').upsert({
      id:o.id, titolo:o.tit, luogo:o.luogo, descrizione:o.desc, data:o.data, durata:o.durata, posti:o.posti,
      prezzo:o.prezzo, prezzo_soggiorno:o.prezzoSoggiorno, commissione:o.comm, ordine:o.ordine,
      pubblicato:o.pubblicato, updated_at:new Date().toISOString()
    }, { onConflict:'id' }); if (error) throw error; },
  async deleteCampus(id){ const { error } = await sb.from('campus').delete().eq('id',id); if (error) throw error; },
  async saveText(o){ const { error } = await sb.from('texts').upsert({
      id:o.id, titolo:o.tit, autore:o.autore, commissione:o.comm, lettura:o.lettura, testo:o.testo,
      capitoli:o.capitoli||[], gratuito:o.free, ordine:o.ordine, pubblicato:o.pubblicato, updated_at:new Date().toISOString()
    }, { onConflict:'id' }); if (error) throw error; },
  async deleteText(id){ const { error } = await sb.from('texts').delete().eq('id',id); if (error) throw error; },
  async saveEvent(o){ const { error } = await sb.from('events').upsert({
      id:o.id, titolo:o.tit, sottotitolo:o.sub, descrizione:o.desc, luogo:o.luogo, periodo:o.periodo,
      tipo:o.tipo, accesso:o.accesso, prezzo:o.prezzo, programma:o.programma, ordine:o.ordine,
      pubblicato:o.pubblicato, updated_at:new Date().toISOString()
    }, { onConflict:'id' }); if (error) throw error; },
  async deleteEvent(id){ const { error } = await sb.from('events').delete().eq('id',id); if (error) throw error; },
  async saveSetting(key,value){ const { error } = await sb.from('settings').upsert({ key, value:String(value) }, { onConflict:'key' }); if (error) throw error; },

  /* ---------- PAGAMENTI (Stripe Checkout) ---------- */
  stripeAttivo(){ return stripeOn(); },
  async checkout(kind, ref){
    const { data:{ session } } = await sb.auth.getSession();
    const r = await fetch(funcBase()+'/create-checkout', {
      method:'POST',
      headers:{ 'Content-Type':'application/json',
                'Authorization':'Bearer '+(session?session.access_token:CFG.SUPABASE_ANON_KEY) },
      body: JSON.stringify({ kind, ref })
    });
    const j = await r.json();
    if (!r.ok || !j.url) throw new Error(j.error || 'Errore nel pagamento');
    window.location.assign(j.url);   // reindirizza a Stripe
  },

  /* ---------- MOTORE IA (Edge Function) ---------- */
  async ai(system, prompt){
    const url = aiUrl();
    if (!url) throw new Error('IA non configurata');
    const { data:{ session } } = await sb.auth.getSession();
    const r = await fetch(url, {
      method:'POST',
      headers:{ 'Content-Type':'application/json',
                'Authorization':'Bearer '+(session?session.access_token:CFG.SUPABASE_ANON_KEY) },
      body: JSON.stringify({ system, prompt })
    });
    if (!r.ok) throw new Error('IA non raggiungibile');
    const j = await r.json();
    return j.text || j.completion || '';
  }
};
