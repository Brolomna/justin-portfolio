// Allowlisted command interpreter for the simulated filesystem.
// Input is treated as plain text: it is tokenized, never evaluated, and only the
// commands below exist. Every command works against the real simulated tree,
// so `cd Documents` works because Documents exists, not because the string matched.

import { isHidden, sortNames, fileKind, archiveListing } from './filesystem.js';
import { resolvePath, parentOf, displayPath } from './path.js';

export const MAX_INPUT = 200;

// Real Linux commands that this training machine does not offer (yet). Saying
// "command not found" for these would teach something false.
const NOT_YET = new Set(['zip', 'tar', 'gzip', 'gunzip', 'mkdir', 'rm', 'rmdir', 'touch', 'mv', 'cp', 'nano', 'vim', 'vi', 'less', 'more',
  'head', 'tail', 'echo', 'grep', 'find', 'chmod', 'chown', 'sudo', 'su', 'whoami', 'man', 'tree', 'file',
  'ln', 'stat', 'history', 'exit']);

/** Split a command line into words. Supports simple '…' and "…" quoting. */
export function tokenize(line) {
  const words = [];
  let cur = '', quote = null, started = false;
  for (const ch of line) {
    if (quote) {
      if (ch === quote) quote = null; else cur += ch;
    } else if (ch === '"' || ch === "'") {
      quote = ch; started = true;
    } else if (/\s/.test(ch)) {
      if (started || cur) { words.push(cur); cur = ''; started = false; }
    } else { cur += ch; started = true; }
  }
  if (quote) return { error: 'unclosed quote' };
  if (started || cur) words.push(cur);
  return { words };
}

// Output helpers: a line is a list of segments { t: text, c: css class }.
const line = (t, c = '') => [{ t, c }];
const err = (t) => line(t, 'err');

function entryClass(node) {
  if (node.type === 'dir') return node.name.startsWith('.') ? 'dir hidden' : 'dir';
  return fileKind(node.name) === 'archive' ? 'file archive' : 'file';
}

