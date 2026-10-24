/* Shared clean UI policy for Android and Windows builds.
   Hide only the specifically unwanted controls/panel; preserve login fields and Dealer Portal. */
(function () {
  if (window.__businessSoftwareCleanUiInstalled) return;
  window.__businessSoftwareCleanUiInstalled = true;

  const unwantedExact = new Set([
    'register account',
    'exit',
    'skip',
    'skip web',
    'excited'
  ]);
  const controls = 'button, a, [role="button"], input[type="button"], input[type="submit"]';

  function textOf(el) {
    return (el && (el.innerText || el.value || el.getAttribute('aria-label') || ''))
      .replace(/\\s+/g, ' ').trim();
  }
  function hide(el) {
    if (!el || el.dataset.cleanUiHidden === '1') return;
    el.style.setProperty('display', 'none', 'important');
    el.setAttribute('aria-hidden', 'true');
    el.dataset.cleanUiHidden = '1';
  }
  function clean() {
    // Keep the app name exactly "Business ERP Software".
    document.title = 'Business ERP Software';
    const appTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (appTitle) appTitle.content = 'Business ERP Software';
    document.querySelectorAll('.lgc h1').forEach((el) => { el.textContent = 'Business ERP Software'; });
    // Keep the login screen version consistent with the requested release label.
    document.querySelectorAll('body *').forEach((el) => {
      if (el.children.length === 0 && (el.textContent || '').replace(/\\s+/g, ' ').trim().toLowerCase() === 'version 03') {
        el.textContent = 'VERSION 02';
      }
    });
    // Hide only the dedicated restore-account panel, never a general login or portal container.
    const panelNeedles = [
      'restore account on this device',
      'apps script web app url',
      'secret key'
    ];
    document.querySelectorAll('div, section, aside, form, article').forEach((el) => {
      if (el.dataset.cleanUiHidden === '1') return;
      const text = textOf(el);
      if (!text || text.length > 1800) return;
      const low = text.toLowerCase();
      if (!panelNeedles.every((needle) => low.includes(needle))) return;

      // Prefer the smallest matching element so unrelated sign-in/Dealer Portal UI stays visible.
      let target = el;
      let parent = el.parentElement;
      while (parent) {
        const parentText = textOf(parent);
        if (parentText.length > 1800 || !panelNeedles.every((needle) => parentText.toLowerCase().includes(needle))) break;
        target = parent;
        parent = parent.parentElement;
      }
      hide(target);
    });

    // Exact-match controls only. Do not hide a button just because its text contains "exit",
    // "skip", or "register" as part of a longer label.
    document.querySelectorAll(controls).forEach((el) => {
      const text = textOf(el).toLowerCase();
      if (unwantedExact.has(text)) hide(el);
    });

    // Hide only exact standalone text nodes/labels, never parent divs or sections.
    document.querySelectorAll('label, small, p, span').forEach((el) => {
      if (el.dataset.cleanUiHidden === '1' || el.children.length > 0) return;
      const text = textOf(el).toLowerCase();
      if (unwantedExact.has(text)) hide(el);
    });
  }

  clean();
  const observer = new MutationObserver(clean);
  observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  document.addEventListener('DOMContentLoaded', clean);
})();
