// theme.js: theme/org switching logic for Scout Tools
(function() {
  const html = document.documentElement;
  const themeKey = 'scouttools:theme';
  function applyTheme(org, mode) {
    html.setAttribute('data-org', org);
    if (mode === 'system') {
      html.removeAttribute('data-theme');
    } else {
      html.setAttribute('data-theme', mode);
    }
    // Enable/disable theme CSS
    document.querySelectorAll('[data-theme-css]').forEach(link => {
      link.disabled = link.getAttribute('data-theme-css') !== org;
    });
  }
  function saveTheme(org, mode) {
    localStorage.setItem(themeKey, JSON.stringify({ org, mode }));
  }
  function loadTheme() {
    try {
      return JSON.parse(localStorage.getItem(themeKey));
    } catch { return null; }
  }
  // Expose for UI
  window.ScoutTheme = {
    set(org, mode) {
      applyTheme(org, mode);
      saveTheme(org, mode);
    },
    get() {
      return loadTheme() || { org: 'pack', mode: 'system' };
    }
  };
  // On load
  const pref = loadTheme() || { org: 'pack', mode: 'system' };
  applyTheme(pref.org, pref.mode);
})();
