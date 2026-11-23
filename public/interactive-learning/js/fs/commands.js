// The wider command set (Lessons 3-6): files and directories, organizing, reading
// and searching text, encoding, hashing and encryption. Each command behaves like
// its GNU/Linux counterpart on the simulated filesystem, with the same kind of
// error messages. Plugged into shell.js through `api` (see createShell).
//
// A command gets (args, io) where io.stdin is the previous pipe stage's text
// (or null), and returns { out, ok?, event }.

import { isHidden, sortNames, gpgFile } from './filesystem.js';
import { parentOf, baseName } from './path.js';
import { base64Encode, base64Decode, wrap76, sha256 } from './codec.js';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Text of a file as a real file would hold it: ending with a newline. */
const asFileText = (s) => (s.endsWith('\n') ? s : `${s}\n`);
/** Split text into lines, without the empty piece after a final newline. */
const linesOf = (s) => { const l = s.split('\n'); if (l[l.length - 1] === '') l.pop(); return l; };

/** Parse short flags like -r, -rf, -n 5, -5. Returns { flags:Set, values:{}, rest:[] }. */
function parseFlags(args, { allowed, withValue = [] }) {
  const flags = new Set(); const values = {}; const rest = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--') { rest.push(...args.slice(i + 1)); break; }
    if (/^-\d+$/.test(a) && withValue.includes('n')) { values.n = Number(a.slice(1)); continue; }
    if (a.startsWith('--') && a.length > 2) { flags.add(a); continue; }
    if (a.startsWith('-') && a.length > 1) {
      for (let j = 1; j < a.length; j++) {
        const ch = a[j];
        if (withValue.includes(ch)) {
          const v = a.slice(j + 1) || args[++i];
          if (v === undefined) return { error: `option requires an argument -- '${ch}'` };
          values[ch] = v;
          break;
        }
        if (!allowed.includes(ch)) return { error: `invalid option -- '${ch}'`, bad: ch };
        flags.add(ch);
      }
      continue;
    }
    rest.push(a);
  }
  return { flags, values, rest };
}

/** Shell-style pattern (*, ?) to a RegExp. */
export function globToRegExp(pat) {
  return new RegExp(`^${pat.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.')}$`);
}

