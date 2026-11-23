// The 3D "inside the machine" world. It never decides what exists: it reads the
// simulated filesystem + view state (cwd, visited, listed) and reacts to command
// events emitted by the shell. Each command type has its own visual response.

import * as THREE from '../vendor/three-r162.module.min.js';
import { isHidden, fileKind, sortNames } from '../fs/filesystem.js';
import { pathChain, parentOf } from '../fs/path.js';
import { visibilityOf } from './visibility.js';

const PALETTE = ['#00f5a0', '#00cfff', '#3be8c8', '#7fd6ff'];
const HIDDEN_COLOR = '#a98bff';
const ERROR_COLOR = '#ff5d6c';
const BG = '#03070c';

const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const easeOut = (k) => 1 - Math.pow(1 - k, 3);
const hashColor = (name) => {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
};

// local (x right, y up, z back) offset around a point facing `heading` (radians; 0 = -Z)
function local(p, heading, x, y, z) {
  const s = Math.sin(heading), c = Math.cos(heading);
  return new THREE.Vector3(p.x + x * c - z * s, p.y + y, p.z + x * s + z * c);
}

// Text canvases are not power-of-two sized; skipping mipmaps keeps them sharp
// and stops WebGL 1 devices from shrinking them.
function crispText(tex) {
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

function makeLabel(text, color, { size = 46, weight = 600, bg = 'rgba(3,10,16,0.72)' } = {}) {
  const pad = 22;
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  const font = `${weight} ${size}px "JetBrains Mono", ui-monospace, monospace`;
  ctx.font = font;
  const w = Math.ceil(ctx.measureText(text).width) + pad * 2;
  const h = size + pad * 1.4;
  c.width = w; c.height = h;
  ctx.font = font;
  ctx.fillStyle = bg;
  ctx.beginPath(); ctx.roundRect(1, 1, w - 2, h - 2, 14); ctx.fill();
  ctx.strokeStyle = color; ctx.globalAlpha = 0.55; ctx.lineWidth = 2; ctx.stroke(); ctx.globalAlpha = 1;
  ctx.fillStyle = color; ctx.textBaseline = 'middle';
  ctx.fillText(text, pad, h / 2 + 2);
  const tex = new THREE.CanvasTexture(c);
  crispText(tex);
  tex.anisotropy = 4;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, fog: false });
  const sprite = new THREE.Sprite(mat);
  const scale = 0.0105;
  sprite.scale.set(w * scale, h * scale, 1);
  sprite.renderOrder = 10;
  return sprite;
}

