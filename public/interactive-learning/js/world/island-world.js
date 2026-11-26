// "The Archive Islands": an illustrated skin for the 3D world. Same behaviour
// as World (layout, visibility, camera, reactions); only the look changes:
// every directory is a floating rock island with a folder-shaped house whose
// glowing door the camera flies through on `cd`. Files are paper sheets and
// crates. Bridges join each island to its parent.

import { World, THREE, makeLabel, radialTexture, shapeOf, crispText } from './world.js';
import { fileKind, isHidden } from '../fs/filesystem.js';
import { isHomeAncestor, HIDDEN_COLOR } from './layout.js';

const R = 5;                 // island top radius (local units)
const WARM = '#ffc47a';
const CREAM = '#efe2c6';
const SKY = '#140d2c';

// deterministic randomness: the same directory always gets the same island
function seeded(str) {
  let h = 2166136261;
  for (const ch of str) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}
// position-based noise, so duplicated seam vertices move together (no cracks)
const noise = (x, y, z, s) => {
  const v = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + s * 4.1) * 43758.5453;
  return v - Math.floor(v);
};

/** The folder house: a folder outline with a tab, and an arched door. */
function houseShape() {
  const s = shapeOf([[-3, 0], [3, 0], [3, 5.3], [-0.5, 5.3], [-0.95, 5.95], [-2.75, 5.95], [-3, 5.7]]);
  const door = new THREE.Path();
  door.moveTo(-1.35, 0.18);
  door.lineTo(1.35, 0.18);
  door.lineTo(1.35, 2.95);
  door.absarc(0, 2.95, 1.35, 0, Math.PI, false);
  door.lineTo(-1.35, 0.18);
  s.holes.push(door);
  return s;
}

function signTexture(text, ink) {
  const size = 120;
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  const font = `800 ${size}px Manrope, system-ui, sans-serif`;
  ctx.font = font;
  c.width = Math.ceil(ctx.measureText(text).width) + 40;
  c.height = size + 40;
  ctx.font = font;
  ctx.fillStyle = ink;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 20, c.height / 2 + 4);
  return { tex: crispText(new THREE.CanvasTexture(c)), aspect: c.width / c.height };
}

