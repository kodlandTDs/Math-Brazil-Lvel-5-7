/* =====================================================================
   TIME PER MODULE — active time a tutor spends in this training
   Loaded right AFTER the training engine. It does not change how the training works:
   it only measures time and adds it to what the engine already sends to the LMS.

   - Active time = page visible AND mouse / keyboard / scroll / touch in the last 2 minutes.
     It is added to the module open on screen (and always to the training total).
   - Kept in memory + localStorage + sessionStorage, so a reload or a second day adds to it.
   - Frozen when every module is passed: later visits don't change it.
   - Nothing is counted or sent in developer mode (?dev=1).
   - LMS: every 'progress' / 'completed' message gets these extra fields:
       time_active_min   active minutes in the whole training (1 decimal)
       time_module_min   { moduleId: active minutes, ... }
       time_started_at   ISO date of the first counted second
       time_finished_at  ISO date when every module was passed ('' until then)
     When the tutor leaves or hides the page, a 'progress' message is sent (at most once a minute),
     so the LMS also has the time of a training left half-way.
   - Google Sheet "TD Trainings – Time per module": ONE row per tutor + training
     ({type:'training_time', repo, ...}) goes to SHEET_URL, one tab per training (repo).
     The tutor is the e-mail of the start survey / identity step; without one, a random browser id.
   ===================================================================== */
