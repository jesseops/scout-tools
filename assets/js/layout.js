(() => {
  const MOBILE_BREAKPOINT = 860;

  const qs = (selector, root = document) => root.querySelector(selector);

  const getMain = () => qs("#app-main") || qs("main");

  const parseBreadcrumbs = (raw) => {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.filter((item) => item && typeof item.label === "string" && typeof item.href === "string")
        : [];
    } catch {
      return [];
    }
  };

  const syncHeaderMeta = () => {
    const main = getMain();
    if (!main) return;

    const title = main.dataset.pageTitle || document.title || "Scout Tools";
    const subtitle = main.dataset.pageSubtitle || "";
    const breadcrumbs = parseBreadcrumbs(main.dataset.breadcrumbs);

    const titleNode = qs("[data-layout-title]");
    if (titleNode) titleNode.textContent = title;

    const subtitleNode = qs("[data-layout-subtitle]");
    if (subtitleNode) {
      subtitleNode.textContent = subtitle;
      subtitleNode.hidden = !subtitle;
    }

    document.title = title;

    const breadcrumbRoot = qs("[data-layout-breadcrumbs]");
    if (!breadcrumbRoot) return;

    breadcrumbRoot.innerHTML = "";
    breadcrumbs.forEach((item, index) => {
      const li = document.createElement("li");
      li.className = "breadcrumb-item";

      const isLast = index === breadcrumbs.length - 1;
      if (isLast) {
        const span = document.createElement("span");
        span.textContent = item.label;
        span.setAttribute("aria-current", "page");
        li.appendChild(span);
      } else {
        const link = document.createElement("a");
        link.href = item.href;
        link.textContent = item.label;
        li.appendChild(link);
      }
      breadcrumbRoot.appendChild(li);
    });
  };

  const syncThemeToggle = () => {
    const toggle = qs("[data-theme-toggle]");
    if (!toggle) return;

    const prefs = window.ScoutTheme?.getPrefs ? window.ScoutTheme.getPrefs() : { mode: "system" };
    const active = document.documentElement.dataset.theme || "light";
    const pressed = active === "dark";
    const modeLabel = prefs.mode === "system" ? "system" : prefs.mode;

    toggle.setAttribute("aria-pressed", String(pressed));
    toggle.dataset.mode = prefs.mode;
    toggle.title = pressed ? "Switch to light mode" : "Switch to dark mode";
    toggle.setAttribute("aria-label", `Theme toggle. Current: ${active}. Preference: ${modeLabel}.`);

    const label = qs("[data-theme-toggle-label]", toggle);
    if (label) {
      label.textContent = pressed ? "🌙" : "☀️";
      label.setAttribute("aria-hidden", "true");
    }
  };

  const toggleMode = () => {
    if (!window.ScoutTheme) return;
    const current = window.ScoutTheme.getPrefs();
    const nextMode = current.mode === "dark" ? "light" : "dark";
    const next = { ...current, mode: nextMode };
    window.ScoutTheme.setPrefs(next);
    window.ScoutTheme.applyTheme(next);
    window.ScoutTheme.syncThemeControls(next);
  };

  const syncMobileMenu = (open) => {
    const toggle = qs("[data-nav-toggle]");
    const panel = qs("[data-nav-panel]");
    if (!toggle || !panel) return;

    const shouldCollapse = window.innerWidth < MOBILE_BREAKPOINT;
    if (!shouldCollapse) {
      panel.hidden = false;
      panel.classList.remove("is-collapsed");
      toggle.setAttribute("aria-expanded", "true");
      return;
    }

    const shouldOpen = Boolean(open);
    panel.hidden = !shouldOpen;
    panel.classList.toggle("is-collapsed", !shouldOpen);
    toggle.setAttribute("aria-expanded", String(shouldOpen));
  };

  const setupLayoutBindings = () => {
    const toggle = qs("[data-nav-toggle]");
    if (toggle && toggle.dataset.layoutBound !== "true") {
      toggle.dataset.layoutBound = "true";
      toggle.addEventListener("click", () => {
        const isOpen = toggle.getAttribute("aria-expanded") === "true";
        syncMobileMenu(!isOpen);
      });
    }

    const themeToggle = qs("[data-theme-toggle]");
    if (themeToggle && themeToggle.dataset.layoutBound !== "true") {
      themeToggle.dataset.layoutBound = "true";
      themeToggle.addEventListener("click", toggleMode);
    }
  };

  document.addEventListener("click", (event) => {
    const panel = qs("[data-nav-panel]");
    const toggle = qs("[data-nav-toggle]");
    if (!panel || !toggle || window.innerWidth >= MOBILE_BREAKPOINT) return;

    const clickInsidePanel = panel.contains(event.target);
    const clickToggle = toggle.contains(event.target);
    if (!clickInsidePanel && !clickToggle) {
      syncMobileMenu(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      syncMobileMenu(false);
    }
  });

  window.addEventListener("resize", () => {
    const toggle = qs("[data-nav-toggle]");
    const isOpen = toggle?.getAttribute("aria-expanded") === "true";
    syncMobileMenu(isOpen);
  });

  document.addEventListener("scout:themechange", () => {
    syncThemeToggle();
  });

  const initLayout = () => {
    setupLayoutBindings();
    syncHeaderMeta();
    syncThemeToggle();
    syncMobileMenu(false);
  };

  const handleHtmxLoad = (root) => {
    if (!root) return;

    const main =
      root.id === "app-main"
        ? root
        : root.querySelector?.("#app-main") || root.closest?.("#app-main");

    if (!main) return;

    syncHeaderMeta();
    syncThemeToggle();
    syncMobileMenu(false);
    window.ScoutTheme?.setupThemeControls?.();
  };

  document.addEventListener("DOMContentLoaded", initLayout);

  if (window.htmx?.onLoad) {
    window.htmx.onLoad(handleHtmxLoad);
  } else {
    document.body.addEventListener("htmx:load", (event) => {
      handleHtmxLoad(event.target);
    });
  }
})();
