/* Web-only UI cleanup. Keep the real login fields visible; hide Dealer Portal and unwanted setup controls only on the web build. */
(function () {
  if (window.__samudayWebUiInstalled) return;
  window.__samudayWebUiInstalled = true;
  const hide = (el) => {
    if (!el || el.dataset.samudayWebHidden === '1') return;
    el.style.setProperty('display', 'none', 'important');
    el.setAttribute('aria-hidden', 'true');
    el.dataset.samudayWebHidden = '1';
  };
  const norm = (s) => (s || '').replace(/\s+/g, ' ').trim().toLowerCase();
  function clean() {
    document.querySelectorAll('button,a,[role="button"],input[type="button"],input[type="submit"],label,small,p,span').forEach((el) => {
      const t = norm(el.innerText || el.value || el.getAttribute('aria-label') || el.textContent);
      if (['dealer portal','register account','exit','skip','skip web','excited'].includes(t)) hide(el);
    });
    document.querySelectorAll('div,section,aside,form,article').forEach((el) => {
      if (el.dataset.samudayWebHidden === '1') return;
      const t = norm(el.innerText || el.textContent);
      if (t.length > 0 && t.length < 500 &&
          (t.includes('apps script web app url') || t.includes('restore account on this device')) &&
          t.includes('secret key')) hide(el);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', clean);
  else clean();
  new MutationObserver(clean).observe(document.documentElement, {childList:true,subtree:true,characterData:true});
})();
