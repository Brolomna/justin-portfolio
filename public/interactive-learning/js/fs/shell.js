// Allowlisted command interpreter for the simulated filesystem.
// Input is treated as plain text: it is tokenized, never evaluated, and only the
// commands below exist. Every command works against the real simulated tree,
// so `cd Documents` works because Documents exists, not because the string matched.

import { isHidden, sortNames, fileKind } from './filesystem.js';
import { resolvePath, parentOf, displayPath } from './path.js';

export const MAX_INPUT = 200;

// Real Linux commands that this training machine does not offer (yet). Saying
// "command not found" for these would teach something false.
const NOT_YET = new Set(['mkdir', 'rm', 'rmdir', 'touch', 'mv', 'cp', 'nano', 'vim', 'vi', 'less', 'more',
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
  };

  function fail(cmd, reason, target, message) {
    return { out: [err(message)], ok: false, event: { type: 'error', cmd, reason, target } };
  }

  function run(rawLine) {
    const text = String(rawLine ?? '');
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
    get cwd() { return cwd; },
    prompt: () => ({ user: machine.user, host: machine.host, dir: displayPath(cwd, home) }),
  };
}
