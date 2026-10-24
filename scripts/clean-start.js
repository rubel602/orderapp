/* One-time clean start for the owner's requested fresh install.
   Keep accounts/roles and business configuration; clear operational/demo records. */
(function () {
  const marker = 'bs_clean_start_v1';
  try {
    if (localStorage.getItem(marker) === '1') return;
    if (typeof SFG === 'undefined' || typeof sfDo !== 'function' || typeof save !== 'function') return;
    // Preserve a recovery snapshot when the app's snapshot facility is available.
    const done = function () {
      sfDo(SFG.map(function (g) { return g[0]; }));
      if (typeof fix === 'function') fix();
      save();
      localStorage.setItem(marker, '1');
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