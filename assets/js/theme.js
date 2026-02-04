const THEME_KEY = "scouttools:theme";

const defaultPrefs = {
  org: "troop",
  mode: "system",
};

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

const applyTheme = (prefs) => {
  const html = document.documentElement;
  html.dataset.org = prefs.org;

  if (prefs.mode === "system") {
    delete html.dataset.theme;
  } else {
    html.dataset.theme = prefs.mode;
  }

  const themeStyles = document.querySelectorAll("[data-theme-css]");
  themeStyles.forEach((link) => {
    link.disabled = link.getAttribute("data-theme-css") !== prefs.org;
  });
};

document.addEventListener("DOMContentLoaded", () => {
  applyTheme(getPrefs());
});
