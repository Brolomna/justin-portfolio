# Mobile cleanup - November 13, 2026

## What changed

- Phone hero: the existing artwork stays. One terminal sits below it. Secondary HUDs, editor, particles and cursor glow are hidden on phones. Buttons wrap and the artwork stays inside the viewport.
- Loadout: below 768px the existing renderer presents one branch at a time, with full skill names and large buttons. Branch arrows stay available. One FILTERS disclosure contains branch, status and difficulty selectors, active indicators and a clear action. The desktop map and filter chips remain.
- Skill details: a scrollable bottom sheet with a sticky close button, safe-area padding, visible-viewport sizing, Escape, focus return and keyboard containment.
- The mobile branch list does not intercept wheel, drag or pinch gestures. Normal vertical page scrolling works over skills.
- Progress: green completion is labelled SELF-MARKED. It is self-assessed, not independently verified. Owner Mode is described as a local editor, not authentication. Storage keys, skill IDs, curriculum, saved progress and XP calculations are unchanged.
- Navigation: 44px menu target, correct expanded state, outside-click, Escape and link-selection close routes. MalachKit also closes its menu on outside clicks.
- Mobile project browsing uses native horizontal scrolling without an idle animation loop. All original project links remain. Larger metadata and full-opacity cards improve readability.
- Reduced-motion preferences apply to CSS and JavaScript. Decorative loops pause when hidden; phone particles, decryption effects and rotating terminal updates are disabled. Security visuals are explicitly labelled simulations.
- Narrow MalachKit results stack below 400px. Technical strings wrap, inputs stay within their grids, and safe-area spacing is applied.
- Learning Notes has contained scrolling for code and tables, readable mobile navigation and article text. Quizzes have wrapping questions/options, larger tap targets, and usable selectors. The password checker has readable labels and controls.
- Removed an accidental nested Loadout section with a duplicate `skills` ID and double horizontal padding. The retired final-design entry still redirects to the homepage.
- Consolidated phone homepage/preview styling in `public/responsive.css` and removed the superseded compressed hero rules. No new dependency, backend or deployment change.

## Tests actually run

- `npm run build`: passed. Vite retains its existing warnings about the plain toolkit script tags; these are intentionally copied static assets.
- `node tests/malachkit.mjs`: all 53 existing checks passed.
- JavaScript syntax checks: passed for public JavaScript and homepage inline scripts.
- 85 local HTML asset/link references checked: none missing.
- Headless Chrome rendered the feature pages and homepage section states at 320, 360, 375, 390, 414, 430, 600, 768, 900, 1024, 1280 and 1440 CSS pixels. 240 layout captures/checks were made across these widths. No accidental horizontal page overflow remained. Actual screenshots and contact sheets were inspected.
- 211 browser interaction checks passed: menu close routes and touch target; branch navigation; status/difficulty filters and clear; filter persistence; sheet focus/Escape; local note persistence after reload; both quiz levels and all Linux topic paths through results; HashCheck, TokenLens, NetCalc including /0, /24, /31 and /32; notes filters/TOC/copy feedback; desktop map/filter/details; reduced-motion behavior.
- An emulated touch swipe over the branch list scrolled the page normally. A shortened visible viewport checked the detail sheet with an input focused.
- Original eight curriculum data files and both quiz banks were not edited. No user's browser storage was reset. Testing used a separate local browser origin.

## Desktop impact

The elaborate desktop hero, map, carousel and navigation are retained. Changes affecting desktop are honest simulation/progress labels, focus and close controls, removal of duplicate section padding, artwork containment at narrower desktop/tablet widths, and reduced-motion behavior.

## Limits

These are Chrome viewport and touch emulation tests, not physical iPhone/Android or Safari/Firefox tests. An actual operating-system keyboard, device notch, screen reader and third-party certificate embed could not be fully validated on hardware. Clipboard/download UI can depend on browser permissions. No lint or typecheck script is configured in this static project.

The draft beginner cybersecurity guide is not included in this release. Learning Notes remains a separate preview; this cleanup does not approve its integration into the main Learning section.
