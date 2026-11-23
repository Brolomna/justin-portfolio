// Terminal Academy — wiring. One authoritative state object:
//   command → shell (simulated FS) → output + event → view state → 3D world + lesson
// The world and the lesson only ever read state; only this file changes it.

import { buildMachine, lessonMachine, practiceMachine, sortNames } from './fs/filesystem.js';
import { createShell } from './fs/shell.js';
import { pathChain } from './fs/path.js';
import { createTerminal, esc } from './ui/terminal.js';
import { createLessonCard } from './ui/lesson.js';
import { topic, steps, finale, practice } from './lessons/exploring-linux.js';
import { visibilityOf } from './world/visibility.js';

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches || params.has('reduced');

const state = {
  mode: 'lesson',          // 'lesson' | 'finale' | 'practice'
  machine: null,
  shell: null,
  view: null,              // { cwd, visited:Set, listed:Map }
  step: 0,
  stepDone: false,
  mistakes: 0,
  busy: false,
  queue: [],
  practiceSolved: false,
};

let world = null;
const lessonEl = $('lesson');
const card = createLessonCard($('lessonBody'));
const term = createTerminal({
  log: $('termLog'), form: $('termForm'), input: $('termInput'),
  promptEl: $('termPrompt'), idEl: $('termId'),
  onSubmit: (line) => submit(line),
  onEscape: () => world?.closeHologram(),
});

// ------------------------------------------------------------------ world
async function createWorld() {
  const stage = $('stage');
  if (!params.has('no3d') && supportsWebGL()) {
    try {
      const { World } = await import('./world/world.js');
      return new World(stage, { reducedMotion });
    } catch (err) {
      console.warn('3D unavailable, using the map view instead:', err);
    }
  }
  const { FallbackWorld } = await import('./world/fallback.js');
  stage.classList.add('is-fallback');
  return new FallbackWorld(stage);
}

function supportsWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch { return false; }
}

// ---------------------------------------------------------------- machines
function loadMachine(spec) {
  state.machine = buildMachine(spec);
  state.shell = createShell(state.machine);
  state.view = {
    cwd: state.machine.start,
    visited: new Set(pathChain(state.machine.start)),
    listed: new Map(),
  };
  term.clear();
  term.resetHistory();
  term.setPrompt(state.shell.prompt());
  world.load(state.machine, state.view);
  describeWorld();
}

// ---------------------------------------------------------------- commands
function submit(line) {
  if (!line.trim()) {
    // Enter on an empty line continues the lesson once a step is complete
    if (state.mode === 'lesson' && state.stepDone) nextStep();
    else term.echo(term.prompt, '', []);
    return;
  }
  if (state.busy) { state.queue.push(line); return; }
  run(line);
}

async function run(line) {
  const shownPrompt = term.prompt;

  if (line.trim() === 'help') {
    const known = state.mode === 'practice' || state.mode === 'finale'
      ? finale.recap.map(([c]) => c)
      : learnedCommands().map(([c]) => c);
    term.echo(shownPrompt, line, [[{ t: known.length ? `Commands you have learned: ${known.join(', ')}` : "You haven't learned any commands yet. Follow the lesson card.", c: 'content' }]]);
    return;
  }

  const res = state.shell.run(line);
  const { event } = res;
  if (event.type === 'clear') term.clear();
  else term.echo(shownPrompt, line, res.out, res.ok);

  // update the single source of truth
  const v = state.view;
  if (res.ok) {
    if (event.type === 'cd') {
      v.cwd = event.to;
      for (const p of pathChain(event.to)) v.visited.add(p);
    } else if (event.type === 'ls' && !event.file) {
      const prev = v.listed.get(event.path) || { visible: false, hidden: false };
      v.listed.set(event.path, { visible: true, hidden: prev.hidden || event.all });
    }
  }
  term.setPrompt(state.shell.prompt());

  state.busy = true;
  try { await world.react(event, v); } catch (err) { console.error(err); }
  state.busy = false;
  describeWorld();
  checkLesson(event, res.ok);
  if (state.queue.length) run(state.queue.shift());
}

// ------------------------------------------------------------------ lesson
function learnedCommands() {
  const upto = state.mode === 'lesson' ? state.step + (state.stepDone ? 1 : 0) : steps.length;
  return steps.slice(0, upto).filter((s) => s.remember).map((s) => s.remember);
}

function showStep() {
  const s = steps[state.step];
  state.stepDone = false;
  state.mistakes = 0;
  card.step(s, state.step, steps.length, steps.slice(0, state.step).filter((x) => x.remember).map((x) => x.remember));
  updateWander();
}

function updateWander() {
  if (state.mode !== 'lesson' || state.stepDone) return;
  const s = steps[state.step];
  const cwd = state.view.cwd;
  if (!s.expect || cwd === s.expect) { card.wander(null); return; }
  const target = s.expect === state.machine.home ? '~' : '~' + s.expect.slice(state.machine.home.length);
  card.wander(`You've wandered to <code>${esc(cwd)}</code>, which is fine! This step starts in <code>${esc(target)}</code>. To jump there, type <code>cd ${esc(target)}</code> (<code>~</code> means your home directory).`);
}

