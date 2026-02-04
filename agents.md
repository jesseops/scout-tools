# agents.md

This repo contains **Scout Tools**: a static collection of small utility pages for Cub Scout packs and Scouting America troops. It is designed to be **fast, reliable, and low-maintenance**, deployable on **GitHub Pages**, and usable in low-connectivity environments.

## Goals

- **Static-first**: plain HTML/CSS/JS; no required build tooling.
- **Consistent UI** across all tools via shared CSS + theme overrides.
- **Progressive enhancement**: pages work without JS; JS adds convenience.
- **Minimal JS policy**:
  - Use **HTMX** for navigation/partial page updates where it reduces glue code.
  - Use **AlpineJS** only for tiny, localized behavior (toggles, small state).
  - Prefer vanilla JS for shared utilities (theme, offline, common helpers).
  - If a tool depends on external libraries, prefer vendored local copies when possible.
- **Offline-friendly**: cache core pages/assets so most tools work offline after first load.

## Non-Goals

- Not a SPA framework.
- Not a server-backed app (no accounts; no remote persistence by default).
- Not a heavy design system or Tailwind pipeline (unless added later intentionally).

---

## Repo Structure

Recommended layout:

- `index.html` — landing page
- `tools/<tool-name>/index.html` — each tool is a folder with its own page
- `assets/css/base.css` — reset + layout + components + semantic tokens
- `assets/css/theme-pack.css` — Pack (Cub Scouts) theme overrides (variables only)
- `assets/css/theme-troop.css` — Troop (Scouts BSA) theme overrides (variables only)
- `assets/js/theme.js` — org + dark/light/system preference management (localStorage)
- `assets/js/htmx.min.js` — vendored dependency (preferred for offline)
- `assets/js/alpine.min.js` — vendored dependency (preferred for offline)
- `sw.js` + `offline.html` — offline caching support
- `manifest.webmanifest` — installable metadata (optional but recommended)

---

## Styling System

### Base CSS
`assets/css/base.css` defines:
- modern reset
- layout helpers: `.container`, `.stack`, `.row`, `.grid`, etc.
- shared components: `.header`, `.card`, `.button`, `.tile`, `.badge`, form styles
- neutral tokens and fallback colors

### Themes
`theme-pack.css` and `theme-troop.css` **only override CSS variables** (colors + header tints). Do not add component styling in theme files.

### Theme Switching
Theme selection is driven by:
- `data-org="pack|troop"` on `<html>` (branding)
- `data-theme="light|dark"` on `<html>` (explicit override)
- default mode is **system** (no `data-theme` set; uses `prefers-color-scheme`)

Theme preferences are stored in `localStorage` under:
- key: `scouttools:theme`
- value shape: `{ "org": "troop"|"pack", "mode": "system"|"light"|"dark" }`

---

## HTMX + AlpineJS Guidance

### HTMX (preferred for “dynamic” navigation)
Use HTMX to:
- navigate between pages without full reload
- load partial fragments into a layout shell

Rules:
- Keep HTMX usage **simple and declarative** (`hx-get`, `hx-target`, `hx-push-url`)
- Avoid complex event choreography; when needed, prefer small vanilla event handlers.

### AlpineJS (use minimally)
Use AlpineJS only when:
- you need small, local interactive state in a component
- the behavior is easier to express inline than with custom JS

Avoid:
- global app state in Alpine
- large Alpine components that become mini-frameworks

---

## Offline Support

Offline support is implemented with a **service worker**:
- Cache-first for static assets (CSS/JS/images)
- Stale-while-revalidate for HTML pages
- Offline fallback: `offline.html`

Guidelines:
- Vendor dependencies locally (`assets/js/htmx.min.js`, `assets/js/alpine.min.js`) so they are cacheable and work offline.
- Keep the pre-cache list small and stable; optionally add tool pages that should always work offline.

---

## GitHub Pages Pathing

This repo may be hosted as:
- a user/org pages site (`https://<user>.github.io/`) OR
- a project pages site (`https://<user>.github.io/<repo>/`)

Prefer **relative paths** in HTML:
- CSS: `./assets/css/base.css`
- tools: `./tools/<tool>/`

Avoid absolute `/assets/...` unless you are certain you are deploying at the domain root.

---

## Adding a New Tool

1. Create a folder:
   - `tools/<tool-name>/index.html`
2. Include shared assets:
   - `../..` relative paths from tool folder:
     - `../../assets/css/base.css`
     - `../../assets/css/theme-pack.css` (disabled)
     - `../../assets/css/theme-troop.css` (disabled)
     - `../../assets/js/theme.js`
3. Build the page as semantic HTML with minimal JS.
4. Add a tile link to `index.html`.
5. If the tool should work offline reliably, add it to the service worker pre-cache list.

Current tools:
- `tools/uniform-inspection-checklist/index.html`
- `tools/activity-timer/index.html`
- `tools/markdown-to-pdf/index.html`

Template snippet for a tool page:

```html
<link rel="stylesheet" href="../../assets/css/base.css" />
<link rel="stylesheet" href="../../assets/css/theme-pack.css" data-theme-css="pack" disabled />
<link rel="stylesheet" href="../../assets/css/theme-troop.css" data-theme-css="troop" disabled />
<script src="../../assets/js/theme.js" defer></script>
````

---

## Accessibility + UX Requirements

* Support keyboard navigation and `:focus-visible`.
* Use real buttons for actions; links for navigation.
* Ensure tap targets are comfortable on phones.
* Avoid tiny text and low contrast.
* Prefer “big obvious buttons” for kid-facing tools.

---

## Security / Privacy Constraints

* Assume tools may be used by/around children: keep privacy strong.
* Do not send data to third-party services by default.
* Avoid putting personal data in URLs.
* If storing anything, default to `localStorage` and offer a “Clear” option.
* Never include trackers/analytics unless explicitly required.

---

## Implementation Priorities

1. Keep pages working without JS.
2. Keep dependencies local for offline reliability.
3. Favor simple patterns over clever abstractions.
4. Maintain consistent look/feel using tokens and shared components.
5. Minimize Alpine usage; prefer HTMX for navigation and vanilla JS for shared logic.

---

## Suggested Future Enhancements (Optional)

* Add a “Download for offline use” button that prefetches tool pages.
* Add an icon set and a PWA install prompt.
* Add IndexedDB wrapper for larger rosters/checklists.
* Add print styles for roster/duty sheets.

```
