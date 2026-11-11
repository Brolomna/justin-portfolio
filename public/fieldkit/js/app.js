import { $ } from './utils.js';
import { initHashCheck } from './hashcheck.js';
import { initTokenLens } from './tokenlens.js';
import { initNetCalc } from './netcalc.js';
initHashCheck();
const tokens = initTokenLens();
initNetCalc();
const pages = {
  overview: ['THE WORKBENCH', 'Overview', 'A small kit for the details that matter. Inspect a file, decode a token, or understand a network - without leaving your browser.'],
  hashcheck: ['FILE INTEGRITY / 01', 'HashCheck', 'Generate and verify SHA-256 checksums for files. One fingerprint. A clear comparison.'],
  tokenlens: ['AUTHENTICATION & TOKEN INSPECTION / 02', 'TokenLens', 'Decode a JSON Web Token and inspect its claims. Read the contents, never assume trust.'],
  netcalc: ['NETWORKING / 03', 'NetCalc', 'An IPv4 subnet calculator. Turn an address and CIDR prefix into a range you can understand.'],
  about: ['PURPOSE & TECHNICAL NOTES', 'About FieldKit', 'Lightweight tools for hands-on learning and everyday technical work. Built to show its workings.']
};
let current = '';
function route(focus = true) {
  const requested = location.hash.slice(1);
  const page = Object.hasOwn(pages, requested) ? requested : 'overview';
  if (current === 'tokenlens' && page !== current) tokens.clear();
  current = page;
  for (const view of document.querySelectorAll('[data-view]')) view.hidden = view.id !== 'view-' + page;
  for (const link of document.querySelectorAll('[data-nav]')) {
    if (link.dataset.nav === page) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
  }
  const [category, title, description] = pages[page];
  $('category').textContent = category;
  $('breadcrumb').textContent = title.toUpperCase();
  $('page-title').replaceChildren();
  if (page === 'overview') $('page-title').append(document.createTextNode('Practical tools.'), document.createElement('br'), Object.assign(document.createElement('span'), { textContent: 'Clear results.' }));
  else $('page-title').textContent = title;
  $('page-description').textContent = description;
  document.title = `${title === 'Overview' ? 'FieldKit' : title + ' | FieldKit'} - Practical tools. Clear results.`;
  document.querySelector('.sidebar').classList.remove('menu-open');
  document.querySelector('.menu-toggle').setAttribute('aria-expanded', 'false');
  $('notification').hidden = true;
  if (focus) { window.scrollTo(0, 0); $('main').focus({ preventScroll: true }); }
}
document.querySelector('.menu-toggle').addEventListener('click', event => {
  const open = document.querySelector('.sidebar').classList.toggle('menu-open');
  event.currentTarget.setAttribute('aria-expanded', String(open));
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    document.querySelector('.sidebar').classList.remove('menu-open');
    document.querySelector('.menu-toggle').setAttribute('aria-expanded', 'false');
  }
});
window.addEventListener('hashchange', () => route());
window.addEventListener('pagehide', () => tokens.clear());
// A cached page restoration must never resurrect a sensitive token.
window.addEventListener('pageshow', event => { if (event.persisted) tokens.clear(); });
route(false);
