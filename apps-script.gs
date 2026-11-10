const TABS = { start: 'Start survey', final: 'Final survey' };
const FIRST = ['received_at', 'sent_at', 'training', 'course', 'lang', 'region', 'email'];

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
