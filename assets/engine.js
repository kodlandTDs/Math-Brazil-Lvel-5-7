/* =========================================================
   Aventuras Matemáticas — Tutor Training (Brazil) · engine
   Texts live in assets/content-<lang>.js (window.COURSE). This file holds the logic only:
   home, modules, level cards, module checks, start + final survey, LMS bridge, dev mode.
   ========================================================= */
'use strict';

/* ---------- CONFIG ---------- */
// Paste the Google Apps Script Web App URL (it ends in /exec) between the quotes below.
// Empty = answers are not sent anywhere: the payload is logged in the console and the training still unlocks.
const SURVEY_URL = 'https://script.google.com/macros/s/AKfycbyLMY4UYvR5h7Aht0NjOyoltWUlqgp8wPrswfLefWq6aeuq_shKRzM1nJSC8YZYmVk/exec';

const C = window.COURSE, UI = C.ui, SV = C.survey;
const REVIEW = !!window.REVIEW_BUILD;                // single-file review version: everything open, no surveys, nothing sent
if (window.__trainingAC) window.__trainingAC.abort();
const SIG = { signal: (window.__trainingAC = new AbortController()).signal };
const TRAINING_ID = C.id;                         // 'mathbr'
const PASS = 0.7;                                 // 70% to pass each check
const DEV_CODE = 'MATHDEV';
const PKEY = 'kl-training-' + TRAINING_ID + (window.REVIEW_BUILD ? '-review' : '');  // progress
const SKEY = 'kl-start-survey-' + TRAINING_ID;    // start survey (sent once per browser)
const REGIONS = ['brazil', 'latam', 'mena', 'italy', 'poland', 'uk', 'usa', 'indonesia', 'gcc', 'cis'];
// This training is for Brazil: the region is preselected as brazil in both languages (the tutor can change it).
const REGION_BY_LANG = { pt: 'brazil', en: 'brazil' };
const FEELINGS = ['excited', 'curious', 'calm', 'unsure', 'worried', 'overwhelmed'];
const LEVEL_MODULE = C.modules[C.modules.length - 1].id;   // the last module holds the level cards

const tx = (k, o) => String(UI[k]).replace(/\{(\w+)\}/g, (s, x) => o && x in o ? o[x] : s);
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const norm = s => String(s || '').trim().toUpperCase().replace(/\s+/g, '');

document.documentElement.lang = C.lang === 'pt' ? 'pt-BR' : 'en';
document.title = `${C.short} · ${UI.pageTitle}`;
document.documentElement.style.setProperty('--course', C.color);

/* ---------- Safe storage: memory + localStorage + sessionStorage, every access in try/catch ---------- */
const STORE = (function(){
  const mem = {};
  function areas(){ const a = []; try { a.push(window.localStorage); } catch(e){} try { a.push(window.sessionStorage); } catch(e){} return a; }
  return {
    get(k){ for (const st of areas()){ try { const v = st.getItem(k); if (v !== null) return v; } catch(e){} } return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
    getAll(k){ const out = []; for (const st of areas()){ try { const v = st.getItem(k); if (v !== null) out.push(v); } catch(e){} } if (Object.prototype.hasOwnProperty.call(mem, k)) out.push(mem[k]); return out; },
    set(k, v){ v = String(v); mem[k] = v; for (const st of areas()){ try { st.setItem(k, v); } catch(e){} } },
    remove(k){ delete mem[k]; for (const st of areas()){ try { st.removeItem(k); } catch(e){} } }
  };
})();
const parse = raw => { try { const v = JSON.parse(raw); return v && typeof v === 'object' ? v : null; } catch(e){ return null; } };

/* ---------- Progress (only moves forward: passed stays passed, best score wins, flags stay on) ---------- */
function mergeP(a, b){
  a = a || {}; b = b || {};
  const out = Object.assign({}, b, a);
  Object.keys(b).forEach(k => {
    const x = a[k], y = b[k];
    if ((k === 'flags' || k === 'levels') && y && typeof y === 'object'){
      out[k] = Object.assign({}, x || {}); Object.keys(y).forEach(f => { if (y[f] && !out[k][f]) out[k][f] = y[f]; });
    } else if (k === 'start' && y && typeof y === 'object' && !(x && x.email)){
      out.start = y;
    } else if (y && typeof y === 'object' && ('passed' in y || 'score' in y)){
      const xo = (x && typeof x === 'object') ? x : {};
      out[k] = Object.assign({}, y, xo, { passed: !!(xo.passed || y.passed), score: Math.max(Number(xo.score) || 0, Number(y.score) || 0) });
    }
  });
  return out;
}
let P = {};
function loadP(){ P = {}; STORE.getAll(PKEY).forEach(raw => { P = mergeP(P, parse(raw) || {}); }); }
function saveP(){ STORE.set(PKEY, JSON.stringify(P)); lmsSync(); }
const passed = id => !!(P[id] && P[id].passed);
function setResult(id, pct, ok){ const o = P[id] || {}; P[id] = Object.assign(o, { passed: ok || !!o.passed, score: Math.max(pct, o.score || 0) }); saveP(); }
const flag = k => !!(P.flags && P.flags[k]);
function setFlag(k, v){ P.flags = Object.assign({}, P.flags); P.flags[k] = v; saveP(); }
const levelSeen = n => !!(P.levels && P.levels[n]);
const levelsSeen = () => C.levels.filter(l => levelSeen(l.n)).length;
function markLevel(n){ if (levelSeen(n)) return; P.levels = Object.assign({}, P.levels); P.levels[n] = true; saveP(); }

const MODS = C.modules, TOTAL = MODS.length;
const findMod = id => MODS.find(m => m.id === id);
const unlocked = m => { const i = MODS.indexOf(m); return P.dev || i <= 0 || passed(MODS[i - 1].id); };
const allDone = () => MODS.every(m => passed(m.id));

/* ---------- Developer mode: only with ?dev=1 ---------- */
const DEV_ALLOWED = REVIEW || /[?&]dev=1(&|$)/.test(location.search);
const DEV_BACKUP = PKEY + '-devbackup';
function restoreRealProgress(){
  const real = parse(STORE.get(DEV_BACKUP)) || {};
  delete real.dev; P = real; STORE.remove(DEV_BACKUP);
}

/* ---------- LMS bridge (postMessage to the parent window) ----------
   Training -> LMS: {source:'kodland-training', training, lang, event:'ready'|'progress'|'completed', progress, done, total, score}
   Outside an iframe nothing is sent. With ?dev=1 nothing is sent. 'completed' is sent only once. */
const IN_LMS = (function(){ try { return window.parent !== window; } catch(e){ return true; } })();
let lmsReady = false;
let completedSent = false;
let lastPassedCount = -1;
function lmsSummary(){
  const done = MODS.filter(m => passed(m.id)).length;
  const score = Math.round(MODS.map(m => (P[m.id] && Number(P[m.id].score)) || 0).reduce((a, b) => a + b, 0) / (MODS.length || 1));
  return { progress: P, done, total: MODS.length, score };
}
function lmsSend(event){
  try {
    if (!IN_LMS || !lmsReady || DEV_ALLOWED || P.dev) return;
    window.parent.postMessage(Object.assign({ source:'kodland-training', training:TRAINING_ID, lang:C.lang, event }, lmsSummary()), '*');
  } catch(e){}
}
function lmsSync(){
  if (!lmsReady) return;
  const n = MODS.filter(m => passed(m.id)).length;
  if (n !== lastPassedCount){ if (lastPassedCount >= 0) lmsSend('progress'); lastPassedCount = n; }
  if (!completedSent && allDone() && !DEV_ALLOWED && !P.dev){ completedSent = true; lmsSend('completed'); }
}
addEventListener('message', e => {
  try { if (!IN_LMS || e.source !== window.parent) return;
    const d = e.data; if (!d || d.source !== 'kodland-lms' || d.event !== 'progress' || !d.progress || typeof d.progress !== 'object') return;
    P = mergeP(P, d.progress); STORE.set(PKEY, JSON.stringify(P)); lmsSync(); route(); } catch(err){}
}, SIG);

/* ---------- Progress carried in the URL (?p=...) by a language switch ---------- */
function takeUrlProgress(){
  try {
    const q = new URLSearchParams(location.search), raw = q.get('p'); if (!raw) return;
    const got = parse(raw); if (got){ P = mergeP(P, got); STORE.set(PKEY, JSON.stringify(P)); if (got.start && got.start.email && !STORE.get(SKEY)) STORE.set(SKEY, JSON.stringify(got.start)); }
    q.delete('p'); history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q.toString() : '') + location.hash);
  } catch(e){}
}

/* =========================================================
   RENDERING
   ========================================================= */
const view = $('#view');
const callout = (kind, e, html) => `<div class="callout ${kind}"><span class="ci">${e}</span><div>${html}</div></div>`;

