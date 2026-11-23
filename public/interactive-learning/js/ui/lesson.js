// The compact lesson card. Renders a mission's briefing, one step at a time,
// a test's objective, and finales. Hints are revealed one level per click and
// never automatically.
//
// Lesson text in lessons/*.js is authored HTML (trusted, static). Anything that
// came from the learner's typing is escaped before it reaches the DOM.

import { esc } from './terminal.js';

export function createLessonCard(root) {
  let hintLevel = 0;
  let hints = [];

  const html = (s) => { root.innerHTML = s; };
  const on = (sel, fn) => { const el = root.querySelector(sel); if (el) el.onclick = fn; };

  function hintBlock(list) {
    hints = list;
    hintLevel = 0;
    return `<div class="hints"><ol class="hint-list" aria-live="polite"></ol><button class="hint-btn" type="button" data-hint>Need a hint?</button></div>`;
  }

  root.addEventListener('click', (e) => {
    if (!e.target.closest('[data-hint]')) return;
    if (hintLevel >= hints.length) return;
    hintLevel += 1;
    const list = root.querySelector('.hint-list');
    const li = document.createElement('li');
    li.innerHTML = `<span class="hint-level">Hint ${hintLevel}</span> ${hints[hintLevel - 1]}`;
    list.appendChild(li);
    const btn = root.querySelector('[data-hint]');
    btn.classList.remove('nudge');
    if (hintLevel >= hints.length) btn.hidden = true;
    else btn.textContent = hintLevel === hints.length - 1 ? 'Last hint' : 'Another hint';
  });

  function toolkit(learned) {
    if (!learned.length) return '';
    return `<div class="toolkit" aria-label="Commands you have learned"><span>Learned</span>${learned.map(([c, m]) => `<code title="${esc(m)}">${esc(c)}</code>`).join('')}</div>`;
  }

  const meta = (left, tag, cls) => `<div class="lesson-meta"><span class="step-num">${left}</span><span class="step-tag ${cls}">${tag}</span></div>`;

  return {
    /** The mission's story, before step 1 / before the objective. */
    briefing(m, onBegin) {
      html(`
        ${meta(esc(m.label.toUpperCase()), m.kind === 'lesson' ? 'BRIEFING' : m.ultimate ? 'ULTIMATE TEST' : 'TEST', m.ultimate ? 'ultimate' : m.kind === 'lesson' ? 'learn' : 'explore')}
        <h2>${esc(m.storyTitle)}</h2>
        <div class="lesson-text story">${m.story.map((p) => `<p>${p}</p>`).join('')}</div>
        <div class="btn-row"><button class="primary-btn small" type="button" data-begin>${m.kind === 'lesson' ? 'Begin' : 'Start the test'} <span aria-hidden="true">↵</span></button></div>
        <p class="next-tip">or press Enter in the terminal</p>`);
      on('[data-begin]', onBegin);
    },

    step(step, index, total, learned) {
      const c = step.command;
      const tag = step.mode === 'learn' ? 'NEW COMMAND' : 'REMEMBER';
      html(`
        ${meta(`${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`, tag, step.mode)}
        <h2>${step.title}</h2>
        <div class="lesson-text">${step.body.map((p) => `<p>${p}</p>`).join('')}</div>
        ${c ? `<div class="cmd-card">
            <div class="cmd-row"><code class="cmd-name">${esc(c.cmd)}</code><span class="cmd-stands">${c.name}</span></div>
            <p>${c.what}</p>
          </div>
          <p class="task">Type it, then press <kbd>Enter</kbd>.</p>` : ''}
        <p class="wander" hidden></p>
        ${hintBlock(step.hints)}
        <div class="success" hidden></div>
        ${toolkit(learned)}`);
    },

    success(text, rememberPair, { last = false } = {}) {
      const box = root.querySelector('.success');
      root.querySelector('.hints')?.remove();
      root.querySelector('.wander').hidden = true;
      box.hidden = false;
      box.innerHTML = `<p class="witness">${text}</p>
        ${rememberPair ? `<p class="remember"><code>${esc(rememberPair[0])}</code> → ${esc(rememberPair[1])}</p>` : ''}
        <button class="primary-btn small" type="button" data-next>${last ? 'Finish' : 'Continue'} <span aria-hidden="true">↵</span></button>
        <p class="next-tip">or press Enter in the terminal</p>`;
    },

    wander(text) {
      const w = root.querySelector('.wander');
      if (!w) return;
      w.hidden = !text;
      w.innerHTML = text || '';
    },

    nudge() { root.querySelector('[data-hint]')?.classList.add('nudge'); },

    /** End of a lesson. */
    finale(m, next, { onNext, onMenu, onRestart }) {
      const f = m.finale;
      html(`
        ${meta(esc(m.label.toUpperCase()), 'COMPLETE', 'done')}
        <h2>${f.title}</h2>
        <div class="lesson-text"><p>${f.body}</p></div>
        <ul class="recap">${f.recap.map(([c, d]) => `<li><code>${esc(c)}</code><span>${esc(d)}</span></li>`).join('')}</ul>
        <div class="btn-row">
          ${next ? `<button class="primary-btn small" type="button" data-nextm>Next: ${esc(next.label)} · ${esc(next.title)}</button>` : ''}
          <button class="link-btn" type="button" data-menu>All missions</button>
          <button class="link-btn" type="button" data-restart>Restart</button>
        </div>`);
      on('[data-nextm]', onNext); on('[data-menu]', onMenu); on('[data-restart]', onRestart);
    },

    /** A test: one objective, optional password-part tracker, concept-only hints. */
    test(m, onReset) {
      html(`
        ${meta(esc(m.label.toUpperCase()), 'ON YOUR OWN', m.ultimate ? 'ultimate' : 'explore')}
        <h2>${esc(m.title)}</h2>
        <div class="lesson-text"><p>${m.objective}</p></div>
        ${m.parts ? `<div class="parts" aria-live="polite"><span class="parts-label">Password</span><div class="parts-slots">${m.parts.map((_, i) => `<span class="part" data-part="${i}">part ${i + 1}</span>`).join('<i>-</i>')}</div></div>` : ''}
        ${hintBlock(m.hints)}
        <div class="success" hidden></div>
        <div class="btn-row"><button class="link-btn" type="button" data-reset>Reset this machine</button></div>`);
      on('[data-reset]', onReset);
    },

    /** Mark password parts as found (indexes into mission.parts). */
    parts(m, found) {
      m.parts.forEach((p, i) => {
        const el = root.querySelector(`[data-part="${i}"]`);
        if (!el || !found.has(i) || el.classList.contains('found')) return;
        el.classList.add('found');
        el.textContent = p.value;
      });
    },

    testSuccess(m, next, { onReset, onNext, onMenu }) {
      const box = root.querySelector('.success');
      root.querySelector('.hints')?.remove();
      box.hidden = false;
      box.classList.toggle('ultimate', !!m.ultimate);
      box.innerHTML = `<p class="witness">${m.success}</p>
        <div class="btn-row">
          ${next ? `<button class="primary-btn small" type="button" data-nextm>Next: ${esc(next.label)}</button>` : ''}
          <button class="link-btn" type="button" data-menu>All missions</button>
          <button class="link-btn" type="button" data-again>Explore a fresh copy</button>
        </div>`;
      on('[data-again]', onReset); on('[data-nextm]', onNext); on('[data-menu]', onMenu);
    },
  };
}
