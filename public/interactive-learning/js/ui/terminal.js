// Compact terminal console: prompt, input, short scrollback, history.
// It only collects input and prints what the shell returned.

const MAX_ENTRIES = 40;

export function createTerminal({ log, form, input, promptEl, idEl, onSubmit, onEscape, onInterrupt }) {
  const history = [];
  let hIndex = 0;
  let draft = '';
  let prompt = { user: 'user', host: 'host', dir: '~' };
  let secret = null;   // label while a program waits for a hidden answer (a password)
  let asking = null;   // label while a program waits for a visible answer (e.g. unzip's "replace?")

  const promptHtml = (p) => `<span class="p-user">${esc(p.user)}@${esc(p.host)}</span><span class="p-sep">:</span><span class="p-dir">${esc(p.dir)}</span><span class="p-sep">$</span>`;

  function setPrompt(p) {
    prompt = p;
    if (!secret && !asking) promptEl.innerHTML = promptHtml(p);
    idEl.textContent = `${p.user}@${p.host}`;
  }

  /** A program is asking something: show its `label` as the prompt. With `hidden`,
   *  what is typed is masked and never echoed (passwords). null ends it. */
  function setQuestion(label, { hidden = false } = {}) {
    secret = label && hidden ? label : null;
    asking = label && !hidden ? label : null;
    input.type = secret ? 'password' : 'text';
    input.setAttribute('aria-label', secret ? 'Password (hidden while you type)' : asking ? 'Answer the question' : 'Terminal command');
    promptEl.innerHTML = label ? `<span class="p-secret">${esc(label)}</span>` : promptHtml(prompt);
  }

  /** Echo the answer to a visible question: label then what was typed. */
  function echoAnswer(label, typed, out, ok) {
    echo(null, typed, out, ok, label, true);
  }

  /** Echo a password answer: the label is shown, the password never is. */
  function echoSecret(label, out, ok) {
    echo(null, '', out, ok, label);
  }

  function trim() { while (log.children.length > MAX_ENTRIES) log.firstElementChild.remove(); }

  function echo(p, command, out, ok = true, secretLabel = null, showTyped = false) {
    const entry = document.createElement('div');
    entry.className = 'entry' + (ok ? '' : ' failed');
    const cmd = document.createElement('div');
    cmd.className = 'cmd';
    cmd.innerHTML = secretLabel
      ? `<span class="p-secret">${esc(secretLabel)}</span>${showTyped ? `<span class="typed">${esc(command)}</span>` : ''}`
      : `${promptHtml(p)} <span class="typed">${esc(command)}</span>`;
    entry.appendChild(cmd);
    for (const segs of out) {
      const line = document.createElement('div');
      line.className = 'out';
      for (const s of segs) {
        const span = document.createElement('span');
        if (s.c) span.className = s.c;
        span.textContent = s.t;
        line.appendChild(span);
      }
      if (!segs.length || segs.every((s) => !s.t)) line.innerHTML = '&nbsp;';
      entry.appendChild(line);
    }
    log.appendChild(entry);
    trim();
    log.scrollTop = log.scrollHeight;
  }

  function note(html, cls = 'note') {
    const d = document.createElement('div');
    d.className = `entry ${cls}`;
    d.innerHTML = html;
    log.appendChild(d);
    trim();
    log.scrollTop = log.scrollHeight;
  }

  function clear() { log.innerHTML = ''; }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = input.value;
    input.value = '';
    if (!secret && !asking && value.trim() && history[history.length - 1] !== value) history.push(value);
    hIndex = history.length;
    draft = '';
    onSubmit(value);
  });

  input.addEventListener('keydown', (e) => {
    // Ctrl+C cancels the line (or a password prompt), unless you're copying selected text
    const selected = window.getSelection()?.toString() || (input.selectionStart !== input.selectionEnd);
    if (e.key === 'c' && e.ctrlKey && !e.metaKey && !selected) {
      e.preventDefault();
      input.value = '';
      onInterrupt?.();
      return;
    }
    if ((secret || asking) && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) { e.preventDefault(); return; }
    if (e.key === 'ArrowUp') {
      if (!history.length) return;
      e.preventDefault();
      if (hIndex === history.length) draft = input.value;
      hIndex = Math.max(0, hIndex - 1);
      input.value = history[hIndex];
      requestAnimationFrame(() => input.setSelectionRange(input.value.length, input.value.length));
    } else if (e.key === 'ArrowDown') {
      if (hIndex >= history.length) return;
      e.preventDefault();
      hIndex += 1;
      input.value = hIndex === history.length ? draft : history[hIndex];
    } else if (e.key === 'Escape') {
      if (secret || asking) onInterrupt?.(); else onEscape?.();
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      clear();
    }
  });

  return {
    setPrompt,
    setQuestion,
    get passwordMode() { return !!(secret || asking); },
    get prompt() { return prompt; },
    echo,
    echoSecret,
    echoAnswer,
    note,
    clear,
    focus: () => input.focus({ preventScroll: true }),
    resetHistory: () => { history.length = 0; hIndex = 0; },
  };
}

export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
