// The compact lesson card. Renders one step at a time; hints are revealed one
// level per click and never automatically.
//
// Lesson text in exploring-linux.js is authored HTML (trusted, static). Anything
// that came from the learner's typing is escaped before it reaches the DOM.

import { esc } from './terminal.js';

export function createLessonCard(root) {
  let hintLevel = 0;
  let hints = [];

  const html = (s) => { root.innerHTML = s; };

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
    else btn.textContent = hintLevel === hints.length - 1 ? 'Show me the command' : 'Another hint';
  });

  function toolkit(learned) {
    if (!learned.length) return '';
    return `<div class="toolkit" aria-label="Commands you have learned"><span>Learned</span>${learned.map(([c, m]) => `<code title="${esc(m)}">${esc(c)}</code>`).join('')}</div>`;
  }

  return {
    step(step, index, total, learned) {
      const c = step.command;
      const tag = step.mode === 'learn' ? 'NEW COMMAND' : 'REMEMBER';
      html(`
        <div class="lesson-meta"><span class="step-num">${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</span><span class="step-tag ${step.mode}">${tag}</span></div>
        <h2>${step.title}</h2>
        <div class="lesson-text">${step.body.map((p) => `<p>${p}</p>`).join('')}</div>
        ${c ? `<div class="cmd-card">
            <div class="cmd-row"><code class="cmd-name">${esc(c.cmd)}</code><span class="cmd-stands">${c.name}</span></div>
            <p>${c.what}</p>
            ${c.format ? `<p class="cmd-format">Format: <code>${esc(c.format)}</code></p>` : ''}
            <p class="analogy">${c.analogy}</p>
          </div>
          <p class="task">Type <kbd>${esc(c.cmd)}</kbd> and press <kbd>Enter</kbd>.</p>` : ''}
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

    finale(f, onPractice, onRestart) {
      html(`
        <div class="lesson-meta"><span class="step-num">TOPIC 01</span><span class="step-tag done">COMPLETE</span></div>
        <h2>${f.title}</h2>
        <div class="lesson-text"><p>${f.body}</p></div>
        <ul class="recap">${f.recap.map(([c, m]) => `<li><code>${esc(c)}</code><span>${esc(m)}</span></li>`).join('')}</ul>
        <p class="lesson-text">Ready for a machine you have never seen, with no instructions?</p>
        <div class="btn-row"><button class="primary-btn small" type="button" data-practice>Try the practice machine</button><button class="link-btn" type="button" data-restart>Restart lesson</button></div>`);
      root.querySelector('[data-practice]').onclick = onPractice;
      root.querySelector('[data-restart]').onclick = onRestart;
    },

    practice(p, onReset) {
      html(`
        <div class="lesson-meta"><span class="step-num">PRACTICE</span><span class="step-tag explore">ON YOUR OWN</span></div>
        <h2>${p.title}</h2>
        <div class="lesson-text"><p>${p.objective}</p></div>
        ${hintBlock(p.hints)}
        <div class="success" hidden></div>
        <div class="btn-row"><button class="link-btn" type="button" data-reset>Reset this machine</button></div>`);
      root.querySelector('[data-reset]').onclick = onReset;
    },

    practiceSuccess(text, onReset) {
      const box = root.querySelector('.success');
      root.querySelector('.hints')?.remove();
      box.hidden = false;
      box.innerHTML = `<p class="witness">${text}</p><div class="btn-row"><button class="primary-btn small" type="button" data-again>Explore a fresh copy</button></div>`;
      box.querySelector('[data-again]').onclick = onReset;
    },
  };
}