function renderNav(kind, back){
  const done = MODS.filter(m => passed(m.id)).length;
  const langs = window.COURSE_LANGS || [];
  const langSw = `<span class="langsw" aria-label="${UI.langLabel}">${langs.map(l => `<a href="#" data-lang="${l[0]}" class="${l[0] === C.lang ? 'on' : ''}">${l[1]}</a>`).join('')}</span>`;
  $('#nav').innerHTML = `<span class="logo">kodland<small>${UI.logoSub}</small></span><span class="sp"></span>
    ${kind === 'home' ? `<span class="npill">${done}/${TOTAL}</span>` : ''}
    ${kind === 'module' || kind === 'done' ? `<button class="nbtn" data-go="">${UI.navHome}</button>` : ''}
    ${kind === 'level' ? `<button class="nbtn" data-go="${LEVEL_MODULE}">${UI.navBackLevels}</button>` : ''}
    ${kind === 'quiz' ? `<button class="nbtn" data-exit>${UI.navBackModule}</button>` : ''}
    ${langSw}`;
}

function renderHome(){
  renderNav('home');
  const done = MODS.filter(m => passed(m.id)).length, H = UI.home;
  view.innerHTML = `
  <div class="hero"><span class="kicker">${H.kicker}</span><h1>${H.title}</h1><p class="lead">${H.lead}</p></div>
  <div class="notes">${H.notes.map(n => callout(n.kind, n.e, n.html)).join('')}</div>
  <div class="facts">${H.facts.map(f => `<div class="fact"><span class="fn">${f[0]}</span><span>${f[1]}</span></div>`).join('')}</div>
  <div class="prog"><b>${done}/${TOTAL}</b><div class="ptrack"><div class="pfill" style="width:${done / TOTAL * 100}%"></div></div><span class="plabel">${done === TOTAL ? UI.progAllDone : UI.progLabel}</span></div>
  <div class="mods">${MODS.map(m => {
      const lock = !unlocked(m), ok = passed(m.id);
      const badge = ok ? tx('badgeDone', { score: P[m.id].score }) : lock ? tx('badgeLocked', { n: m.n - 1 }) : UI.badgeStart;
      return `<button class="mcard ${lock ? 'locked' : ''} ${ok ? 'done' : ''}" ${lock ? `data-locked="${m.n - 1}"` : `data-go="${m.id}"`} style="--mc:${m.color}">
        <span class="mn">${tx('moduleN', { n: m.n })}</span><span class="me">${m.e}</span><h3>${m.title}</h3><p>${m.desc}</p><span class="badge">${badge}</span></button>`;
    }).join('')}</div>
  ${done === TOTAL ? `<div class="mcta"><span class="e">🏆</span><div class="grow"><h3>${UI.homeDoneTitle}</h3><p>${UI.homeDoneText}</p></div><button class="btn-y" data-go="done">${UI.homeDoneBtn}</button></div>` : ''}`;
}

/* ----- module check call-to-action (with the extra locks of Module 5) ----- */
function checkLocks(m){
  if (P.dev) return [];
  const l = [];
  const miss = (m.needs || []).filter(f => !flag(f));
  if (miss.length) l.push(tx('lockSims', { list: miss.map(f => (C.sims[f] || {}).title || f).join(' · ') }));
  if (m.id !== LEVEL_MODULE) return l;
  if (levelsSeen() < C.levels.length) l.push(tx('lockLevels', { done: levelsSeen(), total: C.levels.length }));
  if (!flag('finalSurvey')) l.push(UI.lockSurvey);
  return l;
}
function ctaHTML(m){
  const locks = checkLocks(m), ready = !locks.length;
  return `<span class="e">${passed(m.id) ? '🏅' : '📝'}</span>
    <div class="grow"><h3>${UI.ctaTitle}</h3><p>${tx('ctaText', { n: (C.quiz[m.id] || []).length })}</p>${locks.map(t => `<div class="lockmsg">${t}</div>`).join('')}</div>
    <button class="btn-y" id="startCheck" ${ready ? '' : 'disabled'}>${passed(m.id) ? UI.retake : UI.startCheck}</button>`;
}
const refreshCTA = m => { const c = $('#mcta'); if (c) c.innerHTML = ctaHTML(m); };

function moduleHead(m){
  return `<div class="mhead" style="--mc:${m.color}"><span class="eyebrow">${tx('eyebrow', { n: m.n, total: TOTAL, course: C.short })}</span>
    <h1>${m.e} ${m.title}</h1>${m.goal ? `<div class="mobj"><b>${UI.goalLabel}:</b> ${m.goal}</div>` : ''}</div>`;
}

function renderModule(m){
  renderNav('module');
  if (m.id === LEVEL_MODULE){ renderLevelsModule(m); return; }
  view.innerHTML = `${moduleHead(m)}
  <div class="chips"><span class="chl">${UI.sectionsLabel}:</span>${m.sections.map(s => `<button class="chip" data-jump="${s.id}">${s.title}</button>`).join('')}</div>
  ${m.sections.map(s => `<section class="sec" id="sec-${s.id}"><h2 class="sh">${s.title}</h2><div class="rich">${s.html}</div></section>`).join('')}
  <div class="mcta" id="mcta">${ctaHTML(m)}</div>`;
  initWidgets();
}

function renderLevelsModule(m){
  view.innerHTML = `${moduleHead(m)}
  <section class="sec"><div class="rich">${C.levelsIntro}</div>
    <h2 class="sh">${UI.levelsTitle}</h2><p class="hint">${UI.levelsHint}</p>
    <div class="levels">${C.levels.map(l => `<button class="lvl ${levelSeen(l.n) ? 'seen' : ''}" data-go="${LEVEL_MODULE}/${l.n}" style="--lc:${l.color}">
      <span class="ln">${tx('levelN', { n: l.n })}</span><span class="lt">${l.title}</span>
      <span class="lm"><span>🎂 ${tx('levelAge', { age: l.age })}</span><span>[${l.code}]</span></span>
      <span class="ls">${levelSeen(l.n) ? UI.levelOpened : UI.levelOpen}</span></button>`).join('')}</div>
  </section>
  <section class="sec" id="finalSurvey">${finalSurveyHTML()}</section>
  <div class="mcta" id="mcta">${ctaHTML(m)}</div>`;
  initWidgets(); initFinalSurvey();
}

function renderLevel(n){
  const l = C.levels.find(x => x.n === n); if (!l){ go(LEVEL_MODULE); return; }
  markLevel(n);
  renderNav('level');
  const prev = C.levels.find(x => x.n === n - 1), next = C.levels.find(x => x.n === n + 1);
  view.innerHTML = `<div class="mhead lhead" style="--mc:${l.color}"><span class="eyebrow">${tx('levelN', { n: l.n })} · [${l.code}] · ${tx('levelAge', { age: l.age })}</span><h1>${l.title}</h1></div>
  <section class="sec"><div class="rich level">${l.html}</div>
    <a class="bocard" href="${l.bo}" target="_blank" rel="noopener"><span class="bi">🗂️</span><div><b>${UI.openBOText}</b><small>[${l.code}] ${esc(l.title)}</small></div><span class="btn-y">${UI.openBO}</span></a>
  </section>
  <div class="lnav">${prev ? `<button class="btn-g" data-go="${LEVEL_MODULE}/${prev.n}">${tx('prevLevel', { n: prev.n })}</button>` : '<span></span>'}
    <button class="btn-g" data-go="${LEVEL_MODULE}">${UI.navBackLevels}</button>
    ${next ? `<button class="btn-y" data-go="${LEVEL_MODULE}/${next.n}">${tx('nextLevel', { n: next.n })}</button>` : '<span></span>'}</div>`;
  initWidgets();
}

/* ---------- click a picture to enlarge it ---------- */
document.addEventListener('click', e => {
  const ov = e.target.closest('.zoomov'); if (ov){ ov.remove(); return; }
  const img = e.target.closest('.cfig img'); if (!img) return;
  const cap = img.closest('.cfig').querySelector('figcaption');
  const d = document.createElement('div'); d.className = 'zoomov';
  d.innerHTML = `<img src="${img.getAttribute('src')}" alt=""><p>${cap ? esc(cap.textContent) : ''}</p>`;
  document.body.appendChild(d);
}, SIG);
document.addEventListener('keydown', e => { if (e.key === 'Escape') { const ov = $('.zoomov'); if (ov) ov.remove(); } }, SIG);

/* =========================================================
   MODULE 2 GAMES (Levels 1–4): data in COURSE.games
   ========================================================= */
const gtx = (s, o) => String(s).replace(/\{(\w+)\}/g, (m, k) => o && k in o ? o[k] : m);
function initGame(box){
  const G = (C.games || {})[box.dataset.game]; if (!G) return;
  (({ ask: askGame, habits: habitGame, words: wordsGame, deck: deckGame, roles: roleGame })[box.dataset.game] || (G.stops ? timelineGame : explainGame))(box, G);
}

