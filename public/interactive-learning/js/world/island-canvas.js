// "The Archive Islands" for the 2D view. Browsers without WebGL draw
// pictures baked from the 3D island models (scripts/bake-islands.cjs) with
// Canvas 2D: same layout, camera, effects and reactions as CanvasWorld.

import { CanvasWorld, rgb, rgba, lerp3 } from './canvas-world.js';
import { isHidden, fileKind } from '../fs/filesystem.js';
import { local, isHomeAncestor } from './layout.js';

const BASE = './interactive-learning/img/islands/';
const WARM = [255, 196, 122];
const R = 5;

function hash(str) {
  let h = 2166136261;
  for (const ch of str) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

export class IslandCanvasWorld extends CanvasWorld {
  constructor(container, opts) {
    super(container, opts);
    this.trailColor = [255, 210, 122];
    this.hereColor = [255, 227, 173];
    this.sprites = {};
    this.stars = Array.from({ length: 220 }, () => ({ x: Math.random(), y: Math.random() * 0.75, r: Math.random() * 1.3 + 0.3, p: Math.random() * 6.28 }));
    this.rocks = Array.from({ length: 40 }, (_, i) => {
      const a = Math.random() * Math.PI * 2, d = 20 + Math.random() * 90;
      return { x: Math.cos(a) * d, y: -14 + Math.random() * 30, z: Math.sin(a) * d - 30, k: 0.3 + Math.random() * Math.random() * 1.8, sides: 5 + (i % 3), rot: Math.random() * 6 };
    });
    this.particles.forEach((p) => { p.y -= 8; });
    fetch(`${BASE}sprites.json`).then((r) => r.json()).then((meta) => {
      for (const [name, m] of Object.entries(meta)) {
        const img = new Image();
        img.decoding = 'async';
        img.src = BASE + m.file;
        this.sprites[name] = { ...m, img };
      }
    }).catch((err) => console.warn('island sprites failed to load', err));
  }

  sprite(name) {
    const s = this.sprites[name];
    return s && s.img.complete && s.img.naturalWidth ? s : null;
  }

  /** Draw a baked sprite with its origin at screen point (x, y). */
  blit(s, x, y, pxPerUnit, alpha, rot = 0) {
    const w = s.w * s.upp * pxPerUnit, h = s.h * s.upp * pxPerUnit;
    if (w < 2 || alpha < 0.004) return;
    const ctx = this.ctx;
    ctx.globalAlpha = Math.min(1, alpha);
    if (rot) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
      ctx.drawImage(s.img, -s.ax * w, -s.ay * h, w, h);
      ctx.restore();
    } else ctx.drawImage(s.img, x - s.ax * w, y - s.ay * h, w, h);
    ctx.globalAlpha = 1;
  }

  // ---------------------------------------------------------------- scenery
  drawBackground(t) {
    const ctx = this.ctx, W = this.W, H = this.H;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#060512'); g.addColorStop(0.45, '#160f33'); g.addColorStop(0.75, '#2a1a4d'); g.addColorStop(1, '#140b2a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // stars drift a little with the camera
    const yaw = Math.atan2(this.f.x, -this.f.z);
    for (const s of this.stars) {
      const x = ((s.x - yaw * 0.08) % 1 + 1) % 1 * W;
      const a = 0.45 + 0.35 * (this.reduced ? 1 : Math.sin(t * 0.8 + s.p));
      ctx.fillStyle = `rgba(232,224,255,${(a * (1 - s.y)).toFixed(3)})`;
      ctx.fillRect(x, s.y * H, s.r, s.r);
    }
    // purple mist far below
    for (const [fx, fy, fr] of [[0.2, 1.05, 0.5], [0.7, 1.1, 0.6], [0.45, 0.95, 0.35]]) this.glowDot(fx * W, fy * H, fr * Math.max(W, H), [91, 60, 154], 0.28 + this.glow * 0.1);
  }

  drawGrid() {
    // no floor here: floating rocks instead
    const ctx = this.ctx;
    for (const r of this.rocks) {
      const p = this.project(r);
      if (!p) continue;
      const rad = r.k * p.s;
      if (rad < 0.6 || p.x < -rad || p.x > this.W + rad || p.y < -rad || p.y > this.H + rad) continue;
      ctx.beginPath();
      for (let i = 0; i < r.sides; i++) {
        const a = r.rot + (i / r.sides) * Math.PI * 2;
        const q = 0.75 + ((i * 37) % 10) / 25;
        ctx[i ? 'lineTo' : 'moveTo'](p.x + Math.cos(a) * rad * q, p.y + Math.sin(a) * rad * q * 0.8);
      }
      ctx.closePath();
      ctx.fillStyle = `rgba(52,44,76,${(0.9 * this.fogAt(p.z * 0.5)).toFixed(3)})`;
      ctx.fill();
    }
  }

  drawParticles(t) {
    const ctx = this.ctx;
    for (const p of this.particles) {
      const q = this.reduced ? p : { x: p.x + Math.sin(t * 0.1 + p.p) * 1.5, y: p.y + Math.sin(t * 0.3 + p.p) * 0.6, z: p.z };
      const pr = this.project(q);
      if (!pr || pr.x < 0 || pr.y < 0 || pr.x > this.W || pr.y > this.H) continue;
      const a = (0.45 + this.glow * 0.3) * this.fogAt(pr.z * 0.6) * (this.reduced ? 1 : 0.6 + 0.4 * Math.sin(t * 2 + p.p));
      const sz = Math.max(1, Math.min(3, pr.s * 0.12));
      ctx.fillStyle = `rgba(255,213,154,${a.toFixed(3)})`;
      ctx.fillRect(pr.x, pr.y, sz, sz);
    }
  }

  // ------------------------------------------------------------- the world
  frame() {
    // bridges first, so islands sit on top of their ends
    if (this.machine && this.objects.size) this.drawBridgesNext = true;
    super.frame();
  }

  drawTrail(t) {
    if (this.drawBridgesNext) { this.drawBridgesNext = false; this.drawBridges(); }
    super.drawTrail(t);
  }

  drawBridges() {
    const ctx = this.ctx;
    for (const rec of this.objects.values()) {
      if (rec.node.type !== 'dir' || !rec.node.parent || rec.level < 0.01) continue;
      const par = this.objects.get(rec.node.parent.path);
      if (!par) continue;
      const a = rec.level * 0.95;
      const A = rec.pos, B = par.pos;
      const dx = B.x - A.x, dz = B.z - A.z, d = Math.hypot(dx, dz);
      const ux = dx / d, uz = dz / d, px = -uz, pz = ux;
      const s0 = R * 0.92 * rec.scale, s1 = d - R * 0.92 * par.scale;
      if (s1 - s0 < 0.5) continue;
      const n = Math.max(2, Math.min(60, Math.round((s1 - s0) / 0.62)));
      const sag = Math.min(1.1, (s1 - s0) * 0.05);
      const at = (k, off, lift = 0) => ({ x: A.x + ux * (s0 + (s1 - s0) * k) + px * off, y: -0.12 - sag * Math.sin(Math.PI * k) + lift, z: A.z + uz * (s0 + (s1 - s0) * k) + pz * off });
      for (let i = 0; i < n; i++) {
        const k0 = (i + 0.1) / n, k1 = (i + 0.85) / n;
        const q = this.poly([at(k0, -0.9), at(k0, 0.9), at(k1, 0.9), at(k1, -0.9)]);
        if (!q) continue;
        const fog = this.fogAt(q[0].z * 0.45);
        ctx.fillStyle = rgba(i % 3 ? [122, 86, 55] : [108, 75, 47], a * fog);
        ctx.fill();
      }
      ctx.lineWidth = 1;
      for (const off of [-0.85, 0.85]) {
        const pts = Array.from({ length: 17 }, (_, i) => at(i / 16, off, 0.75));
        if (this.poly(pts, false)) { ctx.strokeStyle = rgba([201, 167, 122], 0.7 * a); ctx.stroke(); }
      }
      for (const k of [0.02, 0.98]) {
        const p = this.project(at(k, 0.95, 0.95));
        if (p) this.glowDot(p.x, p.y, Math.max(3, p.s * 0.8), WARM, 0.55 * a * this.fogAt(p.z));
      }
    }
  }

  drawDir(rec, t) {
    const hidden = rec.node.path.split('/').some((p) => p && isHidden(p));
    const ancestor = isHomeAncestor(this.machine, rec.node.path);
    const variant = hidden ? 'hidden' : ancestor ? 'stone' : 'abc'[hash(rec.node.path) % 3];
    const island = this.sprite(`island-${variant}`), house = this.sprite(`house-${variant}`);
    if (!island || !house) return super.drawDir(rec, t);
    const sc = rec.scale * rec.grow;
    const base = { x: rec.pos.x + rec.shakeX, y: rec.pos.y + rec.yOff, z: rec.pos.z };
    const L = (x, y, z) => local(base, rec.heading, x * sc, y * sc, z * sc);
    const c = this.project(base);
    if (!c) return;
    const a = rec.level * this.fogAt(c.z * 0.45);
    if (a < 0.004) return;
    this.blit(island, c.x, c.y, c.s * sc, a);
    if (rec.flash) this.glowDot(c.x, c.y, c.s * sc * 6, rec.flash.c, 0.5 * rec.flash.w * a);
    const current = rec.node.path === this.view?.cwd;
    if (!rec.archVisible || current) return;
    const h = this.project(L(0, 0, 2.5));
    if (!h || h.z < 3) return;
    // fade the house as the camera flies through its door
    const near = Math.min(1, Math.max(0, (h.z - 3) / 5));
    const ha = a * near;
    const door = this.project(L(0, 2.2, 3.2));
    const glowCol = hidden ? [180, 140, 255] : WARM;
    if (door) this.glowDot(door.x, door.y, door.s * sc * (rec.spin ? 5 : 3.2), glowCol, (rec.spin ? 0.9 : 0.45) * ha);
    this.blit(house, h.x, h.y, h.s * sc, ha);
    if (door) this.glowDot(door.x, door.y, door.s * sc * 1.6, glowCol, 0.35 * ha);
    for (const x of [-3.6, 3.6]) {
      const lp = this.project(L(x, 1.38, 3.8));
      if (lp) this.glowDot(lp.x, lp.y, lp.s * sc * 0.9, glowCol, 0.7 * ha);
    }
    // the name, carved above the door
    const sp = this.project(L(0, 4.75, 3.58));
    if (sp && rec.labelVisible !== false) {
      const ctx = this.ctx;
      const name = rec.node.path === '/' ? '/' : rec.node.name;
      let px = sp.s * sc * 0.85;
      ctx.font = `800 ${px.toFixed(1)}px Manrope, system-ui, sans-serif`;
      const maxW = sp.s * sc * 5.4;
      const tw = ctx.measureText(name).width;
      if (tw > maxW) { px *= maxW / tw; ctx.font = `800 ${px.toFixed(1)}px Manrope, system-ui, sans-serif`; }
      if (px >= 4) {
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = rgba(hidden ? [58, 31, 120] : [75, 54, 34], ha);
        ctx.fillText(name, sp.x, sp.y);
        ctx.textAlign = 'left';
      }
      // far away, a small tag keeps the name readable
      if (px < 11) this.label(`${name === '/' ? '/' : name + '/'}`, sp.x, sp.y - Math.max(14, sp.s * sc * 3.4), 12, hidden ? rgb('#d9c9ff') : rgb('#ffe9c4'), ha);
    }
  }

  drawFile(rec, t) {
    const kind = fileKind(rec.node.name);
    const hidden = rec.node.path.split('/').some((p) => p && isHidden(p));
    const s = this.sprite(kind === 'archive' ? 'crate' : hidden ? 'paper-hidden' : kind === 'log' ? 'paper-log' : 'paper');
    if (!s) return super.drawFile(rec, t);
    let base = { x: rec.pos.x + rec.shakeX, y: rec.pos.y + rec.yOff + (this.reduced ? 0 : Math.sin(t * 1.1 + rec.phase) * 0.12), z: rec.pos.z };
    if (rec.fly) base = lerp3(base, lerp3(this.cam.pos, this.cam.target, 0.25), Math.min(1, rec.fly) * 0.6);
    const c = this.project(base);
    if (!c) return;
    const a = rec.level * this.fogAt(c.z * 0.45);
    if (a < 0.004) return;
    const col = hidden ? [180, 140, 255] : kind === 'archive' ? [255, 181, 71] : [255, 207, 138];
    this.glowDot(c.x, c.y, c.s * 1.7 * rec.grow, col, 0.32 * a);
    if (rec.flash) this.glowDot(c.x, c.y, c.s * 2.2, rec.flash.c, 0.7 * rec.flash.w * a);
    this.blit(s, c.x, c.y, c.s * rec.grow, a, this.reduced ? 0 : Math.sin(t * 0.5 + rec.phase) * 0.06);
    const lp = this.project(local(base, rec.heading, 0, -1.25 * rec.grow, 0));
    if (lp && !rec.fly) this.label(rec.node.name, lp.x, lp.y, lp.s * 0.36, hidden ? rgb('#d9c9ff') : rgb('#ffe9c4'), a);
  }
}
