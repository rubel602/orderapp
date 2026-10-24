/* Web-only login presentation for Business ERP Software Samuday.
   Do not run the shared clean-ui.js here: its broad panel matching can hide the whole login area.
   Keep Employee Sign In and Dealer Portal available. */
(function () {
  if (window.__samudayWebLoginFix) return;
  window.__samudayWebLoginFix = true;
  const norm = s => String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();
  const hide = el => {
    if (!el || el.dataset.samudayHidden === '1') return;
    el.style.setProperty('display', 'none', 'important');
    el.setAttribute('aria-hidden', 'true');
    el.dataset.samudayHidden = '1';
  };
  function clean() {
    document.title = 'Business ERP Software Samuday';
    const meta = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (meta) meta.content = 'Business ERP Software Samuday';
    document.querySelectorAll('.lgc h1').forEach(el => { el.textContent = 'Business ERP Software Samuday'; });
    // Hide only the dedicated restore/setup card, never its login form parent.
    document.querySelectorAll('.lgc > .card, .lgc .card').forEach(el => {
      const t = norm(el.innerText || el.textContent);
      if (t.includes('restore account on this device') &&
          t.includes('apps script web app url') && t.includes('secret key')) hide(el);
    });
    // Make the employee sign-in action explicit; preserve its icon and click handler.
    document.querySelectorAll('.lgc .lgb').forEach(el => {
      if (el.dataset.samudayEmployeeLabel === '1') return;
      const first = Array.from(el.childNodes).find(n => n.nodeType === 3);
      if (first) first.textContent = 'Employee Sign In ';
      else el.insertBefore(document.createTextNode('Employee Sign In '), el.firstChild);
      el.dataset.samudayEmployeeLabel = '1';
    });
    // Remove only the unwanted standalone actions. Dealer Portal is intentionally retained.
    document.querySelectorAll('button,a,[role="button"],input[type="button"],input[type="submit"],label,small,p,span').forEach(el => {
      const t = norm(el.innerText || el.value || el.getAttribute('aria-label'));
      if (['register account', 'exit', 'skip', 'skip web', 'excited'].includes(t)) hide(el);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', clean);
  else clean();
  new MutationObserver(clean).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
})();