/* ---- 1. "What do you ask?" — 5 situations, 3 options each ---- */
function askBoard(b){
  if (b.type === 'count') return `<div class="gb-count" style="--cols:${b.cols}">${Array.from({ length:b.n }, (_, i) => `<button class="gi" type="button" data-n="${i}">${b.emoji}<i></i></button>`).join('')}</div><div class="gb-note" data-note>${gtx(b.label, { k:0 })}</div>`;
  if (b.type === 'empty') return `<button class="gb-box" type="button" data-box><span>${b.box}</span></button><div class="gb-note" data-note>${b.hint}</div>`;
  if (b.type === 'compare') return `<div class="gb-cmp"><button class="pile" type="button" data-p="a">${b.emoji.repeat(b.a)}<b>${b.a}</b></button><span class="croc" data-croc>☐</span><button class="pile" type="button" data-p="b">${b.emoji.repeat(b.b)}<b>${b.b}</b></button></div><div class="gb-note" data-note>${b.hint}</div>`;
  if (b.type === 'blocks'){
    const t = Math.floor(b.a / 10) + Math.floor(b.b / 10), o = b.a % 10 + b.b % 10;
    return `<div class="gb-blocks" data-t="${t}" data-o="${o}"></div><button class="btn-g gb-btn" type="button" data-group>${b.btn}</button><div class="gb-note" data-note></div>`;
  }
  if (b.type === 'pizza') return `<div class="gb-pizzas">${b.parts.map((n, k) => `<div class="pz"><svg viewBox="-52 -52 104 104">${Array.from({ length:n }, (_, i) => {
      const a0 = i / n * 2 * Math.PI - Math.PI / 2, a1 = (i + 1) / n * 2 * Math.PI - Math.PI / 2, r = 48;
      return `<path class="sl" data-k="${k}" d="M0 0 L${(r * Math.cos(a0)).toFixed(2)} ${(r * Math.sin(a0)).toFixed(2)} A${r} ${r} 0 0 1 ${(r * Math.cos(a1)).toFixed(2)} ${(r * Math.sin(a1)).toFixed(2)} Z"/>`; }).join('')}</svg><b>1/${n}</b></div>`).join('')}</div><div class="gb-note" data-note>${b.hint}</div>`;
  if (b.type === 'segments') return `<svg class="gb-seg" viewBox="0 0 340 90">${b.pts.map((p, i) => `<g class="sp" data-p="${i}" transform="translate(${40 + i * 86} 50)"><circle r="16"/><text y="-24">${p}</text></g>`).join('')}<g class="segs"></g></svg><div class="gb-note" data-note>${b.hint}</div>`;
  if (b.type === 'bars') return `<div class="gb-bars">${b.items.map((it, i) => `<button type="button" class="gbar" data-b="${i}"><span class="gbl">${it[0]}</span><span class="gbt"><i style="width:0"></i></span><b>${(b.hidden || []).includes(i) ? '?' : ''}</b></button>`).join('')}</div><div class="gb-note" data-note>${b.hint}</div>`;
  if (b.type === 'grid') return `<div class="gb-grid">${Array.from({ length:b.to - b.from + 1 }, (_, i) => `<button type="button" class="gn" data-v="${b.from + i}">${b.from + i}</button>`).join('')}</div><div class="gb-note" data-note>${b.hint}</div>`;
  if (b.type === 'numline'){
    const n = b.max - b.min, X = v => 20 + (v - b.min) / n * 300;
    return `<svg class="gb-nl" viewBox="0 0 340 80"><path d="M10 40 h320" class="ax"/>${Array.from({ length:n + 1 }, (_, i) => { const v = b.min + i; return `<path d="M${X(v)} 33 v14" class="tk"/>${v % 2 === 0 ? `<text x="${X(v)}" y="68">${v}</text>` : ''}`; }).join('')}
      <path class="jump" d=""/><circle class="mk" cx="${X(b.start)}" cy="40" r="9"/></svg>
      <div class="gb-jbtns">${b.jumps.map((j, k) => `<button class="btn-g gb-btn" type="button" data-j="${k}">${j[0]}</button>`).join('')}</div><div class="gb-note" data-note>${gtx(b.label, { v:b.start })}</div>`;
  }
  return '';
}
function wireBoard(el, b){
  const note = $('[data-note]', el);
  if (b.type === 'count'){ let k = 0; $$('.gi', el).forEach(x => x.onclick = () => { if (x.classList.contains('on')) return; k++; x.classList.add('on'); $('i', x).textContent = k; note.textContent = gtx(b.label, { k }); }); }
  if (b.type === 'empty'){ const bx = $('[data-box]', el); bx.onclick = () => { bx.classList.add('open'); note.innerHTML = `<b>${b.empty}</b>`; }; }
  if (b.type === 'compare') $$('.pile', el).forEach(p => p.onclick = () => { $$('.pile', el).forEach(x => x.classList.toggle('on', x === p));
    const big = b.a >= b.b ? 'a' : 'b'; $('[data-croc]', el).textContent = p.dataset.p === big ? (big === 'a' ? '>' : '<') : '?';
    note.innerHTML = p.dataset.p === big ? `🐊 <b>${b.a} ${b.a > b.b ? '>' : '<'} ${b.b}</b>` : b.hint; });
  if (b.type === 'blocks'){
    const bl = $('.gb-blocks', el); let t = +bl.dataset.t, o = +bl.dataset.o;
    const draw = () => { bl.innerHTML = `<div class="tens">${'<i class="ten"></i>'.repeat(t)}</div><div class="ones">${'<i class="one"></i>'.repeat(o)}</div>`; note.innerHTML = `<b>${t}</b> ${b.tens} · <b>${o}</b> ${b.ones} = <b>${t * 10 + o}</b>`; };
    draw(); $('[data-group]', el).onclick = e => { if (o >= 10){ o -= 10; t += 1; draw(); e.target.disabled = true; } };
  }
  if (b.type === 'segments'){
    const seen = new Set(); let first = null; const pos = i => 40 + i * 86;
    $$('.sp', el).forEach(g => g.onclick = () => {
      const i = +g.dataset.p;
      if (first === null){ first = i; g.classList.add('on'); return; }
      $$('.sp', el).forEach(x => x.classList.remove('on'));
      if (first !== i){ const a = Math.min(first, i), c = Math.max(first, i), k = a + '-' + c;
        if (!seen.has(k)){ seen.add(k); const y = 50 - 6 - seen.size * 0; $('.segs', el).insertAdjacentHTML('beforeend', `<path d="M${pos(a)} 50 Q${(pos(a) + pos(c)) / 2} ${50 - (c - a) * 14} ${pos(c)} 50" class="sg"/>`); }
        note.innerHTML = gtx(b.label, { k:`<b>${seen.size}</b>` }) + ` · [${b.pts[first]}${b.pts[i]}] = [${b.pts[i]}${b.pts[first]}]`; }
      first = null;
    });
  }
  if (b.type === 'bars') $$('.gbar', el).forEach(x => x.onclick = () => { const it = b.items[+x.dataset.b];
    $('i', x).style.width = (it[1] / b.max * 100) + '%'; $('b', x).textContent = it[2]; x.classList.add('on'); });
  if (b.type === 'grid'){ let k = 0; $$('.gn', el).forEach(x => x.onclick = () => { if (x.classList.contains('on') || x.classList.contains('no')) return;
    const ok = b.good.includes(+x.dataset.v); x.classList.add(ok ? 'on' : 'no'); if (ok) k++; note.textContent = gtx(b.label, { k }); }); }
  if (b.type === 'numline'){ const n = b.max - b.min, X = v => 20 + (v - b.min) / n * 300; let v = b.start;
    $$('[data-j]', el).forEach(btn => btn.onclick = () => { const d = b.jumps[+btn.dataset.j][1], to = Math.max(b.min, Math.min(b.max, v + d));
      $('.jump', el).setAttribute('d', `M${X(v)} 40 Q${(X(v) + X(to)) / 2} ${40 - Math.abs(to - v) * 3} ${X(to)} 40`); $('.mk', el).setAttribute('cx', X(to)); v = to;
      note.innerHTML = `<b>${gtx(b.label, { v })}</b>`; btn.disabled = true; }); }
  if (b.type === 'pizza') $$('.sl', el).forEach(s => s.onclick = () => { $$(`.sl[data-k="${s.dataset.k}"]`, el).forEach(x => x.classList.remove('on')); s.classList.add('on'); });
}
function askGame(box, G){
  const U = G.ui, R = G.rounds; let i = 0, score = 0;
  const draw = () => {
    if (i >= R.length){
      box.innerHTML = `<div class="gm-end"><div class="gm-big">🏆</div><p>${gtx(U.done, { score, total:R.length })}</p><button class="btn-y" type="button" data-again>${U.again}</button></div>`;
      $('[data-again]', box).onclick = () => { i = 0; score = 0; draw(); }; return;
    }
    const r = R[i], opts = shuffle(r.options.map((o, k) => ({ t:o[0], ok:o[1], fb:o[2], k })));
    box.innerHTML = `<div class="gm-top"><span>${gtx(U.round, { n:i + 1, total:R.length })}</span><span class="gm-dots">${R.map((_, k) => `<i class="${k < i ? 'done' : k === i ? 'now' : ''}"></i>`).join('')}</span></div>
      <div class="gm-ask"><div class="gm-left"><span class="gm-tag">${r.tag}</span><p class="gm-task">${r.task}</p><div class="gm-board">${askBoard(r.board)}</div><small class="gm-touch">${U.touch}</small>
        <div class="gm-said"><span>🧒 ${U.student}</span>${r.said}</div></div>
      <div class="gm-right"><h4>${U.ask}</h4><div class="gm-opts">${opts.map(o => `<button class="gm-opt" type="button" data-k="${o.k}">${o.t}</button>`).join('')}</div><div class="gm-fb"></div></div></div>`;
    wireBoard($('.gm-board', box), r.board);
    $$('.gm-opt', box).forEach(btn => btn.onclick = () => {
      if (box.dataset.busy === '1') return; box.dataset.busy = '1';
      const o = opts.find(x => String(x.k) === btn.dataset.k); if (o.ok) score++;
      $$('.gm-opt', box).forEach(x => { const oo = opts.find(y => String(y.k) === x.dataset.k); x.classList.add(oo.ok ? 'right' : (x === btn ? 'wrong' : 'dim')); x.disabled = true; });
      $('.gm-fb', box).innerHTML = `<div class="gm-verdict ${o.ok ? 'ok' : 'no'}">${o.ok ? U.right : U.wrong}</div><p><b>${U.review}:</b> ${o.fb}</p>
        <div class="gm-rev"><p><b>${U.mistake}:</b> ${r.mistake}</p><p><b>${U.help}:</b> ${r.help}</p></div>
        <button class="btn-y" type="button" data-next>${i === R.length - 1 ? U.finish : U.next}</button>`;
      $('[data-next]', box).onclick = () => { box.dataset.busy = '0'; i++; draw(); box.scrollIntoView({ behavior:'smooth', block:'start' }); };
    });
  };
  box.dataset.busy = '0'; draw();
}

