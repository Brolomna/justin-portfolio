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

// The directory "folder": a back panel with a tab, papers inside and a front
// flap hinged at the bottom. Local units, standing at the back edge of the
// platform (z = FOLDER.z) and facing the parent directory (+z).
export const FOLDER = {
  w: 4.8, h: 3.2, tabW: 1.9, tabH: 0.5, frontH: 2.75,
  y: 0.25, z: 2.5, flapGap: 0.34, closed: 0.12, open: 1.15,
};

/** Back panel outline (x, y) including the tab, counter-clockwise. */
export function folderBackOutline() {
  const { w, h, tabW, tabH } = FOLDER;
  const l = -w / 2, r = w / 2;
  return [[l, 0], [r, 0], [r, h], [l + tabW + 0.45, h], [l + tabW, h + tabH], [l + 0.18, h + tabH], [l, h + tabH - 0.18]];
}

/** Front flap outline (x, y), hinged along y = 0. */
export function folderFrontOutline() {
  const { w, frontH } = FOLDER;
  return [[-w / 2, 0], [w / 2, 0], [w / 2, frontH], [-w / 2, frontH]];
}

/** Paper sheets peeking out of the folder: [x0, x1, y1, z]. */
export const FOLDER_PAPERS = [[-1.95, 1.75, 3.0, 0.14], [-1.7, 2.0, 2.85, 0.22]];

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
    // files float in a gentle arc just in front of the platform
    const m = files.length;
    const gap = 3.1;
    files.forEach((f, i) => {
      const x = m === 1 ? (dirs.length ? -3.2 : 0) : (i - (m - 1) / 2) * gap;
      out.set(f.path, { pos: local(pos, heading, x, 1.9, -6.2 + Math.abs(x) * 0.18), heading: heading + x * 0.03, depth: depth + 1 });
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
    // glide in just over the folder's top edge (the folder dissolves as you arrive)
    pts.push(local(d.pos, d.heading, 0, 5.4, 9.5), local(d.pos, d.heading, 0, 4.9, 3.6));
  } else if (direction === 'up') {
    const d = layout.get(from);
    pts.push(local(d.pos, d.heading, 0, 5.4, 3.6), local(d.pos, d.heading, 0, 9.5, 12.5));
  } else {
    pts.push({ x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 + 10, z: (start.z + end.z) / 2 });
  }
  pts.push(end);
  return pts;
}
