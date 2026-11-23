# justin-portfolio

Portfolio of Anmol (Justin) Siwa, live at https://anmolsiwa.com.np/ (custom domain for GitHub Pages).

## File map

- `index.html` - the whole main page (single file, all artwork inlined). Edit this one.
- `public/toolkit-preview.html` - standalone preview of the Loadout skill tree.
- `public/toolkit/` - the Loadout skill tree module:
  - `toolkit.css` - tree styles
  - `toolkit.js` - mounts the tree into `#toolkit-mount`
  - `engine.js` - tree rendering, zoom/pan, panels
  - `icons.js` - one SVG symbol per skill
  - `progress.js` - progress saved in the browser (localStorage)
  - `data/*.js` - skills curriculum, one file per module (edit skills here)
- `public/final-design.html` - redirect to the main page (old link, kept working).
- `vite.config.ts`, `postcss.config.js`, `tailwind.config.js`, `package.json` - build
  plumbing only. GitHub Actions runs `vite build` and deploys `dist/`.

To plug the skill tree into any page: one `<link>` to `toolkit/toolkit.css`, a
`<div id="toolkit-mount">`, and the script tags listed at the bottom of `index.html`.

## SEO and sharing

- `index.html` head holds the title, description, canonical URL, Open Graph/Twitter tags and
  JSON-LD (ProfilePage + Person + WebSite). Keep the canonical domain `https://anmolsiwa.com.np/`.
- `public/assets/` - hero artwork and project posters (formerly inlined as base64).
- `public/og-image.jpg` - 1200x630 link-preview image for LinkedIn, X, WhatsApp, etc.
- `public/robots.txt`, `public/sitemap.xml` - add any new public page to the sitemap.
- `public/404.html` - GitHub Pages "not found" page.
- `public/favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `icon-192/512.png`, `site.webmanifest`.

After deploying, submit `https://anmolsiwa.com.np/sitemap.xml` in Google Search Console
(Sitemaps) and use URL Inspection -> Request indexing on the home page.

## Terminal Academy (interactive-learning.html)

`public/interactive-learning.html` - learn Linux by typing commands into a simulated terminal and watching a
3D (or 2D) filesystem respond. Opens on a mission menu (deep links: `#exploring`, `#archives`, `#unfamiliar`, `#vault`, `#files`, `#organize`, `#search`, `#ciphers`, `#mole`):

1. Lesson 1, Exploring Linux - `pwd`, `ls`, `ls -a`, `cd`, `cd ..` (all the way up to `/`), `cat`.
2. Lesson 2, Unpacking Archives - `unzip -l`, `unzip`, and password-protected zips (interactive, hidden prompt).
3. Test 1, An Unfamiliar Machine - no instructions; find the hidden message.
4. Test 2, The Vault (ultimate) - three password parts hidden in hidden files across the machine unlock
   `vault/top_secret.zip` (fictional "classified" joke files inside).

Linked from the home page (hero button + Learning section) and indexable. Everything is simulated in the
browser; no real shell is involved.

### Beta page (learning-new-c.html)

`public/learning-new-c.html` is the test page for lessons before release (`noindex`, BETA badge). It is
**generated**: run `node scripts/make-beta.mjs` after editing `interactive-learning.html`. It sets
`<body data-channel="beta">`, which makes `main.js` also show missions marked `beta: true` in `missions.js`
(none right now: all of these are released):

5. Lesson 3, Files & Folders (`#files`) - `whoami`, `mkdir`, `touch`, `echo "..." > file`, `rm`, `rmdir`, `rm -r`.
6. Lesson 4, Copy, Move & Rename (`#organize`) - `ls -l`, `mv`, renaming, `*` wildcards, `cp`, `cp -r`.
7. Lesson 5, Reading & Searching (`#search`) - `head`, `tail -n`, `wc -l`, `grep`, pipes `|`, `find -name`, `history`.
8. Lesson 6, Codes & Ciphers (`#ciphers`) - `base64` / `-d`, `sha256sum` / `-c`, `gpg -c` / `-d`.
9. Test 3, The Mole (final exam) - grep the logs, decode, decrypt, then write the answer into `~/case/mole.txt`.

To try a new mission before release, add `beta: true` to it; delete that to release it. The shell also knows `hostname`, `date`, `echo`,
`sort`, `>>`, `grep -r/-n/-v/-c`, `find -type`, `mkdir -p`, `rm -f`, globs `*`/`?` and up to 4-stage pipes.

- `public/interactive-learning/js/fs/` - simulated filesystem (`filesystem.js`, with zip archives and extraction),
  the story machines (`machines.js`), path resolver, the allowlisted command interpreter (`shell.js`) with its
  extra commands (`commands.js`), and Base64/SHA-256 (`codec.js`).
  Tests: `node tests/terminal-academy.mjs`.
- `js/lessons/` - `missions.js` (the menu, in order), `exploring-linux.js` (Lesson 1 + Test 1 text),
  `archives.js` (Lesson 2), `files.js`, `organize.js`, `search.js`, `ciphers.js` (Lessons 3-6). Edit lesson text here.
- `js/world/` - `world.js` (WebGL 3D), `canvas-world.js` (Canvas 2D view for browsers without WebGL),
  `fallback.js` (text map); `layout.js` and `visibility.js` are shared so every view agrees.
- `js/ui/` - terminal console (incl. password mode) and the mission card; `js/main.js` wires state -> shell -> world + card.
- `js/vendor/three-r162.module.min.js` - Three.js r162 (MIT, see THREE-LICENSE.txt), loaded only on this page.
  r162 is the last release that still runs on WebGL 1 devices; do not upgrade past it without a WebGL 2 check.
- Test URLs: `?reduced` forces reduced motion, `?view=2d` forces the 2D view, `?view=map` forces the text map.
- Narration: `public/interactive-learning/audio/*.mp3`, pre-recorded with the open Kokoro TTS model
  (Apache-2.0, voice `af_nicole`) and played by `js/ui/voice.js` (on by default, Voice button to turn off).
  The spoken lines are the `say` / `sayDone` fields in `js/lessons/*.js`. After editing them, re-record with
  `node scripts/voice-lines.mjs > /tmp/lines.json` then `python3 scripts/build-voice.py /tmp/lines.json --model model.onnx --voice af_nicole.bin`
  (model + voice from huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX); only changed lines are re-recorded.
  Bump `version` in `createVoice(...)` in `js/main.js` afterwards.

## Client-side mini projects

- `public/password-checker.html` - heuristic strength demo and Web Crypto password generator. No network calls or saved password history.
- `public/linux-quiz.html` + `public/loadout-quiz-bank.js` - Beginner and Intermediate questions across all eight Loadout topics. Add entries to the bank, not the engine.
- `public/phishing-quiz.html` + `public/phishing-quiz-bank.js` - fictional scenarios, safer actions and explanations.
- `public/social-card-preview.html` - preview only, not linked from the main page.

Quizzes are learning examples, not certifications or proof of skill. Reference links accompany the broader security questions.