function radialTexture(inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)') {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, inner); g.addColorStop(1, outer);
  ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export class World {
  constructor(container, { reducedMotion = false } = {}) {
    this.container = container;
    this.reduced = reducedMotion;
    this.speed = reducedMotion ? 0.25 : 1;
    this.tweens = [];
    this.objects = new Map(); // path -> { group, mats[], kind, state, node, pos, heading, ... }
    this.disposables = new Set();

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    this.renderer.setClearColor(BG, 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.setAttribute('aria-hidden', 'true');
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(BG, 0.02);
    this.camera = new THREE.PerspectiveCamera(55, 1, 0.1, 400);
    this.camTarget = new THREE.Vector3();

    this.shared = {
      glow: radialTexture(),
      hexGeo: new THREE.CylinderGeometry(3.4, 3.6, 0.32, 6, 1),
      ringGeo: new THREE.RingGeometry(2.6, 3.05, 6, 1),
      torusGeo: new THREE.TorusGeometry(2.1, 0.07, 10, 72),
      discGeo: new THREE.CircleGeometry(2.03, 48),
      pillarGeo: new THREE.BoxGeometry(0.16, 4.6, 0.16),
      lintelGeo: new THREE.BoxGeometry(5.2, 0.16, 0.16),
      docGeo: new THREE.BoxGeometry(1.2, 1.5, 0.06),
      lineGeo: new THREE.PlaneGeometry(0.8, 0.07),
      cubeGeo: new THREE.BoxGeometry(1, 1, 1),
      bandGeo: new THREE.BoxGeometry(1.06, 0.12, 1.06),
    };
    this.shared.hexEdges = new THREE.EdgesGeometry(this.shared.hexGeo);
    this.shared.docEdges = new THREE.EdgesGeometry(this.shared.docGeo);
    this.shared.cubeEdges = new THREE.EdgesGeometry(this.shared.cubeGeo);

    this.buildEnvironment();
    this.onResize = () => this.resize();
    window.addEventListener('resize', this.onResize);
    this.resize();
    this.clock = new THREE.Clock();
    this.running = true;
    const loop = () => {
      if (!this.running) return;
      this.raf = requestAnimationFrame(loop);
      this.frame();
    };
    loop();
  }

  // ------------------------------------------------------------------ setup
  buildEnvironment() {
    const s = this.scene;
    s.add(new THREE.HemisphereLight('#4d8fb0', '#020407', 0.9));
    const key = new THREE.DirectionalLight('#bff8ff', 1.1);
    key.position.set(10, 22, 14);
    s.add(key);
    this.ambient = new THREE.AmbientLight('#0f2a2a', 0.6);
    s.add(this.ambient);

    const grid = new THREE.GridHelper(420, 140, '#0f5a4a', '#0a2a33');
    grid.material.transparent = true;
    grid.material.opacity = 0.22;
    grid.position.y = -0.2;
    s.add(grid);
    this.grid = grid;

    // particles: one draw call
    const count = this.reduced ? 350 : 800;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 220;
      pos[i * 3 + 1] = Math.random() * 40 + 1;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 220 - 10;
    }
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.particles = new THREE.Points(pg, new THREE.PointsMaterial({
      color: '#7fe9ff', size: 0.16, map: this.shared.glow, transparent: true, opacity: 0.55,
      depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    s.add(this.particles);

    // data streams: thin vertical beams sharing one scrolling texture
    const c = document.createElement('canvas');
    c.width = 4; c.height = 256;
    const ctx = c.getContext('2d');
    for (let y = 0; y < 256; y += 32) {
      const g = ctx.createLinearGradient(0, y, 0, y + 32);
      g.addColorStop(0, 'rgba(0,245,160,0)'); g.addColorStop(0.8, 'rgba(0,245,160,0.9)'); g.addColorStop(1, 'rgba(0,245,160,0)');
      ctx.fillStyle = g; ctx.fillRect(0, y, 4, 32);
    }
    this.streamTex = new THREE.CanvasTexture(c);
    this.streamTex.wrapT = THREE.RepeatWrapping;
    this.streamTex.repeat.set(1, 4);
    const sm = new THREE.MeshBasicMaterial({ map: this.streamTex, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    const sg = new THREE.CylinderGeometry(0.035, 0.035, 46, 6, 1, true);
    for (let i = 0; i < 16; i++) {
      const m = new THREE.Mesh(sg, sm);
      const a = (i / 16) * Math.PI * 2 + Math.random() * 0.3;
      const r = 45 + Math.random() * 40;
      m.position.set(Math.cos(a) * r, 22, Math.sin(a) * r - 10);
      s.add(m);
    }

    this.trailGroup = new THREE.Group();
    s.add(this.trailGroup);
    this.worldGroup = new THREE.Group();
    s.add(this.worldGroup);
    this.fxGroup = new THREE.Group();
    s.add(this.fxGroup);
  }

  resize() {
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // Narrow screens: pull back so the surroundings stay in view.
    this.viewScale = Math.min(2.1, Math.max(1, 1.45 / this.camera.aspect));
    this.camera.fov = this.camera.aspect < 0.8 ? 68 : 55;
    this.applyInsets();
    if (this.view && !this.cameraBusy) this.placeCamera(this.view.cwd, true);
  }

  /** Keep the interesting part of the world clear of the lesson card and terminal. */
  setInsets(insets) { this.insets = insets; this.applyInsets(); }

  applyInsets() {
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    const { left = 0, top = 0, bottom = 0 } = this.insets || {};
    this.camera.setViewOffset(w, h, -left / 2, (bottom - top) / 2, w, h);
    this.camera.updateProjectionMatrix();
  }

  // ------------------------------------------------------------------ build
  /** Load a machine (filesystem) and the initial view state. */
  load(machine, view) {
    this.clearWorld();
    this.machine = machine;
    this.view = view;
    this.layout();
    for (const node of machine.fs.all()) this.buildObject(node);
    this.applyVisibility(view, { animate: false });
    this.rebuildTrail(view.cwd);
    this.placeCamera(view.cwd, true);
    this.setAmbience(0);
  }

  clearWorld() {
    this.tweens.length = 0;
    this.closeHologram(true);
    for (const g of [this.worldGroup, this.trailGroup, this.fxGroup]) {
      for (const child of [...g.children]) { g.remove(child); this.disposeTree(child); }
    }
    this.objects.clear();
  }

  disposeTree(obj) {
    obj.traverse((o) => {
      if (o.geometry && !Object.values(this.shared).includes(o.geometry)) o.geometry.dispose();
      const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
      for (const m of mats) {
        if (m.map && m.map !== this.shared.glow && m.map !== this.streamTex) m.map.dispose();
        m.dispose();
      }
    });
  }

  layout() {
    const { fs, home } = this.machine;
    const chain = new Set(pathChain(home));
    this.layoutInfo = new Map();
    const place = (node, pos, heading, depth) => {
      this.layoutInfo.set(node.path, { pos, heading, depth });
      if (node.type !== 'dir') return;
      const kids = sortNames([...node.children.keys()]).map((n) => node.children.get(n));
      const dirs = kids.filter((k) => k.type === 'dir');
      const files = kids.filter((k) => k.type === 'file');
      const onChain = chain.has(node.path) && node.path !== home;
      dirs.forEach((d, i) => {
        if (onChain) {
          if (!chain.has(d.path)) {
            // directories beside the path to home (none in our machines, but stay sane)
            const side = i % 2 ? 1 : -1;
            place(d, local(pos, heading, side * 16, 0, -10), heading + side * 0.8, depth + 1);
          } else place(d, local(pos, heading, 0, 0, -26), heading, depth + 1);
          return;
        }
        const n = dirs.length;
        const spread = Math.min(1.4, 0.5 * (n - 1));
        const a = n === 1 ? 0 : -spread / 2 + (spread * i) / (n - 1);
        const dist = [23, 19, 16, 14][Math.min(depth - this.homeDepth, 3)] ?? 14;
        const h = heading + a;
        place(d, local(pos, h, 0, 0, -dist), h, depth + 1);
      });
      const m = files.length;
      // files float in a gentle arc just in front of the platform
      const gap = 3.1;
      files.forEach((f, i) => {
        const x = m === 1 ? (dirs.length ? -3.2 : 0) : (i - (m - 1) / 2) * gap;
        const fp = local(pos, heading, x, 1.9, -6.2 + Math.abs(x) * 0.18);
        this.layoutInfo.set(f.path, { pos: fp, heading: heading + x * 0.03, depth: depth + 1 });
      });
    };
    this.homeDepth = pathChain(home).length - 1;
    place(fs.root, new THREE.Vector3(0, 0, 26 * this.homeDepth), 0, 0);
  }

  colorFor(node) {
    if (node.path.split('/').some((p) => p && isHidden(p))) return HIDDEN_COLOR;
    if (node.type === 'file') {
      const k = fileKind(node.name);
      return k === 'archive' ? '#ffb547' : k === 'log' ? '#7fd6ff' : '#c9fff0';
    }
    return hashColor(node.name);
  }

  buildObject(node) {
    const info = this.layoutInfo.get(node.path);
    const color = this.colorFor(node);
    const group = new THREE.Group();
    group.position.copy(info.pos);
    group.rotation.y = -info.heading;
    const mats = [];
    const track = (m, base) => { m.userData.base = base; m.transparent = true; mats.push(m); return m; };
    const rec = { node, group, mats, color, pos: info.pos, heading: info.heading, state: 'none', level: 0 };

    if (node.type === 'dir') {
      const isAncestor = pathChain(this.machine.home).includes(node.path) && node.path !== this.machine.home;
      const scale = isAncestor ? 0.62 : 1;
      group.scale.setScalar(scale);
      const base = new THREE.Mesh(this.shared.hexGeo, track(new THREE.MeshStandardMaterial({ color: '#0a1822', metalness: 0.55, roughness: 0.35, emissive: color, emissiveIntensity: 0.05 }), 0.92));
      base.position.y = 0;
      group.add(base);
      const edges = new THREE.LineSegments(this.shared.hexEdges, track(new THREE.LineBasicMaterial({ color }), 0.9));
      group.add(edges);
      const ring = new THREE.Mesh(this.shared.ringGeo, track(new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }), 0.32));
      ring.rotation.x = -Math.PI / 2; ring.position.y = 0.18;
      group.add(ring);
      rec.ring = ring;
      // portal arch at the back edge, facing the parent
      const arch = new THREE.Group();
      arch.position.set(0, 2.75, 2.5);
      const torus = new THREE.Mesh(this.shared.torusGeo, track(new THREE.MeshBasicMaterial({ color }), 0.95));
      arch.add(torus);
      const disc = new THREE.Mesh(this.shared.discGeo, track(new THREE.MeshBasicMaterial({ color, map: this.shared.glow, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }), 0.16));
      arch.add(disc);
      for (const x of [-2.6, 2.6]) {
        const p = new THREE.Mesh(this.shared.pillarGeo, track(new THREE.MeshStandardMaterial({ color: '#0d2230', emissive: color, emissiveIntensity: 0.35 }), 0.95));
        p.position.set(x, -0.45, 0);
        arch.add(p);
      }
      const lintel = new THREE.Mesh(this.shared.lintelGeo, track(new THREE.MeshStandardMaterial({ color: '#0d2230', emissive: color, emissiveIntensity: 0.5 }), 0.95));
      lintel.position.set(0, 1.85, 0);
      arch.add(lintel);
      group.add(arch);
      rec.torus = torus; rec.disc = disc; rec.arch = arch;
      const name = node.path === '/' ? '/' : `${node.name}/`;
      const label = makeLabel(name, color, { size: isAncestor ? 40 : 48 });
      label.position.set(0, 5.6, 2.5);
      track(label.material, 1);
      group.add(label);
      rec.label = label;
    } else {
      const kind = fileKind(node.name);
      const body = new THREE.Group();
      if (kind === 'archive') {
        body.add(new THREE.Mesh(this.shared.cubeGeo, track(new THREE.MeshStandardMaterial({ color: '#1d1608', emissive: color, emissiveIntensity: 0.18, metalness: 0.4, roughness: 0.4 }), 0.92)));
        body.add(new THREE.LineSegments(this.shared.cubeEdges, track(new THREE.LineBasicMaterial({ color }), 0.95)));
        for (const y of [-0.22, 0.22]) {
          const band = new THREE.Mesh(this.shared.bandGeo, track(new THREE.MeshBasicMaterial({ color }), 0.55));
          band.position.y = y;
          body.add(band);
        }
        body.rotation.y = 0.6;
      } else {
        body.add(new THREE.Mesh(this.shared.docGeo, track(new THREE.MeshStandardMaterial({ color: '#0b2029', emissive: color, emissiveIntensity: 0.12, metalness: 0.3, roughness: 0.25 }), 0.82)));
        body.add(new THREE.LineSegments(this.shared.docEdges, track(new THREE.LineBasicMaterial({ color }), 0.95)));
        for (let i = 0; i < 5; i++) {
          const l = new THREE.Mesh(this.shared.lineGeo, track(new THREE.MeshBasicMaterial({ color, depthWrite: false }), 0.6));
          l.scale.x = i === 4 ? 0.55 : 0.75 + ((i * 37) % 25) / 100;
          l.position.set(-0.4 + (l.scale.x * 0.8) / 2, 0.5 - i * 0.22, 0.035);
          body.add(l);
        }
      }
      group.add(body);
      rec.body = body;
      const label = makeLabel(node.name, color, { size: 38 });
      label.position.set(0, -1.25, 0);
      track(label.material, 1);
      group.add(label);
      rec.label = label;
      rec.phase = Math.random() * Math.PI * 2;
    }
    group.visible = false;
    this.worldGroup.add(group);
    this.objects.set(node.path, rec);
  }

  // ------------------------------------------------------------- visibility
  /** Near the learner: on the path to here, here, or anything inside here. */
  inFocus(path, cwd) {
    if (path === cwd || cwd.startsWith(path === '/' ? '/' : path + '/')) return true;
    return path.startsWith(cwd === '/' ? '/' : cwd + '/');
  }

  setLevel(rec, level) {
    rec.level = level;
    rec.group.visible = level > 0.001;
    for (const m of rec.mats) m.opacity = m.userData.base * level;
  }

  applyVisibility(view, { animate = true, reveal = null, keepArch = null } = {}) {
    let i = 0;
    for (const rec of this.objects.values()) {
      const next = visibilityOf(rec.node, view, this.machine.home);
      const cur = rec.state;
      rec.state = next;
      const isCurrent = rec.node.path === view.cwd;
      if (rec.node.type === 'dir') { rec.label.visible = !isCurrent; rec.arch.visible = !isCurrent || rec.node.path === keepArch; }
      const near = this.inFocus(rec.node.path, view.cwd);
      const to = next === 'shown' ? (near ? 1 : 0.26) : next === 'ghost' ? (near ? 0.09 : 0.04) : 0;
      rec.target = to;
      if (!animate) { this.setLevel(rec, to); continue; }
      if (next === 'shown' && (cur === 'none' || cur === 'ghost')) {
        const hidden = reveal === 'hidden' && isHidden(rec.node.name);
        this.materialize(rec, (i++) * 120, hidden, to);
      } else if (Math.abs(rec.level - to) > 0.005) {
        this.fadeTo(rec, to, 700);
      }
    }
  }

  fadeArch(rec) {
    const mats = [];
    rec.arch.traverse((o) => o.material && mats.push(o.material));
    this.tween(450, (k) => mats.forEach((m) => { m.opacity = m.userData.base * rec.level * (1 - k); }), 0, () => {
      rec.arch.visible = false;
      mats.forEach((m) => { m.opacity = m.userData.base * rec.level; });
    });
  }

  fadeTo(rec, to, dur) {
    const from = rec.level;
    this.tween(dur, (k) => this.setLevel(rec, from + (to - from) * k));
  }

  materialize(rec, delay, flicker, to = 1) {
    const g = rec.group;
    const baseY = rec.pos.y;
    const from = rec.level;
    this.tween(flicker ? 1300 : 800, (k) => {
      let lv = from + (to - from) * easeOut(k);
      if (flicker && k < 0.75) lv *= (Math.sin(k * 60) > 0.2 ? 0.9 : 0.25) * k + 0.05;
      this.setLevel(rec, lv);
      g.scale.setScalar((rec.node.type === 'dir' ? this.dirScale(rec) : 1) * (0.55 + 0.45 * easeOut(k)));
      g.position.y = baseY - 1.4 * (1 - easeOut(k));
    }, delay, () => { g.position.y = baseY; g.scale.setScalar(rec.node.type === 'dir' ? this.dirScale(rec) : 1); });
  }

  dirScale(rec) {
    const isAncestor = pathChain(this.machine.home).includes(rec.node.path) && rec.node.path !== this.machine.home;
    return isAncestor ? 0.62 : 1;
  }

  // ----------------------------------------------------------------- trail
  rebuildTrail(cwd) {
    for (const c of [...this.trailGroup.children]) { this.trailGroup.remove(c); this.disposeTree(c); }
    const chain = pathChain(cwd);
    const pts = chain.map((p) => {
      const info = this.layoutInfo.get(p);
      return info.pos.clone().setY(0.26);
    });
    if (pts.length === 1) pts.push(pts[0].clone().add(new THREE.Vector3(0, 0, 0.01)));
    // Lead in from just past each portal so the trail reads as a path you walked.
    this.trailCurve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    const geo = new THREE.TubeGeometry(this.trailCurve, Math.max(24, pts.length * 28), 0.11, 8, false);
    this.trailMat = new THREE.MeshBasicMaterial({ color: '#00f5a0', transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false });
    this.trailGroup.add(new THREE.Mesh(geo, this.trailMat));
    this.trailStops = [];
    chain.forEach((p, i) => {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.shared.glow, color: i === chain.length - 1 ? '#baffe6' : '#00f5a0', transparent: true, opacity: i === chain.length - 1 ? 0.95 : 0.6, depthWrite: false, blending: THREE.AdditiveBlending }));
      s.position.copy(pts[i]).setY(0.5);
      s.scale.setScalar(i === chain.length - 1 ? 1.7 : 1.4);
      if (i === chain.length - 1) s.material.opacity = 0.7;
      this.trailGroup.add(s);
      this.trailStops.push(s);
    });
    // "you are here" ring around the current platform
    const here = new THREE.Mesh(new THREE.RingGeometry(3.7, 3.95, 64), new THREE.MeshBasicMaterial({ color: '#baffe6', transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
    here.rotation.x = -Math.PI / 2;
    here.position.copy(this.layoutInfo.get(cwd).pos).setY(0.22);
    this.trailGroup.add(here);
    this.hereRing = here;
  }

  runTrailPulse(color = '#ffffff', dur = 1400) {
    if (!this.trailCurve) return;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.shared.glow, color, transparent: true, opacity: 1, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.scale.setScalar(2.2);
    this.fxGroup.add(s);
    this.tween(dur, (k) => { s.position.copy(this.trailCurve.getPointAt(ease(k))).setY(0.6); s.material.opacity = k > 0.85 ? (1 - k) / 0.15 : 1; },
      0, () => this.dropFx(s));
    const m = this.trailMat;
    this.tween(dur + 600, (k) => { m.opacity = 0.5 + 0.45 * Math.sin(Math.PI * k); });
  }

  // ---------------------------------------------------------------- camera
  viewFor(path) {
    const info = this.layoutInfo.get(path);
    const v = this.viewScale || 1;
    const node = this.machine.fs.get(path);
    const hasFilesOnly = node && [...node.children.values()].every((c) => c.type === 'file');
    // Inside a directory of files: stand close. Directories that lead elsewhere: an overview.
    if (hasFilesOnly) {
      return {
        pos: local(info.pos, info.heading, 0, 6.2 + (v - 1) * 2.5, 7.6 + (v - 1) * 7),
        target: local(info.pos, info.heading, 0, 1.2, -7),
      };
    }
    return {
      pos: local(info.pos, info.heading, 0, 8.8 + (v - 1) * 4, 9.5 + (v - 1) * 10),
      target: local(info.pos, info.heading, 0, 0.6, -16),
    };
  }

  placeCamera(path, instant) {
    const v = this.viewFor(path);
    if (instant) {
      this.camera.position.copy(v.pos);
      this.camTarget.copy(v.target);
      this.camera.lookAt(this.camTarget);
      this.restPos = v.pos.clone();
    }
    return v;
  }

  travel(from, to, direction) {
    const start = this.camera.position.clone();
    const startT = this.camTarget.clone();
    const end = this.viewFor(to);
    const pts = [start];
    if (direction === 'into') {
      const d = this.layoutInfo.get(to);
      pts.push(local(d.pos, d.heading, 0, 2.9, 8.5), local(d.pos, d.heading, 0, 2.8, 2.6));
    } else if (direction === 'up') {
      const d = this.layoutInfo.get(from);
      pts.push(local(d.pos, d.heading, 0, 2.8, 2.6), local(d.pos, d.heading, 0, 3.6, 9));
    } else {
      const mid = start.clone().lerp(end.pos, 0.5);
      mid.y += 10;
      pts.push(mid);
    }
    pts.push(end.pos);
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    const dur = (direction === 'jump' ? 2300 : 1900) * this.speed;
    this.cameraBusy = true;
    return new Promise((resolve) => {
      if (this.reduced) {
        // reduced motion: a short fade-through instead of a flight
        this.container.classList.add('fade-cut');
        setTimeout(() => {
          this.camera.position.copy(end.pos); this.camTarget.copy(end.target);
          this.restPos = end.pos.clone(); this.cameraBusy = false;
          this.container.classList.remove('fade-cut'); resolve();
        }, 180);
        return;
      }
      this.tween(dur, (k) => {
        const e = ease(k);
        this.camera.position.copy(curve.getPointAt(e));
        this.camTarget.lerpVectors(startT, end.target, ease(Math.min(1, k * 1.15)));
      }, 0, () => { this.restPos = end.pos.clone(); this.cameraBusy = false; resolve(); });
    });
  }

  // ----------------------------------------------------------------- effects
  tween(dur, update, delay = 0, done) {
    const t = { start: performance.now() + delay * this.speed, dur: Math.max(1, dur * this.speed), update, done };
    this.tweens.push(t);
    return t;
  }

  dropFx(obj) { this.fxGroup.remove(obj); this.disposeTree(obj); }

  ringPulse(center, color, { radius = 26, dur = 1400, y = 0.3, width = 0.35, segments = 64 } = {}) {
    const geo = new THREE.RingGeometry(1 - width / 2, 1 + width / 2, segments);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
    const ring = new THREE.Mesh(geo, mat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.copy(center).setY(y);
    this.fxGroup.add(ring);
    this.tween(dur, (k) => { const r = 0.5 + radius * easeOut(k); ring.scale.set(r, r, 1); mat.opacity = 0.9 * (1 - k); }, 0, () => this.dropFx(ring));
  }

  flashRecord(rec, color, dur = 900) {
    if (!rec) return;
    const mats = rec.mats.filter((m) => m.color);
    const originals = mats.map((m) => m.color.clone());
    const target = new THREE.Color(color);
    this.tween(dur, (k) => {
      const w = Math.sin(Math.PI * k);
      mats.forEach((m, i) => m.color.copy(originals[i]).lerp(target, w * 0.85));
    }, 0, () => mats.forEach((m, i) => m.color.copy(originals[i])));
  }

  shake(rec, dur = 520) {
    if (!rec) return;
    const base = rec.group.position.clone();
    this.tween(dur, (k) => { rec.group.position.x = base.x + Math.sin(k * 40) * 0.22 * (1 - k); }, 0, () => rec.group.position.copy(base));
  }

  cssPulse(cls, ms) {
    this.container.classList.remove(cls);
    void this.container.offsetWidth;
    this.container.classList.add(cls);
    clearTimeout(this['t_' + cls]);
    this['t_' + cls] = setTimeout(() => this.container.classList.remove(cls), ms);
  }

  floatBanner(text, at, color = '#baffe6', ms = 5200) {
    if (this.banner) { this.dropFx(this.banner); this.banner = null; }
    const s = makeLabel(text, color, { size: 64, weight: 700, bg: 'rgba(2,12,10,0.8)' });
    s.position.copy(at);
    s.material.opacity = 0;
    this.fxGroup.add(s);
    this.banner = s;
    const sx = s.scale.x, sy = s.scale.y;
    this.tween(ms, (k) => {
      s.material.opacity = k < 0.12 ? k / 0.12 : k > 0.85 ? (1 - k) / 0.15 : 1;
      const grow = 0.85 + 0.15 * easeOut(Math.min(1, k * 6));
      s.scale.set(sx * grow, sy * grow, 1);
    }, 0, () => { if (this.banner === s) { this.dropFx(s); this.banner = null; } });
  }

  errorGhost(at, heading, kind = 'dir') {
    const group = new THREE.Group();
    group.position.copy(at);
    group.rotation.y = -heading;
    const mat = new THREE.LineBasicMaterial({ color: ERROR_COLOR, transparent: true, opacity: 0.9 });
    const geo = kind === 'dir' ? this.shared.hexEdges : this.shared.docEdges;
    const a = new THREE.LineSegments(geo, mat);
    group.add(a);
    if (kind === 'dir') {
      const t = new THREE.Mesh(this.shared.torusGeo, new THREE.MeshBasicMaterial({ color: ERROR_COLOR, transparent: true, opacity: 0.7, wireframe: true }));
      t.position.set(0, 2.75, 2.5);
      group.add(t);
    }
    this.fxGroup.add(group);
    this.tween(1500, (k) => {
      const glitch = Math.sin(k * 90) > 0.3 ? 1 : 0.3;
      group.traverse((o) => { if (o.material) o.material.opacity = 0.85 * (1 - k) * glitch; });
      group.scale.set(1 + Math.sin(k * 70) * 0.06, 1 - 0.4 * k, 1 + Math.cos(k * 50) * 0.06);
      group.position.x = at.x + (Math.random() - 0.5) * 0.25 * (1 - k);
    }, 0, () => this.dropFx(group));
  }

  // ---------------------------------------------------------------- hologram
  openHologram(path, content) {
    this.closeHologram(true);
    const rec = this.objects.get(path);
    const lines = [];
    for (const raw of content.split('\n')) {
      if (raw.length <= 46) { lines.push(raw); continue; }
      let rest = raw;
      while (rest.length > 46) { const cut = rest.lastIndexOf(' ', 46) > 10 ? rest.lastIndexOf(' ', 46) : 46; lines.push(rest.slice(0, cut)); rest = rest.slice(cut).trimStart(); }
      lines.push(rest);
    }
    const W = 1024, lh = 52, pad = 56, head = 86;
    const H = head + pad + lines.length * lh + pad * 0.6;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d');
    const color = rec?.color || '#c9fff0';
    ctx.fillStyle = 'rgba(4,16,20,0.9)';
    ctx.beginPath(); ctx.roundRect(2, 2, W - 4, H - 4, 26); ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.globalAlpha = 0.8; ctx.stroke(); ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(2, 2, W - 4, head);
    ctx.font = '600 30px "JetBrains Mono", ui-monospace, monospace';
    ctx.fillStyle = color; ctx.fillText(`▤ ${path.split('/').pop()}`, pad * 0.7, 54);
    ctx.fillStyle = 'rgba(201,255,240,0.5)'; ctx.textAlign = 'right'; ctx.fillText('cat', W - pad * 0.7, 54); ctx.textAlign = 'left';
    ctx.font = '400 34px "JetBrains Mono", ui-monospace, monospace';
    ctx.fillStyle = '#eafff8';
    lines.forEach((l, i) => ctx.fillText(l, pad, head + pad + i * lh));
    const tex = new THREE.CanvasTexture(c);
    crispText(tex);
    const width = 5.4;
    const height = width * (H / W);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthTest: false, fog: false }));
    mesh.renderOrder = 20;
    const dir = new THREE.Vector3().subVectors(this.camTarget, this.camera.position).normalize();
    const pos = this.camera.position.clone().addScaledVector(dir, 6.6);
    pos.y += 0.35;
    mesh.position.copy(pos);
    mesh.lookAt(this.camera.position);
    this.fxGroup.add(mesh);
    this.holo = mesh;
    // the file object flies toward the hologram, then the document unfolds
    if (rec) {
      const start = rec.group.position.clone();
      const mid = start.clone().lerp(pos, 0.7);
      rec.flying = true;
      this.tween(650, (k) => { rec.group.position.lerpVectors(start, mid, ease(k)); rec.group.rotation.y = -rec.heading + k * Math.PI * 2; }, 0, () => {
        this.tween(500, (k) => this.setLevel(rec, 1 - k * 0.85));
      });
      this.holoReturn = () => { rec.group.position.copy(start); rec.group.rotation.y = -rec.heading; rec.flying = false; this.setLevel(rec, rec.target ?? 1); };
    }
    this.tween(700, (k) => { const e = easeOut(k); mesh.scale.set(0.6 + 0.4 * e, 0.05 + 0.95 * e, 1); mesh.material.opacity = Math.min(1, k * 1.6); }, rec ? 420 : 0);
  }

  closeHologram(instant = false) {
    const m = this.holo;
    if (!m) return;
    this.holo = null;
    const ret = this.holoReturn; this.holoReturn = null;
    if (instant) { this.dropFx(m); ret?.(); return; }
    this.tween(260, (k) => { m.material.opacity = 1 - k; m.scale.y = 1 - 0.9 * k; }, 0, () => { this.dropFx(m); ret?.(); });
  }

  get hologramOpen() { return !!this.holo; }

  setAmbience(level) {
    // 0 = normal, 1 = the "machine wakes up" finale
    this.ambient.intensity = 0.6 + level * 1.4;
    this.scene.fog.density = 0.02 - level * 0.009;
    this.particles.material.opacity = 0.55 + level * 0.35;
    this.grid.material.opacity = 0.22 + level * 0.2;
  }

  // ------------------------------------------------------------ react to events
  /** React to a shell event. `view` is the already-updated shared state. */
  async react(event, view) {
    this.view = view;
    const cwdRec = this.objects.get(view.cwd);
    const here = this.layoutInfo.get(view.cwd).pos;
    if (event.type !== 'noop' && event.type !== 'clear') this.closeHologram();

    switch (event.type) {
      case 'pwd': {
        this.ringPulse(here, '#00f5a0', { radius: 30, dur: 1600, width: 0.25 });
        this.flashRecord(cwdRec, '#ffffff', 1100);
        this.runTrailPulse('#d9fff0', 1500);
        const at = local(here, this.layoutInfo.get(view.cwd).heading, 0, 4.4, -6.5);
        this.floatBanner(`📍 ${event.path}`, at);
        this.hereRing && this.tween(1400, (k) => { this.hereRing.material.opacity = 0.55 + 0.45 * Math.sin(Math.PI * k); });
        break;
      }
      case 'ls': {
        if (event.file) { this.flashRecord(this.objects.get(event.path), '#ffffff', 700); break; }
        const center = this.layoutInfo.get(event.path).pos;
        if (event.all) {
          this.cssPulse('glitch', 520);
          this.ringPulse(center, HIDDEN_COLOR, { radius: 34, dur: 1800, width: 0.5, segments: 6 });
          setTimeout(() => this.ringPulse(center, '#00cfff', { radius: 30, dur: 1500, width: 0.2 }), 180 * this.speed);
        } else {
          this.ringPulse(center, '#00cfff', { radius: 30, dur: 1500, width: 0.2 });
          this.ringPulse(center, '#00cfff', { radius: 18, dur: 1100, width: 0.12 });
        }
        const before = new Map([...this.objects].map(([p, r]) => [p, r.state]));
        this.applyVisibility(view, { animate: true, reveal: event.all ? 'hidden' : null });
        // entries that were already visible acknowledge the scan with a short glow
        for (const p of event.entries) {
          if (before.get(p) === 'shown') this.flashRecord(this.objects.get(p), event.all ? HIDDEN_COLOR : '#00cfff', 700);
        }
        break;
      }
      case 'cd': {
        if (event.direction === 'stay') { this.ringPulse(here, '#00f5a0', { radius: 6, dur: 600 }); break; }
        const dest = this.objects.get(event.to);
        if (dest?.disc) {
          dest.spin = 1;
          this.tween(900, (k) => { dest.disc.material.opacity = dest.disc.material.userData.base * dest.level + 0.7 * Math.sin(Math.PI * Math.min(1, k * 1.3)); });
          this.flashRecord(dest, '#ffffff', 900);
        }
        if (event.direction === 'up') this.runTrailPulse('#00f5a0', 900);
        this.applyVisibility(view, { animate: true, keepArch: event.direction === 'into' ? event.to : null });
        this.rebuildTrail(view.cwd);
        await this.travel(event.from, event.to, event.direction);
        if (dest) { dest.spin = 0; if (dest.arch) this.fadeArch(dest); }
        this.ringPulse(this.layoutInfo.get(view.cwd).pos, '#00f5a0', { radius: 7, dur: 900 });
        break;
      }
      case 'cat': {
        for (const f of event.files.slice(0, -1)) this.flashRecord(this.objects.get(f.path), '#ffffff', 600);
        this.openHologram(event.path, event.content);
        break;
      }
      case 'error': {
        this.cssPulse('warn', 650);
        if (event.reason === 'not-found' && event.target) {
          const parent = this.layoutInfo.get(parentOf(event.target)) ? parentOf(event.target) : view.cwd;
          const info = this.layoutInfo.get(parent);
          if (event.cmd === 'cd' || event.cmd === 'ls') {
            this.errorGhost(local(info.pos, info.heading, 2.5, 0, -15), info.heading + 0.15, 'dir');
          } else {
            this.errorGhost(local(info.pos, info.heading, -1.5, 1.9, -5.2), info.heading, 'file');
          }
        } else if (event.target && this.objects.get(event.target)) {
          const rec = this.objects.get(event.target);
          if (rec.state === 'shown') { this.shake(rec); this.flashRecord(rec, ERROR_COLOR, 700); }
        } else {
          this.ringPulse(here, ERROR_COLOR, { radius: 5, dur: 600, width: 0.2 });
        }
        break;
      }
      default: break;
    }
  }

  finale() {
    const from = 0;
    this.tween(2600, (k) => this.setAmbience(from + easeOut(k)));
    this.runTrailPulse('#ffffff', 2200);
    if (this.trailMat) this.tween(2600, (k) => { this.trailMat.opacity = 0.5 + 0.45 * easeOut(k); });
    const here = this.layoutInfo.get(this.view.cwd).pos;
    this.ringPulse(here, '#baffe6', { radius: 60, dur: 3200, width: 0.15 });
    for (const rec of this.objects.values()) if (rec.state === 'shown') this.flashRecord(rec, '#ffffff', 1800);
  }

  // ------------------------------------------------------------------ frame
  frame() {
    const now = performance.now();
    const t = this.clock.getElapsedTime();
    for (let i = this.tweens.length - 1; i >= 0; i--) {
      const tw = this.tweens[i];
      if (now < tw.start) continue;
      const k = Math.min(1, (now - tw.start) / tw.dur);
      tw.update(k);
      if (k >= 1) { this.tweens.splice(i, 1); tw.done?.(); }
    }
    if (!this.reduced) {
      this.particles.rotation.y = t * 0.006;
      this.particles.position.y = Math.sin(t * 0.2) * 0.6;
      this.streamTex.offset.y = -t * 0.25;
    }
    for (const rec of this.objects.values()) {
      if (!rec.group.visible) continue;
      if (rec.torus) rec.torus.rotation.z += (rec.spin ? 0.12 : 0.004) * (this.reduced ? 0.2 : 1);
      if (rec.body && !rec.flying && !this.reduced) {
        rec.group.position.y = rec.pos.y + Math.sin(t * 1.1 + rec.phase) * 0.12;
        rec.body.rotation.y = (fileKind(rec.node.name) === 'archive' ? 0.6 : 0) + Math.sin(t * 0.5 + rec.phase) * 0.18;
      }
    }
    if (this.restPos && !this.cameraBusy) {
      this.camera.position.copy(this.restPos);
      if (!this.reduced) { this.camera.position.y += Math.sin(t * 0.35) * 0.07; this.camera.position.x += Math.sin(t * 0.22) * 0.05; }
    }
    this.camera.lookAt(this.camTarget);
    if (this.holo) this.holo.lookAt(this.camera.position);
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.onResize);
    this.clearWorld();
    this.disposeTree(this.scene);
    for (const v of Object.values(this.shared)) v.dispose?.();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
