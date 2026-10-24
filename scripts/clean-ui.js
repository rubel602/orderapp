/* Shared clean UI policy for Android and Windows builds. */
(function () {
  if (window.__businessSoftwareCleanUiInstalled) return;
  window.__businessSoftwareCleanUiInstalled = true;

  const unwanted = [
    "register account",
    "register",
    "excited",
    "exit",
    "skip",
    "restore account on this device",
    "restore from google sheet",
    "apps script url",
    "secret key"
  ];

  function clean() {
    const candidates = document.querySelectorAll(
      'button, a, [role="button"], input[type="button"], input[type="submit"], label, small, p, span, div, section, aside'
    );
    candidates.forEach((el) => {
      if (!el || el.dataset.cleanUiChecked === "1") return;
      const raw = (el.innerText || el.value || el.getAttribute("aria-label") || "")
        .replace(/\s+/g, " ").trim().toLowerCase();
      if (!raw || raw.length > 100) return;
      const match = unwanted.find((word) => raw === word || raw === word + "?" || raw === word + ":");
      if (!match) return;

      // Hide the control itself; for restore/settings field labels, hide its compact
      // surrounding row so the associated URL/key input does not remain orphaned.
      let target = el;
      if (/^(label|small|p|span)$/.test(el.tagName.toLowerCase())) {
        const parent = el.parentElement;
        if (parent && parent.children.length <= 4 && parent.innerText.length < 180) target = parent;
      }
      target.style.setProperty("display", "none", "important");
      target.setAttribute("aria-hidden", "true");
      target.dataset.cleanUiChecked = "1";
    });
  }

  clean();
  const observer = new MutationObserver(clean);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener("DOMContentLoaded", clean);
  setTimeout(clean, 300);
  setTimeout(clean, 1200);
})();