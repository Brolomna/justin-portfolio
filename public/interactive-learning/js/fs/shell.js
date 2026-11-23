// Allowlisted command interpreter for the simulated filesystem.
// Input is treated as plain text: it is tokenized, never evaluated, and only the
// commands below exist. Every command works against the real simulated tree,
// so `cd Documents` works because Documents exists, not because the string matched.

import { isHidden, sortNames, fileKind, archiveListing } from './filesystem.js';
import { resolvePath, parentOf, displayPath } from './path.js';
import { extraCommands, globToRegExp, FILTERS, STANDALONE } from './commands.js';

export const MAX_INPUT = 200;

// Real Linux commands that this training machine does not offer (yet). Saying
// "command not found" for these would teach something false.
const NOT_YET = new Set(['zip', 'tar', 'gzip', 'gunzip', 'nano', 'vim', 'vi', 'less', 'more', 'chmod', 'chown',
  'sudo', 'su', 'man', 'tree', 'file', 'ln', 'stat', 'exit', 'ssh', 'curl', 'wget', 'ping', 'ps', 'kill', 'top', 'apt', 'openssl']);

/** Split a command line into words. Supports simple '…' and "…" quoting. */
export function tokenize(line) {
  const words = []; const quoted = [];
  let cur = '', quote = null, started = false, wasQuoted = false;
  for (const ch of line) {
    if (quote) {
      if (ch === quote) quote = null; else cur += ch;
    } else if (ch === '"' || ch === "'") {
      quote = ch; started = true; wasQuoted = true;
    } else if (/\s/.test(ch)) {
      if (started || cur) { words.push(cur); quoted.push(wasQuoted); cur = ''; started = false; wasQuoted = false; }
    } else { cur += ch; started = true; }
  }
  if (quote) return { error: 'unclosed quote' };
  if (started || cur) { words.push(cur); quoted.push(wasQuoted); }
  return { words, quoted };
}

/** Split a line at unquoted | and a final > or >>. Rejects other shell operators. */
export function splitLine(text) {
  const stages = []; let cur = ''; let quote = null; let redirect = null;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quote) { cur += ch; if (ch === quote) quote = null; continue; }
    if (ch === '"' || ch === "'") { quote = ch; cur += ch; continue; }
    if (redirect) { redirect.target += ch; continue; }
    if (ch === '|') { if (text[i + 1] === '|') return { error: '||' }; stages.push(cur); cur = ''; continue; }
    if (ch === '>') {
      const append = text[i + 1] === '>';
      if (append) i++;
      redirect = { append, target: '' };
      continue;
    }
    if (ch === ';' || ch === '&' || ch === '`' || ch === '<' || (ch === '$' && text[i + 1] === '(')) return { error: ch === '$' ? '$(' : ch };
    cur += ch;
  }
  stages.push(cur);
  if (redirect) {
    if (/[|>]/.test(redirect.target)) return { error: '>' };
    const t = tokenize(redirect.target);
    if (t.error || t.words.length !== 1) return { error: 'redirect' };
    redirect.target = t.words[0];
  }
  return { stages, redirect };
}

/** Plain text of output lines (for pipes and redirection). Error lines are left out. */
const textOf = (out) => out.filter((l) => !l.some((s) => s.c === 'err')).map((l) => l.map((s) => s.t).join('')).join('\n') + (out.length ? '\n' : '');

// Output helpers: a line is a list of segments { t: text, c: css class }.
const line = (t, c = '') => [{ t, c }];
const err = (t) => line(t, 'err');

function entryClass(node) {
  if (node.type === 'dir') return node.name.startsWith('.') ? 'dir hidden' : 'dir';
  if (node.encrypted) return 'file archive';
  return fileKind(node.name) === 'archive' ? 'file archive' : 'file';
}

