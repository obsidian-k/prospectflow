// ══════════════════════════════════════════════════════════════════════════
// RADAR DE SIGNAUX — ProspectFlow (FirstSignal)
// Balayage hebdo GRATUIT (BODACC + API gouv), scoring, écrit signals.json.
// Aucune clé requise. Tourne en GitHub Action (lundi ~6h30) ou en local :
//   node scripts/radar.mjs
// Variables d'env optionnelles (pour test) : RADAR_DEPTS, RADAR_DAYS, RADAR_GOVCAP
// ══════════════════════════════════════════════════════════════════════════

const DEPTS   = (process.env.RADAR_DEPTS || '75,77,78,91,92,93,94,95').split(',').map(s=>s.trim());
const DAYS    = parseInt(process.env.RADAR_DAYS || '8', 10);          // fenêtre (hebdo + marge)
const GOV_CAP = parseInt(process.env.RADAR_GOVCAP || '350', 10);      // max enrichissements gouv (âge/NAF)
const MAX_PER_FAMILLE = parseInt(process.env.RADAR_MAXFAM || '500', 10);
const HOT_THRESHOLD = 60;

const ODS = 'https://bodacc-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/annonces-commerciales/records';
const GOV = 'https://recherche-entreprises.api.gouv.fr/search';

const FAMILIES = [
  { key:'gouvernance', lib:'Modifications diverses', base:40, dirigeantOnly:true },
  { key:'cession',     lib:'Ventes et cessions',     base:45 },
  { key:'creation',    lib:'Créations',              base:35, holdingOnly:true },
  { key:'depot',       lib:'Dépôts des comptes',     base:20, richOnly:true },
];

const SIGNAL_LABELS = {
  gouvernance:'Changement de gouvernance', cession:'Cession / vente',
  creation:'Création de holding', depot:'Dépôt de comptes',
};

const DIRIGEANT_RX = /président|gérant|directeur général|directrice générale|administrateur|administratrice|nomination|dirigeant|représentant|membre du conseil|co-?gérant|directoire|conseil de surveillance/i;
const HOLDING_NAF  = '64.20Z';
const HOLDING_TEXT_RX = /holding|gestion (de|des) (titres|participations|valeurs|portefeuille)|prise de participation|société de portefeuille|animation de (groupe|sociétés)|acquisition de participations/i;

const sleep = ms => new Promise(r=>setTimeout(r, ms));
const cutoffISO = () => { const d=new Date(); d.setDate(d.getDate()-DAYS); return d.toISOString().slice(0,10); };
const todayISO  = () => new Date().toISOString().slice(0,10);

function parseJSONField(v){ if(!v) return null; if(typeof v==='object') return v; try{ return JSON.parse(v); }catch(e){ return null; } }
function sirenFrom(rec){
  const reg = Array.isArray(rec.registre) ? rec.registre : [rec.registre];
  for(const r of reg){ const m=String(r||'').replace(/\D/g,''); if(m.length===9) return m; }
  const lp = parseJSONField(rec.listepersonnes);
  const id = lp?.personne?.numeroImmatriculation?.numeroIdentification;
  if(id){ const m=String(id).replace(/\D/g,''); if(m.length===9) return m; }
  return '';
}
function partiesFrom(rec){
  const lp = parseJSONField(rec.listepersonnes); if(!lp) return [];
  let arr = lp.personne ? (Array.isArray(lp.personne)?lp.personne:[lp.personne]) : (Array.isArray(lp)?lp:[lp]);
  return arr.map(p=>p.denomination || `${p.prenom||''} ${p.nom||''}`.trim()).filter(Boolean).slice(0,4);
}
function adminText(rec){
  const lp = parseJSONField(rec.listepersonnes);
  const mg = parseJSONField(rec.modificationsgenerales);
  let arr = lp?.personne ? (Array.isArray(lp.personne)?lp.personne:[lp.personne]) : [];
  const admins = arr.map(p=>p.administration||'').filter(Boolean).join(' | ');
  return [admins, mg?.descriptif||''].filter(Boolean).join(' — ');
}
function capitalFrom(rec){
  const lp = parseJSONField(rec.listepersonnes);
  let arr = lp?.personne ? (Array.isArray(lp.personne)?lp.personne:[lp.personne]) : [];
  for(const p of arr){ const c=p?.capital?.montantCapital; if(c) return Math.round(parseFloat(c))||0; }
  return 0;
}
function activiteFrom(rec){
  const lp = parseJSONField(rec.listepersonnes);
  let arr = lp?.personne ? (Array.isArray(lp.personne)?lp.personne:[lp.personne]) : [];
  for(const p of arr){ if(p?.activite) return String(p.activite); }
  return '';
}