function streakTexture() {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgba(160,215,255,0.25)';
  ctx.fillRect(0, 0, 64, 256);
  for (let i = 0; i < 40; i++) {
    const x = (i * 37) % 64, y = (i * 91) % 256, h = 30 + ((i * 53) % 70);
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(235,248,255,0.95)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(x, y, 2 + (i % 3), h);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function skyTexture() {
  const c = document.createElement('canvas');
  c.width = 4; c.height = 512;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, '#060512'); g.addColorStop(0.45, '#160f33'); g.addColorStop(0.7, '#2a1a4d'); g.addColorStop(1, '#120a26');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 4, 512);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export class IslandWorld extends World {
  constructor(container, opts) {
    super(container, opts);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
  }

  buildEnvironment() {
    const s = this.scene;
    s.background = skyTexture();
    s.fog = new THREE.FogExp2(SKY, 0.0125);

    s.add(new THREE.HemisphereLight('#9a88ff', '#24142e', 1.5));
    const moon = new THREE.DirectionalLight('#e4dcff', 1.6);
    moon.position.set(-18, 30, 16);
    s.add(moon);
    this.ambient = new THREE.AmbientLight('#3a2c60', 0.7);
    s.add(this.ambient);
    // a warm lamp that follows you from island to island
    this.lamp = new THREE.PointLight(WARM, 90, 34, 1.4);
    s.add(this.lamp);

    // stars: one draw call on a far dome
    const stars = new Float32Array(1400 * 3);
    for (let i = 0; i < 1400; i++) {
      const a = Math.random() * Math.PI * 2, e = Math.random() * 1.2 - 0.15, r = 190;
      stars[i * 3] = Math.cos(a) * Math.cos(e) * r;
      stars[i * 3 + 1] = Math.sin(e) * r;
      stars[i * 3 + 2] = Math.sin(a) * Math.cos(e) * r;
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(stars, 3));
    s.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: '#e8e0ff', size: 0.9, map: this.shared.glow, transparent: true, opacity: 0.8, depthWrite: false, fog: false, blending: THREE.AdditiveBlending })));

    // fireflies drifting between the islands
    const n = this.reduced ? 160 : 380;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 160;
      pos[i * 3 + 1] = Math.random() * 22 - 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 160 - 20;
    }
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.particles = new THREE.Points(pg, new THREE.PointsMaterial({ color: '#ffd59a', size: 0.32, map: this.shared.glow, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.add(this.particles);

    // floating debris and far-off islands
    const rng = seeded('debris');
    const rock = new THREE.IcosahedronGeometry(1, 0);
    const dm = new THREE.MeshStandardMaterial({ color: '#3b3352', roughness: 1, flatShading: true });
    const count = 70;
    this.debris = new THREE.InstancedMesh(rock, dm, count);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(), p = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      const far = i < 10;
      const a = rng() * Math.PI * 2, d = far ? 90 + rng() * 60 : 18 + rng() * 90;
      p.set(Math.cos(a) * d, far ? -18 + rng() * 22 : -16 + rng() * 34, Math.sin(a) * d - 30);
      e.set(rng() * 3, rng() * 3, rng() * 3); q.setFromEuler(e);
      const k = far ? 8 + rng() * 10 : 0.2 + rng() * rng() * 1.6;
      sc.set(k, k * (0.6 + rng() * 0.8), k);
      this.debris.setMatrixAt(i, m.compose(p, q, sc));
    }
    s.add(this.debris);

    // soft purple mist far below, so the islands read as floating
    const mist = new THREE.SpriteMaterial({ map: this.shared.glow, color: '#5b3c9a', transparent: true, opacity: 0.22, depthWrite: false, fog: false });
    for (let i = 0; i < 9; i++) {
      const sp = new THREE.Sprite(mist);
      sp.position.set((rng() - 0.5) * 220, -34 - rng() * 10, -40 - rng() * 120);
      sp.scale.setScalar(70 + rng() * 60);
      s.add(sp);
    }

    // waterfalls share one scrolling texture (World.frame scrolls streamTex)
    this.streamTex = streakTexture();
    this.shared.paperGeo = new THREE.BoxGeometry(1.2, 1.5, 0.05);
    this.shared.crateGeo = new THREE.BoxGeometry(1, 1, 1);
    this.shared.trunkGeo = new THREE.CylinderGeometry(0.1, 0.17, 1.5, 5);
    this.shared.leafGeo = new THREE.IcosahedronGeometry(0.85, 0);
    this.shared.stoneGeo = new THREE.IcosahedronGeometry(0.35, 0);
    this.shared.postGeo = new THREE.BoxGeometry(0.1, 1.3, 0.1);
    this.shared.bulbGeo = new THREE.SphereGeometry(0.13, 8, 6);
    this.shared.plankGeo = new THREE.BoxGeometry(1.8, 0.12, 0.48);
    this.shared.fallGeo = new THREE.PlaneGeometry(0.9, 9);

    this.trailGroup = new THREE.Group(); s.add(this.trailGroup);
    this.worldGroup = new THREE.Group(); s.add(this.worldGroup);
    this.fxGroup = new THREE.Group(); s.add(this.fxGroup);
  }

  setAmbience(level) {
    this.ambient.intensity = 0.7 + level * 1.2;
    this.scene.fog.density = 0.0125 - level * 0.005;
    this.particles.material.opacity = 0.7 + level * 0.3;
    this.renderer.toneMappingExposure = 1.15 + level * 0.25;
  }

  /** Fully visible objects render opaque (correct depth); fading ones blend. */
  setLevel(rec, level) {
    rec.level = level;
    rec.group.visible = level > 0.001;
    for (const m of rec.mats) {
      m.opacity = m.userData.base * level;
      m.transparent = m.userData.blend || m.opacity < 0.999;
    }
  }

  rebuildTrail(cwd) {
    super.rebuildTrail(cwd);
    this.trailMat.color.set('#ffd27a');
    this.trailStops.forEach((s) => s.material.color.set('#ffe3ad'));
    this.hereRing.material.color.set('#ffe3ad');
    this.hereRing.material.opacity = 0.35;
    const p = this.layoutInfo.get(cwd).pos;
    this.lamp.position.set(p.x, p.y + 5, p.z + 2);
  }

  async react(event, view) {
    const r = super.react(event, view);
    if (event.type === 'cd') {
      // the lamp drifts to the new island while the camera flies
      const p = this.layoutInfo.get(view.cwd).pos;
      const from = this.lamp.position.clone();
      const to = new THREE.Vector3(p.x, p.y + 5, p.z + 2);
      this.tween(1800, (k) => this.lamp.position.lerpVectors(from, to, k));
    }
    return r;
  }

  buildObject(node) {
    if (node.type !== 'dir') return this.buildPaper(node);
    const info = this.layoutInfo.get(node.path);
    const rng = seeded(node.path);
    const hidden = node.path.split('/').some((p) => p && isHidden(p));
    const color = hidden ? HIDDEN_COLOR : WARM;
    const group = new THREE.Group();
    group.position.copy(info.pos);
    group.rotation.y = -info.heading;
    const mats = [];
    const track = (m, base = 1, blend = false) => { m.userData.base = base; m.userData.blend = blend; m.transparent = blend; mats.push(m); return m; };
    const glow = (c, op) => track(new THREE.SpriteMaterial({ map: this.shared.glow, color: c, depthWrite: false, blending: THREE.AdditiveBlending }), op, true);
    const rec = { node, group, mats, color, pos: info.pos, heading: info.heading, state: 'none', level: 0 };
    const ancestor = isHomeAncestor(this.machine, node.path);
    group.scale.setScalar(ancestor ? 0.62 : 1);
    const seedN = rng() * 100;

    // --- the rock: an irregular inverted cone, flat-shaded
    const H = 6.2 + rng() * 2;
    const rockGeo = new THREE.CylinderGeometry(R * 0.97, 0.4, H, 11, 6);
    rockGeo.translate(0, -H / 2 - 0.35, 0);
    const pa = rockGeo.attributes.position;
    for (let i = 0; i < pa.count; i++) {
      const x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i);
      if (y > -0.4) continue; // keep the top ring flush with the soil
      const n = noise(x, y, z, seedN);
      const k = 0.78 + n * 0.45;
      pa.setXYZ(i, x * k, y + (noise(z, x, y, seedN) - 0.5) * 0.9, z * k);
    }
    rockGeo.computeVertexNormals();
    group.add(new THREE.Mesh(rockGeo, track(new THREE.MeshStandardMaterial({ color: hidden ? '#3d3060' : '#3f3852', roughness: 0.95, flatShading: true }))));

    // --- soil cap with moss
    const soil = new THREE.CylinderGeometry(R + 0.25, R - 0.15, 0.75, 16, 1);
    soil.translate(0, -0.375, 0);
    const sa = soil.attributes.position;
    for (let i = 0; i < sa.count; i++) {
      const x = sa.getX(i), y = sa.getY(i), z = sa.getZ(i);
      const a = Math.atan2(z, x);
      const k = 1 + (noise(Math.cos(a), 0, Math.sin(a), seedN) - 0.5) * 0.16;
      sa.setXYZ(i, x * k, y, z * k);
    }
    soil.computeVertexNormals();
    group.add(new THREE.Mesh(soil, track(new THREE.MeshStandardMaterial({ color: hidden ? '#46386e' : '#36513f', roughness: 1, flatShading: true }))));

    // a few stones on the grass
    const stoneMat = track(new THREE.MeshStandardMaterial({ color: '#6c6480', roughness: 1, flatShading: true }));
    for (let i = 0; i < 4; i++) {
      const st = new THREE.Mesh(this.shared.stoneGeo, stoneMat);
      const a = rng() * Math.PI * 2, d = 2 + rng() * 2.6;
      st.position.set(Math.cos(a) * d, 0.08, Math.sin(a) * d);
      st.scale.set(1 + rng(), 0.5 + rng() * 0.5, 1 + rng());
      st.rotation.y = rng() * 3;
      group.add(st);
    }

    // --- blossom trees at the sides
    const leafCols = hidden ? ['#8f6bff', '#b59bff'] : ['#c58be8', '#e3a6f2', '#a374d6'];
    const trunkMat = track(new THREE.MeshStandardMaterial({ color: '#4a3528', roughness: 1 }));
    const nTrees = 2 + Math.floor(rng() * 2);
    const slots = [[-4.1, -0.6], [4.1, -1.2], [-3.4, -3.1], [3.3, -3.4]].sort(() => rng() - 0.5).slice(0, nTrees);
    for (const [x, z] of slots) {
      const tree = new THREE.Group();
      tree.position.set(x, 0, z);
      const k = 0.8 + rng() * 0.5;
      tree.scale.setScalar(k);
      const trunk = new THREE.Mesh(this.shared.trunkGeo, trunkMat);
      trunk.position.y = 0.75;
      tree.add(trunk);
      const leafMat = track(new THREE.MeshStandardMaterial({ color: leafCols[Math.floor(rng() * leafCols.length)], roughness: 0.8, flatShading: true, emissive: '#5a2a7a', emissiveIntensity: 0.35 }));
      for (let i = 0; i < 3; i++) {
        const leaf = new THREE.Mesh(this.shared.leafGeo, leafMat);
        leaf.position.set((rng() - 0.5) * 0.9, 1.75 + rng() * 0.6, (rng() - 0.5) * 0.9);
        leaf.scale.setScalar(0.7 + rng() * 0.45);
        leaf.rotation.set(rng() * 3, rng() * 3, 0);
        tree.add(leaf);
      }
      group.add(tree);
    }

    // --- a waterfall off the edge on some islands
    if (rng() < 0.55 && !ancestor) {
      const a = Math.PI * (0.6 + rng() * 0.8) * (rng() < 0.5 ? 1 : -1);
      const fall = new THREE.Mesh(this.shared.fallGeo, track(new THREE.MeshBasicMaterial({ map: this.streamTex, color: '#bfe4ff', side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }), 0.75, true));
      fall.position.set(Math.sin(a) * (R + 0.3), -4.7, Math.cos(a) * (R + 0.3));
      fall.rotation.y = a;
      group.add(fall);
      const mist = new THREE.Sprite(glow('#b9dcff', 0.35));
      mist.position.set(Math.sin(a) * (R + 0.3), -9.2, Math.cos(a) * (R + 0.3));
      mist.scale.setScalar(3.2);
      group.add(mist);
    }

    // --- the folder house (the "portal": the camera flies through its door)
    const arch = new THREE.Group();
    arch.position.set(0, 0, 2.5);
    const folderCol = hidden ? '#cdb6ff' : ancestor ? '#d8d0c2' : CREAM;
    const houseGeo = new THREE.ExtrudeGeometry(houseShape(), { depth: 1.7, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.1, bevelSegments: 2, curveSegments: 14 });
    houseGeo.translate(0, 0, -0.75);
    const house = new THREE.Mesh(houseGeo, track(new THREE.MeshStandardMaterial({ color: folderCol, roughness: 0.8, emissive: hidden ? '#3b1f7a' : '#3a2610', emissiveIntensity: 0.25 })));
    arch.add(house);
    // a second, taller sheet behind it: layered like a real folder
    const backGeo = new THREE.ExtrudeGeometry(shapeOf([[-3.2, 0], [3.2, 0], [3.2, 6.3], [2.9, 6.55], [1.2, 6.55], [0.8, 6.0], [-3.2, 6.0]]), { depth: 0.35, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 1 });
    backGeo.translate(0, 0, -1.6);
    arch.add(new THREE.Mesh(backGeo, track(new THREE.MeshStandardMaterial({ color: hidden ? '#a58ce6' : '#d7c39f', roughness: 0.85, emissive: '#2a1a08', emissiveIntensity: 0.2 }))));
    // warm light inside the doorway
    const inner = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 4.3), track(new THREE.MeshBasicMaterial({ color: hidden ? '#b48cff' : '#ffb466' }), 0.95));
    inner.position.set(0, 2.15, -0.9);
    arch.add(inner);
    const disc = new THREE.Sprite(glow(hidden ? '#a98bff' : '#ffc27a', 0.75));
    disc.position.set(0, 2.2, 0.6);
    disc.scale.set(5, 6, 1);
    arch.add(disc);
    // little papers stacked inside
    const paperMat = track(new THREE.MeshStandardMaterial({ color: '#fff3dc', roughness: 0.9, emissive: '#6a4a20', emissiveIntensity: 0.4 }));
    for (let i = 0; i < 4; i++) {
      const pp = new THREE.Mesh(this.shared.paperGeo, paperMat);
      pp.scale.setScalar(0.4);
      pp.position.set(-0.7 + i * 0.45, 0.55 + (i % 2) * 0.35, -0.5);
      pp.rotation.set(-0.3, (rng() - 0.5) * 0.8, (rng() - 0.5) * 0.6);
      arch.add(pp);
    }
    // name carved on the front, above the door
    const name = node.path === '/' ? '/' : node.name;
    const { tex, aspect } = signTexture(name, hidden ? '#3a1f78' : '#4b3622');
    const h = Math.min(0.95, 5.4 / aspect);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(h * aspect, h), track(new THREE.MeshBasicMaterial({ map: tex, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }), 1, true));
    sign.position.set(0, 4.75, 1.08);
    arch.add(sign);
    // lanterns either side of the door
    for (const x of [-3.6, 3.6]) {
      const post = new THREE.Mesh(this.shared.postGeo, trunkMat);
      post.position.set(x, 0.65, 1.3);
      arch.add(post);
      const bulb = new THREE.Mesh(this.shared.bulbGeo, track(new THREE.MeshBasicMaterial({ color: '#ffe0a8' })));
      bulb.position.set(x, 1.38, 1.3);
      arch.add(bulb);
      const halo = new THREE.Sprite(glow(color, 0.8));
      halo.position.copy(bulb.position);
      halo.scale.setScalar(1.9);
      arch.add(halo);
    }
    group.add(arch);


    // --- a plank bridge back to the parent island
    const parent = node.parent && this.layoutInfo.get(node.parent.path);
    if (parent) rec.bridge = this.addBridge(group, info, parent, ancestor ? 0.62 : 1, isHomeAncestor(this.machine, node.parent.path) ? 0.62 : 1, track, glow);

    rec.arch = arch; rec.disc = disc; rec.label = sign; rec.sign = sign;
    group.visible = false;
    this.worldGroup.add(group);
    this.objects.set(node.path, rec);
  }

  addBridge(group, info, parent, myScale, parentScale, track, glow) {
    const dx = parent.pos.x - info.pos.x, dz = parent.pos.z - info.pos.z;
    const dist = Math.hypot(dx, dz);
    const span = (dist - R * parentScale * 0.92) / myScale - R * 0.92;
    if (span < 0.5) return;
    // world direction -> this group's local frame (group.rotation.y = -heading)
    const s = Math.sin(info.heading), c = Math.cos(info.heading);
    const lx = dx * c + dz * s, lz = -dx * s + dz * c;
    const bridge = new THREE.Group();
    bridge.rotation.y = Math.atan2(lx, lz);
    const n = Math.max(2, Math.min(70, Math.round(span / 0.62)));
    const sag = Math.min(1.1, span * 0.05);
    const planks = new THREE.InstancedMesh(this.shared.plankGeo, track(new THREE.MeshStandardMaterial({ color: '#7a5637', roughness: 0.95, emissive: '#2a1606', emissiveIntensity: 0.3 })), n);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), one = new THREE.Vector3(1, 1, 1), p = new THREE.Vector3();
    const yAt = (t) => -0.12 - sag * Math.sin(Math.PI * t);
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      p.set(0, yAt(t), R * 0.92 + t * span);
      e.set(-Math.atan2(-sag * Math.PI * Math.cos(Math.PI * t), span), ((i * 7) % 5 - 2) * 0.02, 0);
      planks.setMatrixAt(i, m.compose(p, q.setFromEuler(e), one));
    }
    bridge.add(planks);
    // rope rails
    const ropeMat = track(new THREE.LineBasicMaterial({ color: '#c9a77a' }), 0.8);
    for (const x of [-0.85, 0.85]) {
      const pts = [];
      for (let i = 0; i <= 24; i++) { const t = i / 24; pts.push(new THREE.Vector3(x, yAt(t) + 0.75, R * 0.92 + t * span)); }
      bridge.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), ropeMat));
    }
    // lanterns at both ends
    for (const t of [0.02, 0.98]) {
      const lg = new THREE.Sprite(glow(WARM, 0.7));
      lg.position.set(0.95, yAt(t) + 0.95, R * 0.92 + t * span);
      lg.scale.setScalar(1.5);
      bridge.add(lg);
    }
    group.add(bridge);
    return bridge;
  }

  buildPaper(node) {
    const info = this.layoutInfo.get(node.path);
    const hidden = node.path.split('/').some((p) => p && isHidden(p));
    const kind = fileKind(node.name);
    const group = new THREE.Group();
    group.position.copy(info.pos);
    group.rotation.y = -info.heading;
    const mats = [];
    const track = (m, base = 1, blend = false) => { m.userData.base = base; m.userData.blend = blend; m.transparent = blend; mats.push(m); return m; };
    const color = hidden ? HIDDEN_COLOR : kind === 'archive' ? '#ffb547' : '#ffe9c4';
    const rec = { node, group, mats, color, pos: info.pos, heading: info.heading, state: 'none', level: 0 };
    const body = new THREE.Group();
    const halo = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: this.shared.glow, color: hidden ? '#a98bff' : '#ffcf8a', depthWrite: false, blending: THREE.AdditiveBlending }), 0.45, true));
    halo.scale.setScalar(3.4);
    halo.position.z = -0.4;
    body.add(halo);
    if (kind === 'archive') {
      body.add(new THREE.Mesh(this.shared.crateGeo, track(new THREE.MeshStandardMaterial({ color: '#8a6038', roughness: 0.9, emissive: '#3a1e08', emissiveIntensity: 0.35, flatShading: true }))));
      const bandMat = track(new THREE.MeshStandardMaterial({ color: '#4a3220', roughness: 0.8 }));
      for (const y of [-0.3, 0.3]) {
        const band = new THREE.Mesh(this.shared.bandGeo, bandMat);
        band.position.y = y;
        body.add(band);
      }
      body.rotation.y = 0.6;
    } else {
      const paperCol = hidden ? '#ddd0ff' : kind === 'log' ? '#dcecff' : '#f6ecd6';
      body.add(new THREE.Mesh(this.shared.paperGeo, track(new THREE.MeshStandardMaterial({ color: paperCol, roughness: 0.9, emissive: hidden ? '#4a2a8a' : '#5a3c18', emissiveIntensity: 0.3 }))));
      const ink = track(new THREE.MeshBasicMaterial({ color: hidden ? '#5a3aa0' : '#7a6248' }), 0.85);
      for (let i = 0; i < 5; i++) {
        const l = new THREE.Mesh(this.shared.lineGeo, ink);
        l.scale.x = i === 4 ? 0.55 : 0.75 + ((i * 37) % 25) / 100;
        l.position.set(-0.4 + (l.scale.x * 0.8) / 2, 0.5 - i * 0.22, 0.03);
        body.add(l);
      }
      // a folded corner
      const corner = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.3), track(new THREE.MeshStandardMaterial({ color: '#d8c8a8', side: THREE.DoubleSide })));
      corner.position.set(0.45, 0.6, 0.035);
      corner.rotation.z = Math.PI / 4;
      body.add(corner);
    }
    group.add(body);
    const label = makeLabel(node.name, color, { size: 38, bg: 'rgba(22,12,40,0.75)' });
    label.position.set(0, -1.25, 0);
    track(label.material, 1, true);
    group.add(label);
    Object.assign(rec, { body, label, phase: Math.random() * Math.PI * 2 });
    group.visible = false;
    this.worldGroup.add(group);
    this.objects.set(node.path, rec);
  }

  frame() {
    if (this.debris && !this.reduced) this.debris.rotation.y = Math.sin(this.clock.elapsedTime * 0.02) * 0.05;
    super.frame();
  }
}

export { radialTexture };
