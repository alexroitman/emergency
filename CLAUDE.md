# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static PWA (single page, no build step) for one-tap emergency calls to JAVERIM, HATZALA, SHOMRIM, and DAC. Deployed as plain files — `index.html`, `service_worker.js`, `manifest.webmanifest`, and `icons/`. UI copy is in Spanish.

## Architecture

- **`index.html`** — the entire app: inline `<style>`, button markup with `tel:` links, inline `<script>` that registers the service worker, handles the PWA install prompt (Android `beforeinstallprompt` + iOS "Add to Home Screen" instructions), and triggers haptic feedback.
- **`service_worker.js`** — network-first for navigations with an offline fallback to a precached `index.html`. Imports Workbox from CDN but only uses native SW APIs. Sends `SKIP_WAITING` messages so a new SW activates immediately and the page reloads via `controllerchange`.
- **`manifest.webmanifest`** — PWA metadata + icon set under `icons/`.

Each emergency is a separate anchor element with its own color class (`javerim-btn`, `hatzala-btn`, `shomrim-btn`, `dac-btn`). To add/remove a contact, edit the `.emergency-buttons` block in `index.html` and add a matching `*-btn` gradient rule in the inline `<style>`.

## Deploy cache-busting (IMPORTANT)

Service worker updates rely on a version bump in **two places** — bumping only one leaves clients on a stale HTML or SW:

1. `service_worker.js` → `SW_VERSION` constant (drives the `CACHE_NAME`)
2. `index.html` → the `./service_worker.js?v=10` query string in the SW registration

Increment both to the same number on every deploy.

## Local development

No tooling. Open `index.html` in a browser for markup/styling changes. Service worker behavior only works over `https://` or `localhost` — serve the directory with any static server (e.g. `python3 -m http.server`) when testing SW logic.
