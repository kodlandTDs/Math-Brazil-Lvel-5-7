/* =====================================================================
   CONTENT GATE — the check of a module opens only after the tutor has opened its content
   Loaded right AFTER the training engine (and after the surveys script, if any).

   What has to be done in a module before its check (quiz / sort / "done" button) unlocks:
   - scroll to the end of the module;
   - open every expandable item: accordions, flip cards, myth cards, open questions, tabs,
     option switches, "watch the video" buttons;
   - start every embedded video / simulation (click inside it);
   - go through every step of a carousel and answer every row of a sorter.
   Nothing is timed: a fast tutor who opens everything is never slowed down.
   - Items still to open get a dashed outline; the lock message says how many are left and
     "Show me" scrolls to the next one.
   - What was opened is saved (memory + localStorage + sessionStorage): a reload keeps it.
   - Modules already passed, and developer mode (?dev=1), are never locked.
   ===================================================================== */
(function(){
  'use strict';
  if (/[?&]dev=1(&|$)/.test(location.search) || window.REVIEW_BUILD) return;

  /* ---------- texts ---------- */
  var TX = {
    en:{ lock:'🔒 Before the check, open everything in this module: {n} left.', show:'Show me ↓', end:'Scroll to the end of the module.' },
    es:{ lock:'🔒 Antes del test, abre todo el contenido de este módulo: faltan {n}.', show:'Muéstrame ↓', end:'Desplázate hasta el final del módulo.' },
    pt:{ lock:'🔒 Antes do teste, abra todo o conteúdo deste módulo: faltam {n}.', show:'Mostrar ↓', end:'Role até o final do módulo.' },
    it:{ lock:'🔒 Prima del test, apri tutti i contenuti di questo modulo: ne mancano {n}.', show:'Mostrami ↓', end:'Scorri fino alla fine del modulo.' },
    pl:{ lock:'🔒 Przed testem otwórz wszystkie treści tego modułu: zostało {n}.', show:'Pokaż ↓', end:'Przewiń do końca modułu.' },
    tr:{ lock:'🔒 Testten önce bu modüldeki her şeyi aç: {n} kaldı.', show:'Göster ↓', end:'Modülün sonuna kadar kaydır.' },
    ru:{ lock:'🔒 Перед проверкой открой всё в этом модуле: осталось {n}.', show:'Показать ↓', end:'Прокрути модуль до конца.' },
    id:{ lock:'🔒 Sebelum tes, buka semua isi modul ini: tersisa {n}.', show:'Tunjukkan ↓', end:'Gulir sampai akhir modul.' },
    ar:{ lock:'🔒 قبل الاختبار، افتح كل محتوى هذه الوحدة: بقي {n}.', show:'أرني ↓', end:'مرّر حتى نهاية الوحدة.' }
  };
  function tx(k, n){ var l = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase(); var t = (TX[l] || TX.en)[k]; return n == null ? t : t.replace('{n}', n); }

  /* ---------- safe storage ---------- */
  var MEM = {};
  function areas(){ var a = []; try { a.push(window.localStorage); } catch(e){} try { a.push(window.sessionStorage); } catch(e){} return a; }
  function store(k, v){
    var st = areas(), i;
    if (v === undefined){ for (i = 0; i < st.length; i++){ try { var x = st[i].getItem(k); if (x !== null) return x; } catch(e){} } return Object.prototype.hasOwnProperty.call(MEM, k) ? MEM[k] : null; }
    v = String(v); MEM[k] = v; for (i = 0; i < st.length; i++){ try { st[i].setItem(k, v); } catch(e){} }
  }
  function tid(){ try { return TRAINING_ID; } catch(e){ return 'training'; } }

  /* ---------- styles ---------- */
  var css = '.tdg-todo{outline:2px dashed #F5A524!important;outline-offset:4px;border-radius:12px}' +
    '.tdg-flash{animation:tdgflash 1.2s ease 2}@keyframes tdgflash{50%{outline-color:#E5484D;outline-width:4px}}' +
    '.tdg-lock{margin:14px 0;padding:12px 16px;border-radius:14px;background:#FFF7E6;border:2px solid #F5A524;color:#5A4300;font-weight:700;font-size:14px;display:flex;gap:12px;align-items:center;flex-wrap:wrap}' +
    '.tdg-lock button{border:0;border-radius:999px;padding:7px 14px;background:#F5A524;color:#111;font-weight:800;cursor:pointer}' +
    '[data-tdg-locked]{opacity:.45!important;cursor:not-allowed!important}';
  var st = document.createElement('style'); st.textContent = css; (document.head || document.documentElement).appendChild(st);

  /* ---------- what has to be opened ---------- */
  // Clickable items: done once clicked, or when already shown/selected (a tab or option open by default).
  var CLICK = ['summary', '[data-flip]', '[data-myth]', '[data-oq]', '.qa-q', '.dt-btn', '[data-lt]', '[data-dot]', '[data-video]', '#ageSeg button', '[data-cmp] button', '#loopPlay'];
  // tabs / carousel dots: shown once they are the current one
  var ON_SEL = /\b(dt-btn)\b/;
  var G = null;   // the gate of the module on screen

  function itemsOf(root){
    var out = [];
    CLICK.forEach(function(sel, si){
      root.querySelectorAll(sel).forEach(function(el, i){
        if (el.closest('[data-gate-own]')) return;   // the engine decides (window.TD_GATE_ITEMS)
        out.push({ key:'c' + si + '-' + i, el:el, show:sel === 'summary' ? el.parentNode : el,
          auto:function(){
            if (el.getAttribute('aria-pressed') === 'true') return true;
            if ((ON_SEL.test(el.className) || el.hasAttribute('data-lt') || el.hasAttribute('data-dot')) && (el.classList.contains('on') || el.getAttribute('aria-current') === 'true')) return true;
            return sel === '.qa-q' && el.parentNode && el.parentNode.classList.contains('open');   // accordion item open by default
          } });
      });
    });
    root.querySelectorAll('iframe').forEach(function(f, i){ out.push({ key:'f' + i, el:f, show:f.parentNode }); });
    root.querySelectorAll('video').forEach(function(v, i){
      if (v.muted && v.autoplay) return;   // decorative loops
      if (v.closest('[data-gate-own]')) return;   // the engine decides (window.TD_GATE_ITEMS)
      out.push({ key:'v' + i, el:v, show:v, auto:function(){ return v.duration > 0 && v.currentTime / v.duration >= 0.8; } });
    });
    root.querySelectorAll('.stc').forEach(function(c, i){
      out.push({ key:'s' + i, el:c, show:c, auto:function(){ var d = c.querySelectorAll('[data-s]'); return d.length > 0 && Array.prototype.every.call(d, function(b){ return b.classList.contains('seen') || b.classList.contains('on'); }); } });
    });
    root.querySelectorAll('.srow').forEach(function(r, i){
      out.push({ key:'r' + i, el:r, show:r, auto:function(){ return r.classList.contains('ok') || r.classList.contains('ko'); } });
    });
    // engines can add their own items: [{ key, el, show, auto, noClick }] (noClick = a click alone does not count)
    if (typeof window.TD_GATE_ITEMS === 'function'){ try { (window.TD_GATE_ITEMS(root) || []).forEach(function(it){ out.push(it); }); } catch(e){} }
    return out;
  }

  function save(){ if (G) store(G.skey, JSON.stringify(Object.keys(G.done))); }
  function pending(){
    if (!G) return [];
    var p = [];
    G.items = itemsOf(G.root);   // re-read: engines re-render parts of the page
    G.items.forEach(function(it){
      if (!G.done[it.key] && it.auto && it.auto()){ G.done[it.key] = 1; save(); }
      it.show.classList.toggle('tdg-todo', !G.done[it.key]);
      if (!G.done[it.key]) p.push(it);
    });
    return p;
  }
  function visible(el){ return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length); }

  function attach(o){
    detach();
    if (!o.root) return;
    var skey = 'kl-td-gate-' + tid() + '-' + o.id, done = {};
    try { (JSON.parse(store(skey) || '[]') || []).forEach(function(k){ done[k] = 1; }); } catch(e){}
    G = { id:o.id, root:o.root, cta:o.cta, onDone:o.onDone, skey:skey, done:done, items:[], finished:false };
    // end of the module: a marker right before the call to action
    var mark = document.createElement('div'); mark.style.cssText = 'height:1px'; G.mark = mark;
    var first = o.root.querySelector(o.anchor || o.cta);
    if (first && first.parentNode) first.parentNode.insertBefore(mark, first); else o.root.appendChild(mark);
    G.lock = document.createElement('div'); G.lock.className = 'tdg-lock';
    if (mark.parentNode) mark.parentNode.insertBefore(G.lock, mark.nextSibling);
    if ('IntersectionObserver' in window){
      G.io = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting && G){ G.done.end = 1; save(); tick(); } }); });
      G.io.observe(mark);
    } else G.done.end = 1;
    G.timer = setInterval(tick, 700);
    tick();
  }
  function detach(){
    if (!G) return;
    clearInterval(G.timer); if (G.io) G.io.disconnect();
    if (G.lock && G.lock.parentNode) G.lock.parentNode.removeChild(G.lock);
    G.root.querySelectorAll('.tdg-todo').forEach(function(e){ e.classList.remove('tdg-todo'); });
    G.root.querySelectorAll('[data-tdg-locked]').forEach(function(b){ b.removeAttribute('data-tdg-locked'); if (b.dataset.tdgWasEnabled){ b.disabled = false; delete b.dataset.tdgWasEnabled; } });
    G = null;
  }
  function tick(){
    if (!G) return;
    if (!document.body.contains(G.root) || !document.body.contains(G.mark)){ detach(); return; }
    // started a video / simulation: the focus is inside its frame
    var a = document.activeElement;
    if (a && a.tagName === 'IFRAME') G.items.forEach(function(it){ if (it.el === a && !G.done[it.key]){ G.done[it.key] = 1; save(); } });
    var p = pending(), n = p.length + (G.done.end ? 0 : 1);
    var btns = G.root.querySelectorAll(G.cta);
    if (n === 0){
      btns.forEach(function(b){ if (b.hasAttribute('data-tdg-locked')){ b.removeAttribute('data-tdg-locked'); if (b.dataset.tdgWasEnabled){ b.disabled = false; delete b.dataset.tdgWasEnabled; } } });
      G.lock.style.display = 'none';
      if (!G.finished){ G.finished = true; if (G.onDone) try { G.onDone(); } catch(e){} }
      return;
    }
    btns.forEach(function(b){ if (!b.hasAttribute('data-tdg-locked')){ b.setAttribute('data-tdg-locked', ''); if (!b.disabled){ b.dataset.tdgWasEnabled = '1'; b.disabled = true; } } });
    G.lock.style.display = '';
    G.lock.innerHTML = '<span>' + tx('lock', n) + (p.length ? '' : ' ' + tx('end')) + '</span>';
    var go = document.createElement('button'); go.type = 'button'; go.textContent = tx('show');
    go.onclick = function(){
      var t = p.filter(function(it){ return visible(it.show); })[0];
      var el = t ? t.show : G.mark;
      el.scrollIntoView({ behavior:'smooth', block:'center' });
      if (t){ el.classList.remove('tdg-flash'); void el.offsetWidth; el.classList.add('tdg-flash'); }
    };
    G.lock.appendChild(go);
  }
  // record clicks on the items (capture: works even when the engine stops the event)
  document.addEventListener('click', function(e){
    if (!G) return;
    var hit = G.items.filter(function(it){ return !it.noClick && (it.el === e.target || it.el.contains(e.target)); });
    hit.forEach(function(it){ G.done[it.key] = 1; });
    if (hit.length){ save(); setTimeout(tick, 50); }
    // a click on a locked call to action: show what is missing instead
    var b = e.target.closest && e.target.closest('[data-tdg-locked]');
    if (b){ e.preventDefault(); e.stopPropagation(); var go = G.lock && G.lock.querySelector('button'); if (go) go.click(); }
  }, true);

  // Read by engines that pass a reading module as soon as it opens (the Refunds engine):
  // true = hold it, the gate will pass it when everything is open.
  // the engine re-drew its call to action: lock it again at once
  window.TD_GATE_REFRESH = function(){ tick(); };
  window.TD_GATE_HOLD = function(id){ return !!(G && G.id === id && !G.finished) || window.__tdgOpening === id; };

  /* ---------- engine adapters ---------- */
  function wrap(name, after){
    var orig = window[name]; if (typeof orig !== 'function' || orig.__tdg) return;
    var w = function(){ var r = orig.apply(this, arguments); try { after.apply(this, arguments); } catch(e){} return r; };
    w.__tdg = true; window[name] = w;
  }
  function setup(){
    // Refunds / mini-training engine: openModule(index), content in #contentBody, call to action #moduleCta
    if (typeof window.startInteraction === 'function' && document.getElementById('contentBody')){
      var origOpen = window.openModule;
      if (typeof origOpen !== 'function' || origOpen.__tdg) return;
      var w = function(idx){
        var m = MODULES[idx], hold = m && !isPassed(m.id);
        if (hold) window.__tdgOpening = m.id;
        var r; try { r = origOpen.apply(this, arguments); } finally { window.__tdgOpening = null; }
        try {
          var shown = document.getElementById('screen-content'), on = shown && shown.classList.contains('active');
          if (hold && on && currentModule === m.id) attach({ id:m.id, root:document.getElementById('contentBody'), cta:'#moduleCta',
            onDone:function(){ if (!m.ix && !isPassed(m.id)) setResult(m.id, 100, true); } });
          else detach();
        } catch(e){}
        return r;
      };
      w.__tdg = true; window.openModule = w;
      return;
    }
    // Attendance engine: openModule(module), content in #cbody, call to action .ctabtn
    if (document.getElementById('cbody') && typeof window.completeReading === 'function'){
      wrap('openModule', function(m){
        if (m && typeof m === 'object' && !isPassed(m.id)) attach({ id:m.id, root:document.getElementById('cbody'), cta:'.ctabtn' });
        else detach();
      });
      return;
    }
    // EM / PL core engine (inline) and the Math Brazil engine: renderModule(m), content in #view, call to action inside #mcta
    if (typeof window.renderModule === 'function' && document.getElementById('view')){
      wrap('renderModule', function(m){
        if (m && !passed(m.id) && m.id !== 'm0' && m.check !== 'survey') attach({ id:m.id, root:document.getElementById('view'), cta:'#mcta button', anchor:'#mcta' });
        else detach();
      });
      if (typeof window.route === 'function') window.route();   // the first page was drawn before this script loaded
    }
  }
  // the surveys scripts wrap openModule on DOMContentLoaded: wrap after them
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(setup, 0); });
  else setTimeout(setup, 0);
  // leaving the module screen: stop the gate
  addEventListener('hashchange', function(){ setTimeout(function(){ if (G && !document.body.contains(G.mark)) detach(); }, 0); });
})();
