// Compact terminal console: prompt, input, short scrollback, history.
// It only collects input and prints what the shell returned.

const MAX_ENTRIES = 40;

export function createTerminal({ log, form, input, promptEl, idEl, onSubmit, onEscape }) {
  const history = [];
  let hIndex = 0;
  let draft = '';
  let prompt = { user: 'user', host: 'host', dir: '~' };

  const promptHtml = (p) => `<span class="p-user">${esc(p.user)}@${esc(p.host)}</span><span class="p-sep">:</span><span class="p-dir">${esc(p.dir)}</span><span class="p-sep">$</span>`;

  function setPrompt(p) {
    prompt = p;
    promptEl.innerHTML = promptHtml(p);
    idEl.textContent = `${p.user}@${p.host}`;
  }

  function trim() { while (log.children.length > MAX_ENTRIES) log.firstElementChild.remove(); }

  function echo(p, command, out, ok = true) {
    const entry = document.createElement('div');
    entry.className = 'entry' + (ok ? '' : ' failed');
    const cmd = document.createElement('div');
    cmd.className = 'cmd';
    cmd.innerHTML = `${promptHtml(p)} <span class="typed">${esc(command)}</span>`;
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
    if (value.trim() && history[history.length - 1] !== value) history.push(value);
    hIndex = history.length;
    draft = '';
    onSubmit(value);
  });

  input.addEventListener('keydown', (e) => {
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
      onEscape?.();
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      clear();
    }
  });

  return {
    setPrompt,
    get prompt() { return prompt; },
    echo,
    note,
    clear,
    focus: () => input.focus({ preventScroll: true }),
    resetHistory: () => { history.length = 0; hIndex = 0; },
  };
}

export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
