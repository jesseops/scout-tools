# Scout Tools Repo Structure (Planned)

This document lays out the intended repository structure for Scout Tools, aligned with the guidance in `agents.md` (static-first, minimal JS, offline-friendly, consistent UI). It also lists the first two tools to prioritize in the new layout.

## Top-Level Layout

- `index.html` — landing page (tool directory + quick links)
- `tools/` — each tool lives in its own folder
  - `tools/<tool-name>/index.html`
- `assets/` — shared, cacheable assets
  - `assets/css/base.css` — reset + layout + shared components + tokens
  - `assets/css/theme-pack.css` — Cub Scout (Pack) theme overrides (variables only)
  - `assets/css/theme-troop.css` — Scouts BSA (Troop) theme overrides (variables only)
  - `assets/js/theme.js` — theme preference management
  - `assets/js/htmx.min.js` — vendored dependency (optional)
  - `assets/js/alpine.min.js` — vendored dependency (optional, minimal usage)
- `sw.js` — service worker for offline support
- `offline.html` — offline fallback page
- `manifest.webmanifest` — optional PWA metadata
- `STRUCTURE.md` — this plan document

## Initial Tool Set (First Two Tools)

1. **Uniform Inspection Checklist (Troops)**
   - Path: `tools/uniform-inspection-checklist/index.html`
   - Purpose: troop uniform inspection scoring/checklist
   - Notes:
     - Start with the existing uniform inspection tool as the baseline.
     - Ensure it fits the shared layout/components and uses shared CSS.
     - Provide a printable/PDF-friendly layout.

2. **Activity Timer (Packs/Dens)**
   - Path: `tools/activity-timer/index.html`
   - Purpose: quick, kid-friendly timer for den/pack activities
   - Notes:
     - Big buttons, large text, and clear status states.
     - Minimal JS for start/pause/reset; works without JS as a static page.
     - Optional sounds/vibration should be toggled off by default.

3. **Markdown to PDF (Leaders)**
   - Path: `tools/markdown-to-pdf/index.html`
   - Purpose: convert markdown into branded, printable PDFs for den meeting plans
   - Notes:
     - Supports Parent Handout, Leader Notes, Den Chief Instructions.
     - Optional header logo and watermark uploads.
     - Export should force light mode colors for print.

## Shared Conventions

- **Relative paths** for assets and tool links to support GitHub Pages deployments.
- **No external dependencies** unless vendored locally in `assets/js/`.
- **Progressive enhancement**: tool pages should remain usable without JS.
- **Accessibility**: focus-visible styles, large tap targets, and high contrast.