(function(){
  'use strict';
  /* ---------- CONFIG ---------- */
  var SHEET_ENABLED = true;
  var SHEET_URL = window.TD_TIME_SHEET_URL || 'https://script.google.com/macros/s/AKfycbw_9JLpeeQfUniqppJTXbncYW-BVkS4g4astfCwBV8qGTY3vLb6dzbGSEGWzuL4xt0A/exec';
  var IDLE_MS = 120000;   // no input for 2 minutes = not counted

  /* ---------- engine globals (read safely: each training engine names them a bit differently) ---------- */
  function g(fn, dflt){ try { var v = fn(); return v === undefined ? dflt : v; } catch(e){ return dflt; } }
  function A(){ return window.TD_TIME_ADAPTER || null; }   // engines inside a closure expose an adapter instead
  function trainingId(){ var a = A(); if (a) return a.training(); return g(function(){ return TRAINING_ID; }, '') || ''; }
  function lang(){ var a = A(); if (a) return a.lang(); return g(function(){ return C.lang; }, '') || g(function(){ return LANG; }, '') || ''; }
  function modules(){
    var a = A(); if (a) return a.modules();
    var list = g(function(){ return MODS; }, null) || g(function(){ return MODULES; }, null) || [];
    return list.map(function(m){ return m.id; });
  }
  function current(){
    var a = A(); if (a) return a.current();
    var id = (location.hash || '').replace(/^#\/?/, '').split('/').filter(Boolean)[0] || '';
    return modules().indexOf(id) !== -1 ? id : '';
  }
  function passed(id){ return !!g(function(){ return P[id] && P[id].passed; }, false); }
  function allDone(){ var a = A(); if (a) return a.done(); var ids = modules(); return ids.length > 0 && ids.every(passed); }
  function isDev(){
    if (/[?&]dev=1(&|$)/.test(location.search)) return true;
    return !!g(function(){ return P.dev; }, false) || !!g(function(){ return DEV; }, false);
  }
  function identity(){
    var keys = [];
    g(function(){ keys.push('kl-start-survey-' + C.id); });
    g(function(){ keys.push('kl-start-survey-' + T.ID); });
    keys.push('kl-m0-identity');
    for (var i = 0; i < keys.length; i++){ var v = g(function(){ return JSON.parse(store(keys[i]) || 'null'); }, null); if (v && v.email) return v; }
    return {};
  }
  function repo(){ return (location.pathname.split('/').filter(Boolean)[0] || '').replace(/\.html?$/, ''); }
  function browserId(){
    var k = 'kl-td-browser-id', v = store(k);
    if (!v){ v = 'b-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8); store(k, v); }
    return v;
  }

  /* ---------- safe storage ---------- */
  var MEM = {};
  function areas(){ var a = []; try { a.push(window.localStorage); } catch(e){} try { a.push(window.sessionStorage); } catch(e){} return a; }
  function store(k, v){
    var st = areas(), i;
    if (v === undefined){
      for (i = 0; i < st.length; i++){ try { var x = st[i].getItem(k); if (x !== null) return x; } catch(e){} }
      return Object.prototype.hasOwnProperty.call(MEM, k) ? MEM[k] : null;
    }
    v = String(v); MEM[k] = v;
    for (i = 0; i < st.length; i++){ try { st[i].setItem(k, v); } catch(e){} }
  }

  /* ---------- counting ---------- */
  var TIME = null, lastTick = Date.now(), lastInput = Date.now(), lastSent = 0, dirty = false;
  function key(){ return 'kl-td-time-' + trainingId(); }
  function load(){
    if (TIME) return TIME;
    var t = null; try { t = JSON.parse(store(key()) || 'null'); } catch(e){}
    TIME = (t && t.mods) ? t : { started_at:'', finished_at:'', total:0, mods:{} };
    return TIME;
  }
  function save(){ if (TIME) store(key(), JSON.stringify(TIME)); }
  function min1(sec){ return Math.round((sec || 0) / 6) / 10; }   // seconds -> minutes, 1 decimal
  ['mousemove','keydown','scroll','click','touchstart','wheel'].forEach(function(ev){ addEventListener(ev, function(){ lastInput = Date.now(); }, { passive:true, capture:true }); });

  setInterval(function(){
    var now = Date.now(), d = Math.min(now - lastTick, 10000) / 1000;
    lastTick = now;
    if (!trainingId() || isDev()) return;
    var t = load();
    if (t.finished_at) return;
    if (allDone()){ t.finished_at = new Date().toISOString(); save(); sendSheet(true); return; }
    if (document.visibilityState !== 'visible' || now - lastInput >= IDLE_MS) return;
    if (!t.started_at) t.started_at = new Date().toISOString();
    t.total += d;
    var m = current(); if (m) t.mods[m] = (t.mods[m] || 0) + d;
    dirty = true; save();
  }, 5000);

  /* ---------- what goes to the LMS ---------- */
  function fields(){
    var t = load(), mm = {};
    if (!t.finished_at && !isDev() && allDone()){ t.finished_at = new Date().toISOString(); save(); }
    modules().forEach(function(id){ mm[id] = min1(t.mods[id]); });
    return { time_active_min:min1(t.total), time_module_min:mm, time_started_at:t.started_at, time_finished_at:t.finished_at };
  }
  window.TD_TIME_FIELDS = fields;
  // Engines with a global lmsSummary(): add the time to every message they send.
  if (typeof window.lmsSummary === 'function' && !window.lmsSummary.__tdTime){
    var orig = window.lmsSummary;
    window.lmsSummary = function(){ var s = orig.apply(this, arguments) || {}; try { Object.assign(s, fields()); } catch(e){} return s; };
    window.lmsSummary.__tdTime = true;
  }
  function sendLms(){ try { if (typeof window.lmsSend === 'function') window.lmsSend('progress'); else if (A() && A().send) A().send('progress'); } catch(e){} }

  /* ---------- optional Google Sheet row (same format as the Refunds trainings) ---------- */
  function sendSheet(beacon){
    if (!SHEET_ENABLED || !SHEET_URL || isDev()) return;
    var t = load(), who = identity();
    if (!t.started_at) return;
    var ids = modules();
    var body = JSON.stringify({ type:'training_time', repo:repo(), email:who.email || '', region:who.region || '', browser_id:browserId(),
      training:trainingId(), training_name:trainingId(), lang:lang(),
      started_at:t.started_at, finished_at:t.finished_at, completed:!!t.finished_at, active_min:min1(t.total),
      module_ids:ids, module_min:ids.map(function(id){ return min1(t.mods[id]); }) });
    try { if (beacon && navigator.sendBeacon && navigator.sendBeacon(SHEET_URL, new Blob([body], { type:'text/plain;charset=utf-8' }))) return; } catch(e){}
    try { fetch(SHEET_URL, { method:'POST', mode:'no-cors', keepalive:true, headers:{ 'Content-Type':'text/plain;charset=utf-8' }, body:body }); } catch(e){}
  }

  // Leaving or hiding the page: save the time so far in the LMS (and Sheet), at most once a minute.
  document.addEventListener('visibilitychange', function(){
    if (document.visibilityState !== 'hidden' || !dirty || Date.now() - lastSent < 60000) return;
    dirty = false; lastSent = Date.now(); save(); sendLms(); sendSheet(true);
  });
})();
