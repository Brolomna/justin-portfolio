// Where everything sits in the world, shared by the WebGL renderer (world.js)
// and the Canvas 2D renderer (canvas-world.js), so both draw the same machine.
// Plain {x, y, z} numbers only: no Three.js, so the 2D view never loads it.
// Coordinates: y is up, heading 0 faces -z, headings turn toward +x.

import { isHidden, fileKind, sortNames } from '../fs/filesystem.js';
import { pathChain } from '../fs/path.js';

export const PALETTE = ['#00f5a0', '#00cfff', '#3be8c8', '#7fd6ff'];
export const HIDDEN_COLOR = '#a98bff';
export const ERROR_COLOR = '#ff5d6c';
export const BG = '#03070c';

export const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
export const easeOut = (k) => 1 - Math.pow(1 - k, 3);

/** A point at local (x right, y up, z back) around `p` facing `heading`. */
export function local(p, heading, x, y, z) {
  const s = Math.sin(heading), c = Math.cos(heading);
  return { x: p.x + x * c - z * s, y: p.y + y, z: p.z + x * s + z * c };
}

export function colorFor(node) {
  if (node.path.split('/').some((p) => p && isHidden(p))) return HIDDEN_COLOR;
  if (node.type === 'file') {
    const k = fileKind(node.name);
    return k === 'archive' ? '#ffb547' : k === 'log' ? '#7fd6ff' : '#c9fff0';
  }
  let h = 0;
  for (const ch of node.name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

// A small folder icon floating on top of each portal, so the portal reads as a
// folder. Local units: it sits just above the portal's top bar (y 4.6), facing
// the parent like the portal does. LABEL_Y is where the name tag goes above it.
export const ICON = { y: 4.9, z: 2.5, frontZ: 0.08 };
export const LABEL_Y = 7.35;

/** The icon's back sheet with its tab (x, y), bottom edge at y = 0. */
export function iconBackOutline() {
  const w = 2.2, h = 1.4, tabW = 0.88, tabH = 0.3;
  const l = -w / 2, r = w / 2;
  return [[l, 0], [r, 0], [r, h], [l + tabW + 0.2, h], [l + tabW, h + tabH], [l + 0.1, h + tabH], [l, h + tabH - 0.1]];
}

/** The icon's front pocket (x, y): a little shorter, so the tab shows above it. */
export function iconFrontOutline() {
  return [[-1.1, 0], [1.1, 0], [1.1, 1.12], [-1.1, 1.12]];
}

/** Directories on the road down to the home directory are drawn smaller. */
export function isHomeAncestor(machine, path) {
  return path !== machine.home && pathChain(machine.home).includes(path);
}

/** Near the learner: on the path to here, here, or anything inside here. */
export function inFocus(path, cwd) {
  if (path === cwd || cwd.startsWith(path === '/' ? '/' : path + '/')) return true;
  return path.startsWith(cwd === '/' ? '/' : cwd + '/');
}

/** Map<path, { pos, heading, depth }> for every node. */
export function computeLayout(machine) {
  const { fs, home } = machine;
  const chain = new Set(pathChain(home));
  const homeDepth = pathChain(home).length - 1;
  const out = new Map();
  const place = (node, pos, heading, depth) => {
    out.set(node.path, { pos, heading, depth });
    if (node.type !== 'dir') return;
    const kids = sortNames([...node.children.keys()]).map((n) => node.children.get(n));
    const dirs = kids.filter((k) => k.type === 'dir');
    const files = kids.filter((k) => k.type === 'file');
    const onChain = chain.has(node.path) && node.path !== home;
    dirs.forEach((d, i) => {
      if (onChain) {
        if (!chain.has(d.path)) {
          const side = i % 2 ? 1 : -1;
          place(d, local(pos, heading, side * 16, 0, -10), heading + side * 0.8, depth + 1);
        } else place(d, local(pos, heading, 0, 0, -26), heading, depth + 1);
        return;
      }
      const n = dirs.length;
      const spread = Math.min(1.4, 0.5 * (n - 1));
      const a = n === 1 ? 0 : -spread / 2 + (spread * i) / (n - 1);
      const dist = [23, 19, 16, 14][Math.min(depth - homeDepth, 3)] ?? 14;
      const h = heading + a;
      place(d, local(pos, h, 0, 0, -dist), h, depth + 1);
    });
    // files float in front of the platform. Up to 4 share one row; bigger
    // directories fan out in an arc, neighbours alternating low and high so
    // long labels never sit side by side.
    const m = files.length;
    // row spacing grows with the longest name so labels never overlap
    const gap = Math.min(5, Math.max(3.1, Math.max(0, ...files.map((f) => f.name.length)) * 0.3));
    files.forEach((f, i) => {
      if (m <= 4) {
        const x = m === 1 ? (dirs.length ? -3.2 : 0) : (i - (m - 1) / 2) * gap;
        out.set(f.path, { pos: local(pos, heading, x, 1.9, -6.2 + Math.abs(x) * 0.18), heading: heading + x * 0.03, depth: depth + 1 });
        return;
      }
      const a = -0.95 + (1.9 * i) / (m - 1);
      const r = 8.5;
      out.set(f.path, { pos: local(pos, heading, Math.sin(a) * r, i % 2 ? 4.6 : 1.7, -Math.cos(a) * r - 0.5), heading: heading + a * 0.6, depth: depth + 1 });
    });
  };
  place(fs.root, { x: 0, y: 0, z: 26 * homeDepth }, 0, 0);
  return out;
}

/** Camera position + look target for standing in `path`. */
export function cameraView(machine, layout, path, viewScale = 1) {
  const info = layout.get(path);
  const v = viewScale;
  const node = machine.fs.get(path);
  const filesOnly = node && [...node.children.values()].every((c) => c.type === 'file');
  if (filesOnly) {
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

/** Control points for the camera's flight between two directories. */
export function travelPoints(layout, from, to, direction, start, end) {
  const pts = [start];
  if (direction === 'into') {
    const d = layout.get(to);
    pts.push(local(d.pos, d.heading, 0, 2.9, 8.5), local(d.pos, d.heading, 0, 2.8, 2.6));
  } else if (direction === 'up') {
    const d = layout.get(from);
    pts.push(local(d.pos, d.heading, 0, 2.8, 2.6), local(d.pos, d.heading, 0, 3.6, 9));
  } else {
    pts.push({ x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 + 10, z: (start.z + end.z) / 2 });
  }
  pts.push(end);
  return pts;
}
