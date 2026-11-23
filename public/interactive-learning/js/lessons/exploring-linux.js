// Lesson 1 — Exploring Linux. Pure data: the engine (main.js) decides when to show what.
// Card text is kept short; the narrator (say / sayDone, pre-recorded in
// /interactive-learning/audio) gives the friendlier explanation out loud.
//   mode 'learn'  : introduces a command
//   mode 'recall' : a situation only; the learner remembers the command (hints optional)
// `done(event)` checks the real shell event, never the raw text typed.

const HOME = '/home/rookie';
const DOCS = `${HOME}/Documents`;
const HIDDEN = `${HOME}/.hidden`;

export const topic = {
  number: '01',
  title: 'Exploring Linux',
  subtitle: 'Learn to navigate a computer without a mouse.',
  story: [
    "You've entered an unfamiliar Linux machine.",
    'Your only tool is the terminal. Explore it.',
  ],
  say: "Welcome, rookie. You've just entered an unfamiliar Linux machine, and the terminal is your only tool. Let's explore it together.",
};

export const steps = [
  {
    id: 'pwd',
    mode: 'learn',
    title: 'Where are you?',
    body: ['First, find out where you are.'],
    command: { cmd: 'pwd', name: 'print working directory', what: 'Shows where you are.' },
    expect: HOME,
    done: (e) => e.type === 'pwd',
    success: (e) => `You're in <code>${e.path}</code>.`,
    remember: ['pwd', 'where am I?'],
    say: 'First question: where are you? Type P W D. It stands for print working directory, and it tells you exactly where you are.',
    sayDone: "That's your location. Every command you type runs from here.",
    hints: [
      'Ask the computer for your current location.',
      'Three letters: print working directory.',
      'Type <code>pwd</code>.',
    ],
  },
  {
    id: 'ls',
    mode: 'learn',
    title: "What's here?",
    body: ['Look around this place.'],
    command: { cmd: 'ls', name: 'list', what: 'Shows what is in this directory.' },
    expect: HOME,
    done: (e) => e.type === 'ls' && !e.file && e.path === HOME,
    success: () => 'Three <b>directories</b> (folders) appeared.',
    remember: ['ls', "what's here?"],
    say: "Now, what's around you? Type L S, short for list, to see what's in this place.",
    sayDone: 'Three folders appeared. In Linux, folders are called directories.',
    hints: [
      'See what this directory contains.',
      'Two letters, short for "list".',
      'Type <code>ls</code>.',
    ],
  },
  {
    id: 'cd',
    mode: 'learn',
    title: 'Go inside',
    body: ['Enter <b>Documents</b>.'],
    command: { cmd: 'cd Documents', name: 'change directory', what: 'Moves you into a directory.' },
    expect: HOME,
    done: (e) => e.type === 'cd' && e.to === DOCS,
    success: () => 'You\'re in Documents. The prompt shows <code>~/Documents</code>.',
    remember: ['cd NAME', 'go into'],
    say: "Let's go inside Documents. Type C D, then a space, then Documents. C D means change directory.",
    sayDone: "You're inside Documents now. Look at the prompt: it shows where you are.",
    hints: [
      'Move into the Documents directory.',
      'Change directory, then the name. Capitals matter.',
      'Type <code>cd Documents</code>.',
    ],
  },
  {
    id: 'ls-docs',
    mode: 'recall',
    title: "What's in here?",
    body: ['A new place. Look around.'],
    expect: DOCS,
    done: (e) => e.type === 'ls' && !e.file && e.path === DOCS,
    success: () => 'A file and another directory.',
    say: "You're somewhere new. What's in here? Use the command you already know.",
    sayDone: 'A text file and another folder. L S always lists the place you are standing in.',
    hints: [
      "You haven't looked around in here yet.",
      'The same command that showed you Documents.',
      'Type <code>ls</code>.',
    ],
  },
  {
    id: 'cat',
    mode: 'learn',
    title: 'Read a file',
    body: ['Read <b>notes.txt</b>.'],
    command: { cmd: 'cat notes.txt', name: 'concatenate', what: "Prints a file's text." },
    expect: DOCS,
    done: (e) => e.type === 'cat' && e.files.some((f) => f.path === `${DOCS}/notes.txt`),
    success: () => 'Same text in the terminal and the hologram. <kbd>Esc</kbd> closes it.',
    remember: ['cat FILE', 'read a file'],
    say: "Let's read the note. Type cat, then the file name: notes dot T X T. Cat prints what's inside a file.",
    sayDone: 'That is what the note says. Press Escape whenever you want to close it.',
    hints: [
      'Read what is inside notes.txt.',
      'A three-letter command, then the file name.',
      'Type <code>cat notes.txt</code>.',
    ],
  },
  {
    id: 'cd-up',
    mode: 'learn',
    title: 'Go back',
    body: ['Return to where you came from.'],
    command: { cmd: 'cd ..', name: 'parent directory', what: '<code>..</code> means one level up.' },
    expect: DOCS,
    done: (e) => e.type === 'cd' && e.direction === 'up' && e.to === HOME,
    success: () => 'Back home. Keep going up and you reach <code>/</code>, the root.',
    remember: ['cd ..', 'go up one level'],
    say: 'Time to go back. Type C D, a space, and two dots. Two dots always mean one level up.',
    sayDone: "You're back home. Keep climbing with C D dot dot and you'd reach the root, a single slash: the top of the whole machine.",
    hints: [
      'Go back to the directory that holds Documents.',
      'Two dots mean "one level up".',
      'Type <code>cd ..</code>',
    ],
  },
  {
    id: 'ls-a',
    mode: 'learn',
    title: 'Look closer',
    body: ['Something is hidden here.'],
    command: { cmd: 'ls -a', name: 'list all', what: 'Also shows hidden names (they start with a dot).' },
    expect: HOME,
    done: (e) => e.type === 'ls' && e.all && e.path === HOME,
    success: () => '<code>.hidden</code> was there all along.',
    remember: ['ls -a', 'show hidden too'],
    say: 'Something here is hidden. Type L S, space, dash A. The A means all, so hidden things show up too.',
    sayDone: "There it is: dot hidden. Names that start with a dot are hidden from a normal listing. They're not locked, just out of sight.",
    hints: [
      'A normal listing skips some names. See them all.',
      'Add the option for "all" to the list command.',
      'Type <code>ls -a</code>.',
    ],
  },
  {
    id: 'cd-hidden',
    mode: 'recall',
    title: 'Go in',
    body: ['Explore what you just found.'],
    expect: HOME,
    done: (e) => e.type === 'cd' && e.to === HIDDEN,
    success: () => 'Hidden directories open like any other.',
    say: 'You found a hidden folder. Go inside it. You already know how.',
    sayDone: 'Hidden folders work like any other. The dot is just part of the name.',
    hints: [
      'Go inside the directory you just revealed.',
      'Same command as for Documents. Include the dot.',
      'Type <code>cd .hidden</code>.',
    ],
  },
  {
    id: 'cat-message',
    mode: 'recall',
    title: 'The last file',
    body: ["There's a message here. Read it."],
    expect: HIDDEN,
    done: (e) => e.type === 'cat' && e.files.some((f) => f.path === `${HIDDEN}/message.txt`),
    success: () => 'You found the message.',
    say: "There's a message in here. Read it.",
    sayDone: 'You found it. You just explored a Linux machine using nothing but the keyboard. Well done.',
    hints: [
      'Read the file in here.',
      'List first if you need the name, then print it.',
      'Type <code>cat message.txt</code>.',
    ],
  },
];

export const finale = {
  title: 'Lesson 1 complete.',
  body: 'You can move around a Linux machine with the keyboard.',
  recap: [['pwd', 'where am I?'], ['ls', "what's here?"], ['ls -a', 'include hidden'], ['cd NAME', 'go into'], ['cd ..', 'go up'], ['cat FILE', 'read']],
  say: 'Lesson one complete. Next, lesson two teaches you how to open zip files, even locked ones.',
};

export const practice = {
  title: 'An unfamiliar machine',
  objective: 'Find the hidden message somewhere on this machine.',
  // Concept-only nudges: they never name a command or the location.
  hints: [
    'Find out where you are, then what is around you.',
    'Read the text files you find. They point to where to look next.',
    'When a clue says something is out of sight, look again in that directory, including hidden names.',
  ],
  success: 'Message recovered. You found it without a guide.',
};
