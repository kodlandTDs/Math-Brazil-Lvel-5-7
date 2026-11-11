/* =========================================================
   Kodland tutor trainings · survey receiver + summary (Google Apps Script)
   - Every training sends its start and final survey here.
   - All answers go into TWO tabs: "Start survey" and "Final survey".
     The "training" column says which training each row comes from (mathbr14, mathbr57, …).
   - The "Summary" tab is rebuilt automatically after every answer
     (and from the menu 📊 Surveys → Rebuild the summary).
   - Old split tabs (for example "Lvl 1-4 Start survey") can be merged with
     📊 Surveys → Merge old tabs into the main tabs.
   After changing this code: Deploy → Manage deployments → ✏️ → Version: New version (the /exec URL stays the same).
   ========================================================= */

const TABS = { start: 'Start survey', final: 'Final survey' };
const SUMMARY = 'Summary';
const FIRST = ['received_at', 'sent_at', 'training', 'course', 'lang', 'region', 'email'];
// Readable names for the trainings (add new ones here)
const TRAINING_NAMES = {
  mathbr14: 'Math Adventures Levels 1–4',
  mathbr57: 'Math Adventures Levels 5–7'
};
// A tutor "needs follow-up" when any final rating is at or below this value, or the final feeling is one of these
const FOLLOW_UP_MAX = 2;
const FOLLOW_UP_FEELINGS = ['worried', 'overwhelmed'];
const SHARED = ['confidence', 'understand_why', 'know_where'];                 // asked in both surveys
const FINAL_ONLY = ['ready_first_lesson', 'know_course', 'ready_tools', 'ready_teach_math', 'training_clear', 'math_tips_helped'];
const LABELS = {
  confidence: 'Confidence to teach the course', understand_why: 'Understands why we are making this change',
  know_where: 'Knows where to find help', ready_first_lesson: 'Ready for the first lesson', know_course: 'Knows the course',
  ready_tools: 'Ready to use BO, Classroom and the tools', ready_teach_math: 'Ready to teach math', training_clear: 'Training was clear',
  math_tips_helped: 'Math teaching tips were useful'
};
const FEELINGS = ['excited', 'curious', 'calm', 'unsure', 'worried', 'overwhelmed'];

/* ---------- receiver ---------- */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const data = JSON.parse(e.postData.contents);
    data.received_at = new Date();
    const key = String(data.survey || 'other');
    const sheet = getSheet_(TABS[key] || key);
    const headers = ensureHeaders_(sheet, data);
    sheet.appendRow(headers.map(h => (h in data ? data[h] : '')));
    try { rebuildSummary(); } catch (err) { console.warn('Summary not rebuilt: ' + err); }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json_({ ok: true, message: 'Survey receiver is running.' });
}

/* ---------- menu ---------- */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('📊 Surveys')
    .addItem('Rebuild the summary', 'rebuildSummary')
    .addItem('Merge old tabs into the main tabs', 'mergeOldTabs')
    .addToUi();
}

/* ---------- helpers ---------- */
function getSheet_(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function ensureHeaders_(sheet, data) {
  const lastCol = sheet.getLastColumn();
  let headers = lastCol ? sheet.getRange(1, 1, 1, lastCol).getValues()[0].filter(String) : [];
  if (!headers.length) headers = FIRST.slice();
  Object.keys(data).filter(k => k !== 'survey' && headers.indexOf(k) < 0).forEach(k => headers.push(k));
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
  sheet.setFrozenRows(1);
  return headers;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Rows of a tab as objects ({header: value})
function readRows_(name) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sh || sh.getLastRow() < 2) return [];
  const v = sh.getRange(1, 1, sh.getLastRow(), sh.getLastColumn()).getValues();
  const h = v[0];
  return v.slice(1).filter(r => r.some(String)).map(r => { const o = {}; h.forEach((k, i) => { if (k) o[k] = r[i]; }); return o; });
}

/* ---------- merge the old split tabs (e.g. "Lvl 1-4 Start survey") into "Start survey" / "Final survey" ---------- */
function mergeOldTabs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet(), ui = SpreadsheetApp.getUi();
  const plan = [];
  ss.getSheets().forEach(sh => {
    const n = sh.getName();
    if (n === TABS.start || n === TABS.final || n === SUMMARY) return;
    if (/start/i.test(n)) plan.push([sh, TABS.start]);
    else if (/final/i.test(n)) plan.push([sh, TABS.final]);
  });
  if (!plan.length) { ui.alert('There are no old tabs to merge.'); return; }
  const ok = ui.alert('Merge ' + plan.length + ' tab(s) into "' + TABS.start + '" and "' + TABS.final + '"?\n\n' +
    plan.map(p => '• ' + p[0].getName() + ' → ' + p[1]).join('\n') + '\n\nThe old tabs are deleted after their rows are copied (duplicates are skipped).', ui.ButtonSet.YES_NO);
  if (ok !== ui.Button.YES) return;
  plan.forEach(([sh, target]) => {
    const rows = readRows_(sh.getName());
    const dest = getSheet_(target);
    const seen = new Set(readRows_(target).map(r => [r.sent_at, r.email, r.training].join('|')));
    rows.forEach(r => {
      const k = [r.sent_at, r.email, r.training].join('|');
      if (seen.has(k)) return;
      seen.add(k);
      const headers = ensureHeaders_(dest, r);
      dest.appendRow(headers.map(h => (h in r ? r[h] : '')));
    });
    ss.deleteSheet(sh);
  });
  rebuildSummary();
  ui.alert('Done: the old tabs were merged and the summary was rebuilt.');
}

