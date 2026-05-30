# Kana PWA Audio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the single-file kana quiz into a multi-file PWA with offline Edge TTS MP3 playback and GitHub Pages deployment.

**Architecture:** Keep the existing UI and behavior, split CSS/JS into focused static assets, add generated MP3 files under `audio/`, and cache all assets with a service worker. Playback uses local MP3 first and falls back to the existing `speechSynthesis` path only if media playback fails.

**Tech Stack:** Pure HTML/CSS/JavaScript, Edge TTS CLI, static PWA manifest/service worker, GitHub Pages.

---

### Task 1: Restructure Static Files

**Files:**
- Modify: `kana.html`
- Create: `index.html`
- Create: `css/style.css`
- Create: `js/data.js`
- Create: `js/audio-map.js`
- Create: `js/app.js`

- [ ] Extract the existing `<style>` block into `css/style.css` without visual redesign.
- [ ] Extract kana data, examples, constants, and app logic into JS files.
- [ ] Keep `kana.html` as a redirect/compatibility entry or equivalent copy if useful.
- [ ] Confirm the UI skeleton and existing controls remain unchanged.

### Task 2: Complete Examples and Audio Mapping

**Files:**
- Modify: `js/data.js`
- Modify: `js/audio-map.js`
- Create: `tools/build_audio_manifest.py`

- [ ] Add examples for daku, handaku, youon, and katakana keys.
- [ ] Generate an audio mapping from every kana/word text to `audio/<romaji>.mp3`.
- [ ] Ensure duplicate hira/kata sounds share files safely.

### Task 3: Generate Offline Audio

**Files:**
- Create: `tools/generate_audio.py`
- Create: `audio/*.mp3`

- [ ] Install `edge-tts` with cache on `D:`.
- [ ] Generate MP3 files using `ja-JP-NanamiNeural` and `--rate=-15%`.
- [ ] Skip already-existing files on rerun.

### Task 4: Add PWA Support

**Files:**
- Create: `manifest.webmanifest`
- Create: `sw.js`
- Modify: `index.html`
- Modify: `js/app.js`

- [ ] Register the service worker after page load.
- [ ] Cache HTML, CSS, JS, manifest, and all MP3 assets.
- [ ] Keep progress in per-device `localStorage`.

### Task 5: Verify and Deploy

**Files:**
- Modify: deployment files only if required by GitHub Pages.

- [ ] Serve locally with `python -m http.server`.
- [ ] Verify local MP3 playback and fallback behavior.
- [ ] Verify service worker registration and cached assets.
- [ ] Publish via GitHub Pages and provide the public URL.
