// Compact terminal console: prompt, input, short scrollback, history.
// It only collects input and prints what the shell returned.

const MAX_ENTRIES = 40;

export function createTerminal({ log, form, input, promptEl, idEl, onSubmit, onEscape, onInterrupt }) {
  const history = [];
  let hIndex = 0;
  let draft = '';
  let prompt = { user: 'user', host: 'host', dir: '~' };
  let secret = null; // the password prompt's label while a program waits for a password

  const promptHtml = (p) => `<span class="p-user">${esc(p.user)}@${esc(p.host)}</span><span class="p-sep">:</span><span class="p-dir">${esc(p.dir)}</span><span class="p-sep">$</span>`;

  function setPrompt(p) {
    prompt = p;
    if (!secret) promptEl.innerHTML = promptHtml(p);
    idEl.textContent = `${p.user}@${p.host}`;
  }

  /** Password mode: show `label` as the prompt and hide what is typed. null ends it. */
  function setPasswordMode(label) {
    secret = label;
    input.type = label ? 'password' : 'text';
    input.setAttribute('aria-label', label ? 'Password (hidden while you type)' : 'Terminal command');
    if (label) promptEl.innerHTML = `<span class="p-secret">${esc(label)}</span>`;
    else promptEl.innerHTML = promptHtml(prompt);
  }

  /** Echo a password answer: the label is shown, the password never is. */
  function echoSecret(label, out, ok) {
    echo(null, '', out, ok, label);
  }

  function trim() { while (log.children.length > MAX_ENTRIES) log.firstElementChild.remove(); }

  function echo(p, command, out, ok = true, secretLabel = null) {
    const entry = document.createElement('div');
    entry.className = 'entry' + (ok ? '' : ' failed');
    const cmd = document.createElement('div');
    cmd.className = 'cmd';
    cmd.innerHTML = secretLabel ? `<span class="p-secret">${esc(secretLabel)}</span>` : `${promptHtml(p)} <span class="typed">${esc(command)}</span>`;
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
    if (!secret && value.trim() && history[history.length - 1] !== value) history.push(value);
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
    if (secret && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) { e.preventDefault(); return; }
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
      if (secret) onInterrupt?.(); else onEscape?.();
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      clear();
    }
  });

  return {
    setPrompt,
    setPasswordMode,
    get passwordMode() { return !!secret; },
    get prompt() { return prompt; },
    echo,
    echoSecret,
    note,
    clear,
    focus: () => input.focus({ preventScroll: true }),
    resetHistory: () => { history.length = 0; hIndex = 0; },
  };
}

export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
