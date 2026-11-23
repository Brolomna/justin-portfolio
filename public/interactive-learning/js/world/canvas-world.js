// The same world, drawn with Canvas 2D for browsers/devices without WebGL.
// It shares layout.js and visibility.js with the WebGL renderer, projects the
// 3D layout with a simple pinhole camera, and reacts to the same command events.

import { isHidden, fileKind } from '../fs/filesystem.js';
import { pathChain, parentOf } from '../fs/path.js';
import { visibilityOf } from './visibility.js';
import {
  HIDDEN_COLOR, ERROR_COLOR, BG, ease, easeOut, local, colorFor, inFocus, isHomeAncestor,
  computeLayout, cameraView, travelPoints, ICON, LABEL_Y, iconBackOutline, iconFrontOutline,
} from './layout.js';

const ICON_BACK = iconBackOutline();
const ICON_FRONT = iconFrontOutline();

// ---------------------------------------------------------------- vectors
const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
const cross = (a, b) => ({ x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x });
const norm = (a) => { const l = Math.hypot(a.x, a.y, a.z) || 1; return { x: a.x / l, y: a.y / l, z: a.z / l }; };
const lerp3 = (a, b, k) => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, z: a.z + (b.z - a.z) * k });
const copy = (a) => ({ x: a.x, y: a.y, z: a.z });

function catmull(pts, t) {
  const n = pts.length - 1;
  const f = Math.min(n - 1e-6, Math.max(0, t * n));
  const i = Math.floor(f), u = f - i;
  const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n, i + 2)];
  const c = (a, b, cc, d) => 0.5 * (2 * b + (-a + cc) * u + (2 * a - 5 * b + 4 * cc - d) * u * u + (-a + 3 * b - 3 * cc + d) * u * u * u);
  return { x: c(p0.x, p1.x, p2.x, p3.x), y: c(p0.y, p1.y, p2.y, p3.y), z: c(p0.z, p1.z, p2.z, p3.z) };
}