// ── BODACC : récupère une famille sur la fenêtre, pour les départements ciblés ──
async function fetchFamille(fam){
  const out=[]; const since=cutoffISO();
  const deptIn = DEPTS.map(d=>`"${d}"`).join(',');
  const where = `familleavis_lib="${fam.lib}" and numerodepartement in (${deptIn}) and dateparution>=date'${since}'`;
  for(let offset=0; offset<MAX_PER_FAMILLE; offset+=100){
    const url = `${ODS}?where=${encodeURIComponent(where)}&order_by=dateparution%20desc&limit=100&offset=${offset}`;
    let j; try{ const r=await fetch(url); if(!r.ok) break; j=await r.json(); }catch(e){ break; }
    const rows = j.results || [];
    if(!rows.length) break;
    for(const rec of rows){
      const siren = sirenFrom(rec); if(!siren) continue;
      if(fam.dirigeantOnly && !DIRIGEANT_RX.test(adminText(rec))) continue;
      // créations : ne garder que les holdings (objet social), gratuit, sans appel gouv
      if(fam.holdingOnly && !HOLDING_TEXT_RX.test(activiteFrom(rec))) continue;
      out.push({
        siren, famille:fam.key, base:fam.base,
        societe: rec.commercant || (partiesFrom(rec)[0]||''),
        date: rec.dateparution || '', dept: rec.numerodepartement || '',
        cp: rec.cp || '', ville: rec.ville || '',
        capital: capitalFrom(rec),
        admin: fam.dirigeantOnly ? adminText(rec).slice(0,220) : '',
        parties: (fam.key==='cession') ? partiesFrom(rec) : [],
        bodacc_url: rec.url_complete || '',
        _holdingOnly: !!fam.holdingOnly, _richOnly: !!fam.richOnly,
      });
    }
    if(rows.length<100) break;
    await sleep(120);
  }
  return out;
}

// ── API gouv : âge dirigeants + NAF + nom (gratuit) ──
async function govEnrich(siren){
  try{
    const r = await fetch(`${GOV}?q=${siren}&page=1&per_page=1&include=dirigeants,siege`);
    if(!r.ok) return null;
    const j = await r.json();
    const e = (j.results||[]).find(x=>x.siren===siren) || (j.results||[])[0];
    if(!e) return null;
    const naf = e.siege?.activite_principale || e.activite_principale || '';
    const dirs = (e.dirigeants||[]).filter(d=>d.type_dirigeant==='personne physique');
    let ageMax=0; const names=[];
    const yNow=new Date().getFullYear();
    for(const d of dirs){
      const y = parseInt((d.annee_de_naissance||(d.date_de_naissance||'').slice(0,4)),10);
      if(y){ const age=yNow-y; if(age>0&&age<110&&age>ageMax) ageMax=age; }
      const nm=`${(d.prenoms||'').split(' ')[0]||''} ${d.nom||''}`.trim();
      if(nm) names.push(nm + (y?` (${yNow-y})`:''));
    }
    return { naf, ageMax, nom: e.nom_complet||e.nom_raison_sociale||'', dirigeants:names.slice(0,4) };
  }catch(e){ return null; }
}

function score(s){
  let sc = s.base;
  const a = s.ageMax||0;
  if(a>=70) sc+=30; else if(a>=65) sc+=25; else if(a>=60) sc+=18; else if(a>=55) sc+=8;
  const cap = s.capital||0;
  if(cap>=1e6) sc+=15; else if(cap>=5e5) sc+=10; else if(cap>=1e5) sc+=5;
  const days = s.date ? Math.round((Date.now()-new Date(s.date).getTime())/864e5) : 99;
  if(days<=3) sc+=8; else if(days<=7) sc+=4;
  return Math.min(sc,100);
}