function checkLesson(event, ok) {
  if (state.mode === 'practice') {
    if (!state.practiceSolved && event.type === 'cat' && event.files.some((f) => f.path === state.machine.target)) {
      state.practiceSolved = true;
      world.finale();
      card.practiceSuccess(practice.success, resetPractice);
    } else if (!ok) state.mistakes++;
    return;
  }
  if (state.mode !== 'lesson' || state.stepDone) return;
  const s = steps[state.step];
  if (ok && s.done(event, state.view)) {
    state.stepDone = true;
    const last = state.step === steps.length - 1;
    card.success(s.success(event), s.remember, { last });
    $('lessonBody').querySelector('[data-next]')?.addEventListener('click', () => { nextStep(); term.focus(); });
    if (last) world.finale();
    return;
  }
  if (!ok) {
    state.mistakes++;
    if (state.mistakes === 3) card.nudge();
  }
  updateWander();
}

function nextStep() {
  if (!state.stepDone) return;
  if (state.step >= steps.length - 1) { showFinale(); return; }
  state.step++;
  showStep();
}

function showFinale() {
  state.mode = 'finale';
  card.finale(finale, startPractice, restartLesson);
  $('practiceBtn').hidden = false;
}

function startLesson() {
  state.mode = 'lesson';
  state.step = 0;
  loadMachine(lessonMachine());
  showStep();
  $('restartBtn').hidden = false;
}

function restartLesson() {
  startLesson();
  term.focus();
}

function startPractice() {
  state.mode = 'practice';
  state.practiceSolved = false;
  state.mistakes = 0;
  loadMachine(practiceMachine());
  card.practice(practice, resetPractice);
  $('practiceBtn').hidden = true;
  $('restartBtn').hidden = false;
  term.focus();
}

function resetPractice() { startPractice(); }

// Tell the 3D view which parts of the screen the panels cover.
function updateInsets() {
  if (!world) return;
  const wide = window.innerWidth > 760;
  const lesson = lessonEl.hidden || lessonEl.classList.contains('collapsed') ? null : lessonEl.getBoundingClientRect();
  const termEl = $('terminal');
  const termH = termEl.hidden ? 0 : termEl.getBoundingClientRect().height + 16;
  world.setInsets({
    left: wide && lesson ? lesson.right : 0,
    top: wide ? 56 : (lesson ? lesson.bottom : 56),
    bottom: termH,
  });
}

// -------------------------------------------------------- screen readers
function describeWorld() {
  const { fs, home } = state.machine;
  const node = fs.get(state.view.cwd);
  const seen = sortNames([...node.children.keys()])
    .map((n) => node.children.get(n))
    .filter((c) => visibilityOf(c, state.view, home) === 'shown')
    .map((c) => c.name + (c.type === 'dir' ? '/' : ''));
  $('worldStatus').textContent = `Location ${state.view.cwd}. ${seen.length ? 'Discovered here: ' + seen.join(', ') + '.' : 'Nothing discovered here yet.'}`;
}

// ------------------------------------------------------------------- boot
async function boot() {
  $('introStory').innerHTML = topic.story.map((p) => `<p>${esc(p)}</p>`).join('');
  world = await createWorld();
  // load the lesson machine behind the intro so the mysterious world is visible
  state.mode = 'lesson';
  loadMachine(lessonMachine());

  const begin = (practiceFirst) => {
    $('intro').hidden = true;
    lessonEl.hidden = false;
    $('terminal').hidden = false;
    if (practiceFirst) startPractice();
    else { state.step = 0; showStep(); $('restartBtn').hidden = false; }
    updateInsets();
    term.focus();
  };
  window.addEventListener('resize', updateInsets);
  new ResizeObserver(updateInsets).observe(lessonEl);
  $('enterBtn').addEventListener('click', () => begin(false));
  $('skipBtn').addEventListener('click', () => begin(true));
  $('enterBtn').focus();

  $('restartBtn').addEventListener('click', restartLesson);
  $('practiceBtn').addEventListener('click', startPractice);
  $('lessonToggle').addEventListener('click', () => {
    const collapsed = lessonEl.classList.toggle('collapsed');
    $('lessonToggle').setAttribute('aria-expanded', String(!collapsed));
    $('lessonToggle').textContent = collapsed ? 'Show lesson' : 'Hide';
    updateInsets();
  });

  // Typing anywhere goes to the terminal; clicking the world closes a hologram.
  document.addEventListener('keydown', (e) => {
    if (!$('intro').hidden) return;
    if (e.key === 'Escape') { world.closeHologram(); return; }
    const t = e.target;
    if (t.closest?.('input, textarea, button, a, [contenteditable]')) return;
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) term.focus();
  });
  $('stage').addEventListener('click', () => world.closeHologram());
  $('terminal').addEventListener('mouseup', () => {
    if (!window.getSelection()?.toString()) term.focus();
  });
}

boot().catch((err) => {
  console.error(err);
  document.body.insertAdjacentHTML('beforeend', '<p class="noscript">Something went wrong while starting the lesson. Please reload the page.</p>');
});
