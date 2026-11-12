# Learning notes: review-first prototype

Preview listing: `../learning-notes-preview.html`. Each card opens its own static HTML page in this folder. All preview/note pages currently carry noindex. The main portfolio's Learning section is unchanged until Justin approves the preview.

## Add or revise a note

1. Edit `public/learning-notes/notes.json`. Add a unique lowercase hyphenated slug, title, short summary, category, type, tags, date added, estimated read time, symbol, honest basis statement, sections, and source links.
2. Supported block types: `p`, `list`, `code`, `callout`, and the reviewed FieldKit `link`. All text is HTML-escaped by the generator. Add any new link destination deliberately, not by trusting pasted content.
3. Use a real basis: an actual completed course, covered topic, project, or authorized lab. A reference example is not a claim that the command was run in a real engagement. Keep draft reflections separate from established milestones.
4. Run `python3 scripts/build-learning-notes.py` from the repository root, then `npm run build`. No new packages are required. Generated HTML is checked in and copied through the existing Vite build.
5. Inspect desktop/mobile, sources, internal links, code examples, and factual/personal claims before publishing. Keep the main page untouched until approval.

Categories currently shown: Linux, Build notes, Security basics, CTF, Hack The Box, TryHackMe. Empty categories deliberately say that no note is published. Add a category to the generator's categories list when needed. The filters count actual notes, not claimed lab progress. Without JavaScript, all cards and note pages remain readable.

## Content boundaries

These starter pages are two reference notes and one real introductory-course milestone. No platform lab or machine has been invented. Cisco completion date is November 8, 2026; the note's added date is November 12. Personal experiences, specific exercises, and course reflections need Justin's words rather than guessed anecdotes.

For future CTF/HTB/THM notes, get the task name, completion status, what Justin actually did, observations, mistakes or takeaways, and any non-sensitive evidence he wants to share. Never publish active HTB machine solutions. Check a platform's current sharing rules before publishing any retired-machine/challenge walkthrough. Do not publish secrets, flags where disallowed, private targets, or copied assessment answers.

## Files

- `notes.json`: editable source of truth for content and card metadata.
- `styles.css`: shared portfolio-themed listing and reading layout.
- `notes.js`: accessible filters and optional code copy actions; no analytics/storage/API requests.
- Three generated HTML note pages, plus `../learning-notes-preview.html`.
- Generator: `scripts/build-learning-notes.py` (Python standard library).

Source links appear in every note. Changes to sources do not automatically update the note; re-check them during revisions.
