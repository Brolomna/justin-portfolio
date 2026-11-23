// Simulated filesystem. Pure data + lookups: no DOM, no rendering, no real OS access.
// A machine spec describes the tree with plain objects: an object is a directory,
// a string is a text file's contents, and zip(...) is a .zip archive.

export const isHidden = (name) => name.startsWith('.');

const ZIP = Symbol('zip');
const GPG = Symbol('gpg');

/** A gpg-encrypted file in a machine spec (made with `gpg -c`). */
export function gpgFile(plain, password) {
  return { [GPG]: true, plain, password };
}

// What `cat` shows for an encrypted file: binary noise.
function cipherBytes(seed) {
  let h = 11;
  for (const ch of seed) h = (h * 33 + ch.charCodeAt(0)) >>> 0;
  const junk = '\u0001\u00b9\u00e3\u2592\u00a6\u00cf\u0012\u00f4\u00d1\u008c\u00be\u2593\u00a3\u00e7';
  let out = '\u008c\r\u0004\t\u0003\u0002 ';
  for (let i = 0; i < 22; i++) { h = (h * 1103515245 + 12345) >>> 0; out += junk[h % junk.length]; }
  return out;
}

// A simulated clock for file times (ls -l), starting at the machine's "today".
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function stamp(minutes) {
  const d = new Date(Date.UTC(2026, 10, 20, 9, 14) + minutes * 60000);
  return `${MONTHS[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2, ' ')} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
}

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
  root.mtime = stamp(0);

  const add = (parent, name, value, added) => {
    const path = parent.path === '/' ? `/${name}` : `${parent.path}/${name}`;
    let node;
    if (typeof value === 'string') node = { name, type: 'file', path, parent, content: value };
    else if (value && value[ZIP]) node = { name, type: 'file', path, parent, content: archiveBytes(name), archive: value };
    else if (value && value[GPG]) node = { name, type: 'file', path, parent, content: cipherBytes(name + value.plain), encrypted: value };
    else node = { name, type: 'dir', path, parent, children: new Map() };
    node.mtime = stamp(clock);
    parent.children.set(name, node);
    index.set(path, node);
    added?.push(path);
    if (node.type === 'dir') for (const [n, v] of Object.entries(value)) add(node, n, v, added);
  };
  let clock = 0;
  // turn a node back into spec form (used to copy and move)
  const toSpec = (node) => {
    if (node.type === 'dir') return Object.fromEntries([...node.children].map(([n, c]) => [n, toSpec(c)]));
    if (node.archive) return node.archive;
    if (node.encrypted) return node.encrypted;
    return node.content;
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
    /** Advance the simulated clock (one minute per command that changes something). */
    tick() { clock += 1; return stamp(clock); },
    now: () => stamp(clock),
    /** Create or overwrite a text file. Returns { created }. */
    writeFile(path, content, { append = false } = {}) {
      const node = index.get(path);
      if (node) {
        node.content = append ? node.content + content : content;
        delete node.archive; delete node.encrypted;
        node.mtime = stamp(clock);
        return { created: false };
      }
      const parent = index.get(path.slice(0, path.lastIndexOf('/')) || '/');
      add(parent, path.slice(path.lastIndexOf('/') + 1), content);
      return { created: true };
    },
    /** Add any spec value (string, directory object, zip(), gpgFile()) at `path`. Returns new paths. */
    put(path, value) {
      const parent = index.get(path.slice(0, path.lastIndexOf('/')) || '/');
      const added = [];
      add(parent, path.slice(path.lastIndexOf('/') + 1), value, added);
      return added;
    },
    /** Update a file's time (touch). */
    touch(path) { const n = index.get(path); if (n) n.mtime = stamp(clock); },
    /** Delete a node and everything under it. Returns every removed path. */
    remove(path) {
      const node = index.get(path);
      if (!node || node === root) return [];
      const gone = [...index.keys()].filter((p) => p === path || p.startsWith(path + '/'));
      remove(node);
      return gone;
    },
    /** Copy a node (and its contents) to a new path. Returns the new paths. */
    copy(src, dest) {
      const node = index.get(src);
      const old = index.get(dest);
      if (old) remove(old);
      return this.put(dest, toSpec(node));
    },
    /** Move or rename. Returns { created, removed }. */
    move(src, dest) {
      const node = index.get(src);
      const spec = toSpec(node);
      const removed = this.remove(src);
      const old = index.get(dest);
      if (old) remove(old);
      return { created: this.put(dest, spec), removed };
    },
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
