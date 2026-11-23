// Terminal Academy — wiring. One authoritative state object:
//   command → shell (simulated FS) → output + event → view state → world + mission card
// The world and the card only ever read state; only this file changes it.

import { buildMachine, sortNames } from './fs/filesystem.js';
import { createShell } from './fs/shell.js';
import { pathChain } from './fs/path.js';
import { createTerminal, esc } from './ui/terminal.js';
import { createLessonCard } from './ui/lesson.js';
import { createVoice, voiceKey } from './ui/voice.js';
import { missions, byId, nextOf } from './lessons/missions.js';
import { visibilityOf } from './world/visibility.js';

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches || params.has('reduced');

const state = {
  mission: null,           // the mission object from lessons/missions.js
  phase: 'menu',           // 'menu' | 'briefing' | 'steps' | 'finale' | 'test'
  machine: null,
  shell: null,
  view: null,              // { cwd, visited:Set, listed:Map }
  step: 0,
  stepDone: false,
  mistakes: 0,
  solved: false,
  partsFound: new Set(),
  busy: false,
  queue: [],
};

let world = null;
const voice = createVoice({
  base: './interactive-learning/audio',
  version: 'nicole-1', // bump when clips are re-recorded so browsers fetch the new ones
  onChange: (on) => renderVoiceBtn(on),
});
const say = (m, part, suffix) => voice.play(voiceKey(m, part, suffix));

function renderVoiceBtn(on = voice.enabled) {
  const b = $('voiceBtn');
  b.setAttribute('aria-pressed', String(on));
  b.innerHTML = on ? '<span aria-hidden="true">🔊</span> Voice on' : '<span aria-hidden="true">🔇</span> Voice off';
  b.title = on ? 'Turn the narrator off' : 'Turn the narrator on';
}
const lessonEl = $('lesson');
const card = createLessonCard($('lessonBody'));
const term = createTerminal({
  log: $('termLog'), form: $('termForm'), input: $('termInput'),
  promptEl: $('termPrompt'), idEl: $('termId'),
  onSubmit: (line) => submit(line),
  onEscape: () => world?.closeHologram(),
  onInterrupt: () => interrupt(),
});

// ------------------------------------------------------------------ world
// Renderer order: WebGL 3D -> Canvas 2D (same world, drawn without the GPU) -> text map.
// ?view=2d or ?view=map force a mode (for testing).
async function createWorld() {
  const stage = $('stage');
  const forced = params.get('view') || (params.has('no3d') ? '2d' : '');
  let reason = forced ? 'forced' : '';
  if (!forced) {
    if (!supportsWebGL()) reason = 'no-webgl';
    else {
      try {
        const { World } = await import('./world/world.js');
        return new World(stage, { reducedMotion });
      } catch (err) {
        console.warn('WebGL view failed, using the 2D view instead:', err);
        reason = 'failed';
      }
    }
  }
  if (forced !== 'map') {
    try {
      const { CanvasWorld } = await import('./world/canvas-world.js');
      const w = new CanvasWorld(stage, { reducedMotion });
      showViewChip(reason);
      return w;
    } catch (err) {
      console.warn('2D view failed, using the map instead:', err);
    }
  }
  const { FallbackWorld } = await import('./world/fallback.js');
  stage.classList.add('is-fallback');
  return new FallbackWorld(stage, reason || 'failed');
}

function showViewChip(reason) {
  const chip = document.createElement('span');
  chip.className = 'view-chip';
  chip.textContent = '2D view';
  chip.title = reason === 'forced'
    ? '2D view chosen for this visit.'
    : 'Your browser is not offering WebGL, so the machine is drawn in 2D. Every command and effect still works.';
  document.querySelector('.topic').appendChild(chip);
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
  term.setQuestion(null);
  term.clear();
  term.resetHistory();
  term.setPrompt(state.shell.prompt());
  world.load(state.machine, state.view);
  describeWorld();
}

// ---------------------------------------------------------------- commands
function submit(line) {
  const awaiting = state.shell?.awaiting;
  if (!awaiting && !line.trim()) {
    // Enter on an empty line moves the mission card along
    if (state.phase === 'briefing') beginMission();
    else if (state.phase === 'steps' && state.stepDone) nextStep();
    else term.echo(term.prompt, '', []);
    return;
  }
  if (state.busy) { state.queue.push(line); return; }
  run(line);
}

function interrupt() {
  const res = state.shell?.cancel();
  if (res) {
    term.echoSecret(state.lastSecretLabel || '', res.out, false);
    term.setQuestion(null);
  } else {
    term.echo(term.prompt, '^C', []);
  }
}

function knownCommands() {
  const m = state.mission;
  if (!m) return [];
  if (m.kind === 'test') return m.known;
  const upto = state.phase === 'steps' ? state.step + (state.stepDone ? 1 : 0) : m.steps.length;
  return m.steps.slice(0, upto).filter((s) => s.remember).map((s) => s.remember[0]);
}

