const THEME_KEY = "scouttools:theme";

const defaultPrefs = {
  org: "troop",
  mode: "system",
};

const systemQuery = window.matchMedia("(prefers-color-scheme: dark)");

const getPrefs = () => {
  const raw = localStorage.getItem(THEME_KEY);
  if (!raw) return { ...defaultPrefs };
  try {
    const parsed = JSON.parse(raw);
    return {
      org: parsed.org || defaultPrefs.org,
      mode: parsed.mode || defaultPrefs.mode,
    };
  } catch {
    return { ...defaultPrefs };
  }
};

const setPrefs = (prefs) => {
  localStorage.setItem(THEME_KEY, JSON.stringify(prefs));
};

const getSystemMode = () => (systemQuery.matches ? "dark" : "light");

const applyTheme = (prefs) => {
  const html = document.documentElement;
  html.dataset.org = prefs.org;

  if (prefs.mode === "system") {
    html.dataset.theme = getSystemMode();
  } else {
    html.dataset.theme = prefs.mode;
  }
  html.dataset.themeMode = prefs.mode;

  const themeStyles = document.querySelectorAll("[data-theme-css]");
  themeStyles.forEach((link) => {
    link.disabled = link.getAttribute("data-theme-css") !== prefs.org;
  });
};

const syncThemeControls = (prefs) => {
  document.querySelectorAll("[data-theme-control='org']").forEach((select) => {
    select.value = prefs.org;
  });
  document.querySelectorAll("[data-theme-control='mode']").forEach((select) => {
    select.value = prefs.mode;
  });
};

const setupThemeControls = () => {
  document.querySelectorAll("[data-theme-control='org']").forEach((select) => {
    select.addEventListener("change", (event) => {
      const prefs = { ...getPrefs(), org: event.target.value };
      setPrefs(prefs);
      applyTheme(prefs);
      syncThemeControls(prefs);
    });
  });

  document.querySelectorAll("[data-theme-control='mode']").forEach((select) => {
    select.addEventListener("change", (event) => {
      const prefs = { ...getPrefs(), mode: event.target.value };
      setPrefs(prefs);
      applyTheme(prefs);
      syncThemeControls(prefs);
    });
  });
};

document.addEventListener("DOMContentLoaded", () => {
  const prefs = getPrefs();
  applyTheme(prefs);
  syncThemeControls(prefs);
  setupThemeControls();
  systemQuery.addEventListener("change", () => {
    const latest = getPrefs();
    if (latest.mode === "system") {
      applyTheme(latest);
    }
  });
});