function sizeOf(node) {
  if (node.type === 'dir') return 4096;
  if (!node.content) return 0;
  return new TextEncoder().encode(node.content.endsWith('\n') ? node.content : node.content + '\n').length;
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

    ls(args, io = {}) {
      const flags = args.filter((a) => a.startsWith('-') && a.length > 1);
      const paths = args.filter((a) => !(a.startsWith('-') && a.length > 1));
      let all = false, long = false;
      for (const f of flags) {
        for (const ch of f.slice(1)) {
          if (ch === 'a') all = true;
          else if (ch === 'l') long = true;
          else return fail('ls', 'unavailable', null,
            `ls: the -${ch} option isn't available on this training machine yet (try ls, ls -a, ls -l or ls -la)`);
        }
      }
      const longRow = (node, name) => {
        const isDir = node.type === 'dir';
        const links = isDir ? 2 + [...node.children.values()].filter((c) => c.type === 'dir').length : 1;
        return [{ t: `${isDir ? 'drwxr-xr-x' : '-rw-r--r--'} ${String(links).padStart(2)} ${machine.user} ${machine.user} ${String(sizeOf(node)).padStart(5)} ${node.mtime || fs.now()} ` }, { t: name, c: entryClass(node) }];
      };
      const listDir = (path, node) => {
        const names = sortNames([...node.children.keys()].filter((n) => all || !isHidden(n)));
        const entries = names.map((n) => node.children.get(n));
        if (long) {
          const rows = [];
          if (all) rows.push(longRow(node, '.'), longRow(node.parent || node, '..'));
          for (const e of entries) rows.push(longRow(e, e.name));
          const blocks = entries.reduce((t, e) => t + Math.ceil(sizeOf(e) / 4096) * 4, all ? 8 : 0);
          return { out: [line(`total ${blocks}`), ...rows], entries };
        }
        // into a pipe, ls prints one name per line (so `ls | wc -l` counts entries)
        if (io.piped) return { out: [...(all ? [line('.'), line('..')] : []), ...entries.map((e) => [{ t: e.name, c: entryClass(e) }])], entries };
        const segs = [];
        if (all) segs.push({ t: '.', c: 'dir' }, { t: '  ' }, { t: '..', c: 'dir' });
        entries.forEach((e) => {
          if (segs.length) segs.push({ t: '  ' });
          segs.push({ t: e.name, c: entryClass(e) });
        });
        return { out: segs.length ? [segs] : [], entries };
      };
      const targets = (paths.length ? paths : ['.']).map((a) => ({ arg: a, ...lookup(a) }));
      const missing = targets.filter((t) => !t.node);
      const out = missing.map((t) => err(`ls: cannot access '${t.arg}': No such file or directory`));
      const files = targets.filter((t) => t.node?.type === 'file');
      const dirs = targets.filter((t) => t.node?.type === 'dir');
      if (!files.length && !dirs.length) return { out, ok: false, event: { type: 'error', cmd: 'ls', reason: 'not-found', target: missing[0].path } };
      if (files.length) {
        if (long) for (const f of files) out.push(longRow(f.node, f.arg));
        else out.push(files.flatMap((f, i) => [...(i ? [{ t: '  ' }] : []), { t: f.arg, c: entryClass(f.node) }]));
      }
      let lastDir = null;
      dirs.forEach((d, i) => {
        if (dirs.length > 1 || files.length) { if (out.length) out.push(line('')); out.push(line(`${d.arg}:`)); }
        const r = listDir(d.path, d.node);
        out.push(...r.out);
        lastDir = { path: d.path, entries: r.entries };
      });
      if (!lastDir) return { out, event: { type: 'ls', path: files[0].path, file: true, all, long, entries: [] } };
      return { out, event: { type: 'ls', path: lastDir.path, all, long, entries: lastDir.entries.map((e) => e.path), dirs: dirs.map((d) => d.path) } };
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

    cat(args, io = {}) {
      if (!args.length && io.stdin != null) {
        const lines = io.stdin.split('\n'); if (lines[lines.length - 1] === '') lines.pop();
        return { out: lines.map((l) => line(l, 'content')), event: { type: 'cat', path: null, content: io.stdin, files: [] } };
      }
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
        const p = { ...ctx, kind: 'replace', label: `replace ${clash.name}? [y]es, [n]o, [A]ll, [N]one, [r]ename: ` };
        pending = { label: p.label, secret: false, command: 'unzip (answer)', resume: (t) => answerUnzip(p, t) };
        return { out: head, event: { type: 'unzip-prompt', path: ctx.path, kind: 'replace' } };
      }
      ctx.overwrite = false;
    }
    if (ctx.overwrite !== 'skip' && ctx.node.archive.password && ctx.password === null) {
      // Real unzip asks for the password interactively and does not echo it.
      const p = { ...ctx, kind: 'password', label: `[${ctx.file}] ${firstFile} password: ` };
      pending = { label: p.label, secret: true, command: 'unzip (password)', resume: (t) => answerUnzip(p, t) };
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
  function answerUnzip(p, text) {
    cwd = p.cwdAtStart;
    if (p.kind === 'replace') {
      const t = text.trim();
      if (/^(y|yes|A)$/.test(t)) return proceed({ ...p, overwrite: true }, false);
      if (/^(n|no|N)$/.test(t)) return proceed({ ...p, overwrite: 'skip' }, false);
      // anything else: real unzip complains and asks again
      pending = { label: p.label, secret: false, command: 'unzip (answer)', resume: (t) => answerUnzip(p, t) };
      const msg = /^r(ename)?$/i.test(t) ? "rename isn't available on this training machine. Answer y (replace) or n (keep)." : `error:  invalid response [${t.slice(0, 20)}]`;
      return { out: [err(msg)], ok: false, event: { type: 'unzip-prompt', path: p.path, kind: 'replace', again: true } };
    }
    return proceed({ ...p, password: text }, false);
  }

  function fail(cmd, reason, target, message) {
    return { out: [err(message)], ok: false, event: { type: 'error', cmd, reason, target } };
  }

  // ---- the wider command set (commands.js) and what it needs from the shell
  const history = [];
  let changes = null;
  const api = {
    fs, home, user: machine.user, host: machine.host, line, err, fail, entryClass, lookup, history,
    get cwd() { return cwd; },
    cwdAt(dir) { cwd = dir; },
    record: {
      created: (path, from = null) => changes.created.push({ path, from }),
      removed: (path, moved = false) => changes.removed.push({ path, moved }),
      modified: (path) => changes.modified.push(path),
    },
    /** Ask the learner something (e.g. a passphrase); `resume(answer)` continues. */
    ask({ label, secret, command, resume, event }) {
      pending = { label, secret, command, resume };
      return { out: [], event };
    },
  };
  Object.assign(commands, extraCommands(api));

  const fresh = () => ({ created: [], removed: [], modified: [] });
  const finish = (res, command) => {
    const event = { ...res.event, command };
    if (changes.created.length || changes.removed.length || changes.modified.length) {
      event.fsChange = changes;
      fs.tick();
    }
    return { ok: res.ok !== false, out: res.out, event };
  };

  // *.txt and friends, like bash: matched against the simulated filesystem, unmatched patterns stay as typed
  function expandGlobs(words, quoted) {
    const out = [];
    words.forEach((w, i) => {
      if (quoted[i] || !/[*?]/.test(w)) { out.push(w); return; }
      const cut = w.lastIndexOf('/');
      const dirArg = cut >= 0 ? (w.slice(0, cut) || '/') : '.';
      const pat = w.slice(cut + 1);
      const { node } = lookup(dirArg);
      if (!node || node.type !== 'dir' || /[*?]/.test(w.slice(0, Math.max(0, cut)))) { out.push(w); return; }
      const re = globToRegExp(pat);
      const hits = sortNames([...node.children.keys()].filter((n) => re.test(n) && (pat.startsWith('.') || !isHidden(n))));
      if (!hits.length) out.push(w); else out.push(...hits.map((n) => (cut >= 0 ? w.slice(0, cut + 1) : '') + n));
    });
    return out;
  }

  function exec(stageText, stdin, piped = false) {
    const tok = tokenize(stageText);
    if (tok.error) return fail('', 'usage', null, `bash: ${tok.error}`);
    if (!tok.words.length) return fail('', 'usage', null, "bash: syntax error near unexpected token '|'");
    const [name, ...args] = expandGlobs(tok.words, tok.quoted);
    if (Object.prototype.hasOwnProperty.call(commands, name)) return commands[name](args, { stdin, piped });
    if (NOT_YET.has(name)) return fail(name, 'unavailable', null, `${name}: a real Linux command, but it isn't available on this training machine yet`);
    return fail(name, 'unknown-command', null, `bash: ${name}: command not found`);
  }

  function run(rawLine) {
    const text = String(rawLine ?? '');
    changes = fresh();
    if (pending) {
      const p = pending;
      pending = null;
      return finish(p.resume(text), p.command || 'answer');
    }
    if (text.length > MAX_INPUT) return finish(fail('', 'usage', null, `bash: input is longer than ${MAX_INPUT} characters`), text.trim());
    if (text.trim()) history.push(text.trim());
    const split = splitLine(text);
    if (split.error) {
      const what = split.error === 'redirect' ? 'a redirect needs one file name after > (e.g. echo hi > note.txt)' : `'${split.error}' isn't available on this training machine. Pipes (|) and redirection (>, >>) work; run other commands one at a time.`;
      return finish({ ok: false, out: [err(`bash: ${what}`)], event: { type: 'error', cmd: '', reason: 'usage', target: null } }, text.trim());
    }
    const { stages, redirect } = split;
    if (stages.length === 1 && !stages[0].trim() && !redirect) return { ok: true, out: [], event: { type: 'noop' } };
    const names = stages.map((st) => tokenize(st).words?.[0]);
    if (stages.length > 1) {
      const blocked = names.find((n) => STANDALONE.has(n));
      if (blocked) return finish(fail(blocked, 'usage', null, `bash: ${blocked} can't be used in a pipe on this training machine. Run it on its own.`), text.trim());
      const bad = names.slice(1).find((n) => n && !FILTERS.has(n));
      if (bad) return finish(fail(bad, 'usage', null, `bash: ${bad} can't read from a pipe here. Pipe into grep, head, tail, wc, sort, base64, sha256sum or cat.`), text.trim());
      if (stages.length > 4) return finish(fail('', 'usage', null, 'bash: this training machine allows up to 4 commands in one pipe'), text.trim());
    }
    if (redirect && ['cd', 'unzip', 'gpg', 'clear'].includes(names[names.length - 1])) {
      return finish(fail(names[0], 'usage', null, `bash: ${names[names.length - 1]} can't be redirected on this training machine`), text.trim());
    }
    let stdin = null; let res = null;
    for (let i = 0; i < stages.length; i++) {
      res = exec(stages[i], stdin, i < stages.length - 1 || !!redirect);
      if (pending) return finish(res, text.trim());
      if (res.ok === false && i < stages.length - 1) return finish(res, text.trim());
      if (i < stages.length - 1) stdin = textOf(res.out);
    }
    if (stages.length > 1) res = { ...res, event: { ...res.event, pipe: names } };
    if (redirect) {
      const { path, node } = lookup(redirect.target);
      if (node && node.type === 'dir') return finish(fail('', 'is-dir', path, `bash: ${redirect.target}: Is a directory`), text.trim());
      const parent = fs.get(parentOf(path));
      if (!parent || parent.type !== 'dir') return finish(fail('', 'not-found', path, `bash: ${redirect.target}: No such file or directory`), text.trim());
      const body = textOf(res.out);
      const { created } = fs.writeFile(path, redirect.append && node ? (node.content && !node.content.endsWith('\n') ? '\n' : '') + body.replace(/\n$/, '') : body.replace(/\n$/, ''), { append: !!(redirect.append && node) });
      if (created) api.record.created(path); else api.record.modified(path);
      res = { ...res, out: res.out.filter((l) => l.some((sg) => sg.c === 'err')), event: { ...res.event, redirect: { path, append: redirect.append, created } } };
    }
    return finish(res, text.trim());
  }

  return {
    run,
    /** While a program waits for an answer: { label, secret } (secret = a password, don't echo it), else null. */
    get awaiting() { return pending ? { label: pending.label, secret: !!pending.secret } : null; },
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