async function run(line) {
  const shownPrompt = term.prompt;
  const asked = state.shell.awaiting;   // unzip is waiting for an answer to this question

  if (!asked && line.trim() === 'help') {
    const known = knownCommands();
    term.echo(shownPrompt, line, [[{ t: known.length ? `Commands you have learned: ${known.join(', ')}` : "You haven't learned any commands yet. Follow the lesson card.", c: 'content' }]]);
    return;
  }

  const res = state.shell.run(line);
  const { event } = res;
  if (event.type === 'clear') term.clear();
  else if (asked?.secret) term.echoSecret(asked.label, res.out, res.ok);
  else if (asked) term.echoAnswer(asked.label, line, res.out, res.ok);
  else term.echo(shownPrompt, line, res.out, res.ok);

  // a program (unzip) is now asking something (a password is hidden), or has stopped asking
  const awaiting = state.shell.awaiting;
  state.lastSecretLabel = awaiting?.label || null;
  term.setQuestion(awaiting ? awaiting.label : null, { hidden: !!awaiting?.secret });

  // update the single source of truth
  const v = state.view;
  if (res.ok) {
    if (event.type === 'cd') {
      v.cwd = event.to;
      for (const p of pathChain(event.to)) v.visited.add(p);
    } else if (event.type === 'ls' && !event.file) {
      const prev = v.listed.get(event.path) || { visible: false, hidden: false };
      v.listed.set(event.path, { visible: true, hidden: prev.hidden || event.all });
    } else if (event.type === 'unzip') {
      // unzip printed what it created, so the learner has "seen" those entries
      for (const p of event.top) v.visited.add(p);
    }
  }
  term.setPrompt(state.shell.prompt());

  state.busy = true;
  try { await world.react(event, v); } catch (err) { console.error(err); }
  state.busy = false;
  describeWorld();
  checkProgress(event, res.ok);
  if (state.queue.length) run(state.queue.shift());
}

// ---------------------------------------------------------------- missions
function setTopic(m) {
  $('topicNum').textContent = m ? m.label : 'Terminal Academy';
  $('topicTitle').textContent = m ? m.title : 'Missions';
  $('topicSub').textContent = m ? m.subtitle : 'Learn Linux by exploring a living machine.';
  $('restartBtn').hidden = !m;
  $('missionsBtn').hidden = !m;
}

function startMission(id) {
  const m = byId(id) || missions[0];
  state.mission = m;
  state.step = 0;
  state.stepDone = false;
  state.mistakes = 0;
  state.solved = false;
  state.partsFound = new Set();
  state.queue.length = 0;
  loadMachine(m.machine());
  setTopic(m);
  hideMenu();
  state.phase = 'briefing';
  card.briefing(m, beginMission);
  say(m, 'brief');
  try { history.replaceState(null, '', `#${m.id}`); } catch { /* ignore */ }
  updateInsets();
  term.focus();
}

function beginMission() {
  const m = state.mission;
  if (m.kind === 'lesson') { state.phase = 'steps'; showStep(); }
  else { state.phase = 'test'; card.test(m, () => startMission(m.id)); if (m.parts) card.parts(m, state.partsFound); }
  term.focus();
}

function showStep() {
  const steps = state.mission.steps;
  const s = steps[state.step];
  state.stepDone = false;
  state.mistakes = 0;
  card.step(s, state.step, steps.length, steps.slice(0, state.step).filter((x) => x.remember).map((x) => x.remember));
  say(state.mission, s.id);
  updateWander();
}

function updateWander() {
  if (state.phase !== 'steps' || state.stepDone) return;
  const s = state.mission.steps[state.step];
  const cwd = state.view.cwd;
  // Steps whose command only works from one place set `expect`; steps that work
  // from anywhere (like reading a file by path) leave it null and never show this note.
  if (!s.expect || cwd === s.expect) { card.wander(null); return; }
  const target = s.expect === state.machine.home ? '~' : '~' + s.expect.slice(state.machine.home.length);
  card.wander(`You're in <code>${esc(cwd)}</code>, which is fine! This step starts in <code>${esc(target)}</code>. To jump there, type <code>cd ${esc(target)}</code> (<code>~</code> means your home directory).`);
}

function checkProgress(event, ok) {
  const m = state.mission;
  if (!m) return;
  if (state.phase === 'test') {
    if (m.parts && event.type === 'cat') {
      m.parts.forEach((p, i) => {
        if (state.partsFound.has(i) || !event.files.some((f) => f.path === p.path)) return;
        state.partsFound.add(i);
        if (!state.solved) say(m, `part${state.partsFound.size}`);
      });
      card.parts(m, state.partsFound);
    }
    if (!state.solved && ok && m.done(event)) {
      state.solved = true;
      say(m, 'success');
      world.finale();
      const next = nextOf(m.id);
      card.testSuccess(m, next, { onReset: () => startMission(m.id), onNext: next ? () => startMission(next.id) : null, onMenu: showMenu });
    } else if (!ok && ++state.mistakes === 4) card.nudge();
    return;
  }
  if (state.phase !== 'steps' || state.stepDone) return;
  const s = m.steps[state.step];
  if (ok && s.done(event, state.view)) {
    state.stepDone = true;
    const last = state.step === m.steps.length - 1;
    card.success(s.success(event), s.remember, { last });
    say(m, s.id, 'done');
    $('lessonBody').querySelector('[data-next]')?.addEventListener('click', () => { nextStep(); term.focus(); });
    if (last) world.finale();
    return;
  }
  if (!ok && ++state.mistakes === 3) card.nudge();
  updateWander();
}