export function createShell(machine) {
  const { fs, home } = machine;
  let cwd = machine.start;

  const lookup = (arg) => {
    const path = resolvePath(cwd, arg, home);
    return { path, node: fs.get(path) };
  };

  const commands = {
    pwd() {
      return { out: [line(cwd)], event: { type: 'pwd', path: cwd } };
    },

    ls(args) {
      const flags = args.filter((a) => a.startsWith('-') && a.length > 1);
      const paths = args.filter((a) => !(a.startsWith('-') && a.length > 1));
      let all = false;
      for (const f of flags) {
        for (const ch of f.slice(1)) {
          if (ch === 'a') all = true;
          else return fail('ls', 'unavailable', null,
            `ls: the -${ch} option isn't available on this training machine yet (try ls or ls -a)`);
        }
      }
      if (paths.length > 1) return fail('ls', 'usage', null, 'ls: this training machine lists one directory at a time');
      const { path, node } = lookup(paths[0] ?? '.');
      if (!node) return fail('ls', 'not-found', path, `ls: cannot access '${paths[0]}': No such file or directory`);
      if (node.type === 'file') {
        return { out: [[{ t: paths[0], c: entryClass(node) }]], event: { type: 'ls', path, file: true, all, entries: [] } };
      }
      const names = sortNames([...node.children.keys()].filter((n) => all || !isHidden(n)));
      const entries = names.map((n) => node.children.get(n));
      const segs = [];
      if (all) segs.push({ t: '.', c: 'dir' }, { t: '  ' }, { t: '..', c: 'dir' });
      entries.forEach((e) => {
        if (segs.length) segs.push({ t: '  ' });
        segs.push({ t: e.name, c: entryClass(e) });
      });
      return {
        out: segs.length ? [segs] : [],
        event: { type: 'ls', path, all, entries: entries.map((e) => e.path) },
      };
    },

    cd(args) {
      if (args.length > 1) return fail('cd', 'usage', null, 'bash: cd: too many arguments');
      if (args[0] === '-') return fail('cd', 'unavailable', null, "bash: cd: '-' (previous directory) isn't available on this training machine yet");
      const from = cwd;
      const { path, node } = lookup(args[0] ?? '~');
      if (!node) return fail('cd', 'not-found', path, `bash: cd: ${args[0]}: No such file or directory`);
      if (node.type !== 'dir') return fail('cd', 'not-dir', path, `bash: cd: ${args[0]}: Not a directory`);
      cwd = path;
      const direction = path === from ? 'stay'
        : parentOf(path) === from ? 'into'
        : parentOf(from) === path ? 'up'
        : 'jump';
      return { out: [], event: { type: 'cd', from, to: path, direction } };
    },

    cat(args) {
      if (!args.length) return fail('cat', 'usage', null, 'cat: missing file name (usage: cat FILE)');
      const out = [];
      const files = [];
      let firstError = null;
      for (const arg of args) {
        const { path, node } = lookup(arg);
        if (!node) {
          out.push(err(`cat: ${arg}: No such file or directory`));
          firstError ??= { reason: 'not-found', target: path };
        } else if (node.type === 'dir') {
          out.push(err(`cat: ${arg}: Is a directory`));
          firstError ??= { reason: 'is-dir', target: path };
        } else {
          for (const l of node.content.split('\n')) out.push(line(l, 'content'));
          files.push({ path, content: node.content });
        }
      }
      if (!files.length) return { out, ok: false, event: { type: 'error', cmd: 'cat', ...firstError } };
      return { out, event: { type: 'cat', path: files[files.length - 1].path, content: files[files.length - 1].content, files } };
    },

    clear() {
      return { out: [], event: { type: 'clear' } };
    },

    // unzip [-l] [-P password] FILE  — list or extract a zip archive into the current directory.
    unzip(args) {
      let list = false, password = null, file = null;
      for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (a === '-l') list = true;
        else if (a === '-P') {
          if (i + 1 >= args.length) return fail('unzip', 'usage', null, 'unzip: -P needs a password after it');
          password = args[++i];
        } else if (a.startsWith('-') && a.length > 1) {
          return fail('unzip', 'unavailable', null, `unzip: the ${a} option isn't available on this training machine yet (try unzip -l FILE or unzip FILE)`);
        } else if (file === null) file = a;
        else return fail('unzip', 'usage', null, 'unzip: this training machine unzips one archive at a time');
      }
      if (file === null) return fail('unzip', 'usage', null, 'UnZip: usage: unzip [-l] [-P password] file.zip');
      const { path, node } = lookup(file);
      if (!node || node.type !== 'file') {
        return fail('unzip', 'not-found', path, `unzip:  cannot find or open ${file}, ${file}.zip or ${file}.ZIP.`);
      }
      if (!node.archive) {
        return { out: [line(`Archive:  ${file}`), err(`  End-of-central-directory signature not found. ${file} is not a zip file.`)], ok: false, event: { type: 'error', cmd: 'unzip', reason: 'not-zip', target: path } };
      }
      const listing = archiveListing(node.archive.entries);
      if (list) return listArchive(file, path, listing);
      return proceed({ file, path, node, listing, password, overwrite: null, cwdAtStart: cwd }, true);
    },
  };

  let pending = null;

  function listArchive(file, path, listing) {
    const out = [line(`Archive:  ${file}`), line('  Length      Date    Time    Name'), line('---------  ---------- -----   ----')];
    let total = 0, count = 0;
    for (const e of listing) {
      total += e.size; if (!e.dir) count++;
      out.push([{ t: `${String(e.size).padStart(9)}  2026-11-20 09:14   ` }, { t: e.name, c: e.dir ? 'dir' : 'file' }]);
    }
    out.push(line('---------                     -------'));
    out.push(line(`${String(total).padStart(9)}                     ${count} file${count === 1 ? '' : 's'}`));
    return { out, event: { type: 'unzip-list', path, entries: listing.map((e) => e.name) } };
  }

  // unzip's questions come in the same order as the real tool:
  // "replace X?" for files that already exist, then the password.
  function proceed(ctx, first) {
    const head = first ? [line(`Archive:  ${ctx.file}`)] : [];
    const firstFile = ctx.listing.find((e) => !e.dir)?.name ?? '';
    if (ctx.overwrite === null) {
      const clash = ctx.listing.find((e) => !e.dir && fs.get(joinPath(cwd, e.name)));
      if (clash) {
        pending = { ...ctx, kind: 'replace', label: `replace ${clash.name}? [y]es, [n]o, [A]ll, [N]one, [r]ename: ` };
        return { out: head, event: { type: 'unzip-prompt', path: ctx.path, kind: 'replace' } };
      }
      ctx.overwrite = false;
    }
    if (ctx.overwrite !== 'skip' && ctx.node.archive.password && ctx.password === null) {
      // Real unzip asks for the password interactively and does not echo it.
      pending = { ...ctx, kind: 'password', label: `[${ctx.file}] ${firstFile} password: ` };
      return { out: head, event: { type: 'unzip-prompt', path: ctx.path, kind: 'password' } };
    }
    const res = extract(ctx);
    if (!first && res.out[0]?.[0]?.t?.startsWith('Archive:')) res.out.shift();
    return res;
  }

  function joinPath(dir, rel) { return (dir === '/' ? '' : dir) + '/' + rel.replace(/\/$/, ''); }

  function extract({ file, path, node, listing, password, overwrite }) {
    const tops = Object.keys(node.archive.entries).map((n) => joinPath(cwd, n));
    if (overwrite === 'skip') {
      // "no" to replacing: everything that was already there stays as it was
      const out = [line(`Archive:  ${file}`)];
      for (const e of listing) if (!e.dir && fs.get(joinPath(cwd, e.name))) out.push([{ t: '   skipping: ' }, { t: e.name, c: 'file' }, { t: '  (kept the existing file)' }]);
      const added = [];
      return { out, event: { type: 'unzip', path, dir: cwd, added, top: tops, skipped: true, protected: !!node.archive.password } };
    }
    if (node.archive.password && password !== node.archive.password) {
      const first = listing.find((e) => !e.dir)?.name ?? '';
      return { out: [line(`Archive:  ${file}`), err(`   skipping: ${first}  incorrect password`)], ok: false, event: { type: 'error', cmd: 'unzip', reason: 'bad-password', target: path } };
    }
    const existed = new Set(listing.filter((e) => fs.get(joinPath(cwd, e.name))).map((e) => e.name));
    const added = fs.mergeTree(cwd, node.archive.entries);
    const out = [line(`Archive:  ${file}`)];
    for (const e of listing) {
      if (e.dir) { if (!existed.has(e.name)) out.push([{ t: '   creating: ' }, { t: e.name, c: 'dir' }]); }
      else out.push([{ t: '  inflating: ' }, { t: e.name, c: 'file' }]);
    }
    return { out, event: { type: 'unzip', path, dir: cwd, added, top: tops, replaced: existed.size > 0, protected: !!node.archive.password } };
  }

  /** Answer whatever unzip is asking: "replace?" or the password. */
  function answer(text) {
    const p = pending;
    pending = null;
    cwd = p.cwdAtStart;
    if (p.kind === 'replace') {
      const t = text.trim();
      if (/^(y|yes|A)$/.test(t)) return proceed({ ...p, overwrite: true }, false);
      if (/^(n|no|N)$/.test(t)) return proceed({ ...p, overwrite: 'skip' }, false);
      // anything else: real unzip complains and asks again
      pending = p;
      const msg = /^r(ename)?$/i.test(t) ? "rename isn't available on this training machine. Answer y (replace) or n (keep)." : `error:  invalid response [${t.slice(0, 20)}]`;
      return { out: [err(msg)], ok: false, event: { type: 'unzip-prompt', path: p.path, kind: 'replace', again: true } };
    }
    return proceed({ ...p, password: text }, false);
  }

  function fail(cmd, reason, target, message) {
    return { out: [err(message)], ok: false, event: { type: 'error', cmd, reason, target } };
  }

  function run(rawLine) {
    const text = String(rawLine ?? '');
    if (pending) {
      const res = answer(text);
      return { ok: res.ok !== false, out: res.out, event: { ...res.event, command: 'unzip (password)' } };
    }
    if (text.length > MAX_INPUT) return fail('', 'usage', null, `bash: input is longer than ${MAX_INPUT} characters`);
    const op = text.match(/[;|&<>`]|\$\(/);
    if (op) return { ok: false, out: [err(`bash: '${op[0]}' (chaining, pipes and redirection) isn't available on this training machine. Run one command at a time.`)], event: { type: 'error', cmd: '', reason: 'usage', target: null, command: text.trim() } };
    const tok = tokenize(text);
    if (tok.error) return fail('', 'usage', null, `bash: ${tok.error}`);
    const [name, ...args] = tok.words;
    if (name === undefined) return { ok: true, out: [], event: { type: 'noop' } };
    let res;
    if (Object.prototype.hasOwnProperty.call(commands, name)) res = commands[name](args);
    else if (NOT_YET.has(name)) res = fail(name, 'unavailable', null, `${name}: a real Linux command, but it isn't available on this training machine yet`);
    else res = fail(name, 'unknown-command', null, `bash: ${name}: command not found`);
    return { ok: res.ok !== false, out: res.out, event: { ...res.event, command: text.trim() } };
  }

  return {
    run,
    /** While unzip waits for an answer: { label, secret } (secret = a password, don't echo it), else null. */
    get awaiting() { return pending ? { label: pending.label, secret: pending.kind === 'password' } : null; },
    /** Ctrl+C / Escape during a password prompt. */
    cancel() {
      if (!pending) return null;
      pending = null;
      return { ok: false, out: [line('^C')], event: { type: 'noop', command: '^C' } };
    },
    get cwd() { return cwd; },
    prompt: () => ({ user: machine.user, host: machine.host, dir: displayPath(cwd, home) }),
  };
}
