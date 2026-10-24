/* One-time full clean start requested by the owner: clear app-side records and prevent old local Google Sheet settings from syncing back. */
(function () {
  const marker = 'bs_clean_start_v2';
  try {
    if (localStorage.getItem(marker) === '1') return;
    if (typeof SFG === 'undefined' || typeof sfDo !== 'function' || typeof save !== 'function') return;
    // Preserve a recovery snapshot when the app's snapshot facility is available.
    const done = function () {
      // Prevent old Google Sheet demo data from being pulled back automatically.
      localStorage.removeItem('bs_gs');
      sfDo(SFG.map(function (g) { return g[0]; }));
      if (typeof fix === 'function') fix();
      save();
      localStorage.setItem(marker, '1');
      if (typeof render === 'function') render();
    };
    if (typeof snapPut === 'function') {
      Promise.resolve(snapPut('Before clean start')).then(done).catch(done);
    } else {
      done();
    }
  } catch (e) {
    console.error('Clean start could not finish:', e);
  }
})();