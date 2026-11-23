// Simulated filesystem. Pure data + lookups: no DOM, no rendering, no real OS access.
// A machine spec describes the tree with plain objects: an object is a directory,
// a string is a text file's contents, and zip(...) is a .zip archive.

export const isHidden = (name) => name.startsWith('.');

const ZIP = Symbol('zip');

/** A zip archive in a machine spec. `entries` uses the same spec format as a directory. */
export function zip(entries, { password = null } = {}) {
  return { [ZIP]: true, entries, password };
}

// What `cat` shows for an archive: compressed bytes, not text (like a real terminal).
function archiveBytes(name) {
  let h = 7;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const junk = '\u00a7\u00d2\u00fe\u00b4\u2592\u00d8\u00a4\u00e5\u0091\u00b6\u00a5\u00f0\u00ff\u00e8';
  let out = 'PK\u0003\u0004\u0014\u0000\u0008\u0000 ';
  for (let i = 0; i < 18; i++) { h = (h * 1103515245 + 12345) >>> 0; out += junk[h % junk.length]; }
  return out;
}

/** Build an immutable-shaped tree of nodes from a nested spec. */
export function createFilesystem(spec) {
  const root = { name: '/', type: 'dir', path: '/', parent: null, children: new Map() };
  const index = new Map([['/', root]]);

  const add = (parent, name, value, added) => {
    const path = parent.path === '/' ? `/${name}` : `${parent.path}/${name}`;
    let node;
    if (typeof value === 'string') node = { name, type: 'file', path, parent, content: value };
    else if (value && value[ZIP]) node = { name, type: 'file', path, parent, content: archiveBytes(name), archive: value };
    else node = { name, type: 'dir', path, parent, children: new Map() };
    parent.children.set(name, node);
    index.set(path, node);
    added?.push(path);
    if (node.type === 'dir') for (const [n, v] of Object.entries(value)) add(node, n, v, added);
  };
  const remove = (node) => {
    node.parent.children.delete(node.name);
    for (const p of [...index.keys()]) if (p === node.path || p.startsWith(node.path + '/')) index.delete(p);
  };
  for (const [n, v] of Object.entries(spec)) add(root, n, v);

  return {
    root,
    get: (path) => index.get(path) || null,
    /** Every node, parents before children (stable order for layout). */
    all: () => [...index.values()],
    /** Add a spec under an existing directory (used by unzip). Returns every new path. */
    addTree(dirPath, entries) {
      const dir = index.get(dirPath);
      if (!dir || dir.type !== 'dir') throw new Error(`not a directory: ${dirPath}`);
      const added = [];
      for (const [n, v] of Object.entries(entries)) add(dir, n, v, added);
      return added;
    },
    /** Like addTree, but existing files are replaced and existing directories merged
     *  (unzip answering "yes" to "replace?"). Returns only the paths that are new. */
    mergeTree(dirPath, entries) {
      const dir = index.get(dirPath);
      if (!dir || dir.type !== 'dir') throw new Error(`not a directory: ${dirPath}`);
      const added = [];
      const isDirSpec = (v) => v && typeof v === 'object' && !v[ZIP];
      const merge = (into, spec) => {
        for (const [n, v] of Object.entries(spec)) {
          const old = into.children.get(n);
          if (old && old.type === 'dir' && isDirSpec(v)) { merge(old, v); continue; }
          if (old && old.type === 'file' && typeof v === 'string') { old.content = v; delete old.archive; continue; }
          if (old) remove(old);
          add(into, n, v, added);
        }
      };
      merge(dir, entries);
      return added;
    },
  };
}

/** Sort like `ls`: case-insensitive, ignoring a leading dot. */
export function sortNames(names) {
  const key = (n) => n.replace(/^\.+/, '').toLowerCase();
  return [...names].sort((a, b) => key(a).localeCompare(key(b)) || a.localeCompare(b));
}

/** File kind drives how the 3D world draws it. */
export function fileKind(name) {
  if (/\.zip$/i.test(name)) return 'archive';
  if (/\.log$/i.test(name)) return 'log';
  return 'text';
}

/** Attach a filesystem to a machine spec. Each call builds a fresh, independent tree. */
export function buildMachine(spec) {
  return { ...spec, fs: createFilesystem(spec.tree) };
}

/** Flatten an archive's entries into ['dir/', 'dir/file.txt', ...] in listing order. */
export function archiveListing(entries, prefix = '') {
  const out = [];
  for (const [n, v] of Object.entries(entries)) {
    if (typeof v === 'string' || (v && v[ZIP])) out.push({ name: prefix + n, size: typeof v === 'string' ? v.length : 64, dir: false });
    else { out.push({ name: `${prefix}${n}/`, size: 0, dir: true }); out.push(...archiveListing(v, `${prefix}${n}/`)); }
  }
  return out;
}
