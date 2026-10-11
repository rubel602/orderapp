/**
 * Business Software ERP - Google Sheet storage
 * 1) Open your Google Sheet -> Extensions -> Apps Script -> paste this whole file.
 * 2) Change SECRET below to your own long secret word.
 * 3) Deploy -> New deployment -> type "Web app"
 *      Execute as: Me      Who has access: Anyone
 * 4) Copy the Web app URL and paste it into the app: Data Backup -> Google Sheet sync.
 */
const SECRET = 'CHANGE-THIS-TO-YOUR-OWN-SECRET';
const DATA_SHEET = '_data';

function doPost(e) {
  try {
    const b = JSON.parse(e.postData.contents);
    if (b.k !== SECRET) return out_({ ok: false, e: 'Wrong key' });
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (b.a === 'ping') return out_({ ok: true });

    if (b.a === 'push') {
      const lock = LockService.getScriptLock();
      lock.waitLock(30000);
      try {
        // 1) full copy of the app data (used for restore), split in cells of 40,000 characters
        const sh = sheet_(ss, DATA_SHEET);
        sh.clear();
        const rows = [[String(b.t)]].concat((b.chunks || []).map(function (c) { return [c]; }));
        const r = sh.getRange(1, 1, rows.length, 1);
        r.setNumberFormat('@');
        r.setValues(rows);
        sh.hideSheet();

        // 2) readable tabs (Customers, Products, Sales, ...)
        const tabs = b.tabs || {};
        Object.keys(tabs).forEach(function (name) {
          const t = tabs[name];
          if (!t || !t.length) return;
          const w = Math.max.apply(null, t.map(function (x) { return x.length; }));
          const data = t.map(function (x) { const y = x.slice(); while (y.length < w) y.push(''); return y; });
          const s = sheet_(ss, name);
          s.clear();
          s.getRange(1, 1, data.length, w).setValues(data);
          s.getRange(1, 1, 1, w).setFontWeight('bold').setBackground('#e8eefc');
          s.setFrozenRows(1);
        });
        return out_({ ok: true, t: b.t });
      } finally {
        lock.releaseLock();
      }
    }

    if (b.a === 'pull') {
      const sh = ss.getSheetByName(DATA_SHEET);
      if (!sh || sh.getLastRow() < 2) return out_({ ok: true, d: '' });
      const vals = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
      return out_({ ok: true, t: sh.getRange(1, 1).getValue(), d: vals.map(function (x) { return x[0]; }).join('') });
    }

    return out_({ ok: false, e: 'Unknown action' });
  } catch (err) {
    return out_({ ok: false, e: String(err) });
  }
}

function doGet() {
  return out_({ ok: true, e: 'Business Software ERP sync is running. Use the app to sync.' });
}

function sheet_(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
