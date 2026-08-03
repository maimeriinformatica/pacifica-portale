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
  /* ---------- AUTENTICAZIONE ---------- */
  async signUp(nome, email, password){
    const { data, error } = await sb.auth.signUp({
      email, password, options:{ data:{ nome } }
    });
    if (error) throw error;
    return data;
  },
  async signIn(email, password){
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },
  async signOut(){ await sb.auth.signOut(); },
  async session(){ const { data } = await sb.auth.getSession(); return data.session; },

  /* ---------- PROFILO (carica tutto ciò che serve a `io`) ---------- */
  async loadMe(){
    const { data:{ user } } = await sb.auth.getUser();
    if (!user) return null;
    const { data:prof, error } = await sb.from('profiles').select('*').eq('id', user.id).single();
    if (error) throw error;
    const acquisti = await this.myPurchases();
    const progress = await this.myProgress();
    return {
      id:prof.id, nome:prof.nome, email:user.email,
      ruolo:prof.ruolo, membership:prof.membership,
      seggio:prof.seggio, comm:prof.commissione,
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
    const [c,v,a,p,cm,tx,ev,s,lv,tm,ds,fo,nz,ep,ag,ct] = await Promise.all([
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
      sb.from('contratti').select('*').order('id',{ascending:false})
    ]);
    const set = {}; (s.data||[]).forEach(r=>set[r.key]=r.value);
    const prezzoCorso = parseInt(set.prezzo_corso||'69',10);
    const prezzoPercorso = parseInt(set.prezzo_percorso||'440',10);
    return {
      CORSI: (c.data||[]).map(r=>({ id:r.id, tit:r.titolo, form:r.formatore, comm:r.commissione,
        pacc:r.pacchetto, desc:r.descrizione, prezzo:r.prezzo, ordine:r.ordine, pubblicato:r.pubblicato, creato:r.updated_at, formatoreId:r.formatore_id })),
      VOD: (v.data||[]).map(r=>({ id:r.id, tit:r.titolo, tipo:r.tipo, durata:r.durata, livello:r.livello,
        comm:r.commissione, desc:r.descrizione, ordine:r.ordine, pubblicato:r.pubblicato, creato:r.updated_at })),
      TEMI: (tm.data||[]).map(r=>({commissione:r.commissione, prefisso:r.prefisso, nota:r.nota})),
      ANAGRAFICHE: (ag.data||[]).map(r=>({ id:r.id, tipo:r.tipo, nome:r.nome, cognome:r.cognome,
        cf:r.codice_fiscale, piva:r.partita_iva, email:r.email, tel:r.telefono, indirizzo:r.indirizzo,
        citta:r.citta, cap:r.cap, prov:r.provincia, qualifica:r.qualifica, note:r.note,
        userId:r.user_id, attivo:r.attivo, creato:r.updated_at })),
      CONTRATTI: (ct.data||[]).map(r=>({ id:r.id, numero:r.numero, anagId:r.anagrafica_id, tipo:r.tipo,
        oggetto:r.oggetto, desc:r.descrizione, compenso:r.compenso, inizio:r.data_inizio, fine:r.data_fine,
        stato:r.stato, testo:r.testo, note:r.note, firmatoIl:r.firmato_il, creato:r.updated_at })),
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
      id:o.id, titolo:o.tit, formatore:o.form, formatore_id:o.formatoreId||null, commissione:o.comm, pacchetto:o.pacc,
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
  async numeroContratto(){ const { data, error } = await sb.rpc('genera_numero_contratto'); if(error) throw error; return data; },
  async saveContratto(o){ const { error } = await sb.from('contratti').upsert({ id:o.id||undefined, numero:o.numero,
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
    const r = await fetch(base.replace(/\/+$/,'')+'/rassegna', { method:'POST',
      headers:{ 'content-type':'application/json', authorization:'Bearer '+(session&&session.access_token||'') },
      body: JSON.stringify({ fonte_id:id }) });
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
      descrizione:o.desc, ordine:o.ordine, pubblicato:o.pubblicato, updated_at:new Date().toISOString()
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
