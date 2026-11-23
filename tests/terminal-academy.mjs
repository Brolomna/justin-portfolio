// Unit tests for the Terminal Academy filesystem + command interpreter.
// Run: node tests/terminal-academy.mjs
import assert from 'node:assert/strict';
import { buildMachine, lessonMachine, practiceMachine, PRACTICE_TARGET } from '../public/interactive-learning/js/fs/filesystem.js';
import { resolvePath, displayPath, pathChain, parentOf } from '../public/interactive-learning/js/fs/path.js';
import { createShell, tokenize } from '../public/interactive-learning/js/fs/shell.js';

let count = 0;
const check = (name, fn) => { fn(); count++; console.log('PASS', name); };
const text = (res) => res.out.map((l) => l.map((s) => s.t).join('')).join('\n');
const fresh = () => createShell(buildMachine(lessonMachine()));

// --- paths -----------------------------------------------------------------
check('relative path', () => assert.equal(resolvePath('/home/rookie', 'Documents', '/home/rookie'), '/home/rookie/Documents'));
check('parent path', () => assert.equal(resolvePath('/home/rookie/Documents', '..', '/home/rookie'), '/home/rookie'));
check('cannot climb above root', () => assert.equal(resolvePath('/home', '../../../../etc', '/home/rookie'), '/etc'));
check('tilde', () => assert.equal(resolvePath('/', '~/Documents', '/home/rookie'), '/home/rookie/Documents'));
check('absolute + dots', () => assert.equal(resolvePath('/x', '/home/./rookie//Documents/', '/home/rookie'), '/home/rookie/Documents'));
check('display path', () => assert.equal(displayPath('/home/rookie/Documents', '/home/rookie'), '~/Documents'));
check('display outside home', () => assert.equal(displayPath('/home', '/home/rookie'), '/home'));
check('path chain', () => assert.deepEqual(pathChain('/home/rookie'), ['/', '/home', '/home/rookie']));
check('parent of root', () => assert.equal(parentOf('/'), '/'));

// --- tokenizer -------------------------------------------------------------
check('tokenize spaces', () => assert.deepEqual(tokenize('  ls   -a  ').words, ['ls', '-a']));
check('tokenize quotes', () => assert.deepEqual(tokenize('cat "my file.txt"').words, ['cat', 'my file.txt']));
check('tokenize unclosed', () => assert.ok(tokenize('cat "oops').error));

// --- the nine lesson interactions, in order --------------------------------
const sh = fresh();
check('1 pwd', () => { const r = sh.run('pwd'); assert.equal(text(r), '/home/rookie'); assert.equal(r.event.type, 'pwd'); });
check('2 ls hides dotfiles', () => assert.equal(text(sh.run('ls')), 'Desktop  Documents  Downloads'));
check('3 cd Documents', () => { const r = sh.run('cd Documents'); assert.equal(r.event.direction, 'into'); assert.equal(sh.cwd, '/home/rookie/Documents'); assert.equal(sh.prompt().dir, '~/Documents'); });
check('4 ls in Documents', () => assert.equal(text(sh.run('ls')), 'notes.txt  project'));
check('5 cat notes.txt', () => { const r = sh.run('cat notes.txt'); assert.equal(text(r), 'This machine contains more than it appears.\nKeep exploring.'); assert.equal(r.event.path, '/home/rookie/Documents/notes.txt'); });
check('6 cd ..', () => { const r = sh.run('cd ..'); assert.equal(r.event.direction, 'up'); assert.equal(sh.prompt().dir, '~'); });
check('7 ls -a', () => { const r = sh.run('ls -a'); assert.equal(text(r), '.  ..  Desktop  Documents  Downloads  .hidden'); assert.ok(r.event.all); });
check('8 cd .hidden', () => { sh.run('cd .hidden'); assert.equal(sh.cwd, '/home/rookie/.hidden'); });
check('9 cat message.txt', () => assert.match(text(sh.run('cat message.txt')), /^You found me\./));