async function main(){
  console.log(`[radar] fenêtre ${DAYS}j depuis ${cutoffISO()} · départements ${DEPTS.join(',')}`);
  // 1) BODACC : toutes les familles
  let raw=[];
  for(const fam of FAMILIES){
    const rows = await fetchFamille(fam);
    console.log(`[radar] BODACC ${fam.lib}: ${rows.length}`);
    raw.push(...rows);
  }
  // 2) dédup par SIREN (garde le signal au score de base le + fort)
  const bySiren=new Map();
  for(const s of raw){ const ex=bySiren.get(s.siren); if(!ex || s.base>ex.base) bySiren.set(s.siren, s); }
  let signals=[...bySiren.values()];
  console.log(`[radar] ${signals.length} signaux uniques (avant enrichissement gouv)`);

  // 3) enrichissement gouv (âge/NAF) — priorité cession>gouvernance>création>dépôt, plafonné
  const prio={cession:0,gouvernance:1,creation:2,depot:3};
  signals.sort((a,b)=>(prio[a.famille]-prio[b.famille]) || (b.capital-a.capital));
  let used=0;
  for(const s of signals){
    if(used>=GOV_CAP) break;
    // dépôts : on n'enrichit que si capital déjà élevé (sinon trop de bruit)
    if(s._richOnly && s.capital<5e5) continue;
    const g = await govEnrich(s.siren); used++;
    if(g){ s.ageMax=g.ageMax; s.naf=g.naf; s.dirigeants=g.dirigeants; if(g.nom) s.societe=s.societe||g.nom; }
    await sleep(140);
  }
  console.log(`[radar] enrichissements gouv : ${used}`);

  // 4) filtres post-enrichissement
  signals = signals.filter(s=>{
    if(s._holdingOnly && s.naf && s.naf!==HOLDING_NAF) return false; // créations : holdings only
    if(s._richOnly && s.capital<5e5) return false;                  // dépôts : seulement les "riches"
    return true;
  });

  // 5) scoring + tri + sortie
  for(const s of signals){ s.score=score(s); s.hot=s.score>=HOT_THRESHOLD; s.signal_label=SIGNAL_LABELS[s.famille]; }
  signals.sort((a,b)=>b.score-a.score);
  signals.forEach(s=>{ delete s._holdingOnly; delete s._richOnly; delete s.base; });

  const hot = signals.filter(s=>s.hot);
  const payload = {
    generated_at: new Date().toISOString(), window_days: DAYS, depts: DEPTS,
    count: signals.length, count_hot: hot.length, signals,
  };

  const fs = await import('node:fs');
  fs.writeFileSync('signals.json', JSON.stringify(payload, null, 1));
  fs.writeFileSync('radar_email.html', emailHTML(payload));
  console.log(`[radar] ✅ signals.json : ${signals.length} signaux (${hot.length} chauds)`);
}

function emailHTML(p){
  const rows = p.signals.filter(s=>s.hot).slice(0,25).map(s=>`
    <tr>
      <td style="padding:6px 10px;border-bottom:1px solid #eee"><b>${esc(s.societe||s.siren)}</b><br><span style="color:#888;font-size:11px">${s.siren} · ${s.cp} ${esc(s.ville)}</span></td>
      <td style="padding:6px 10px;border-bottom:1px solid #eee">${esc(s.signal_label)}<br><span style="color:#888;font-size:11px">${s.date}</span></td>
      <td style="padding:6px 10px;border-bottom:1px solid #eee;font-size:12px">${esc((s.dirigeants||[]).join(', '))}${s.capital?`<br><span style="color:#888;font-size:11px">capital ${s.capital.toLocaleString('fr-FR')} €</span>`:''}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:center;font-weight:700;color:${s.score>=75?'#d97706':'#555'}">${s.score}</td>
    </tr>`).join('');
  return `<div style="font-family:Arial,sans-serif;max-width:760px;margin:auto">
    <h2 style="color:#111">🎯 Radar ProspectFlow — ${p.count_hot} leads chauds</h2>
    <p style="color:#555">Balayage du ${p.generated_at.slice(0,10)} · ${p.depts.join(', ')} · ${p.count} signaux détectés, ${p.count_hot} chauds (score ≥ ${HOT_THRESHOLD}).</p>
    <table style="border-collapse:collapse;width:100%;font-size:13px">
      <tr style="background:#f5f5f5;text-align:left"><th style="padding:6px 10px">Société</th><th style="padding:6px 10px">Signal</th><th style="padding:6px 10px">Dirigeant / capital</th><th style="padding:6px 10px">Score</th></tr>
      ${rows}
    </table>
    <p style="color:#888;font-size:12px;margin-top:16px">Ouvre ProspectFlow pour traiter ces leads (enrichissement Pappers/LinkedIn à la demande). Les leads non chauds sont en attente dans l'app.</p>
  </div>`;
}
function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

main().catch(e=>{ console.error('[radar] ERREUR', e); process.exit(1); });
