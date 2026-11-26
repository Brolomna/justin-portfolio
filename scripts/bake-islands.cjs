// Bakes the "Archive Islands" 3D models into transparent WebP sprites for the
// 2D view (browsers without WebGL draw these pictures instead of 3D models).
//
//   npm run build && npx vite preview --port 4173 &
//   node scripts/bake-islands.cjs            (needs Playwright + Chromium)
//
// Writes public/interactive-learning/img/islands/*.webp and sprites.json:
// { name: { file, w, h, ax, ay, upp } } where (ax, ay) is the model's origin as
// a fraction of the image and upp is world units per image pixel.
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const OUT = path.join(__dirname, '../public/interactive-learning/img/islands');
const URL = process.env.BAKE_URL || 'http://localhost:4173/learning-new-c.html';

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.error('page error:', e.message));
  await page.goto(URL, { waitUntil: 'networkidle' });
  const shots = await page.evaluate(async () => {
    const { IslandWorld } = await import('./interactive-learning/js/world/island-world.js');
    const { THREE } = await import('./interactive-learning/js/world/world.js');
    const { buildMachine } = await import('./interactive-learning/js/fs/filesystem.js');
    const box = document.createElement('div');
    box.style.cssText = 'position:fixed;left:0;top:0;width:64px;height:64px;opacity:0';
    document.body.appendChild(box);
    const w = new IslandWorld(box, { reducedMotion: true });
    w.running = false; cancelAnimationFrame(w.raf);
    const machine = buildMachine({
      id: 'bake', user: 'u', host: 'h', home: '/home/u', start: '/home/u',
      tree: { home: { u: { meadow: {}, orchard: {}, harbor: {}, '.secret': {}, 'note.txt': 'x', '.hush.txt': 'x', 'log.log': 'x', 'box.zip': 'x' } } },
    });
    const all = new Set(machine.fs.all().map((n) => n.path));
    w.load(machine, { cwd: '/home/u', visited: all, listed: new Map([...all].map((p) => [p, true])) });

    const r = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
    r.setClearColor(0x000000, 0);
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.15;
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight('#9a88ff', '#24142e', 1.5));
    const moon = new THREE.DirectionalLight('#e4dcff', 1.6); moon.position.set(-18, 30, 16); scene.add(moon);
    scene.add(new THREE.AmbientLight('#3a2c60', 0.7));
    const lamp = new THREE.PointLight('#ffc47a', 60, 30, 1.4); lamp.position.set(0, 6, 8); scene.add(lamp);

    const ELEV = 24 * Math.PI / 180;
    const out = {};
    const snap = (name, obj, { width, height, px, center = [0, 0, 0] }) => {
      const cam = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0.1, 200);
      cam.position.set(center[0], center[1] + Math.sin(ELEV) * 60, center[2] + Math.cos(ELEV) * 60);
      cam.lookAt(center[0], center[1], center[2]);
      cam.updateMatrixWorld(); cam.updateProjectionMatrix();
      const W = Math.round(width * px), H = Math.round(height * px);
      r.setSize(W, H, false);
      scene.add(obj);
      r.render(scene, cam);
      scene.remove(obj);
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      const ctx = c.getContext('2d'); ctx.drawImage(r.domElement, 0, 0);
      const data = ctx.getImageData(0, 0, W, H).data;
      let x0 = W, y0 = H, x1 = 0, y1 = 0;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (data[(y * W + x) * 4 + 3] > 6) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      x0 = Math.max(0, x0 - 2); y0 = Math.max(0, y0 - 2); x1 = Math.min(W - 1, x1 + 2); y1 = Math.min(H - 1, y1 + 2);
      const cw = x1 - x0 + 1, ch = y1 - y0 + 1;
      const o = new THREE.Vector3(0, 0, 0).project(cam);
      const ox = (o.x + 1) / 2 * W, oy = (1 - o.y) / 2 * H;
      const crop = document.createElement('canvas'); crop.width = cw; crop.height = ch;
      crop.getContext('2d').drawImage(c, x0, y0, cw, ch, 0, 0, cw, ch);
      out[name] = { data: crop.toDataURL('image/webp', 0.86), w: cw, h: ch, ax: +((ox - x0) / cw).toFixed(4), ay: +((oy - y0) / ch).toFixed(4), upp: +(1 / px).toFixed(5) };
    };
    // pose a record's group at the origin, glows off (the 2D view draws its own)
    const pose = (rec) => {
      const g = rec.group;
      g.position.set(0, 0, 0); g.rotation.set(0, 0, 0); g.scale.setScalar(1); g.visible = true;
      g.traverse((o) => {
        if (o.isSprite) o.visible = false;
        if (o.material) { o.material.opacity = o.material.userData.base ?? 1; if (o.material.blending === THREE.AdditiveBlending && !o.isSprite) { o.material.blending = THREE.NormalBlending; o.material.opacity = 0.55; } }
      });
      return g;
    };
    const islands = { meadow: 'island-a', orchard: 'island-b', harbor: 'island-c', '.secret': 'island-hidden' };
    for (const [dir, name] of Object.entries(islands)) {
      const rec = w.objects.get(`/home/u/${dir}`);
      const g = pose(rec);
      rec.arch.visible = false; if (rec.bridge) rec.bridge.visible = false;
      snap(name, g, { width: 15, height: 17, px: 84, center: [0, -2.5, 0] });
      rec.arch.visible = true;
      // the house alone, anchored at its own origin (local z 2.5 on the island)
      g.children.forEach((ch) => { ch.userData.was = ch.visible; ch.visible = ch === rec.arch; });
      rec.sign.visible = false;
      rec.arch.position.set(0, 0, 0);
      snap(name.replace('island', 'house'), g, { width: 8, height: 9, px: 96, center: [0, 3.2, 0] });
      rec.arch.position.set(0, 0, 2.5); rec.sign.visible = true;
      g.children.forEach((ch) => { ch.visible = ch.userData.was; });
    }
    // ancestors ("/" and "/home") use stone-coloured houses
    {
      const rec = w.objects.get('/home');
      const g = pose(rec);
      g.children.forEach((ch) => { ch.visible = ch === rec.arch; });
      rec.sign.visible = false; rec.arch.position.set(0, 0, 0);
      snap('house-stone', g, { width: 8, height: 9, px: 96, center: [0, 3.2, 0] });
      g.children.forEach((ch) => { ch.visible = ch !== rec.arch && ch !== rec.bridge; });
      snap('island-stone', g, { width: 15, height: 17, px: 84, center: [0, -2.5, 0] });
    }
    for (const [file, name] of [['note.txt', 'paper'], ['.hush.txt', 'paper-hidden'], ['log.log', 'paper-log'], ['box.zip', 'crate']]) {
      const rec = w.objects.get(`/home/u/${file}`);
      const g = pose(rec);
      rec.label.visible = false;
      snap(name, g, { width: 2.6, height: 2.6, px: 128 });
    }
    w.dispose(); r.dispose();
    return out;
  });
  const meta = {};
  for (const [name, s] of Object.entries(shots)) {
    const file = `${name}.webp`;
    fs.writeFileSync(path.join(OUT, file), Buffer.from(s.data.split(',')[1], 'base64'));
    meta[name] = { file, w: s.w, h: s.h, ax: s.ax, ay: s.ay, upp: s.upp };
    console.log(`${file.padEnd(22)} ${s.w}x${s.h}  ${(fs.statSync(path.join(OUT, file)).size / 1024).toFixed(0)} KB`);
  }
  fs.writeFileSync(path.join(OUT, 'sprites.json'), JSON.stringify(meta, null, 1) + '\n');
  await browser.close();
})();