// --- errors never change state ---------------------------------------------
check('typo in cd', () => {
  const s = fresh(); const r = s.run('cd Documnts');
  assert.equal(text(r), 'bash: cd: Documnts: No such file or directory');
  assert.equal(r.ok, false); assert.equal(r.event.reason, 'not-found'); assert.equal(s.cwd, '/home/rookie');
});
check('cd into a file', () => { const s = fresh(); s.run('cd Documents'); const r = s.run('cd notes.txt'); assert.equal(text(r), 'bash: cd: notes.txt: Not a directory'); assert.equal(s.cwd, '/home/rookie/Documents'); });
check('cat missing', () => assert.equal(text(fresh().run('cat missing.txt')), 'cat: missing.txt: No such file or directory'));
check('cat a directory', () => assert.equal(text(fresh().run('cat Documents')), 'cat: Documents: Is a directory'));
check('unknown command', () => { const r = fresh().run('lss'); assert.equal(text(r), 'bash: lss: command not found'); assert.equal(r.event.reason, 'unknown-command'); });
check('real but unavailable command is not "not found"', () => assert.match(text(fresh().run('rm notes.txt')), /isn't available/));
check('unsupported ls flag', () => assert.match(text(fresh().run('ls -l')), /-l option isn't available/));
check('cd too many args', () => assert.equal(text(fresh().run('cd a b')), 'bash: cd: too many arguments'));
check('empty input', () => assert.equal(fresh().run('   ').event.type, 'noop'));
check('long input rejected', () => assert.equal(fresh().run('x'.repeat(500)).ok, false));
check('no chaining or eval of input', () => {
  const s = fresh();
  for (const bad of ['pwd; cd Documents', 'ls | cat', 'cat notes.txt > x', 'echo $(pwd)', 'ls && cd Documents', 'cat `x`']) {
    const r = s.run(bad); assert.equal(r.ok, false); assert.match(text(r), /isn't available/);
  }
  assert.equal(s.cwd, '/home/rookie');
});
check('prototype names are not commands', () => assert.equal(fresh().run('constructor').event.reason, 'unknown-command'));
check('__proto__ path is just missing', () => assert.equal(fresh().run('cd __proto__').ok, false));

// --- general shell behaviour ----------------------------------------------
check('cd with no args goes home', () => { const s = fresh(); s.run('cd Documents/project'); s.run('cd'); assert.equal(s.cwd, '/home/rookie'); });
check('multi-segment cd', () => { const s = fresh(); const r = s.run('cd Documents/project'); assert.equal(r.event.direction, 'jump'); assert.equal(s.cwd, '/home/rookie/Documents/project'); });
check('cd .. at root stays at root', () => { const s = fresh(); s.run('cd /'); s.run('cd ..'); assert.equal(s.cwd, '/'); });
check('ls a path', () => assert.equal(text(fresh().run('ls Documents')), 'notes.txt  project'));
check('ls a file', () => assert.equal(text(fresh().run('ls Documents/notes.txt')), 'Documents/notes.txt'));
check('ls root', () => assert.equal(text(fresh().run('ls /')), 'home'));
check('cat two files', () => assert.equal(fresh().run('cat Desktop/welcome.txt Documents/notes.txt').event.files.length, 2));
check('cat absolute path', () => assert.match(text(fresh().run('cat /home/rookie/.hidden/message.txt')), /You found me/));
check('ls -a in empty-ish dir', () => assert.equal(text(fresh().run('ls -a Desktop')), '.  ..  welcome.txt'));
check('dir output is classed', () => assert.equal(fresh().run('ls').out[0][0].c, 'dir'));

// --- practice machine ------------------------------------------------------
check('practice machine is different', () => {
  const p = createShell(buildMachine(practiceMachine()));
  assert.equal(p.cwd, '/home/operator');
  assert.equal(text(p.run('ls')), 'backups  logs  projects  readme.txt');
  assert.equal(p.run('cd Documents').ok, false);
});
check('practice target needs ls -a', () => {
  const p = createShell(buildMachine(practiceMachine()));
  p.run('cd projects/radio');
  assert.equal(text(p.run('ls')), 'frequencies.txt');
  assert.match(text(p.run('ls -a')), /\.archive/);
  p.run('cd .archive');
  const r = p.run('cat transmission.txt');
  assert.equal(r.event.path, PRACTICE_TARGET);
});
check('machines are independent copies', () => {
  const a = buildMachine(lessonMachine()), b = buildMachine(lessonMachine());
  assert.notEqual(a.fs.root, b.fs.root);
});

console.log(`\n${count} checks passed`);