/* ---------- summary ---------- */
function rebuildSummary() {
  const starts = readRows_(TABS.start), finals = readRows_(TABS.final);
  const key = r => String(r.email).trim().toLowerCase() + '|' + r.training;
  const latest = rows => { const m = {}; rows.forEach(r => { const k = key(r), t = new Date(r.received_at || r.sent_at).getTime() || 0;
    if (!m[k] || t >= m[k]._t) m[k] = Object.assign({ _t: t }, r); }); return m; };
  const S = latest(starts), F = latest(finals);
  const trainings = Array.from(new Set(starts.concat(finals).map(r => r.training).filter(String))).sort();
  const name = t => TRAINING_NAMES[t] || ((starts.concat(finals).find(r => r.training === t) || {}).course) || t;
  const num = v => (v === '' || v === null || isNaN(Number(v))) ? null : Number(v);
  const avg = a => { const n = a.map(num).filter(x => x !== null); return n.length ? Math.round(n.reduce((s, x) => s + x, 0) / n.length * 100) / 100 : ''; };

  const out = [];
  out.push(['Tutor training surveys: start vs. final']);
  out.push(['Only tutors with both a start and a final survey for the same training are compared. If a tutor repeated a training, the latest answer is used. Follow-up = a final rating of ' + FOLLOW_UP_MAX + ' or lower, or a final feeling of ' + FOLLOW_UP_FEELINGS.join(' / ') + '. Updated: ' + new Date().toLocaleString()]);
  out.push(['']);

  // 1. Overview
  out.push(['Overview']);
  out.push(['Training', 'Name', 'Start surveys (tutors)', 'Final surveys (tutors)', 'Tutors with both', 'Needing follow-up', '% needing follow-up', 'Start survey only']);
  const follow = [];
  trainings.forEach(t => {
    const sk = Object.keys(S).filter(k => S[k].training === t), fk = Object.keys(F).filter(k => F[k].training === t);
    const both = sk.filter(k => F[k]);
    let need = 0;
    fk.forEach(k => {
      const f = F[k], s = S[k] || {};
      const scales = SHARED.concat(FINAL_ONLY).map(m => [m, num(f[m])]).filter(x => x[1] !== null);
      const low = scales.reduce((a, b) => (a && a[1] <= b[1]) ? a : b, null);
      const flag = (low && low[1] <= FOLLOW_UP_MAX) || FOLLOW_UP_FEELINGS.indexOf(String(f.feeling)) >= 0;
      if (flag) { need++; follow.push([f.email, name(t), f.region || s.region || '', low ? low[1] : '', low ? (LABELS[low[0]] || low[0]) : '', s.feeling || '', f.feeling || '', s.worries || '', f.improve || '']); }
    });
    out.push([t, name(t), sk.length, fk.length, both.length, need, fk.length ? Math.round(need / fk.length * 1000) / 10 + '%' : '', sk.filter(k => !F[k]).length]);
  });
  out.push(['']);

  // 2. Ratings (1–5)
  out.push(['Ratings (average, 1–5)']);
  const head = ['Question'];
  trainings.forEach(t => head.push(name(t) + ' · start', name(t) + ' · final', name(t) + ' · change'));
  out.push(head);
  SHARED.forEach(m => {
    const row = [LABELS[m]];
    trainings.forEach(t => {
      const both = Object.keys(S).filter(k => S[k].training === t && F[k]);
      const a = avg(both.map(k => S[k][m])), b = avg(both.map(k => F[k][m]));
      row.push(a, b, (a !== '' && b !== '') ? Math.round((b - a) * 100) / 100 : '');
    });
    out.push(row);
  });
  FINAL_ONLY.forEach(m => {
    const row = [LABELS[m] + ' (final only)'];
    trainings.forEach(t => row.push('', avg(Object.keys(F).filter(k => F[k].training === t).map(k => F[k][m])), ''));
    out.push(row);
  });
  out.push(['']);

  // 3. Feelings
  out.push(['How tutors feel (number of tutors)']);
  const fh = ['Feeling'];
  trainings.forEach(t => fh.push(name(t) + ' · start', name(t) + ' · final'));
  out.push(fh);
  FEELINGS.forEach(fe => {
    const row = [fe];
    trainings.forEach(t => row.push(
      Object.keys(S).filter(k => S[k].training === t && S[k].feeling === fe).length,
      Object.keys(F).filter(k => F[k].training === t && F[k].feeling === fe).length));
    out.push(row);
  });
  out.push(['']);

  // 4. Follow-up list
  out.push(['Tutors who need follow-up (latest attempt)']);
  out.push(['Tutor', 'Training', 'Region', 'Lowest final rating', 'Lowest question', 'Feeling (start)', 'Feeling (final)', 'Worry at start', 'What to improve']);
  if (follow.length) follow.forEach(r => out.push(r)); else out.push(['Nobody needs follow-up right now.']);

  // write
  const sh = getSheet_(SUMMARY);
  sh.clear();
  const width = Math.max.apply(null, out.map(r => r.length));
  const grid = out.map(r => r.concat(new Array(width - r.length).fill('')));
  sh.getRange(1, 1, grid.length, width).setValues(grid);
  sh.getRange(1, 1).setFontSize(14).setFontWeight('bold');
  sh.getRange(2, 1).setFontStyle('italic').setWrap(false);
  grid.forEach((r, i) => {
    if (/^(Overview|Ratings|How tutors feel|Tutors who need)/.test(String(r[0]))) {
      sh.getRange(i + 1, 1).setFontWeight('bold').setFontSize(12);
      sh.getRange(i + 2, 1, 1, width).setFontWeight('bold').setBackground('#EEF0FE');
    }
  });
  sh.setFrozenRows(1);
  sh.autoResizeColumns(1, width);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setActiveSheet(sh); ss.moveActiveSheet(1);
}
