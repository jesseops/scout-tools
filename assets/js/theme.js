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

const getActiveTheme = (prefs) => (prefs.mode === "system" ? getSystemMode() : prefs.mode);

const applyTheme = (prefs) => {
  const html = document.documentElement;
  html.dataset.org = prefs.org;

  html.dataset.theme = getActiveTheme(prefs);
  html.dataset.themeMode = prefs.mode;

  const themeStyles = document.querySelectorAll("[data-theme-css]");
  themeStyles.forEach((link) => {
    link.disabled = link.getAttribute("data-theme-css") !== prefs.org;
  });

  document.dispatchEvent(new CustomEvent("scout:themechange", { detail: { ...prefs } }));
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
    if (select.dataset.themeBound === "true") return;
    select.dataset.themeBound = "true";
    select.addEventListener("change", (event) => {
      const prefs = { ...getPrefs(), org: event.target.value };
      setPrefs(prefs);
      applyTheme(prefs);
      syncThemeControls(prefs);
    });
  });

  document.querySelectorAll("[data-theme-control='mode']").forEach((select) => {
    if (select.dataset.themeBound === "true") return;
    select.dataset.themeBound = "true";
    select.addEventListener("change", (event) => {
      const prefs = { ...getPrefs(), mode: event.target.value };
      setPrefs(prefs);
      applyTheme(prefs);
      syncThemeControls(prefs);
    });
  });
};

const initTheme = () => {
  const prefs = getPrefs();
  applyTheme(prefs);
  syncThemeControls(prefs);
  setupThemeControls();
};

window.ScoutTheme = {
  THEME_KEY,
  defaultPrefs,
  getPrefs,
  setPrefs,
  getSystemMode,
  getActiveTheme,
  applyTheme,
  syncThemeControls,
  setupThemeControls,
  initTheme,
};

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  systemQuery.addEventListener("change", () => {
    const latest = getPrefs();
    if (latest.mode === "system") {
      applyTheme(latest);
    }
  });
});
