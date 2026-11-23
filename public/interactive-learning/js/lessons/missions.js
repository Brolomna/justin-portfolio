// Every mission on the page, in the recommended order. Lessons have guided
// steps; tests have one objective, concept-only hints and a done(event) check.
// Nothing is locked or scored: learners can open any mission at any time.

import { lessonMachine, practiceMachine, archivesMachine, vaultMachine, PRACTICE_TARGET, VAULT_ARCHIVE } from '../fs/machines.js';
import * as exploring from './exploring-linux.js';
import * as archives from './archives.js';

const LESSON1_COMMANDS = exploring.finale.recap.map(([c]) => c);
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
];

export const byId = (id) => missions.find((m) => m.id === id);
export const nextOf = (id) => missions[missions.findIndex((m) => m.id === id) + 1] || null;
