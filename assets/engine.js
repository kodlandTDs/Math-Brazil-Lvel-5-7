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
  if (m.id !== LEVEL_MODULE || P.dev) return [];
  const l = [];
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

function initWidgets(){
  $$('.cklist .ck').forEach(b => b.onclick = () => b.classList.toggle('on'));
  $$('[data-fm]').forEach(initFollowDemo);
  $$('[data-video]').forEach(renderVideo);
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
  const src = embedUrl((C.videos || {})[box.dataset.video]);
  box.innerHTML = src
    ? `<div class="vframe"><iframe src="${esc(src)}" title="${esc(UI.videoLabel)}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`
    : `<div class="vframe vsoon"><span>🎬</span><b>${UI.videoLabel}</b><p>${UI.videoSoon}</p></div>`;
}

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
