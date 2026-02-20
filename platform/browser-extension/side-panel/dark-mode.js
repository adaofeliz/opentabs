// Apply dark/light theme before first paint to avoid flash.
// Reads the persisted choice from chrome.storage.local; falls back to
// the system preference when no stored value exists.
(function () {
  var mq = window.matchMedia('(prefers-color-scheme:dark)');
  function apply(dark) {
    document.documentElement.classList.toggle('dark', dark);
  }

  // Synchronous fallback — use system preference immediately so the
  // page renders with the right theme while storage loads.
  apply(mq.matches);

  // Async — override with persisted preference once available.
  chrome.storage.local.get('theme').then(function (result) {
    if (result.theme === 'dark' || result.theme === 'light') {
      apply(result.theme === 'dark');
    }
  });

  // Keep responding to OS changes only if the user has no stored preference.
  mq.addEventListener('change', function (e) {
    chrome.storage.local.get('theme').then(function (result) {
      if (!result.theme) {
        apply(e.matches);
      }
    });
  });
})();