/* ---- 2. Habit or not? — sort what a tutor does ---- */
function habitGame(box, G){
  const U = G.ui, cards = G.cards; let i = 0, score = 0; const got = new Set();
  const badges = () => `<div class="hb-badges">${G.habits.map((h, k) => `<span class="${got.has(k) ? 'on' : ''}">${h[0]} ${h[1]}</span>`).join('')}</div>`;
  const draw = () => {
    if (i >= cards.length){
      box.innerHTML = `<div class="gm-end"><div class="gm-big">⭐</div><p>${gtx(U.done, { score, total:cards.length })}</p>${badges()}<button class="btn-y" type="button" data-again>${U.again}</button></div>`;
      $$('.hb-badges span', box).forEach(x => x.classList.add('on'));
      $('[data-again]', box).onclick = () => { i = 0; score = 0; got.clear(); draw(); }; return;
    }
    const c = cards[i];
    box.innerHTML = `<div class="gm-top"><span>${gtx(U.progress, { n:i + 1, total:cards.length })}</span><span class="gm-dots">${cards.map((_, k) => `<i class="${k < i ? 'done' : k === i ? 'now' : ''}"></i>`).join('')}</span></div>
      <div class="hb-card"><span class="hb-who">👩‍🏫</span><p>${c[0]}</p></div>
      <div class="hb-btns"><button class="hb-b good" type="button" data-v="1">${U.good}</button><button class="hb-b bad" type="button" data-v="0">${U.bad}</button></div>
      <div class="gm-fb"></div>${badges()}`;
    $$('.hb-b', box).forEach(b => b.onclick = () => {
      if ($('.gm-fb', box).innerHTML) return;
      const ok = (b.dataset.v === '1') === c[1]; if (ok) score++; got.add(c[2]);
      $$('.hb-b', box).forEach(x => { x.disabled = true; x.classList.add((x.dataset.v === '1') === c[1] ? 'right' : 'dim'); });
      const h = G.habits[c[2]];
      $('.gm-fb', box).innerHTML = `<div class="gm-verdict ${ok ? 'ok' : 'no'}">${ok ? U.right : U.wrong}</div><p><span class="hb-tag">${U.habit}: ${h[0]} ${h[1]}</span> ${c[3]}</p><button class="btn-y" type="button" data-next>${U.next}</button>`;
      $('.hb-badges', box).outerHTML = badges();
      $('[data-next]', box).onclick = () => { i++; draw(); };
    });
  };
  draw();
}

/* ---- 3. Math words inside three tasks: touch a highlighted part to see the word ---- */
function wordsGame(box, G){
  const U = G.ui; let t = 0; const seen = G.tasks.map(() => new Set());
  const hs = (txt, key) => key ? `<button class="hs" type="button" data-w="${key}">${esc(txt)}</button>` : `<span>${esc(txt)}</span>`;
  const cell = c => Array.isArray(c) ? hs(c[0], c[1]) : (String(c).startsWith('~') ? `<span class="strike">${esc(c.slice(1))}</span>` : `<span>${esc(c)}</span>`);
  const draw = () => {
    const T = G.tasks[t], total = Object.keys(T.words).length;
    let visual = '';
    if (T.type === 'column') visual = `<div class="wcol">${T.rows.map((r, k) => `<div class="wrow ${k === T.rows.length - 1 ? 'res' : ''} ${k === 0 ? 'small' : ''}">${r.map(cell).join('')}</div>`).join('')}</div>`;
    if (T.type === 'svg') visual = `<div class="wsvg">${T.svg}</div><div class="wfrac wparts">${T.parts.map(p => hs(p[0], p[1])).join('')}</div>`;
    if (T.type === 'pizza') visual = `<div class="wpz"><svg viewBox="-52 -52 104 104">${Array.from({ length:8 }, (_, i) => { const a0 = i / 8 * 2 * Math.PI - Math.PI / 2, a1 = (i + 1) / 8 * 2 * Math.PI - Math.PI / 2, r = 48;
        return `<path class="sl ${i < 3 ? 'on' : ''}" d="M0 0 L${(r * Math.cos(a0)).toFixed(2)} ${(r * Math.sin(a0)).toFixed(2)} A${r} ${r} 0 0 1 ${(r * Math.cos(a1)).toFixed(2)} ${(r * Math.sin(a1)).toFixed(2)} Z"/>`; }).join('')}</svg>
        <div class="wfrac">${T.parts.map(p => hs(p[0], p[1])).join('')}</div></div>`;
    box.innerHTML = `<div class="wtabs">${G.tasks.map((x, k) => `<button type="button" class="${k === t ? 'on' : ''} ${seen[k].size === Object.keys(x.words).length ? 'done' : ''}" data-t="${k}">${x.title}</button>`).join('')}</div>
      <div class="wbody"><div class="wleft"><p class="wstory">${T.story}</p>${visual}<div class="wextra">${T.extra.map(e => hs(e[0], e[1])).join('')}</div><small class="gm-touch">${U.tap}</small></div>
      <div class="wright"><div class="wcount">${gtx(U.found, { k:seen[t].size, total })}</div><div class="wcard"><span class="wq">👆</span></div></div></div>`;
    $$('[data-t]', box).forEach(b => b.onclick = () => { t = +b.dataset.t; draw(); });
    $$('.hs', box).forEach(b => { if (seen[t].has(b.dataset.w)) b.classList.add('seen'); b.onclick = () => {
      const w = T.words[b.dataset.w]; seen[t].add(b.dataset.w);
      $$(`.hs[data-w="${b.dataset.w}"]`, box).forEach(x => x.classList.add('seen'));
      $$('.hs', box).forEach(x => x.classList.toggle('cur', x.dataset.w === b.dataset.w));
      $('.wcard', box).innerHTML = `<h4>${w[0]}</h4><p>${w[1]}</p><div class="wsay"><b>${U.say}:</b> ${w[2]}</div>`;
      $('.wcount', box).textContent = gtx(U.found, { k:seen[t].size, total }) + (seen[t].size === total ? ' — ' + U.all : '');
      $(`[data-t="${t}"]`, box).classList.toggle('done', seen[t].size === total);
    }; });
  };
  draw();
}

