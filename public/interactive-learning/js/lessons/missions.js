// Every mission on the page, in the recommended order. Lessons have guided
// steps; tests have one objective, concept-only hints and a done(event) check.
// Nothing is locked or scored: learners can open any mission at any time.

import { lessonMachine, practiceMachine, archivesMachine, vaultMachine, filesMachine, organizeMachine, searchMachine, ciphersMachine, moleMachine, PRACTICE_TARGET, VAULT_ARCHIVE, MOLE_FILE } from '../fs/machines.js';
import * as exploring from './exploring-linux.js';
import * as archives from './archives.js';
import * as files from './files.js';
import * as organize from './organize.js';
import * as search from './search.js';
import * as ciphers from './ciphers.js';

const LESSON1_COMMANDS = exploring.finale.recap.map(([c]) => c);
const recapOf = (l) => l.finale.recap.map(([c]) => c);
const LESSON2_COMMANDS = archives.finale.recap.map(([c]) => c).filter((c) => c.startsWith('unzip'));

export const missions = [
  {
    id: 'exploring',
    kind: 'lesson',
    label: 'Lesson 1',
    title: 'Exploring Linux',
    subtitle: 'Learn to navigate a computer without a mouse.',
    teaches: ['pwd', 'ls', 'ls -a', 'cd', 'cd ..', 'cat'],
    storyTitle: 'The Forgotten Machine',
    story: exploring.topic.story,
    say: exploring.topic.say,
    machine: lessonMachine,
    steps: exploring.steps,
    finale: exploring.finale,
  },
  {
    id: 'archives',
    kind: 'lesson',
    label: 'Lesson 2',
    title: 'Unpacking Archives',
    subtitle: 'Open zip files, including locked ones.',
    teaches: ['unzip -l', 'unzip', 'passwords'],
    storyTitle: 'The Delivery',
    story: archives.story,
    say: archives.say,
    machine: archivesMachine,
    steps: archives.steps,
    finale: archives.finale,
  },
  {
    id: 'unfamiliar',
    kind: 'test',
    label: 'Test 1',
    title: 'An Unfamiliar Machine',
    subtitle: 'No instructions. Find the hidden message.',
    teaches: ['everything from Lesson 1'],
    storyTitle: 'The Relay Station',
    story: ['A new machine. No instructions.', 'Somewhere inside is a hidden message.'],
    say: 'This is your first test. A brand new machine, and no instructions. Somewhere inside is a hidden message. Find it.',
    machine: practiceMachine,
    objective: exploring.practice.objective,
    hints: exploring.practice.hints,
    done: (e) => e.type === 'cat' && e.files.some((f) => f.path === PRACTICE_TARGET),
    success: exploring.practice.success,
    successSay: 'Message found. You did it without a guide. Nicely done.',
    known: LESSON1_COMMANDS,
  },
  {
    id: 'vault',
    kind: 'test',
    ultimate: true,
    label: 'Test 2 · Ultimate',
    title: 'The Vault',
    subtitle: 'Find 3 hidden password parts. Open the vault.',
    teaches: ['everything from Lessons 1 and 2'],
    storyTitle: 'Operation Blackout',
    story: ['A locked vault. Its password is split into <b>3 parts</b>,', 'each hidden in a file a normal listing won\'t show.', 'Follow the clues. Open the vault.'],
    say: 'Agent, this is the ultimate test. A locked vault. Its password was split into three parts, and each part is hidden in a file you will not see with a normal listing. Follow the clues, find all three parts, and open the vault. Good luck.',
    machine: vaultMachine,
    objective: 'Find the 3 password parts, then unlock <b>vault/top_secret.zip</b>.',
    hints: [
      'Read the briefing in your home directory. Each clue points to the next place.',
      'Parts hide in hidden files, and hidden directories. Wherever a clue sends you, list including hidden names.',
      'Join the parts in order with dashes: PART1-PART2-PART3. Then unzip the vault.',
    ],
    partSay: ['Part one found. Two to go.', 'Part two found. One left.', 'Part three found. You have the whole password. Now open the vault.'],
    // the three fragments: shown in the lesson card as you find them
    parts: [
      { path: '/home/agent/reports/archive/.part1.txt', value: 'ORION' },
      { path: '/home/agent/tools/scanner/.cache/part2.txt', value: '47' },
      { path: '/home/agent/personal/photos/.part3.txt', value: 'ECHO' },
    ],
    done: (e) => e.type === 'unzip' && e.path === VAULT_ARCHIVE,
    success: 'VAULT OPEN. Go into <code>top_secret/</code> and read everything.',
    successSay: 'Vault open. Clearance granted. Go inside top secret and read everything.',
    known: [...LESSON1_COMMANDS, ...LESSON2_COMMANDS],
  },
  // ---- beta: only shown on the test page (learning-new-c.html) ----
  {
    id: 'files', kind: 'lesson', beta: true,
    label: 'Lesson 3',
    title: 'Files & Folders',
    subtitle: 'Create, write and delete files and directories.',
    teaches: ['whoami', 'mkdir', 'touch', 'echo >', 'rm', 'rmdir', 'rm -r'],
    storyTitle: 'Moving In',
    story: files.story, say: files.say,
    machine: filesMachine, steps: files.steps, finale: files.finale,
  },
  {
    id: 'organize', kind: 'lesson', beta: true,
    label: 'Lesson 4',
    title: 'Copy, Move & Rename',
    subtitle: 'Tidy up with mv, cp and wildcards.',
    teaches: ['ls -l', 'mv', 'cp', 'cp -r', '*'],
    storyTitle: 'The Messy Desk',
    story: organize.story, say: organize.say,
    machine: organizeMachine, steps: organize.steps, finale: organize.finale,
  },
  {
    id: 'search', kind: 'lesson', beta: true,
    label: 'Lesson 5',
    title: 'Reading & Searching',
    subtitle: 'Search inside files and find them anywhere.',
    teaches: ['head', 'tail', 'wc', 'grep', '|', 'find', 'history'],
    storyTitle: 'The Server Logs',
    story: search.story, say: search.say,
    machine: searchMachine, steps: search.steps, finale: search.finale,
  },
  {
    id: 'ciphers', kind: 'lesson', beta: true,
    label: 'Lesson 6',
    title: 'Codes & Ciphers',
    subtitle: 'Encode, decode, verify, encrypt and decrypt.',
    teaches: ['base64', 'base64 -d', 'sha256sum', 'gpg -c', 'gpg -d'],
    storyTitle: 'The Cipher Room',
    story: ciphers.story, say: ciphers.say,
    machine: ciphersMachine, steps: ciphers.steps, finale: ciphers.finale,
  },
  {
    id: 'mole', kind: 'test', beta: true, ultimate: true,
    label: 'Test 3 · Final Exam',
    title: 'The Mole',
    subtitle: 'Search, decode, decrypt. Name the leaker.',
    teaches: ['everything from Lessons 1 to 6'],
    storyTitle: 'The Leak',
    story: ['Someone inside HQ is leaking secrets at night.', 'The logs, a coded message and a locked staff list hold the answer.', 'Find the mole. File your report.'],
    say: 'Final exam, analyst. Someone inside headquarters is leaking secrets at night. The logs, a coded message, and a locked staff list hold the answer. Find the mole, and file your report.',
    machine: moleMachine,
    objective: 'Find the mole\'s full name and save it in <b>~/case/mole.txt</b>.',
    hints: [
      'Start with the briefing. The logs are long: search them for anything at night, or anything unusual.',
      'One log points to a coded attachment. Decode it; it holds a key to something locked.',
      'Decrypt the staff list, match the badge, then: make the case directory and write the name into mole.txt with echo and &gt;.',
    ],
    done: (e, fs) => !!e.redirect && /felix\s+morrow/i.test(fs?.get(MOLE_FILE)?.content || ''),
    success: 'Report filed: <b>Felix Morrow</b>, badge B-77. Case closed.',
    successSay: 'Report filed. Felix Morrow, badge B 77. Case closed, analyst. You have completed every mission.',
    known: [...LESSON1_COMMANDS, ...LESSON2_COMMANDS, ...recapOf(files), ...recapOf(organize), ...recapOf(search), ...recapOf(ciphers)],
  },
];

export const byId = (id) => missions.find((m) => m.id === id);
export const nextOf = (id) => missions[missions.findIndex((m) => m.id === id) + 1] || null;
