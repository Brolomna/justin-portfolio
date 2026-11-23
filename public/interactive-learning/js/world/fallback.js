// Used when WebGL is unavailable. Same interface as World, but draws a readable
// map of what you've discovered, so every lesson still works.

import { sortNames, isHidden } from '../fs/filesystem.js';
import { visibilityOf } from './visibility.js';

export class FallbackWorld {
  constructor(container) {
    this.container = container;
    this.el = document.createElement('div');
    this.el.className = 'fallback-map';
    this.el.innerHTML = '<p class="fallback-note">3D isn\'t available in this browser, so the machine is shown as a map. Every command still works.</p><pre class="fallback-tree"></pre><div class="fallback-file" hidden></div>';
    container.appendChild(this.el);
    this.tree = this.el.querySelector('.fallback-tree');
    this.file = this.el.querySelector('.fallback-file');
  }

  load(machine, view) { this.machine = machine; this.render(view); }

  render(view) {
    const { fs, home } = this.machine;
    const lines = [];
    const walk = (node, depth) => {
      const state = visibilityOf(node, view, home);
      if (state === 'none') return;
      const here = node.path === view.cwd;
      const name = node.path === '/' ? '/' : node.name + (node.type === 'dir' ? '/' : '');
      const cls = [node.type, state, isHidden(node.name) ? 'hidden' : '', here ? 'here' : ''].join(' ');
      lines.push(`<span class="${cls}">${'  '.repeat(depth)}${here ? '▶ ' : '  '}${state === 'ghost' ? '· · ·' : escapeHtml(name)}</span>`);
      if (node.type === 'dir') for (const n of sortNames([...node.children.keys()])) walk(node.children.get(n), depth + 1);
    };
    walk(fs.root, 0);
    this.tree.innerHTML = lines.join('\n');
  }

  react(event, view) {
    this.render(view);
    this.closeHologram();
    if (event.type === 'cat') {
      this.file.hidden = false;
      this.file.innerHTML = `<strong>${escapeHtml(event.path.split('/').pop())}</strong><pre>${escapeHtml(event.content)}</pre>`;
    }
    if (event.type === 'error') { this.container.classList.add('warn'); setTimeout(() => this.container.classList.remove('warn'), 600); }
    return Promise.resolve();
  }

  setInsets() {}
  closeHologram() { this.file.hidden = true; }
  get hologramOpen() { return !this.file.hidden; }
  finale() { this.el.classList.add('finale'); }
  dispose() { this.el.remove(); }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