export function extraCommands(api) {
  const { fs, line, err, fail, entryClass, lookup, record, user, host, home } = api;
  const cwd = () => api.cwd;
  const shown = (arg, path) => arg ?? path;

  // where something would go: dest dir + name, following cp/mv rules
  function target(destArg, srcPath, many, cmd) {
    const { path: dpath, node: dnode } = lookup(destArg);
    if (dnode && dnode.type === 'dir') return { path: (dpath === '/' ? '' : dpath) + '/' + baseName(srcPath) };
    if (many) return { error: `${cmd}: target '${destArg}' is not a directory` };
    const parent = fs.get(parentOf(dpath));
    if (!parent || parent.type !== 'dir') return { error: `${cmd}: cannot create regular file '${destArg}': No such file or directory` };
    return { path: dpath };
  }

  function guardRemove(cmd, arg, path) {
    if (path === '/') return `${cmd}: it is dangerous to operate recursively on '/'`;
    if (path === home || home.startsWith(path + '/')) return `${cmd}: refusing to remove '${arg}': it holds your home directory (this training machine protects it)`;
    if (cwd() === path || cwd().startsWith(path + '/')) return `${cmd}: refusing to remove '${arg}': you are inside it. cd out of it first.`;
    return null;
  }

  // text input for filters: files named in args, else what came down the pipe
  function readInputs(cmd, files, io) {
    if (!files.length) {
      if (io.stdin === null) return { error: `${cmd}: no file given (usage: ${cmd} FILE, or pipe text into it with |)` };
      return { inputs: [{ name: null, text: io.stdin }] };
    }
    const inputs = []; const errors = [];
    for (const f of files) {
      const { path, node } = lookup(f);
      if (!node) errors.push(`${cmd}: ${f}: No such file or directory`);
      else if (node.type === 'dir') errors.push(`${cmd}: ${f}: Is a directory`);
      else inputs.push({ name: f, path, text: asFileText(node.content) });
    }
    return { inputs, errors };
  }

  const cmds = {
    whoami: () => ({ out: [line(user)], event: { type: 'whoami', user } }),
    hostname: () => ({ out: [line(host)], event: { type: 'hostname', host } }),
    date() {
      const t = fs.now();
      const d = new Date(`${t.slice(0, 6)} 2026 ${t.slice(7)}:00 UTC`);
      return { out: [line(`${DAYS[d.getUTCDay()]} ${t.slice(0, 6)} ${t.slice(7)}:00 UTC 2026`)], event: { type: 'date' } };
    },

    echo(args) {
      const words = args[0] === '-n' ? args.slice(1) : args;
      return { out: [line(words.join(' '), 'content')], event: { type: 'echo', text: words.join(' ') } };
    },

    touch(args) {
      if (!args.length) return fail('touch', 'usage', null, 'touch: missing file operand');
      const out = []; const created = []; const touched = [];
      for (const a of args) {
        const { path, node } = lookup(a);
        if (node) { fs.touch(path); touched.push(path); continue; }
        const parent = fs.get(parentOf(path));
        if (!parent || parent.type !== 'dir') { out.push(err(`touch: cannot touch '${a}': No such file or directory`)); continue; }
        fs.writeFile(path, '');
        record.created(path);
        created.push(path);
      }
      const ok = created.length + touched.length > 0;
      return { out, ok, event: ok ? { type: 'touch', created, touched } : { type: 'error', cmd: 'touch', reason: 'not-found', target: null } };
    },

    mkdir(args) {
      const p = parseFlags(args, { allowed: ['p', 'v'] });
      if (p.error) return fail('mkdir', 'usage', null, `mkdir: ${p.error}`);
      if (!p.rest.length) return fail('mkdir', 'usage', null, 'mkdir: missing operand');
      const out = []; const made = [];
      for (const a of p.rest) {
        const { path, node } = lookup(a);
        if (node) {
          if (!p.flags.has('p')) out.push(err(`mkdir: cannot create directory '${a}': File exists`));
          continue;
        }
        const chain = [];
        let cur = path;
        while (!fs.get(cur)) { chain.unshift(cur); cur = parentOf(cur); }
        if (fs.get(cur).type !== 'dir') { out.push(err(`mkdir: cannot create directory '${a}': Not a directory`)); continue; }
        if (chain.length > 1 && !p.flags.has('p')) { out.push(err(`mkdir: cannot create directory '${a}': No such file or directory`)); continue; }
        for (const c of chain) {
          fs.put(c, {});
          record.created(c);
          made.push(c);
          if (p.flags.has('v')) out.push(line(`mkdir: created directory '${c}'`));
        }
      }
      const ok = made.length > 0 || (p.flags.has('p') && !out.length);
      return { out, ok, event: made.length ? { type: 'mkdir', paths: made, parents: p.flags.has('p') } : (ok ? { type: 'noop' } : { type: 'error', cmd: 'mkdir', reason: 'exists', target: null }) };
    },

    rmdir(args) {
      if (!args.length) return fail('rmdir', 'usage', null, 'rmdir: missing operand');
      const out = []; const removed = [];
      for (const a of args) {
        const { path, node } = lookup(a);
        if (!node) { out.push(err(`rmdir: failed to remove '${a}': No such file or directory`)); continue; }
        if (node.type !== 'dir') { out.push(err(`rmdir: failed to remove '${a}': Not a directory`)); continue; }
        if (node.children.size) { out.push(err(`rmdir: failed to remove '${a}': Directory not empty`)); continue; }
        const guard = guardRemove('rmdir', a, path);
        if (guard) { out.push(err(guard)); continue; }
        for (const g of fs.remove(path)) record.removed(g);
        removed.push(path);
      }
      return { out, ok: removed.length > 0, event: removed.length ? { type: 'rmdir', paths: removed } : { type: 'error', cmd: 'rmdir', reason: 'not-empty', target: lookup(args[0]).path } };
    },

    rm(args) {
      const p = parseFlags(args, { allowed: ['r', 'R', 'f', 'v', 'i'] });
      if (p.error) return fail('rm', 'usage', null, `rm: ${p.error}`);
      const recursive = p.flags.has('r') || p.flags.has('R');
      const force = p.flags.has('f');
      if (!p.rest.length) return force ? { out: [], event: { type: 'noop' } } : fail('rm', 'usage', null, 'rm: missing operand');
      const out = []; const removed = []; let firstTarget = null;
      for (const a of p.rest) {
        const { path, node } = lookup(a);
        firstTarget ??= path;
        if (!node) { if (!force) out.push(err(`rm: cannot remove '${a}': No such file or directory`)); continue; }
        if (node.type === 'dir' && !recursive) { out.push(err(`rm: cannot remove '${a}': Is a directory`)); continue; }
        const guard = guardRemove('rm', a, path);
        if (guard) { out.push(err(guard)); continue; }
        for (const g of fs.remove(path)) { record.removed(g); removed.push(g); }
        if (p.flags.has('v')) out.push(line(`removed '${a}'`));
      }
      const ok = removed.length > 0 || (force && !out.length);
      return { out, ok, event: removed.length ? { type: 'rm', paths: removed, recursive } : (ok ? { type: 'noop' } : { type: 'error', cmd: 'rm', reason: out.some((l) => /Is a directory/.test(l[0].t)) ? 'is-dir' : 'not-found', target: firstTarget }) };
    },

    cp(args) {
      const p = parseFlags(args, { allowed: ['r', 'R', 'v', 'i', 'a'] });
      if (p.error) return fail('cp', 'usage', null, `cp: ${p.error}`);
      const recursive = p.flags.has('r') || p.flags.has('R') || p.flags.has('a');
      if (p.rest.length === 0) return fail('cp', 'usage', null, 'cp: missing file operand');
      if (p.rest.length === 1) return fail('cp', 'usage', null, `cp: missing destination file operand after '${p.rest[0]}'`);
      const dest = p.rest[p.rest.length - 1];
      const srcs = p.rest.slice(0, -1);
      const out = []; const copies = [];
      for (const s of srcs) {
        const { path, node } = lookup(s);
        if (!node) { out.push(err(`cp: cannot stat '${s}': No such file or directory`)); continue; }
        if (node.type === 'dir' && !recursive) { out.push(err(`cp: -r not specified; omitting directory '${s}'`)); continue; }
        const t = target(dest, path, srcs.length > 1, 'cp');
        if (t.error) { out.push(err(t.error)); break; }
        if (t.path === path) { out.push(err(`cp: '${s}' and '${dest}' are the same file`)); continue; }
        if (t.path.startsWith(path + '/')) { out.push(err(`cp: cannot copy a directory, '${s}', into itself, '${dest}'`)); continue; }
        const created = fs.copy(path, t.path);
        for (const c of created) record.created(c, path);
        copies.push({ from: path, to: t.path });
        if (p.flags.has('v')) out.push(line(`'${s}' -> '${t.path}'`));
      }
      return { out, ok: copies.length > 0, event: copies.length ? { type: 'cp', copies, recursive } : { type: 'error', cmd: 'cp', reason: 'failed', target: lookup(srcs[0]).path } };
    },

    mv(args) {
      const p = parseFlags(args, { allowed: ['v', 'i', 'f', 'n'] });
      if (p.error) return fail('mv', 'usage', null, `mv: ${p.error}`);
      if (p.rest.length === 0) return fail('mv', 'usage', null, 'mv: missing file operand');
      if (p.rest.length === 1) return fail('mv', 'usage', null, `mv: missing destination file operand after '${p.rest[0]}'`);
      const dest = p.rest[p.rest.length - 1];
      const srcs = p.rest.slice(0, -1);
      const out = []; const moves = [];
      for (const s of srcs) {
        const { path, node } = lookup(s);
        if (!node) { out.push(err(`mv: cannot stat '${s}': No such file or directory`)); continue; }
        const t = target(dest, path, srcs.length > 1, 'mv');
        if (t.error) { out.push(err(t.error)); break; }
        if (t.path === path) { out.push(err(`mv: '${s}' and '${dest}' are the same file`)); continue; }
        if (t.path.startsWith(path + '/')) { out.push(err(`mv: cannot move '${s}' to a subdirectory of itself, '${dest}'`)); continue; }
        const guard = node.type === 'dir' ? guardRemove('mv', s, path) : null;
        if (guard) { out.push(err(guard.replace('remove', 'move'))); continue; }
        const r = fs.move(path, t.path);
        for (const g of r.removed) record.removed(g, true);
        r.created.forEach((c, i) => record.created(c, r.removed[i]));
        moves.push({ from: path, to: t.path, rename: parentOf(path) === parentOf(t.path) });
        if (p.flags.has('v')) out.push(line(`renamed '${s}' -> '${t.path}'`));
      }
      return { out, ok: moves.length > 0, event: moves.length ? { type: 'mv', moves } : { type: 'error', cmd: 'mv', reason: 'failed', target: lookup(srcs[0]).path } };
    },

    head(args, io) { return headTail('head', args, io); },
    tail(args, io) { return headTail('tail', args, io); },

    wc(args, io) {
      const p = parseFlags(args, { allowed: ['l', 'w', 'c', 'm'] });
      if (p.error) return fail('wc', 'usage', null, `wc: ${p.error}`);
      const r = readInputs('wc', p.rest, io);
      if (r.error) return fail('wc', 'usage', null, r.error);
      const want = p.flags.size ? ['l', 'w', 'c'].filter((f) => p.flags.has(f) || (f === 'c' && p.flags.has('m'))) : ['l', 'w', 'c'];
      const rows = r.inputs.map((i) => {
        const n = { l: (i.text.match(/\n/g) || []).length, w: i.text.split(/\s+/).filter(Boolean).length, c: new TextEncoder().encode(i.text).length };
        return { name: i.name, n };
      });
      if (rows.length > 1) rows.push({ name: 'total', n: rows.reduce((t, x) => ({ l: t.l + x.n.l, w: t.w + x.n.w, c: t.c + x.n.c }), { l: 0, w: 0, c: 0 }) });
      const width = want.length === 1 && rows.length === 1 ? 0 : Math.max(...rows.flatMap((x) => want.map((f) => String(x.n[f]).length)));
      const out = (r.errors || []).map((e) => err(e));
      for (const x of rows) out.push(line([...want.map((f) => String(x.n[f]).padStart(width)), x.name].filter((v) => v !== null && v !== undefined).join(' ')));
      return { out, ok: rows.length > 0, event: { type: 'wc', lines: rows[0]?.n.l, counts: rows, files: r.inputs.map((i) => i.path).filter(Boolean) } };
    },

    sort(args, io) {
      const p = parseFlags(args, { allowed: ['r', 'n', 'u'] });
      if (p.error) return fail('sort', 'usage', null, `sort: ${p.error}`);
      const r = readInputs('sort', p.rest, io);
      if (r.error) return fail('sort', 'usage', null, r.error);
      let all = r.inputs.flatMap((i) => linesOf(i.text));
      all = p.flags.has('n') ? all.sort((a, b) => parseFloat(a) - parseFloat(b)) : all.sort((a, b) => a.localeCompare(b));
      if (p.flags.has('r')) all.reverse();
      if (p.flags.has('u')) all = all.filter((l, i) => all.indexOf(l) === i);
      return { out: [...(r.errors || []).map((e) => err(e)), ...all.map((l) => line(l, 'content'))], event: { type: 'sort' } };
    },

    grep(args, io) {
      const p = parseFlags(args, { allowed: ['i', 'n', 'v', 'c', 'r', 'R', 'l', 'w'] });
      if (p.error) return fail('grep', 'usage', null, `grep: ${p.error}`);
      const [pattern, ...files] = p.rest;
      if (pattern === undefined) return fail('grep', 'usage', null, 'Usage: grep [OPTION]... PATTERNS [FILE]...');
      const recursive = p.flags.has('r') || p.flags.has('R');
      let re;
      const body = p.flags.has('w') ? `\\b(?:${pattern})\\b` : pattern;
      try { re = new RegExp(body, p.flags.has('i') ? 'gi' : 'g'); } catch { re = new RegExp(body.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), p.flags.has('i') ? 'gi' : 'g'); }
      let inputs = []; const errors = [];
      if (recursive) {
        const starts = files.length ? files : ['.'];
        for (const s of starts) {
          const { path, node } = lookup(s);
          if (!node) { errors.push(`grep: ${s}: No such file or directory`); continue; }
          const walk = (n, shownAs) => {
            if (n.type === 'file') { if (!n.archive && !n.encrypted) inputs.push({ name: shownAs, path: n.path, text: asFileText(n.content) }); return; }
            for (const name of sortNames([...n.children.keys()])) walk(n.children.get(name), `${shownAs === '.' ? '.' : shownAs}/${name}`.replace(/^\.\//, ''));
          };
          walk(node, files.length ? s.replace(/\/$/, '') : '.');
        }
      } else {
        const r = readInputs('grep', files, io);
        if (r.error) return fail('grep', 'usage', null, r.error);
        inputs = r.inputs; errors.push(...(r.errors || []));
      }
      const prefix = recursive || inputs.length > 1;
      const out = errors.map((e) => err(e));
      let total = 0;
      const matchedFiles = [];
      for (const i of inputs) {
        let count = 0;
        linesOf(i.text).forEach((l, idx) => {
          re.lastIndex = 0;
          const hit = re.test(l) !== p.flags.has('v');
          if (!hit) return;
          count++;
          if (p.flags.has('c') || p.flags.has('l')) return;
          const segs = [];
          if (prefix) segs.push({ t: i.name, c: 'grep-file' }, { t: ':' });
          if (p.flags.has('n')) segs.push({ t: String(idx + 1), c: 'grep-num' }, { t: ':' });
          if (p.flags.has('v')) segs.push({ t: l, c: 'content' });
          else {
            let last = 0; re.lastIndex = 0; let m;
            while ((m = re.exec(l)) && m[0] !== '') { segs.push({ t: l.slice(last, m.index), c: 'content' }, { t: m[0], c: 'match' }); last = m.index + m[0].length; }
            segs.push({ t: l.slice(last), c: 'content' });
          }
          out.push(segs);
        });
        if (p.flags.has('c')) out.push(line(prefix ? `${i.name}:${count}` : String(count)));
        if (p.flags.has('l') && count) out.push([{ t: i.name || '(standard input)', c: 'grep-file' }]);
        if (count) matchedFiles.push(i.path);
        total += count;
      }
      return { out, ok: true, event: { type: 'grep', pattern, matches: total, files: matchedFiles.filter(Boolean), recursive } };
    },

    find(args) {
      const starts = []; let i = 0;
      while (i < args.length && !args[i].startsWith('-')) starts.push(args[i++]);
      let name = null, iname = null, type = null;
      for (; i < args.length; i++) {
        const a = args[i];
        if (a === '-name') name = args[++i];
        else if (a === '-iname') iname = args[++i];
        else if (a === '-type') type = args[++i];
        else return fail('find', 'usage', null, `find: unknown predicate '${a}' (this training machine knows -name, -iname and -type)`);
        if (args[i] === undefined) return fail('find', 'usage', null, `find: missing argument to '${a}'`);
      }
      if (type && !['f', 'd'].includes(type)) return fail('find', 'usage', null, `find: Unknown argument to -type: ${type}`);
      const re = name ? globToRegExp(name) : iname ? new RegExp(globToRegExp(iname).source, 'i') : null;
      const out = []; const found = [];
      for (const s of starts.length ? starts : ['.']) {
        const { node } = lookup(s);
        if (!node) { out.push(err(`find: '${s}': No such file or directory`)); continue; }
        const walk = (n, shownAs) => {
          const okType = !type || (type === 'd' ? n.type === 'dir' : n.type === 'file');
          if (okType && (!re || re.test(n.name === '/' ? '/' : n.name))) { out.push([{ t: shownAs, c: n.type === 'dir' ? 'dir' : 'file' }]); found.push(n.path); }
          if (n.type === 'dir') for (const c of sortNames([...n.children.keys()])) walk(n.children.get(c), `${shownAs === '/' ? '' : shownAs}/${c}`);
        };
        walk(node, s.replace(/^~(?=\/|$)/, home).replace(/(.)\/$/, '$1'));
      }
      return { out, ok: found.length > 0 || !out.length, event: { type: 'find', found, pattern: name || iname } };
    },

    history() {
      return { out: api.history.map((h, i) => line(`${String(i + 1).padStart(5)}  ${h}`)), event: { type: 'history' } };
    },

    base64(args, io) {
      const p = parseFlags(args, { allowed: ['d', 'w'] });
      if (p.error) return fail('base64', 'usage', null, `base64: ${p.error}`);
      const r = readInputs('base64', p.rest, io);
      if (r.error) return fail('base64', 'usage', null, r.error);
      if (r.errors?.length) return fail('base64', 'not-found', null, r.errors[0]);
      const text = r.inputs[0].text;
      if (p.flags.has('d')) {
        const plain = base64Decode(text);
        if (plain === null) return fail('base64', 'invalid', r.inputs[0].path, 'base64: invalid input');
        return { out: linesOf(plain).map((l) => line(l, 'content')), event: { type: 'base64', decode: true, path: r.inputs[0].path || null, text: plain } };
      }
      return { out: wrap76(base64Encode(text)).map((l) => line(l, 'content')), event: { type: 'base64', decode: false, path: r.inputs[0].path || null, text: base64Encode(text) } };
    },

    sha256sum(args, io) {
      const p = parseFlags(args, { allowed: ['c'] });
      if (p.error) return fail('sha256sum', 'usage', null, `sha256sum: ${p.error}`);
      if (p.flags.has('c')) {
        // check mode: each line of the list is "<hash>  <file>"
        const r = readInputs('sha256sum', p.rest, io);
        if (r.error || r.errors?.length) return fail('sha256sum', 'not-found', null, r.error || r.errors[0]);
        const out = []; let failed = 0; const checked = [];
        for (const l of linesOf(r.inputs[0].text)) {
          const m = l.match(/^([0-9a-f]{64})\s+\*?(.+)$/i);
          if (!m) continue;
          const { path, node } = lookup(m[2]);
          if (!node || node.type !== 'file') { out.push(err(`sha256sum: ${m[2]}: No such file or directory`)); failed++; continue; }
          const good = sha256(asFileText(node.content)) === m[1].toLowerCase();
          if (!good) failed++;
          checked.push({ path, ok: good });
          out.push(line(`${m[2]}: ${good ? 'OK' : 'FAILED'}`, good ? 'ok' : 'err'));
        }
        if (failed) out.push(err(`sha256sum: WARNING: ${failed} computed checksum${failed > 1 ? 's' : ''} did NOT match`));
        return { out, ok: true, event: { type: 'sha256sum', check: true, checked, failed } };
      }
      const r = readInputs('sha256sum', p.rest, io);
      if (r.error) return fail('sha256sum', 'usage', null, r.error);
      const out = (r.errors || []).map((e) => err(e));
      const sums = r.inputs.map((i) => ({ path: i.path, hash: sha256(i.text) }));
      r.inputs.forEach((i, k) => out.push(line(`${sums[k].hash}  ${i.name ?? '-'}`)));
      return { out, ok: sums.length > 0, event: { type: 'sha256sum', sums } };
    },

    gpg(args) {
      let mode = null, outFile = null; const files = [];
      for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (a === '-c' || a === '--symmetric') mode = 'encrypt';
        else if (a === '-d' || a === '--decrypt') mode = 'decrypt';
        else if (a === '-o' || a === '--output') { outFile = args[++i]; if (outFile === undefined) return fail('gpg', 'usage', null, 'gpg: -o needs a file name'); }
        else if (a.startsWith('-')) return fail('gpg', 'unavailable', null, `gpg: the ${a} option isn't available on this training machine (try gpg -c FILE or gpg -d FILE)`);
        else files.push(a);
      }
      if (!mode) return fail('gpg', 'usage', null, 'gpg: choose -c to encrypt or -d to decrypt (e.g. gpg -c notes.txt)');
      if (files.length !== 1) return fail('gpg', 'usage', null, `gpg: ${mode === 'encrypt' ? 'encrypt' : 'decrypt'} one file at a time`);
      const { path, node } = lookup(files[0]);
      if (!node) return fail('gpg', 'not-found', path, `gpg: can't open '${files[0]}': No such file or directory`);
      if (node.type === 'dir') return fail('gpg', 'is-dir', path, `gpg: read error: Is a directory`);
      const startCwd = cwd();
      if (mode === 'encrypt') {
        const outPath = outFile ? lookup(outFile).path : `${path}.gpg`;
        return api.ask({
          label: 'Enter passphrase: ', secret: true, command: 'gpg (passphrase)',
          event: { type: 'gpg-prompt', path, mode },
          resume: (pass1) => api.ask({
            label: 'Repeat passphrase: ', secret: true, command: 'gpg (passphrase)',
            event: { type: 'gpg-prompt', path, mode, repeat: true },
            resume: (pass2) => {
              if (!pass1) return fail('gpg', 'bad-passphrase', path, 'gpg: an empty passphrase is not allowed on this training machine');
              if (pass1 !== pass2) return fail('gpg', 'bad-passphrase', path, 'gpg: passphrases do not match. Nothing was encrypted.');
              const existed = !!fs.get(outPath);
              if (existed) fs.remove(outPath);
              fs.put(outPath, gpgFile(node.content, pass1));
              if (!existed) record.created(outPath, path); else record.modified(outPath);
              api.cwdAt(startCwd);
              return { out: [], event: { type: 'gpg-encrypt', path, out: outPath } };
            },
          }),
        });
      }
      if (!node.encrypted) {
        return { out: [err('gpg: no valid OpenPGP data found.'), err(`gpg: decrypt_message failed: Unknown system error`)], ok: false, event: { type: 'error', cmd: 'gpg', reason: 'not-encrypted', target: path } };
      }
      return api.ask({
        label: 'Enter passphrase: ', secret: true, command: 'gpg (passphrase)',
        event: { type: 'gpg-prompt', path, mode },
        resume: (pass) => {
          const info = [line('gpg: AES256.CFB encrypted data', 'dim'), line('gpg: encrypted with 1 passphrase', 'dim')];
          if (pass !== node.encrypted.password) return { out: [...info, err('gpg: decryption failed: Bad session key')], ok: false, event: { type: 'error', cmd: 'gpg', reason: 'bad-passphrase', target: path } };
          const plain = node.encrypted.plain;
          if (outFile) {
            const target2 = lookup(outFile).path;
            const parent = fs.get(parentOf(target2));
            if (!parent || parent.type !== 'dir') return fail('gpg', 'not-found', target2, `gpg: can't create '${outFile}': No such file or directory`);
            const { created } = fs.writeFile(target2, plain);
            if (created) record.created(target2, path); else record.modified(target2);
            return { out: info, event: { type: 'gpg-decrypt', path, out: target2, content: plain } };
          }
          return { out: [...info, ...plain.split('\n').map((l) => line(l, 'content'))], event: { type: 'gpg-decrypt', path, content: plain } };
        },
      });
    },
  };

  function headTail(cmd, args, io) {
    const p = parseFlags(args, { allowed: [], withValue: ['n'] });
    if (p.error) return fail(cmd, 'usage', null, `${cmd}: ${p.error}`);
    const n = p.values.n === undefined ? 10 : Number(p.values.n);
    if (!Number.isFinite(n) || n < 0) return fail(cmd, 'usage', null, `${cmd}: invalid number of lines: '${p.values.n}'`);
    const r = readInputs(cmd, p.rest, io);
    if (r.error) return fail(cmd, 'usage', null, r.error);
    const out = (r.errors || []).map((e) => err(`${cmd}: cannot open '${e.split(': ')[1]}' for reading: ${e.split(': ').slice(2).join(': ')}`));
    r.inputs.forEach((i, k) => {
      if (r.inputs.length > 1) { if (k) out.push(line('')); out.push(line(`==> ${i.name} <==`, 'dim')); }
      const all = linesOf(i.text);
      const pick = cmd === 'head' ? all.slice(0, n) : all.slice(Math.max(0, all.length - n));
      for (const l of pick) out.push(line(l, 'content'));
    });
    return { out, ok: r.inputs.length > 0, event: { type: cmd, n, files: r.inputs.map((i) => i.path).filter(Boolean) } };
  }

  return cmds;
}

/** Commands that make sense as pipe filters (they read the previous stage's text). */
export const FILTERS = new Set(['grep', 'head', 'tail', 'wc', 'sort', 'base64', 'sha256sum', 'cat']);
/** Commands that can't run inside a pipe on this machine (they change state or ask questions). */
export const STANDALONE = new Set(['cd', 'unzip', 'gpg', 'clear', 'rm', 'rmdir', 'mv', 'cp', 'mkdir', 'touch']);