/* ---- 4. How to explain a math idea — one big card, click through ---- */
function explainGame(box, G){
  const U = G.ui, K = G.cards; let i = 0;
  box.classList.add('xp');
  const draw = () => {
    const c = K[i];
    const pic = c.img ? `<img src="${c.img}" alt="">` : (c.svg || `<div class="xp-art">${esc(c.art || '')}</div>`);
    box.innerHTML = `<div class="xp-card"><div class="xp-pic">${pic}</div>
      <div class="xp-txt"><span class="gm-tag">${c.tag}</span><h3>${c.title}</h3><p>${c.text}</p>
        <div class="wsay"><b>${U.try}:</b> ${c.say}</div></div></div>
      <div class="xp-nav"><button class="btn-g" type="button" data-prev ${i === 0 ? 'disabled' : ''}>${U.prev}</button>
        <span class="gm-dots">${K.map((_, k) => `<i class="${k < i ? 'done' : k === i ? 'now' : ''}" data-go-card="${k}"></i>`).join('')}</span>
        <span class="xp-n">${gtx(U.of, { n:i + 1, total:K.length })}</span>
        <button class="btn-y" type="button" data-nextc>${i === K.length - 1 ? U.again : U.next}</button></div>`;
    $('[data-prev]', box).onclick = () => { if (i > 0){ i--; draw(); } };
    $('[data-nextc]', box).onclick = () => { i = i === K.length - 1 ? 0 : i + 1; draw(); };
    $$('[data-go-card]', box).forEach(d => d.onclick = () => { i = +d.dataset.goCard; draw(); });
  };
  draw();
}

/* ---- 5. Interactive timeline (Classroom): stops appear one after another ---- */
function timelineGame(box, G){
  const U = G.ui, S = G.stops; let open = -1, reached = 0;
  box.classList.add('tl');
  const draw = () => {
    const c = open >= 0 ? S[open] : null;
    const pic = c ? (c.img ? `<img src="${c.img}" alt="">` : c.svg) : '';
    box.innerHTML = `<div class="tl-line" style="--n:${S.length}"><i class="tl-bar" style="--p:${S.length > 1 ? reached / (S.length - 1) : 0}"></i>
        ${S.map((s, k) => `<button type="button" class="tl-stop ${k <= reached ? 'show' : ''} ${k === open ? 'on' : ''} ${k < reached || (k === reached && open === k) ? 'seen' : ''}" data-s="${k}" ${k > reached ? 'disabled' : ''}>
          <span class="tl-dot">${s.icon}</span><span class="tl-lab">${s.title}</span></button>`).join('')}</div>
      ${c ? `<div class="tl-pop"><div class="tl-pic">${pic}</div><div class="tl-txt"><h4>${c.icon} ${c.title}</h4><ul>${c.points.map(p => `<li>${p}</li>`).join('')}</ul>
          ${open < S.length - 1 ? `<button class="btn-y" type="button" data-tnext>${U.next}</button>` : `<p class="tl-done">${U.done}</p><button class="btn-g" type="button" data-tagain>${U.again}</button>`}</div></div>`
        : `<p class="tl-hint">${U.start}</p>`}`;
    $$('.tl-stop', box).forEach(b => b.onclick = () => { open = +b.dataset.s; draw(); });
    const nx = $('[data-tnext]', box); if (nx) nx.onclick = () => { open++; reached = Math.max(reached, open); draw(); };
    const ag = $('[data-tagain]', box); if (ag) ag.onclick = () => { open = -1; reached = 0; draw(); };
  };
  draw();
}

/* ---- 6. Card deck: click the top card and it goes to the back ---- */
function deckGame(box, G){
  const U = G.ui, K = G.cards; let i = 0, busy = false;
  box.classList.add('dk');
  const face = c => `<div class="dk-pic">${c.img ? `<img src="${c.img}" alt="">` : c.svg}</div>
    <div class="dk-txt"><span class="dk-kind ${c.kind}">${U[c.kind] || ''}</span><h3>${c.title}</h3><p>${c.text}</p></div>`;
  const draw = () => {
    box.innerHTML = `<div class="dk-stack">${[2, 1].map(d => K[i + d] ? `<div class="dk-card dk-back d${d}" aria-hidden="true"></div>` : '').join('')}
        <button type="button" class="dk-card dk-top">${face(K[i])}</button></div>
      <div class="xp-nav"><span class="gm-dots">${K.map((_, k) => `<i class="${k < i ? 'done' : k === i ? 'now' : ''}" data-go-card="${k}"></i>`).join('')}</span>
        <span class="xp-n">${gtx(U.of, { n:i + 1, total:K.length })}</span></div>
      <p class="dk-hint">${i === K.length - 1 ? `<button class="btn-g" type="button" data-again>${U.again}</button>` : U.tap}</p>`;
    $('.dk-top', box).onclick = () => { if (busy || i === K.length - 1) return; busy = true; $('.dk-top', box).classList.add('fly');
      setTimeout(() => { busy = false; i++; draw(); }, 380); };
    const ag = $('[data-again]', box); if (ag) ag.onclick = () => { i = 0; draw(); };
    $$('[data-go-card]', box).forEach(d => d.onclick = () => { i = +d.dataset.goCard; draw(); });
  };
  draw();
}

/* ---- 7. Which role? — one case at a time ---- */
function roleGame(box, G){
  const U = G.ui, C2 = G.cases; let i = 0, score = 0;
  const draw = () => {
    if (i >= C2.length){
      box.innerHTML = `<div class="gm-end"><div class="gm-big">🧭</div><p>${gtx(U.done, { score, total:C2.length })}</p><button class="btn-y" type="button" data-again>${U.again}</button></div>`;
      $('[data-again]', box).onclick = () => { i = 0; score = 0; draw(); }; return;
    }
    const c = C2[i];
    box.innerHTML = `<div class="gm-top"><span>${gtx(U.case, { n:i + 1, total:C2.length })}</span><span class="gm-dots">${C2.map((_, k) => `<i class="${k < i ? 'done' : k === i ? 'now' : ''}"></i>`).join('')}</span></div>
      <div class="gm-ask"><div class="gm-left"><div class="rl-pic">${c.svg || ''}</div><p class="gm-task">${c.text}</p></div>
      <div class="gm-right"><h4>${U.ask}</h4><div class="rl-roles">${G.roles.map((r, k) => `<button type="button" class="gm-opt rl" data-k="${k}"><span>${r[0]}</span> ${r[1]}</button>`).join('')}</div><div class="gm-fb"></div></div></div>`;
    $$('.rl', box).forEach(b => b.onclick = () => {
      if ($('.gm-fb', box).innerHTML) return;
      const ok = +b.dataset.k === c.ok; if (ok) score++;
      $$('.rl', box).forEach(x => { x.disabled = true; x.classList.add(+x.dataset.k === c.ok ? 'right' : (x === b ? 'wrong' : 'dim')); });
      $('.gm-fb', box).innerHTML = `<div class="gm-verdict ${ok ? 'ok' : 'no'}">${ok ? U.right : U.wrong}</div><p>${G.roles[c.ok][0]} <b>${G.roles[c.ok][1]}</b> — ${c.fb}</p>
        <button class="btn-y" type="button" data-next>${i === C2.length - 1 ? U.finish : U.next}</button>`;
      $('[data-next]', box).onclick = () => { i++; draw(); };
    });
  };
  draw();
}

