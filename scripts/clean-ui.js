/* Shared clean UI policy for Android and Windows builds.
   Hide unwanted account/restore/exit/skip controls even when text is wrapped
   or the label has extra words (for example "Skip web"). */
(function () {
  if (window.__businessSoftwareCleanUiInstalled) return;
  window.__businessSoftwareCleanUiInstalled = true;

  const unwanted = [
    /\\bregister(?:\\s+account)?\\b/i,
    /\\bexit\\b/i,
    /\\bskip(?:\\s+web)?\\b/i,
    /\\brestore account on this device\\b/i,
    /\\brestore from google sheet\\b/i,
    /\\bapps script(?: web app)? url\\b/i,
    /\\bsecret key\\b/i,
    /\\bexcited\\b/i
  ];
  const controls = 'button, a, [role="button"], input[type="button"], input[type="submit"]';
  const smallText = 'label, small, p, span';

  function textOf(el) {
    return (el.innerText || el.value || el.getAttribute('aria-label') || '')
      .replace(/\\s+/g, ' ').trim();
  }

  function matches(text) {
    return unwanted.some((pattern) => pattern.test(text));
  }

  function hide(el) {
    if (!el || el.dataset.cleanUiHidden === '1') return;
    el.style.setProperty('display', 'none', 'important');
    el.setAttribute('aria-hidden', 'true');
    el.dataset.cleanUiHidden = '1';
  }

  function clean() {
    document.querySelectorAll(controls).forEach((el) => {
      const text = textOf(el);
      if (text && text.length <= 160 && matches(text)) hide(el);
    });

    document.querySelectorAll(smallText).forEach((el) => {
      const text = textOf(el);
      if (!text || text.length > 100 || !matches(text)) return;
      const parent = el.parentElement;
      // Hide the compact row for restore/settings labels, not a whole page section.
      if (parent && parent.children.length <= 5 && textOf(parent).length <= 220) hide(parent);
      else hide(el);
    });

    // Catch standalone text-only chips/rows such as "Skip web" that are not buttons.
    document.querySelectorAll('div, section, aside').forEach((el) => {
      if (el.dataset.cleanUiHidden === '1') return;
      const text = textOf(el);
      if (!text || text.length > 80 || !matches(text)) return;
      if (el.children.length <= 2) hide(el);
    });
  }

  clean();
  const observer = new MutationObserver(clean);
  observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  document.addEventListener('DOMContentLoaded', clean);
})();
