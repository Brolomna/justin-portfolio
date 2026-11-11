# justin-portfolio

Justin's personal site, live at https://brolomna.github.io/justin-portfolio/

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

## Client-side mini projects

- `public/password-checker.html` - heuristic strength demo and Web Crypto password generator. No network calls or saved password history.
- `public/linux-quiz.html` + `public/loadout-quiz-bank.js` - Beginner and Intermediate questions across all eight Loadout topics. Add entries to the bank, not the engine.
- `public/phishing-quiz.html` + `public/phishing-quiz-bank.js` - fictional scenarios, safer actions and explanations.
- `public/social-card-preview.html` - preview only, not linked from the main page.

Quizzes are learning examples, not certifications or proof of skill. Reference links accompany the broader security questions.