// ----------------------------------------------------------------- colour
function rgb(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${Math.max(0, Math.min(1, a)).toFixed(3)})`;
const mix = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k].map(Math.round);
const WHITE = [255, 255, 255];

export class CanvasWorld {
  constructor(container, { reducedMotion = false } = {}) {
    this.container = container;
    this.reduced = reducedMotion;
    this.speed = reducedMotion ? 0.25 : 1;
    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('aria-hidden', 'true');
    this.canvas.className = 'canvas-2d';
    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) throw new Error('Canvas 2D unavailable');
    this.tweens = [];
    this.fx = [];
    this.objects = new Map();
    this.cam = { pos: { x: 0, y: 8, z: 10 }, target: { x: 0, y: 0, z: -10 } };
    this.fog = 0.02;
    this.glow = 0;
    this.insets = {};
    this.particles = Array.from({ length: reducedMotion ? 120 : 260 }, () => ({
      x: (Math.random() - 0.5) * 180, y: Math.random() * 34 + 1, z: (Math.random() - 0.5) * 180 - 20, p: Math.random() * 6.28,
    }));
    this.onResize = () => this.resize();
    window.addEventListener('resize', this.onResize);
    this.resize();
    this.start = performance.now();
    this.running = true;
    const loop = () => { if (!this.running) return; this.raf = requestAnimationFrame(loop); this.frame(); };
    loop();
  }

  resize() {
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.W = w; this.H = h;
    const aspect = w / h;
    this.viewScale = Math.min(2.1, Math.max(1, 1.45 / aspect));
    this.fov = (aspect < 0.8 ? 68 : 55) * Math.PI / 180;
    if (this.machine && !this.cameraBusy) this.placeCamera(this.view.cwd);
  }

  setInsets(insets) { this.insets = insets || {}; }

  // ---------------------------------------------------------------- build
  load(machine, view) {
    this.tweens.length = 0;
    this.fx.length = 0;
    this.holo = null;
    this.machine = machine;
    this.view = view;
    this.layout = computeLayout(machine);
    this.objects.clear();
    for (const node of machine.fs.all()) this.addRec(node);
    this.applyVisibility(view, { animate: false });
    this.trail = pathChain(view.cwd);
    this.placeCamera(view.cwd);
    this.fog = 0.02; this.glow = 0;
  }

  addRec(node) {
    const info = this.layout.get(node.path);
    this.objects.set(node.path, {
      node, pos: info.pos, heading: info.heading, color: rgb(colorFor(node)), level: 0, target: 0, state: 'none',
      scale: node.type === 'dir' && isHomeAncestor(this.machine, node.path) ? 0.62 : 1, grow: 1, yOff: 0, shakeX: 0,
      flash: null, archVisible: true, phase: Math.random() * 6.28, spin: 0,
    });
  }

  /** unzip added nodes: re-run the layout, glide moved objects, add the new ones. */
  grow(view) {
    this.layout = computeLayout(this.machine);
    for (const node of this.machine.fs.all()) {
      const rec = this.objects.get(node.path);
      if (!rec) { this.addRec(node); continue; }
      const info = this.layout.get(node.path);
      const from = copy(rec.pos);
      rec.heading = info.heading;
      if (Math.hypot(from.x - info.pos.x, from.z - info.pos.z) > 0.01) this.tween(900, (k) => { rec.pos = lerp3(from, info.pos, ease(k)); }, 0, () => { rec.pos = info.pos; });
    }
    this.trail = pathChain(view.cwd);
  }

  banner(text, at, color = [186, 255, 230], ms = 3400) {
    this.addFx({ type: 'banner', text, at, color }, ms);
  }

  placeCamera(path) {
    const v = cameraView(this.machine, this.layout, path, this.viewScale);
    this.cam = { pos: copy(v.pos), target: copy(v.target) };
    this.rest = copy(v.pos);
  }

  // ----------------------------------------------------------- visibility
  applyVisibility(view, { animate = true, reveal = null, keepArch = null } = {}) {
    let i = 0;
    for (const rec of this.objects.values()) {
      const next = visibilityOf(rec.node, view, this.machine.home);
      const cur = rec.state;
      rec.state = next;
      const isCurrent = rec.node.path === view.cwd;
      rec.archVisible = !isCurrent || rec.node.path === keepArch;
      rec.labelVisible = !(rec.node.type === 'dir' && isCurrent);
      const near = inFocus(rec.node.path, view.cwd);
      const to = next === 'shown' ? (near ? 1 : 0.26) : next === 'ghost' ? (near ? 0.1 : 0.05) : 0;
      rec.target = to;
      if (!animate) { rec.level = to; continue; }
      if (next === 'shown' && (cur === 'none' || cur === 'ghost')) {
        const flicker = reveal === 'hidden' && isHidden(rec.node.name);
        const from = rec.level;
        this.tween(flicker ? 1300 : 800, (k) => {
          let lv = from + (to - from) * easeOut(k);
          if (flicker && k < 0.75) lv *= (Math.sin(k * 60) > 0.2 ? 0.9 : 0.25) * k + 0.05;
          rec.level = lv;
          rec.grow = 0.55 + 0.45 * easeOut(k);
          rec.yOff = -1.4 * (1 - easeOut(k));
        }, (i++) * 120, () => { rec.grow = 1; rec.yOff = 0; });
      } else if (Math.abs(rec.level - to) > 0.005) {
        const from = rec.level;
        this.tween(700, (k) => { rec.level = from + (to - from) * k; });
      }
    }
  }

  // ---------------------------------------------------------------- tweens
  tween(dur, update, delay = 0, done) {
    this.tweens.push({ start: performance.now() + delay * this.speed, dur: Math.max(1, dur * this.speed), update, done });
  }

  flash(rec, color, dur = 900) {
    if (!rec) return;
    const c = color === 'white' ? WHITE : rgb(color);
    this.tween(dur, (k) => { rec.flash = { c, w: Math.sin(Math.PI * k) * 0.85 }; }, 0, () => { rec.flash = null; });
  }

  shake(rec) {
    if (!rec) return;
    this.tween(520, (k) => { rec.shakeX = Math.sin(k * 40) * 0.22 * (1 - k); }, 0, () => { rec.shakeX = 0; });
  }

  addFx(fx, dur, delay = 0) {
    fx.k = 0;
    this.fx.push(fx);
    this.tween(dur, (k) => { fx.k = k; }, delay, () => { this.fx.splice(this.fx.indexOf(fx), 1); });
  }

  ring(center, color, { radius = 26, dur = 1400, width = 2, sides = 48 } = {}) {
    this.addFx({ type: 'ring', center: { ...center, y: 0.3 }, color: rgb(color), radius, width, sides }, dur);
  }

  cssPulse(cls, ms) {
    this.container.classList.remove(cls);
    void this.container.offsetWidth;
    this.container.classList.add(cls);
    clearTimeout(this['t_' + cls]);
    this['t_' + cls] = setTimeout(() => this.container.classList.remove(cls), ms);
  }

  trailPulse(color = '#ffffff', dur = 1400) {
    this.addFx({ type: 'runner', color: rgb(color) }, dur);
    this.tween(dur + 600, (k) => { this.trailBoost = Math.sin(Math.PI * k); });
  }

  // --------------------------------------------------------------- camera
  travel(from, to, direction) {
    const end = cameraView(this.machine, this.layout, to, this.viewScale);
    const pts = travelPoints(this.layout, from, to, direction, copy(this.cam.pos), end.pos);
    const startT = copy(this.cam.target);
    this.cameraBusy = true;
    return new Promise((resolve) => {
      const finish = () => { this.cam.pos = copy(end.pos); this.cam.target = copy(end.target); this.rest = copy(end.pos); this.cameraBusy = false; resolve(); };
      if (this.reduced) {
        this.container.classList.add('fade-cut');
        setTimeout(() => { finish(); this.container.classList.remove('fade-cut'); }, 180);
        return;
      }
      this.tween(direction === 'jump' ? 2300 : 1900, (k) => {
        this.cam.pos = catmull(pts, ease(k));
        this.cam.target = lerp3(startT, end.target, ease(Math.min(1, k * 1.15)));
      }, 0, finish);
    });
  }

  // ------------------------------------------------------------- hologram
  openHologram(path, content) {
    const rec = this.objects.get(path);
    this.holo = { name: path.split('/').pop(), lines: wrap(content, 46), color: rec ? rec.color : rgb('#c9fff0'), k: 0 };
    const h = this.holo;
    if (rec) {
      rec.flying = 1;
      this.tween(650, (k) => { rec.fly = k; }, 0, () => this.tween(400, (k) => { rec.level = rec.target * (1 - 0.85 * k); }));
    }
    this.holoRec = rec;
    this.tween(650, (k) => { h.k = easeOut(k); }, rec ? 420 : 0);
  }

  closeHologram() {
    if (!this.holo) return;
    this.holo = null;
    const rec = this.holoRec;
    if (rec) { rec.flying = 0; rec.fly = 0; rec.level = rec.target; }
    this.holoRec = null;
  }

  get hologramOpen() { return !!this.holo; }

  // ------------------------------------------------------------ reactions
  async react(event, view) {
    this.view = view;
    const here = this.layout.get(view.cwd);
    if (event.type !== 'noop' && event.type !== 'clear') this.closeHologram();
    switch (event.type) {
      case 'pwd': {
        this.ring(here.pos, '#00f5a0', { radius: 30, dur: 1600, width: 2 });
        this.flash(this.objects.get(view.cwd), 'white', 1100);
        this.trailPulse('#d9fff0', 1500);
        this.addFx({ type: 'banner', text: `📍 ${event.path}`, at: local(here.pos, here.heading, 0, 4.4, -6.5) }, 5200);
        break;
      }
      case 'ls': {
        if (event.file) { this.flash(this.objects.get(event.path), 'white', 700); break; }
        const c = this.layout.get(event.path).pos;
        if (event.all) {
          this.cssPulse('glitch', 520);
          this.ring(c, HIDDEN_COLOR, { radius: 34, dur: 1800, width: 4, sides: 6 });
          this.ring(c, '#00cfff', { radius: 30, dur: 1500, width: 1.5 });
        } else {
          this.ring(c, '#00cfff', { radius: 30, dur: 1500, width: 1.5 });
          this.ring(c, '#00cfff', { radius: 18, dur: 1100, width: 1 });
        }
        const before = new Map([...this.objects].map(([p, r]) => [p, r.state]));
        this.applyVisibility(view, { reveal: event.all ? 'hidden' : null });
        for (const p of event.entries) if (before.get(p) === 'shown') this.flash(this.objects.get(p), event.all ? HIDDEN_COLOR : '#00cfff', 700);
        break;
      }
      case 'cd': {
        if (event.direction === 'stay') { this.ring(here.pos, '#00f5a0', { radius: 6, dur: 600 }); break; }
        const dest = this.objects.get(event.to);
        if (dest) { dest.spin = 1; this.flash(dest, 'white', 900); }
        if (event.direction === 'up') this.trailPulse('#00f5a0', 900);
        this.applyVisibility(view, { keepArch: event.direction === 'into' ? event.to : null });
        this.trail = pathChain(view.cwd);
        await this.travel(event.from, event.to, event.direction);
        if (dest) { dest.spin = 0; dest.archVisible = false; }
        this.ring(this.layout.get(view.cwd).pos, '#00f5a0', { radius: 7, dur: 900 });
        break;
      }
      case 'unzip-list': {
        const z = this.objects.get(event.path);
        if (!z) break;
        this.flash(z, '#00cfff', 900);
        this.ring(z.pos, '#00cfff', { radius: 5, dur: 900 });
        const files = event.entries.filter((e) => !e.endsWith('/')).length;
        this.banner(`📦 ${files} file${files === 1 ? '' : 's'} inside`, { ...z.pos, y: z.pos.y + 2.2 }, [191, 239, 255], 3200);
        break;
      }
      case 'unzip-prompt': {
        const z = this.objects.get(event.path);
        if (!z) break;
        const replace = event.kind === 'replace';
        this.flash(z, replace ? '#7fd6ff' : '#ffc45c', 1400);
        this.ring(z.pos, replace ? '#7fd6ff' : '#ffc45c', { radius: 4, dur: 1000, width: 2.5 });
        this.banner(replace ? '↻ replace existing files?' : '🔒 password required', { ...z.pos, y: z.pos.y + 2.2 }, replace ? [191, 239, 255] : [255, 217, 138], 3600);
        break;
      }
      case 'unzip': {
        const z = this.objects.get(event.path);
        this.grow(view);
        const at = z ? z.pos : here.pos;
        if (z) this.flash(z, 'white', 900);
        this.ring(at, '#ffb547', { radius: 14, dur: 1300, width: 2.5 });
        if (event.protected) {
          this.cssPulse('glitch', 420);
          this.ring(at, '#ffc45c', { radius: 30, dur: 1900, width: 1.5, sides: 6 });
        }
        this.applyVisibility(view);
        break;
      }
      case 'cat': {
        for (const f of event.files.slice(0, -1)) this.flash(this.objects.get(f.path), 'white', 600);
        this.openHologram(event.path, event.content);
        break;
      }
      case 'error': {
        this.cssPulse('warn', 650);
        if (event.reason === 'not-found' && event.target) {
          const parent = this.layout.get(parentOf(event.target)) ? parentOf(event.target) : view.cwd;
          const info = this.layout.get(parent);
          const dir = event.cmd === 'cd' || event.cmd === 'ls';
          const at = dir ? local(info.pos, info.heading, 2.5, 0, -15) : local(info.pos, info.heading, -1.5, 1.9, -5.2);
          this.addFx({ type: 'ghost', at, heading: info.heading, kind: dir ? 'dir' : 'file' }, 1500);
        } else if (event.target && this.objects.get(event.target)?.state === 'shown') {
          const rec = this.objects.get(event.target);
          this.shake(rec); this.flash(rec, ERROR_COLOR, 700);
        } else {
          this.ring(here.pos, ERROR_COLOR, { radius: 5, dur: 600 });
        }
        break;
      }
      default: break;
    }
  }

  finale() {
    this.tween(2600, (k) => { const e = easeOut(k); this.glow = e; this.fog = 0.02 - 0.009 * e; });
    this.trailPulse('#ffffff', 2200);
    this.ring(this.layout.get(this.view.cwd).pos, '#baffe6', { radius: 60, dur: 3200, width: 1.5 });
    for (const rec of this.objects.values()) if (rec.state === 'shown') this.flash(rec, 'white', 1800);
  }

  // ------------------------------------------------------------ projection
  setupCamera() {
    const { pos, target } = this.cam;
    this.f = norm(sub(target, pos));
    this.r = norm(cross(this.f, { x: 0, y: 1, z: 0 }));
    this.u = cross(this.r, this.f);
    this.F = (this.H / 2) / Math.tan(this.fov / 2);
    const { left = 0, top = 0, bottom = 0 } = this.insets;
    this.cx = this.W / 2 + left / 2;
    this.cy = this.H / 2 - (bottom - top) / 2;
  }

  /** world point -> { x, y, s (pixels per unit), z (depth) } or null when behind the camera */
  project(p) {
    const d = sub(p, this.cam.pos);
    const z = dot(d, this.f);
    if (z < 0.4) return null;
    const s = this.F / z;
    return { x: this.cx + dot(d, this.r) * s, y: this.cy - dot(d, this.u) * s, s, z };
  }

  fogAt(z) { return Math.exp(-Math.pow(this.fog * z, 2)); }

  poly(points, close = true) {
    const pr = points.map((p) => this.project(p));
    if (pr.some((p) => !p)) return null;
    const ctx = this.ctx;
    ctx.beginPath();
    pr.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    if (close) ctx.closePath();
    return pr;
  }

  // ------------------------------------------------------------------ draw
  frame() {
    const now = performance.now();
    for (let i = this.tweens.length - 1; i >= 0; i--) {
      const tw = this.tweens[i];
      if (now < tw.start) continue;
      const k = Math.min(1, (now - tw.start) / tw.dur);
      tw.update(k);
      if (k >= 1) { this.tweens.splice(i, 1); tw.done?.(); }
    }
    if (!this.machine) return;
    const t = (now - this.start) / 1000;
    if (this.rest && !this.cameraBusy) {
      this.cam.pos = copy(this.rest);
      if (!this.reduced) { this.cam.pos.y += Math.sin(t * 0.35) * 0.07; this.cam.pos.x += Math.sin(t * 0.22) * 0.05; }
    }
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.setupCamera();
    this.drawBackground(t);
    this.drawGrid();
    this.drawParticles(t);
    this.drawTrail(t);
    const recs = [];
    for (const rec of this.objects.values()) {
      if (rec.level < 0.004) continue;
      const pr = this.project(rec.pos);
      recs.push({ rec, z: pr ? pr.z : -1 });
    }
    recs.sort((a, b) => b.z - a.z);
    for (const { rec } of recs) {
      if (rec.node.type === 'dir') this.drawDir(rec, t); else this.drawFile(rec, t);
    }
    this.drawFx();
    if (this.holo) this.drawHologram();
  }

  drawBackground() {
    const ctx = this.ctx, W = this.W, H = this.H;
    const g = ctx.createRadialGradient(this.cx, this.cy * 0.8, 0, this.cx, this.cy, Math.max(W, H) * 0.75);
    g.addColorStop(0, `rgba(9,40,46,${0.55 + this.glow * 0.3})`);
    g.addColorStop(1, BG);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  drawGrid() {
    const ctx = this.ctx;
    const tgt = this.cam.target;
    const step = 6, span = 84;
    const ox = Math.round(tgt.x / step) * step, oz = Math.round(tgt.z / step) * step;
    ctx.lineWidth = 1;
    const seg = (a, b, base) => {
      // clip to the near plane, then fade with distance
      const da = dot(sub(a, this.cam.pos), this.f), db = dot(sub(b, this.cam.pos), this.f);
      if (da < 0.5 && db < 0.5) return;
      if (da < 0.5) a = lerp3(a, b, (0.5 - da) / (db - da));
      if (db < 0.5) b = lerp3(b, a, (0.5 - db) / (da - db));
      const pa = this.project(a), pb = this.project(b);
      if (!pa || !pb) return;
      ctx.strokeStyle = rgba(base, (0.2 + this.glow * 0.15) * this.fogAt((pa.z + pb.z) / 2));
      ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
    };
    const c1 = [15, 90, 74], c2 = [12, 52, 62];
    for (let i = -span; i <= span; i += step) {
      for (let j = -span; j < span; j += step * 2) {
        seg({ x: ox + i, y: -0.2, z: oz + j }, { x: ox + i, y: -0.2, z: oz + j + step * 2 }, i % 24 === 0 ? c1 : c2);
        seg({ x: ox + j, y: -0.2, z: oz + i }, { x: ox + j + step * 2, y: -0.2, z: oz + i }, i % 24 === 0 ? c1 : c2);
      }
    }
  }

  drawParticles(t) {
    const ctx = this.ctx;
    for (const p of this.particles) {
      const q = this.reduced ? p : { x: p.x + Math.sin(t * 0.1 + p.p) * 1.5, y: p.y + Math.sin(t * 0.3 + p.p) * 0.6, z: p.z };
      const pr = this.project(q);
      if (!pr || pr.x < 0 || pr.y < 0 || pr.x > this.W || pr.y > this.H) continue;
      const a = (0.35 + this.glow * 0.3) * this.fogAt(pr.z * 0.6);
      ctx.fillStyle = `rgba(127,233,255,${a.toFixed(3)})`;
      const sz = Math.max(1, Math.min(3, pr.s * 0.09));
      ctx.fillRect(pr.x, pr.y, sz, sz);
    }
  }

  drawTrail(t) {
    const ctx = this.ctx;
    const pts = this.trail.map((p) => ({ ...this.layout.get(p).pos, y: 0.26 }));
    const boost = this.trailBoost || 0;
    const green = [0, 245, 160];
    for (const [w, a] of [[9, 0.08], [3.5, 0.5]]) {
      ctx.lineWidth = w;
      ctx.lineCap = 'round';
      for (let i = 0; i < pts.length - 1; i++) {
        const n = 12;
        for (let s = 0; s < n; s++) {
          let a1 = lerp3(pts[i], pts[i + 1], s / n), b1 = lerp3(pts[i], pts[i + 1], (s + 1) / n);
          const pa = this.project(a1), pb = this.project(b1);
          if (!pa || !pb) continue;
          ctx.strokeStyle = rgba(green, (a + boost * 0.4 + this.glow * 0.3) * this.fogAt((pa.z + pb.z) / 2));
          ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
        }
      }
    }
    // stops along the trail, brightest where you are
    pts.forEach((p, i) => {
      const pr = this.project({ ...p, y: 0.5 });
      if (!pr) return;
      const last = i === pts.length - 1;
      this.glowDot(pr.x, pr.y, Math.max(4, pr.s * (last ? 0.9 : 0.6)), last ? [186, 255, 230] : green, (last ? 0.75 : 0.55) * this.fogAt(pr.z));
    });
    // "you are here" ring
    const here = this.layout.get(this.view.cwd).pos;
    const ring = [];
    for (let i = 0; i <= 40; i++) { const a = (i / 40) * Math.PI * 2; ring.push({ x: here.x + Math.cos(a) * 3.85, y: 0.22, z: here.z + Math.sin(a) * 3.85 }); }
    if (this.poly(ring, false)) { ctx.lineWidth = 2; ctx.strokeStyle = `rgba(186,255,230,${(0.45 + boost * 0.4).toFixed(3)})`; ctx.stroke(); }
  }

  glowDot(x, y, r, c, a) {
    const ctx = this.ctx;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgba(c, a));
    g.addColorStop(1, rgba(c, 0));
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  colorOf(rec) { return rec.flash ? mix(rec.color, rec.flash.c, rec.flash.w) : rec.color; }

  drawDir(rec, t) {
    const ctx = this.ctx;
    const sc = rec.scale * rec.grow;
    const base = { x: rec.pos.x, y: rec.pos.y + rec.yOff, z: rec.pos.z };
    const L = (x, y, z) => { const p = local(base, rec.heading, x * sc + rec.shakeX, y * sc, z * sc); return p; };
    const center = this.project(base);
    if (!center) return;
    const a = rec.level * this.fogAt(center.z);
    if (a < 0.004) return;
    const col = this.colorOf(rec);
    const hex = (r, y) => Array.from({ length: 6 }, (_, i) => { const ang = (i / 6) * Math.PI * 2 + Math.PI / 6; return L(Math.cos(ang) * r, y, Math.sin(ang) * r); });
    // platform
    if (this.poly(hex(3.5, 0.16))) {
      ctx.fillStyle = `rgba(10,24,34,${(0.85 * a).toFixed(3)})`; ctx.fill();
      ctx.lineWidth = Math.max(1, center.s * 0.05); ctx.strokeStyle = rgba(col, 0.9 * a); ctx.stroke();
    }
    if (this.poly(hex(2.85, 0.18))) { ctx.lineWidth = Math.max(1, center.s * 0.08); ctx.strokeStyle = rgba(col, 0.3 * a); ctx.stroke(); }
    // portal arch, facing the parent
    if (rec.archVisible) {
      const spin = rec.spin ? t * 6 : t * 0.25;
      const circle = Array.from({ length: 36 }, (_, i) => { const ang = (i / 36) * Math.PI * 2; return L(Math.cos(ang) * 2.1, 2.75 + Math.sin(ang) * 2.1, 2.5); });
      const pc = this.project(L(0, 2.75, 2.5));
      if (pc && this.poly(circle)) {
        const g = ctx.createRadialGradient(pc.x, pc.y, 0, pc.x, pc.y, 2.1 * pc.s);
        g.addColorStop(0, rgba(col, (rec.spin ? 0.55 : 0.18) * a));
        g.addColorStop(1, rgba(col, 0.02 * a));
        ctx.fillStyle = g; ctx.fill();
        ctx.lineWidth = Math.max(1.2, pc.s * 0.14); ctx.strokeStyle = rgba(col, 0.95 * a); ctx.stroke();
        // a travelling spark shows the portal is "live"
        const sp = this.project(L(Math.cos(spin) * 2.1, 2.75 + Math.sin(spin) * 2.1, 2.5));
        if (sp) this.glowDot(sp.x, sp.y, Math.max(3, sp.s * 0.35), col, 0.9 * a);
      }
      ctx.lineWidth = Math.max(1, center.s * 0.1);
      ctx.strokeStyle = rgba(col, 0.75 * a);
      for (const x of [-2.6, 2.6]) if (this.poly([L(x, 0, 2.5), L(x, 4.6, 2.5)], false)) ctx.stroke();
      if (this.poly([L(-2.6, 4.6, 2.5), L(2.6, 4.6, 2.5)], false)) ctx.stroke();
      // folder icon on top of the portal, so it reads as a folder
      const bob = this.reduced ? 0 : Math.sin(t * 1.2 + rec.node.path.length) * 0.06;
      const iy = ICON.y + bob;
      if (this.poly(ICON_BACK.map(([x, y]) => L(x, iy + y, ICON.z)))) {
        ctx.fillStyle = `rgba(12,34,48,${(0.9 * a).toFixed(3)})`; ctx.fill();
        ctx.lineWidth = Math.max(1, center.s * 0.045); ctx.strokeStyle = rgba(col, 0.95 * a); ctx.stroke();
      }
      if (this.poly(ICON_FRONT.map(([x, y]) => L(x, iy + y, ICON.z + ICON.frontZ)))) {
        ctx.fillStyle = rgba(col, 0.38 * a); ctx.fill();
        ctx.lineWidth = Math.max(1, center.s * 0.04); ctx.strokeStyle = rgba([234, 255, 248], 0.7 * a); ctx.stroke();
      }
    }
    if (rec.labelVisible) {
      const lp = this.project(L(0, LABEL_Y, 2.5));
      if (lp) this.label(rec.node.path === '/' ? '/' : rec.node.name + '/', lp.x, lp.y, lp.s * (isHomeAncestor(this.machine, rec.node.path) ? 0.36 : 0.44), col, a);
    }
  }

  drawFile(rec, t) {
    const ctx = this.ctx;
    let base = { x: rec.pos.x + rec.shakeX, y: rec.pos.y + rec.yOff + (this.reduced ? 0 : Math.sin(t * 1.1 + rec.phase) * 0.12), z: rec.pos.z };
    if (rec.fly) {
      // drift toward the camera while the document opens
      const toward = lerp3(this.cam.pos, this.cam.target, 0.25);
      base = lerp3(base, toward, ease(rec.fly) * 0.6);
    }
    const center = this.project(base);
    if (!center) return;
    const a = rec.level * this.fogAt(center.z);
    if (a < 0.004) return;
    const col = this.colorOf(rec);
    const sc = rec.grow;
    const h = rec.heading + (this.reduced ? 0 : Math.sin(t * 0.5 + rec.phase) * 0.18) + (rec.fly ? rec.fly * Math.PI * 2 : 0);
    const L = (x, y, z) => local(base, h, x * sc, y * sc, z * sc);
    if (fileKind(rec.node.name) === 'archive') {
      const hh = h + 0.6;
      const C = (x, y, z) => local(base, hh, x * sc, y * sc, z * sc);
      const v = [-0.5, 0.5];
      const corners = [];
      for (const x of v) for (const y of v) for (const z of v) corners.push(C(x, y, z));
      const front = [C(-0.5, -0.5, 0.5), C(0.5, -0.5, 0.5), C(0.5, 0.5, 0.5), C(-0.5, 0.5, 0.5)];
      if (this.poly(front)) { ctx.fillStyle = `rgba(29,22,8,${(0.85 * a).toFixed(3)})`; ctx.fill(); }
      const edges = [[0, 1], [0, 2], [0, 4], [1, 3], [1, 5], [2, 3], [2, 6], [3, 7], [4, 5], [4, 6], [5, 7], [6, 7]];
      ctx.lineWidth = Math.max(1, center.s * 0.04); ctx.strokeStyle = rgba(col, 0.95 * a);
      for (const [i, j] of edges) if (this.poly([corners[i], corners[j]], false)) ctx.stroke();
      ctx.lineWidth = Math.max(1, center.s * 0.09); ctx.strokeStyle = rgba(col, 0.55 * a);
      for (const y of [-0.22, 0.22]) if (this.poly([C(-0.53, y, 0.53), C(0.53, y, 0.53), C(0.53, y, -0.53)], false)) ctx.stroke();
    } else {
      if (this.poly([L(-0.6, -0.75, 0), L(0.6, -0.75, 0), L(0.6, 0.75, 0), L(-0.6, 0.75, 0)])) {
        ctx.fillStyle = `rgba(11,32,41,${(0.82 * a).toFixed(3)})`; ctx.fill();
        ctx.lineWidth = Math.max(1, center.s * 0.04); ctx.strokeStyle = rgba(col, 0.95 * a); ctx.stroke();
      }
      ctx.lineWidth = Math.max(1, center.s * 0.06); ctx.strokeStyle = rgba(col, 0.6 * a);
      for (let i = 0; i < 5; i++) {
        const w = i === 4 ? 0.44 : 0.6 + ((i * 37) % 25) / 125;
        if (this.poly([L(-0.4, 0.5 - i * 0.22, 0.04), L(-0.4 + w, 0.5 - i * 0.22, 0.04)], false)) ctx.stroke();
      }
    }
    const lp = this.project(L(0, -1.25, 0));
    if (lp && !rec.fly) this.label(rec.node.name, lp.x, lp.y, lp.s * 0.36, col, a);
  }

  label(text, x, y, size, col, a) {
    const ctx = this.ctx;
    const px = Math.max(9, Math.min(24, size));
    ctx.font = `600 ${px.toFixed(1)}px "JetBrains Mono", ui-monospace, monospace`;
    const w = ctx.measureText(text).width + px * 0.9;
    const h = px * 1.55;
    ctx.fillStyle = `rgba(3,10,16,${(0.72 * a).toFixed(3)})`;
    roundRect(ctx, x - w / 2, y - h / 2, w, h, px * 0.3);
    ctx.fill();
    ctx.lineWidth = 1; ctx.strokeStyle = rgba(col, 0.5 * a); ctx.stroke();
    ctx.fillStyle = rgba(col, a);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y + px * 0.05);
    ctx.textAlign = 'left';
  }

  drawFx() {
    const ctx = this.ctx;
    for (const fx of this.fx) {
      const k = fx.k;
      if (fx.type === 'ring') {
        const r = 0.5 + fx.radius * easeOut(k);
        const pts = Array.from({ length: fx.sides + 1 }, (_, i) => { const a = (i / fx.sides) * Math.PI * 2 + (fx.sides === 6 ? Math.PI / 6 : 0); return { x: fx.center.x + Math.cos(a) * r, y: 0.3, z: fx.center.z + Math.sin(a) * r }; });
        // draw only the visible parts of the ring
        ctx.lineWidth = fx.width + 1;
        ctx.strokeStyle = rgba(fx.color, 0.9 * (1 - k));
        ctx.beginPath();
        let pen = false;
        for (const p of pts) {
          const pr = this.project(p);
          if (!pr) { pen = false; continue; }
          if (pen) ctx.lineTo(pr.x, pr.y); else { ctx.moveTo(pr.x, pr.y); pen = true; }
        }
        ctx.stroke();
      } else if (fx.type === 'runner') {
        const pts = this.trail.map((p) => this.layout.get(p).pos);
        if (pts.length < 2) continue;
        const f = ease(k) * (pts.length - 1);
        const i = Math.min(pts.length - 2, Math.floor(f));
        const p = lerp3(pts[i], pts[i + 1], f - i);
        const pr = this.project({ ...p, y: 0.6 });
        if (pr) this.glowDot(pr.x, pr.y, Math.max(8, pr.s * 1.1), fx.color, k > 0.85 ? (1 - k) / 0.15 : 1);
      } else if (fx.type === 'banner') {
        const pr = this.project(fx.at);
        if (!pr) continue;
        const a = k < 0.12 ? k / 0.12 : k > 0.85 ? (1 - k) / 0.15 : 1;
        this.label(fx.text, pr.x, pr.y, Math.max(16, pr.s * 0.62), fx.color || [186, 255, 230], a);
      } else if (fx.type === 'ghost') {
        const glitch = Math.sin(k * 90) > 0.3 ? 1 : 0.3;
        const a = 0.85 * (1 - k) * glitch;
        const jitter = (Math.random() - 0.5) * 0.25 * (1 - k);
        const L = (x, y, z) => local(fx.at, fx.heading, x * (1 + Math.sin(k * 70) * 0.06) + jitter, y * (1 - 0.4 * k), z);
        ctx.setLineDash([6, 5]);
        ctx.lineWidth = 2;
        ctx.strokeStyle = rgba(rgb(ERROR_COLOR), a);
        if (fx.kind === 'dir') {
          const hex = Array.from({ length: 6 }, (_, i) => { const ang = (i / 6) * Math.PI * 2 + Math.PI / 6; return L(Math.cos(ang) * 3.5, 0.16, Math.sin(ang) * 3.5); });
          if (this.poly(hex)) ctx.stroke();
          const circle = Array.from({ length: 30 }, (_, i) => { const ang = (i / 30) * Math.PI * 2; return L(Math.cos(ang) * 2.1, 2.75 + Math.sin(ang) * 2.1, 2.5); });
          if (this.poly(circle)) ctx.stroke();
        } else if (this.poly([L(-0.6, -0.75, 0), L(0.6, -0.75, 0), L(0.6, 0.75, 0), L(-0.6, 0.75, 0)])) ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }

  drawHologram() {
    const ctx = this.ctx, h = this.holo;
    if (h.k <= 0) return;
    const { left = 0, top = 0, bottom = 0 } = this.insets;
    const areaW = this.W - left;
    const w = Math.min(560, areaW - 32);
    const px = Math.max(13, Math.min(18, w / 30));
    const lh = px * 1.55;
    const head = px * 2.6;
    const ph = head + px * 1.4 + h.lines.length * lh;
    const x = left + (areaW - w) / 2;
    const cy = top + (this.H - top - bottom) * 0.42;
    const y = cy - (ph * h.k) / 2;
    ctx.save();
    ctx.globalAlpha = Math.min(1, h.k * 1.6);
    ctx.beginPath();
    ctx.rect(x - 4, y - 4, w + 8, ph * h.k + 8);
    ctx.clip();
    ctx.fillStyle = 'rgba(4,16,20,0.93)';
    roundRect(ctx, x, y, w, ph, 16); ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = rgba(h.color, 0.8); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(x + 1, y + 1, w - 2, head - 6);
    ctx.font = `600 ${px}px "JetBrains Mono", ui-monospace, monospace`;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = rgba(h.color, 1); ctx.fillText(`▤ ${h.name}`, x + px * 1.2, y + head / 2 - 2);
    ctx.fillStyle = 'rgba(201,255,240,0.5)'; ctx.textAlign = 'right'; ctx.fillText('cat', x + w - px * 1.2, y + head / 2 - 2); ctx.textAlign = 'left';
    ctx.font = `400 ${px}px "JetBrains Mono", ui-monospace, monospace`;
    ctx.fillStyle = '#eafff8';
    h.lines.forEach((l, i) => ctx.fillText(l, x + px * 1.4, y + head + px * 0.6 + i * lh + lh / 2));
    ctx.restore();
  }

  dispose() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.onResize);
    this.canvas.remove();
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) { ctx.roundRect(x, y, w, h, r); return; }
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

function wrap(content, width) {
  const out = [];
  for (const raw of content.split('\n')) {
    let rest = raw;
    while (rest.length > width) {
      const cut = rest.lastIndexOf(' ', width) > 10 ? rest.lastIndexOf(' ', width) : width;
      out.push(rest.slice(0, cut));
      rest = rest.slice(cut).trimStart();
    }
    out.push(rest);
  }
  return out;
}