function initWidgets(){
  $$('.cklist .ck').forEach(b => b.onclick = () => b.classList.toggle('on'));
  $$('[data-fm]').forEach(initFollowDemo);
  $$('[data-video]').forEach(renderVideo);
  $$('[data-sim]').forEach(renderSim);
  $$('[data-game]').forEach(initGame);
  // Classroom "3 minutes remaining" countdown (demo: loops from 3:00)
  clearInterval(window.__cdTimer);
  const cds = $$('.ctoast .cd');
  if (cds.length){ let t = 180; const tick = () => { t = t <= 0 ? 180 : t - 1; cds.forEach(el => el.textContent = Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0')); }; tick(); window.__cdTimer = setInterval(tick, 1000); }
  $$('.flip, .rv').forEach(b => b.onclick = () => b.classList.toggle('on'));
  $$('.acc .ah').forEach(b => b.onclick = () => b.parentElement.classList.toggle('open'));
  $$('.tabs').forEach(tb => $$('.tb', tb).forEach(b => b.onclick = () => {
    $$('.tb', tb).forEach(x => x.classList.toggle('on', x === b));
    $$('.tp', tb).forEach(p => p.classList.toggle('on', p.dataset.pane === b.dataset.tab));
  }));
}

/* ---------- Lesson recordings (links in COURSE.videos: YouTube, Google Drive, Loom or any embed URL) ---------- */
function embedUrl(u){
  u = String(u || '').trim(); if (!u) return '';
  let m;
  if ((m = /youtu\.be\/([\w-]{6,})/.exec(u)) || (m = /youtube\.com\/watch\?[^#]*v=([\w-]{6,})/.exec(u)) || (m = /youtube\.com\/shorts\/([\w-]{6,})/.exec(u))) return 'https://www.youtube.com/embed/' + m[1];
  if ((m = /drive\.google\.com\/file\/d\/([\w-]+)/.exec(u))) return 'https://drive.google.com/file/d/' + m[1] + '/preview';
  if ((m = /loom\.com\/share\/([\w-]+)/.exec(u))) return 'https://www.loom.com/embed/' + m[1];
  return u;
}
function renderVideo(box){
  const key = box.dataset.video, raw = (C.videos || {})[key], src = embedUrl(raw), note = (C.videoNotes || {})[key];
  if (src && /\.mp4($|\?)|^data:video/.test(src)){ box.innerHTML = `<div class="vframe"><video src="${esc(src)}" controls preload="none"></video></div>`; return; }
  box.innerHTML = src
    ? `<div class="vframe"><iframe src="${esc(src)}" title="${esc(UI.videoLabel)}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`
    : note
      ? `<div class="vneed"><span class="ii">🎬</span><div><b>${UI.videoNeeded}</b><h4>${note.title}</h4><p>${note.text}</p><small>${UI.videoKey}: ${esc(key)}</small></div></div>`
      : `<div class="vframe vsoon"><span>🎬</span><b>${UI.videoLabel}</b><p>${UI.videoSoon}</p></div>`;
}

/* ---------- Simulations (BO and Classroom): open inside the page, report completion with postMessage ---------- */
const simSrc = f => (window.SIM_SRC && window.SIM_SRC[f]) ? window.SIM_SRC[f](C.lang) : C.sims[f].src + '?lang=' + C.lang;
function renderSim(box){
  const f = box.dataset.sim, S = C.sims[f]; if (!S) return;
  box.innerHTML = `<div class="simbox"><span class="se">${S.e}</span><div class="grow">
      <span class="simbadge">${S.badge}</span><h3>${S.title}</h3><p>${S.text}</p>
      <div class="simstate">${flag(f) ? UI.simDone : UI.simTodo}</div>
      <div class="simbtns"><button class="btn-y" type="button" data-simopen>${UI.simOpen}</button><a class="btn-g" href="${simSrc(f)}" target="_blank" rel="noopener">${UI.simNewTab}</a></div></div></div>
    <div class="simframe"></div>`;
  const fr = $('.simframe', box), btn = $('[data-simopen]', box);
  btn.onclick = () => {
    if (fr.innerHTML){ fr.innerHTML = ''; btn.textContent = UI.simOpen; return; }
    fr.innerHTML = `<iframe src="${simSrc(f)}" title="${esc(S.title)}" allow="fullscreen"></iframe>`;
    btn.textContent = UI.simClose; fr.scrollIntoView({ behavior:'smooth', block:'start' });
  };
}
addEventListener('message', e => {
  const d = Object.assign({}, e.data || {});
  if (d.sim === 'mathClassroom') d.sim = 'classroomSim';   // older copies of the Classroom simulation
  if (d.type !== 'em-sim-done' || !C.sims || !C.sims[d.sim]) return;
  if (!flag(d.sim)) confetti(80);
  setFlag(d.sim, true);
  $$(`[data-sim="${d.sim}"] .simstate`).forEach(x => x.innerHTML = UI.simDone);
  const m = MODS.find(x => (x.needs || []).includes(d.sim)); if (m) refreshCTA(m);
}, SIG);

/* ---------- Follow Mode demo (Lead the group) ---------- */
function initFollowDemo(box){
  const FM = UI.fm, CARDS = FM.cards, ft = (k, o) => String(FM[k]).replace(/\{(\w+)\}/g, (s, x) => o && x in o ? o[x] : s);
  box.innerHTML = `<div class="fmdemo">
    <div class="fm-ctrl"><button class="lead-sw" type="button"><i></i> Lead the group</button><button class="btn-g fm-next" type="button">${FM.next}</button><span class="fm-hint">${FM.hint}</span></div>
    <div class="fm">
      <div class="screen"><div class="sc-h"><span>${FM.you}</span><span>${FM.tutor}</span></div><div class="sc-card fmT"></div></div>
      <div class="screen"><div class="sc-h"><span>${FM.student}</span><span>${FM.studentLbl}</span></div><div class="sc-card fmS"></div></div>
    </div>
    <div class="fm-out"></div></div>
    <div class="fm-info">${FM.info.map(x => `<div><span>${x[0]}</span><b>${x[1]}</b><p>${x[2]}</p></div>`).join('')}</div>`;
  let lead = false, t = 0, s = 0;
  const draw = msg => {
    $('.lead-sw', box).classList.toggle('on', lead);
    $('.fmT', box).innerHTML = `<span class="tnb">${FM.notes}</span><b>${CARDS[t][0]}</b>${CARDS[t][1]}`;
    $('.fmS', box).innerHTML = `<b>${CARDS[s][0]}</b>${CARDS[s][1]}${lead ? `<span class="follow">${FM.following}</span>` : ''}`;
    $('.fm-out', box).innerHTML = msg;
  };
  $('.lead-sw', box).onclick = () => { lead = !lead; if (lead) s = t; draw(lead ? FM.on : FM.off); };
  $('.fm-next', box).onclick = () => { t = (t + 1) % CARDS.length; if (lead) s = t; draw(ft(lead ? 'moved' : 'movedAlone', { t: t + 1, s: s + 1 })); };
  draw(FM.start);
}

/* =========================================================
   MODULE CHECK (multiple choice, options shuffled)
   ========================================================= */
let QZ = null;
function startQuiz(m){
  QZ = { m, i:0, score:0, items: shuffle(C.quiz[m.id]).map(q => {
    const idx = shuffle(q.o.map((_, k) => k));
    return { q:q.q, o:idx.map(k => q.o[k]), a:idx.indexOf(q.a), e:q.e }; }) };
  renderQ(); scrollTo(0, 0);
}
function renderQ(){
  renderNav('quiz');
  const { items, i, m } = QZ, q = items[i];
  view.innerHTML = `<div class="quiz">
    <div class="qbar"><i style="width:${i / items.length * 100}%"></i></div>
    <span class="qmeta">${tx('qmeta', { e:m.e, n:m.n, i:i + 1, total:items.length })}</span>
    <h2 class="qq">${q.q}</h2>
    <div id="opts">${q.o.map((o, k) => `<button class="qopt" data-o="${k}"><span class="k">${'ABCD'[k]}</span><span>${o}</span></button>`).join('')}</div>
    <div class="qfb" id="qfb"></div>
    <button class="btn-y qnext" id="qnext">${i === items.length - 1 ? UI.seeResult : UI.nextQuestion}</button></div>`;
  $$('#opts .qopt').forEach(b => b.onclick = () => {
    if ($('#opts').classList.contains('answered')) return;
    const k = +b.dataset.o, ok = k === q.a;
    $('#opts').classList.add('answered');
    b.classList.add(ok ? 'right' : 'wrong'); $(`#opts [data-o="${q.a}"]`).classList.add('right');
    if (ok) QZ.score++;
    const fb = $('#qfb'); fb.className = 'qfb show ' + (ok ? 'ok' : 'ko'); fb.innerHTML = (ok ? UI.fbRight : UI.fbWrong) + q.e;
    $('#qnext').classList.add('show');
  });
  $('#qnext').onclick = () => { QZ.i++; if (QZ.i < QZ.items.length) renderQ(); else finishCheck(QZ.m, QZ.score, QZ.items.length); };
}
function finishCheck(m, score, n){
  const pct = Math.round(score / n * 100), ok = score / n >= PASS;
  setResult(m.id, pct, ok); QZ = null;
  const next = MODS[MODS.indexOf(m) + 1];
  let nextTxt = '', btn = '';
  if (ok){
    if (next){ nextTxt = tx('nextUnlocked', { n:next.n, title:next.title }); btn = `<button class="btn-y" data-go="${next.id}">${tx('goModule', { n:next.n })}</button>`; }
    else { nextTxt = UI.allDoneText; btn = `<button class="btn-y" data-go="done">${UI.seeNext}</button>`; }
  } else btn = `<button class="btn-y" data-retake="${m.id}">${UI.retake}</button>`;
  renderNav('done');
  view.innerHTML = `<div class="result"><div class="re">${ok ? '🎉' : '😅'}</div><h1>${ok ? UI.passedTitle : UI.failTitle}</h1>
    <div class="pct ${ok ? 'pass' : 'fail'}">${pct}%</div><p>${tx('scoreLine', { score, n })} ${ok ? nextTxt : UI.failText}</p>
    <div class="btn-row">${btn}<button class="btn-g" data-go="${m.id}">${UI.reviewModule}</button></div></div>`;
  scrollTo(0, 0);
  if (ok) confetti();
}
function renderDone(){
  renderNav('done');
  const D = UI.done;
  view.innerHTML = `<div class="result wide"><div class="re">🏆</div><h1>${D.title}</h1>${D.html}
    <div class="nexts">${D.nexts.map(x => `<div><span>${x[0]}</span><p>${x[1]}</p></div>`).join('')}</div>
    <div class="btn-row center"><button class="btn-y" data-go="">${UI.doneBack}</button></div></div>`;
  confetti(240);
}

/* =========================================================
   SURVEYS (start pop-up + final section of Module 5) → Google Sheet
   ========================================================= */
const regionOptions = sel => `<option value="">${SV.regionPh}</option>` + REGIONS.map(r => `<option value="${r}" ${r === sel ? 'selected' : ''}>${SV.regions[r]}</option>`).join('');
const choiceQ = (id, text) => `<fieldset class="sq" data-q="${id}" data-type="choice" data-req="1"><legend>${text} <span class="req">*</span></legend>
  <div class="chips2">${FEELINGS.map(f => `<label class="pill"><input type="radio" name="${id}" value="${f}"><span>${SV.feelings[f]}</span></label>`).join('')}</div></fieldset>`;
const scaleQ = id => `<fieldset class="sq" data-q="${id}" data-type="scale" data-req="1"><legend>${SV.q[id]} <span class="req">*</span></legend>
  <div class="scale">${[1,2,3,4,5].map(v => `<label class="sc"><input type="radio" name="${id}" value="${v}"><span>${v}</span></label>`).join('')}</div>
  <div class="scl"><span>1 · ${SV.scaleLow}</span><span>5 · ${SV.scaleHigh}</span></div></fieldset>`;
const openQ = id => `<fieldset class="sq" data-q="${id}" data-type="open"><legend>${SV.q[id]} <span class="opt">(${SV.optional})</span></legend><textarea name="${id}" rows="3" maxlength="1500"></textarea></fieldset>`;

function collect(form){
  const data = {}; let missing = false;
  $$('.sq', form).forEach(fs => {
    fs.classList.remove('miss');
    const id = fs.dataset.q, type = fs.dataset.type;
    if (type === 'open'){ data[id] = ($('textarea', fs).value || '').trim(); return; }
    const c = $('input:checked', fs);
    if (c) data[id] = type === 'scale' ? Number(c.value) : c.value;
    else if (fs.dataset.req){ missing = true; fs.classList.add('miss'); }
  });
  return { data, missing };
}
function sendSurvey(payload){
  if (!SURVEY_URL){ console.warn('[survey] SURVEY_URL is empty — payload not sent:', payload); return Promise.resolve(); }
  try {
    return fetch(SURVEY_URL, { method:'POST', mode:'no-cors', headers:{ 'Content-Type':'text/plain;charset=utf-8' }, body: JSON.stringify(payload) })
      .catch(err => console.warn('[survey] send failed (counted as sent):', err));
  } catch(e){ return Promise.resolve(); }
}
const basePayload = (survey, email, region) => ({ survey, training: TRAINING_ID, course: C.title, lang: C.lang, email, region, sent_at: new Date().toISOString() });
const validEmail = v => /^[^\s@]+@kodland[^\s@]*$/i.test(v);   // must contain @kodland

function startSurveyDone(){ return !!(STORE.get(SKEY) || (P.start && P.start.email)); }
function showStartSurvey(){
  const box = $('#startSurvey');
  box.innerHTML = `<form class="sbox" id="ssForm" novalidate>
    <h2>${SV.startTitle}</h2><p class="sintro">${SV.startIntro}</p>
    <div class="frow"><label class="fld"><span>${SV.email} <span class="req">*</span></span><input type="email" name="email" placeholder="${SV.emailPh}" autocomplete="email"></label>
      <label class="fld"><span>${SV.region} <span class="req">*</span></span><select name="region">${regionOptions(REGION_BY_LANG[C.lang] || '')}</select></label></div>
    ${choiceQ('feeling', SV.q.feeling)}${scaleQ('confidence')}${scaleQ('understand_why')}${scaleQ('know_where')}${openQ('worries')}
    <p class="serr" id="ssErr" role="alert"></p>
    <div class="btn-row"><button class="btn-y" type="submit">${SV.send}</button>${DEV_ALLOWED ? `<button class="devskip" type="button" id="ssSkip">${SV.skipDev}</button>` : ''}</div></form>`;
  box.classList.add('show'); document.body.classList.add('locked');
  const form = $('#ssForm');
  form.onsubmit = ev => {
    ev.preventDefault();
    const email = form.email.value.trim(), region = form.region.value, err = $('#ssErr');
    const { data, missing } = collect(form);
    form.email.classList.toggle('bad', !validEmail(email)); form.region.classList.toggle('bad', !region);
    if (!validEmail(email)){ err.textContent = SV.errEmail; form.email.focus(); return; }
    if (!region || missing){ err.textContent = SV.errRequired; return; }
    err.textContent = '';
    const btn = $('button[type=submit]', form); btn.disabled = true; btn.textContent = SV.sending;
    const payload = Object.assign(basePayload('start', email, region), data);
    sendSurvey(payload).then(() => {
      const rec = { email, region, sent_at: payload.sent_at };
      STORE.set(SKEY, JSON.stringify(rec)); P.start = rec; saveP();
      closeStartSurvey();
    });
  };
  const skip = $('#ssSkip'); if (skip) skip.onclick = () => closeStartSurvey();
}
function closeStartSurvey(){ const b = $('#startSurvey'); b.classList.remove('show'); b.innerHTML = ''; document.body.classList.remove('locked'); }
function startInfo(){ return (P.start && P.start.email) ? P.start : (parse(STORE.get(SKEY)) || {}); }

function finalSurveyHTML(){
  if (flag('finalSurvey')) return `<h2 class="sh">${SV.finalTitle}</h2><div class="sent">${SV.sentFinal}</div>`;
  const s = startInfo();
  return `<h2 class="sh">${SV.finalTitle}</h2><p class="sintro">${SV.finalIntro}</p>
  <form class="sbox inline" id="fsForm" novalidate>
    <div class="frow"><label class="fld"><span>${SV.email} <span class="req">*</span></span><input type="email" name="email" value="${esc(s.email || '')}" ${s.email ? 'readonly' : ''} placeholder="${SV.emailPh}"></label>
      <label class="fld"><span>${SV.region} <span class="req">*</span></span><select name="region" ${s.region ? 'disabled' : ''}>${regionOptions(s.region || REGION_BY_LANG[C.lang] || '')}</select></label></div>
    <h3 class="sg">${SV.groups.feel}</h3>${choiceQ('feeling', SV.q.feeling_final)}${scaleQ('confidence')}${scaleQ('understand_why')}${scaleQ('know_where')}
    <h3 class="sg">${SV.groups.teach}</h3>${scaleQ('ready_first_lesson')}${scaleQ('know_course')}${scaleQ('ready_tools')}${scaleQ('ready_teach_math')}
    <h3 class="sg">${SV.groups.materials}</h3>${scaleQ('training_clear')}${scaleQ('math_tips_helped')}
    <h3 class="sg">${SV.groups.feedback}</h3>${openQ('improve')}
    <p class="serr" id="fsErr" role="alert"></p>
    <div class="btn-row"><button class="btn-y" type="submit">${SV.send}</button>${DEV_ALLOWED ? `<button class="devskip" type="button" id="fsSkip">${SV.skipDev}</button>` : ''}</div>
  </form>`;
}
function initFinalSurvey(){
  const form = $('#fsForm'); if (!form) return;
  const done = () => { setFlag('finalSurvey', true); $('#finalSurvey').innerHTML = finalSurveyHTML(); refreshCTA(findMod(LEVEL_MODULE)); confetti(80); };
  form.onsubmit = ev => {
    ev.preventDefault();
    const email = form.email.value.trim(), region = form.region.value, err = $('#fsErr');
    const { data, missing } = collect(form);
    if (!validEmail(email)){ err.textContent = SV.errEmail; return; }
    if (!region || missing){ err.textContent = SV.errRequired; return; }
    err.textContent = '';
    const btn = $('button[type=submit]', form); btn.disabled = true; btn.textContent = SV.sending;
    sendSurvey(Object.assign(basePayload('final', email, region), data)).then(done);
  };
  const skip = $('#fsSkip'); if (skip) skip.onclick = () => { setFlag('finalSurvey', true); $('#finalSurvey').innerHTML = finalSurveyHTML(); refreshCTA(findMod(LEVEL_MODULE)); };
}

/* ---------- Confetti (no library) ---------- */
function confetti(count = 160){
  const cv = $('#confetti'); if (!cv || !cv.getContext) return;
  const cx = cv.getContext('2d'); cv.width = innerWidth; cv.height = innerHeight;
  const colors = ['#C4F046', '#F03D9E', '#3E7BFA', '#FFD34D', '#8B5CF6', '#0EA5E9'];
  const ps = Array.from({ length:count }, () => ({ x:innerWidth / 2 + (Math.random() - .5) * 200, y:innerHeight * .35,
    vx:(Math.random() - .5) * 16, vy:-Math.random() * 15 - 6, r:Math.random() * 360, vr:(Math.random() - .5) * 18,
    w:6 + Math.random() * 7, h:8 + Math.random() * 10, c:colors[Math.floor(Math.random() * colors.length)] }));
  let f = 0;
  const tick = () => { cx.clearRect(0, 0, cv.width, cv.height);
    ps.forEach(p => { p.vy += .38; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r * Math.PI / 180); cx.fillStyle = p.c; cx.globalAlpha = Math.max(0, 1 - f / 170); cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); cx.restore(); });
    if (++f < 180) requestAnimationFrame(tick); else cx.clearRect(0, 0, cv.width, cv.height); };
  tick();
}
function modal(html){ const m = $('#modal'); m.innerHTML = `<div class="mbox">${html}</div>`; m.classList.add('show'); }
function closeModal(){ $('#modal').classList.remove('show'); }
window.closeModal = closeModal;

/* =========================================================
   ROUTER  (#/ · #/m1 … #/m3 · #/m3/2 · #/done)
   ========================================================= */
const go = path => { location.hash = '#/' + path; };
const curParts = () => location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
function route(){
  closeModal(); QZ = null;
  const [id, sub] = curParts(), m = findMod(id);
  if (!id) renderHome();
  else if (id === 'done' && allDone()) renderDone();
  else if (m){
    if (!unlocked(m)){ go(''); setTimeout(() => modal(`<div class="mi">🔒</div><h2>${UI.lockedTitle}</h2><p>${tx('lockedModule', { n:m.n - 1 })}</p><button class="btn-y" onclick="closeModal()">${UI.ok}</button>`), 50); return; }
    if (m.id === LEVEL_MODULE && sub) renderLevel(Number(sub)); else renderModule(m);
  } else renderHome();
  scrollTo(0, 0);
}
addEventListener('hashchange', route, SIG);

document.addEventListener('click', e => {
  const t = e.target;
  const ls = t.closest('[data-lang]');
  if (ls && window.COURSES){ e.preventDefault(); window.__carryP = JSON.stringify(P); window.COURSE = window.COURSES[ls.dataset.lang]; window.__boot(); return; }
  if (ls){ e.preventDefault(); const q = new URLSearchParams(location.search); q.set('lang', ls.dataset.lang); q.set('p', JSON.stringify(P)); location.href = location.pathname + '?' + q.toString() + location.hash; return; }
  const g = t.closest('[data-go]'); if (g && !t.closest('a')){ const target = g.dataset.go; if (('#/' + target) === location.hash || (target === '' && !curParts().length)) route(); else go(target); return; }
  const lk = t.closest('[data-locked]'); if (lk){ modal(`<div class="mi">🔒</div><h2>${UI.lockedTitle}</h2><p>${tx('lockedModule', { n: lk.dataset.locked })}</p><button class="btn-y" onclick="closeModal()">${UI.ok}</button>`); return; }
  const j = t.closest('[data-jump]'); if (j){ const s = $('#sec-' + j.dataset.jump); if (s) s.scrollIntoView({ behavior:'smooth' }); return; }
  if (t.id === 'modal') closeModal();
  const sc = t.closest('#startCheck'); if (sc){ if (sc.disabled) return; const m = findMod(curParts()[0]); if (m) startQuiz(m); return; }
  const r = t.closest('[data-retake]'); if (r){ startQuiz(findMod(r.dataset.retake)); return; }
  if (t.closest('[data-exit]')){ const m = QZ ? QZ.m : MODS[0]; QZ = null; renderModule(m); scrollTo(0, 0); }
}, SIG);
document.addEventListener('pointerdown', e => {
  if (!e.target.closest('#mcta')) return;
  const b = $('#startCheck'); if (b && b.disabled) $$('.lockmsg').forEach(l => { l.classList.remove('shake'); void l.offsetWidth; l.classList.add('shake'); });
}, SIG);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); }, SIG);

/* =========================================================
   DEVELOPER OPTIONS (only with ?dev=1): "🛠 Developer" link (code MATHDEV) or Shift+D three times.
   Unlock all modules (real progress is restored when it is turned off), skip the surveys, reset.
   ========================================================= */
function setDev(on){
  if (on && !DEV_ALLOWED) return;
  if (on){ STORE.set(DEV_BACKUP, JSON.stringify(P)); P.dev = true; }
  else restoreRealProgress();
  saveP(); devBadge(); route();
}
function devBadge(){ $$('.devbadge').forEach(x => x.remove()); if (P.dev && !REVIEW) document.body.insertAdjacentHTML('beforeend', '<button class="devbadge" id="devBadge">🔓 DEV MODE · options</button>'); }
function openDev(ok){
  if (!DEV_ALLOWED) return;
  if (!ok && !P.dev){
    modal(`<div class="mi">🛠</div><h2>Developer options</h2><p>For reviewers only. Enter the developer code:</p>
      <input id="devCode" type="password" autocomplete="off" class="devin"><p id="devErr" class="serr"></p>
      <div class="btn-row center"><button class="btn-g" onclick="closeModal()">Cancel</button><button class="btn-y" id="devGo">Continue</button></div>`);
    const tryDev = () => { if (norm($('#devCode').value) === DEV_CODE) openDev(true); else $('#devErr').textContent = 'Wrong code.'; };
    $('#devGo').onclick = tryDev; $('#devCode').onkeydown = e => { if (e.key === 'Enter') tryDev(); };
    setTimeout(() => { const i = $('#devCode'); if (i) i.focus(); }, 50); return;
  }
  modal(`<div class="mi">🛠</div><h2>Developer options</h2><p>Developer mode is <b>${P.dev ? 'ON' : 'OFF'}</b>. Nothing is sent to the LMS while the page has ?dev=1.</p>
    <div class="btn-col">
      <button class="btn-y" id="devToggle">${P.dev ? '🔒 Turn developer mode off' : '🔓 Unlock all modules'}</button>
      <button class="btn-g" id="devStart">⏭ Skip the start survey</button>
      <button class="btn-g" id="devFinal">⏭ Skip the final survey</button>
      <button class="btn-g" id="devLevels">👁 Mark all 7 levels as opened</button>
      <button class="btn-g" id="devReset">♻️ Reset all progress and surveys</button>
      <button class="btn-g" onclick="closeModal()">Close</button></div>`);
  $('#devToggle').onclick = () => { closeModal(); setDev(!P.dev); };
  $('#devStart').onclick = () => { closeModal(); closeStartSurvey(); };
  $('#devFinal').onclick = () => { closeModal(); setFlag('finalSurvey', true); route(); };
  $('#devLevels').onclick = () => { closeModal(); P.levels = {}; C.levels.forEach(l => P.levels[l.n] = true); saveP(); route(); };
  $('#devReset').onclick = () => { closeModal(); P = {}; STORE.remove(SKEY); STORE.remove(DEV_BACKUP); saveP(); devBadge(); go(''); route(); showStartSurvey(); };
}
document.addEventListener('click', e => { if (e.target.closest('#devLink') || e.target.closest('#devBadge')) openDev(false); }, SIG);
let dk = [];
document.addEventListener('keydown', e => {
  if (!DEV_ALLOWED || !(e.shiftKey && e.key.toLowerCase() === 'd')) return;
  const now = Date.now(); dk = dk.filter(x => now - x < 1200); dk.push(now);
  if (dk.length >= 3){ dk = []; openDev(true); }
}, SIG);

/* ---------- start ---------- */
$('#footTxt').textContent = UI.footer;
if (!DEV_ALLOWED) $('#devLink').style.display = 'none';
loadP();
takeUrlProgress();
if (window.__carryP){ P = mergeP(P, parse(window.__carryP) || {}); window.__carryP = null; }
if (REVIEW && !P.dev){ P.dev = true; STORE.set(PKEY, JSON.stringify(P)); }
if (P.dev && !DEV_ALLOWED){ restoreRealProgress(); STORE.set(PKEY, JSON.stringify(P)); }
lastPassedCount = MODS.filter(m => passed(m.id)).length;
lmsReady = true; lmsSend('ready'); lmsSync();
devBadge();
route();
if (!startSurveyDone() && !REVIEW) showStartSurvey();
if (REVIEW) $('#footTxt').textContent = (C.lang === 'pt' ? '🔍 Versão de revisão — todos os módulos abertos, pesquisas desativadas, nada é enviado. · ' : '🔍 Review version — all modules open, surveys off, nothing is sent. · ') + UI.footer;
