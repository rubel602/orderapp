/* Shared clean UI policy for Android and Windows builds.
   Removes unwanted account/restore panels and Exit/Skip controls from both builds. */
(function () {
  if (window.__businessSoftwareCleanUiInstalled) return;
  window.__businessSoftwareCleanUiInstalled = true;

  const unwanted = [
    /\bregister(?:\s+account)?\b/i,
    /\bexit\b/i,
    /\bskip(?:\s+web)?\b/i,
    /\brestore account on this device\b/i,
    /\brestore from google sheet\b/i,
    /\bapps script(?: web app)? url\b/i,
    /\bsecret key\b/i,
    /\bexcited\b/i
  ];
  const controls = 'button, a, [role="button"], input[type="button"], input[type="submit"]';

  function textOf(el) {
    return (el && (el.innerText || el.value || el.getAttribute('aria-label') || ''))
      .replace(/\s+/g, ' ').trim();
  }
  function hide(el) {
    if (!el || el.dataset.cleanUiHidden === '1') return;
    el.style.setProperty('display', 'none', 'important');
    el.setAttribute('aria-hidden', 'true');
    el.dataset.cleanUiHidden = '1';
  }
  function matches(text) {
    return unwanted.some((pattern) => pattern.test(text));
  }

  function clean() {
    // Hide the entire restore-account panel, including description, URL, secret-key inputs and warnings.
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
      if (panelNeedles.every((needle) => low.includes(needle))) {
        // Pick the smallest ancestor that contains all panel text, without hiding the whole app.
        let target = el;
        while (target.parentElement) {
          const parentText = textOf(target.parentElement);
          if (parentText.length > 1800) break;
          const parentLow = parentText.toLowerCase();
          if (!panelNeedles.every((needle) => parentLow.includes(needle))) break;
          target = target.parentElement;
        }
        hide(target);
      }
    });

    document.querySelectorAll(controls).forEach((el) => {
      const text = textOf(el);
      if (text && text.length <= 180 && matches(text)) hide(el);
    });

    // Hide short standalone labels/rows that contain the unwanted options.
    document.querySelectorAll('label, small, p, span, div, section, aside').forEach((el) => {
      if (el.dataset.cleanUiHidden === '1') return;
      const text = textOf(el);
      if (!text || text.length > 100 || !matches(text)) return;
      if (el.children.length <= 3) hide(el);
    });
  }

  clean();
  const observer = new MutationObserver(clean);
  observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  document.addEventListener('DOMContentLoaded', clean);
})();