function nextStep() {
  if (!state.stepDone) return;
  const m = state.mission;
  if (state.step >= m.steps.length - 1) {
    state.phase = 'finale';
    const next = nextOf(m.id);
    card.finale(m, next, { onNext: next ? () => startMission(next.id) : null, onMenu: showMenu, onRestart: () => startMission(m.id) });
    say(m, 'finale');
    return;
  }
  state.step++;
  showStep();
}

// ------------------------------------------------------------------- menu
function renderMenu() {
  $('missionList').innerHTML = missions.map((m, i) => `
    <li><button class="mission kind-${m.kind}${m.ultimate ? ' ultimate' : ''}" type="button" data-mission="${m.id}">
      <span class="mission-num">${String(i + 1).padStart(2, '0')}</span>
      <span class="mission-body">
        <span class="mission-label">${esc(m.label)}${i === 0 ? ' · start here' : ''}</span>
        <span class="mission-title">${esc(m.title)}</span>
        <span class="mission-sub">${esc(m.subtitle)}</span>
        <span class="mission-teaches">${m.teaches.map((t) => `<code>${esc(t)}</code>`).join(' ')}</span>
      </span>
      <span class="mission-go" aria-hidden="true">→</span>
    </button></li>`).join('');
  $('missionList').querySelectorAll('[data-mission]').forEach((b) => { b.onclick = () => startMission(b.dataset.mission); });
}

function showMenu() {
  state.phase = 'menu';
  voice.stop();
  $('intro').hidden = false;
  lessonEl.hidden = true;
  $('terminal').hidden = true;
  updateInsets();
  $('missionList').querySelector(`[data-mission="${state.mission?.id || missions[0].id}"]`)?.focus();
}

function hideMenu() {
  $('intro').hidden = true;
  lessonEl.hidden = false;
  $('terminal').hidden = false;
}

// Tell the 3D view which parts of the screen the panels cover.
function updateInsets() {
  if (!world) return;
  const wide = window.innerWidth > 760;
  const lesson = lessonEl.hidden || lessonEl.classList.contains('collapsed') ? null : lessonEl.getBoundingClientRect();
  const termEl = $('terminal');
  const term = termEl.hidden ? null : termEl.getBoundingClientRect();
  if (wide) {
    // desktop: lesson card on the left, terminal along the bottom-left; centre the world in what's left
    world.setInsets({ left: (lesson ? lesson.right : 0) + 60, top: 56, bottom: term ? term.height * 0.25 : 0 });
  } else {
    world.setInsets({ left: 0, top: lesson ? lesson.bottom : 56, bottom: term ? term.height + 16 : 0 });
  }
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
  world = await createWorld();
  renderMenu();
  // the Lesson 1 machine sits mysteriously behind the menu
  loadMachine(missions[0].machine());

  window.addEventListener('resize', updateInsets);
  new ResizeObserver(updateInsets).observe(lessonEl);
  $('restartBtn').addEventListener('click', () => startMission(state.mission.id));
  $('missionsBtn').addEventListener('click', showMenu);
  renderVoiceBtn();
  $('voiceBtn').addEventListener('click', () => { voice.toggle(); term.focus(); });
  $('lessonToggle').addEventListener('click', () => {
    const collapsed = lessonEl.classList.toggle('collapsed');
    $('lessonToggle').setAttribute('aria-expanded', String(!collapsed));
    $('lessonToggle').textContent = collapsed ? 'Show lesson' : 'Hide';
    updateInsets();
  });

  // Typing anywhere goes to the terminal; clicking the world closes a hologram.
  document.addEventListener('keydown', (e) => {
    if (!$('intro').hidden) return;
    if (e.key === 'Escape' && !term.passwordMode) { world.closeHologram(); return; }
    const t = e.target;
    if (t.closest?.('input, textarea, button, a, [contenteditable]')) return;
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) term.focus();
  });
  $('stage').addEventListener('click', () => world.closeHologram());
  $('terminal').addEventListener('mouseup', () => {
    if (!window.getSelection()?.toString()) term.focus();
  });

  // deep links (#vault etc.) open a mission directly
  const fromHash = byId(location.hash.slice(1));
  if (fromHash) startMission(fromHash.id);
  else { setTopic(null); showMenu(); }
}

boot().catch((err) => {
  console.error(err);
  document.body.insertAdjacentHTML('beforeend', '<p class="noscript">Something went wrong while starting the lesson. Please reload the page.</p>');
});
