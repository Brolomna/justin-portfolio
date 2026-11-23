// Topic 01 — Exploring Linux. Pure data: the lesson engine (ui/lesson.js)
// decides when to show what. Each step is DISCOVER → LEARN → EXECUTE → WITNESS → REMEMBER.
//   mode 'learn'  : introduces a command (name, meaning, analogy, example)
//   mode 'recall' : a situation only; the learner remembers the command (hints optional)
// `done(event, view)` checks the real shell event, never the raw text typed.

const HOME = '/home/rookie';
const DOCS = `${HOME}/Documents`;
const HIDDEN = `${HOME}/.hidden`;

export const topic = {
  number: '01',
  title: 'Exploring Linux',
  subtitle: 'Learn to navigate a computer without a mouse.',
  story: [
    'Welcome, rookie.',
    "You've entered an unfamiliar Linux machine.",
    "You don't know where you are, what files are stored here, or what this computer contains.",
    'You have one tool: the terminal.',
    'Explore the machine and discover what was left behind.',
  ],
};

export const steps = [
  {
    id: 'pwd',
    mode: 'learn',
    title: 'Where are you?',
    body: ["Before exploring this machine, there's something you should know.", 'Where exactly are you right now?'],
    command: {
      cmd: 'pwd',
      name: 'Print Working Directory',
      what: 'Prints the full path of the directory you are in right now.',
      analogy: 'Like asking the computer: "where am I?"',
    },
    expect: HOME,
    done: (e) => e.type === 'pwd',
    success: (e) => `You're at <code>${e.path}</code>. That's your <b>working directory</b>: the folder you're standing in. Commands you type run from here.`,
    remember: ['pwd', 'where am I?'],
    hints: [
      'You want the computer to tell you your current location.',
      'The command is three letters, short for Print Working Directory.',
      'Type <code>pwd</code> and press Enter.',
    ],
  },
  {
    id: 'ls',
    mode: 'learn',
    title: "What's around you?",
    body: ['Interesting. You know where you are.', "But what's actually inside this location?"],
    command: {
      cmd: 'ls',
      name: 'list',
      what: 'Lists the visible files and directories inside the current directory.',
      analogy: 'Like switching on the lights to see what is in the room.',
    },
    expect: HOME,
    done: (e) => e.type === 'ls' && !e.file && e.path === HOME,
    success: () => 'Three <b>directories</b> appeared: the big structures with portals. Directories hold files and other directories.',
    remember: ['ls', "what's here?"],
    hints: [
      'You want to see what this directory contains.',
      'The command is two letters, short for "list".',
      'Type <code>ls</code> and press Enter.',
    ],
  },
  {
    id: 'cd',
    mode: 'learn',
    title: 'Go somewhere',
    body: ["You've discovered several places inside this computer.", "Take a look at <b>Documents</b>. There's something inside it. How would you enter?"],
    command: {
      cmd: 'cd Documents',
      name: 'Change Directory',
      what: 'Moves you from the current directory into another one.',
      analogy: 'Like walking through a door into the next room.',
      format: 'cd directory_name',
    },
    expect: HOME,
    done: (e) => e.type === 'cd' && e.to === DOCS,
    success: () => 'You moved into Documents. Look at the prompt: it now ends in <code>~/Documents</code>. <code>~</code> is short for your home directory.',
    remember: ['cd NAME', 'go into'],
    hints: [
      'You want to move into the Documents directory.',
      'Use the change-directory command followed by the directory name. Capital letters matter.',
      'Type <code>cd Documents</code> and press Enter.',
    ],
  },
  {
    id: 'ls-docs',
    mode: 'recall',
    exact: true, // the listing must be of Documents itself
    title: 'A new place',
    body: ["You're inside Documents now.", 'But what does this location contain?'],
    expect: DOCS,
    done: (e) => e.type === 'ls' && !e.file && e.path === DOCS,
    success: () => 'A file, <code>notes.txt</code>, and another directory, <code>project</code>. Same command, different place, different answer: <code>ls</code> always lists where you are.',
    hints: [
      "You're in a new directory, but you haven't looked around yet.",
      'Use the same command that showed you Desktop, Documents and Downloads.',
      'Type <code>ls</code>.',
    ],
  },
  {
    id: 'cat',
    mode: 'learn',
    title: 'Read a file',
    body: ['You found a file called <b>notes.txt</b>.', 'How can you see what it says without a text editor?'],
    command: {
      cmd: 'cat notes.txt',
      name: 'concatenate',
      what: 'Prints the contents of a file in the terminal.',
      analogy: 'Like unfolding a note and reading it out loud.',
      format: 'cat file_name',
    },
    expect: DOCS,
    done: (e) => e.type === 'cat' && e.files.some((f) => f.path === `${DOCS}/notes.txt`),
    success: () => '<code>cat</code> printed the file: the same words appear in the terminal and on the hologram. Close the hologram with <kbd>Esc</kbd> whenever you like.',
    remember: ['cat FILE', 'read a file'],
    hints: [
      'You want to read what is inside notes.txt.',
      'The command that prints a file is three letters. Give it the file name.',
      'Type <code>cat notes.txt</code>.',
    ],
  },
  {
    id: 'cd-up',
    mode: 'learn',
    exact: true, // cd .. has to start from Documents to land in home
    title: 'Go back',
    body: ["You've explored Documents.", 'But how do you get back to where you came from?'],
    command: {
      cmd: 'cd ..',
      name: 'parent directory',
      what: '<code>..</code> means "the directory that contains this one". <code>cd ..</code> moves you one level up.',
      analogy: 'Like stepping back out through the door you came in.',
    },
    expect: DOCS,
    done: (e) => e.type === 'cd' && e.direction === 'up' && e.to === HOME,
    success: () => 'You climbed one level up, back to <code>/home/rookie</code>. The prompt shows <code>~</code> again, and the glowing trail shrank by one step. Keep climbing with <code>cd ..</code> and you reach <code>/home</code>, then <code>/</code>: the <b>root</b>, the top of the whole filesystem. (<code>cd ~</code> brings you home.)',
    remember: ['cd ..', 'go up one level'],
    hints: [
      'You want to return to the directory that contains Documents.',
      'Two dots mean "parent directory". Combine them with the change-directory command.',
      'Type <code>cd ..</code> (cd, a space, then two dots).',
    ],
  },
  {
    id: 'ls-a',
    mode: 'learn',
    title: 'Look closer',
    body: ['Something about this machine feels unusual.', "You've seen the visible contents. Are you sure you've seen everything?"],
    command: {
      cmd: 'ls -a',
      name: 'list all',
      what: 'Some names start with a dot and are hidden from a normal <code>ls</code>. The <code>-a</code> option includes them.',
      analogy: "Hidden doesn't mean locked or secret. It only means a normal listing doesn't show it.",
    },
    expect: HOME,
    done: (e) => e.type === 'ls' && e.all && e.path === HOME,
    success: () => '<code>.hidden</code> was here all along: a normal <code>ls</code> just skips names that start with a dot. <code>.</code> is this directory and <code>..</code> is its parent.',
    remember: ['ls -a', 'show hidden too'],
    hints: [
      'A normal listing skips some entries. You want to see all of them.',
      'Add an option to the list command: a dash and the letter a, for "all".',
      'Type <code>ls -a</code>.',
    ],
  },
  {
    id: 'cd-hidden',
    mode: 'recall',
    title: 'Something new',
    body: ["You found something that wasn't visible before.", 'Explore it.'],
    expect: HOME,
    done: (e) => e.type === 'cd' && e.to === HIDDEN,
    success: () => 'A hidden directory is entered like any other. The dot is simply part of its name.',
    hints: [
      'There is a directory here that you could not see before. Go inside it.',
      'Use the same command you used to enter Documents, with the full name, including the dot.',
      'Type <code>cd .hidden</code>.',
    ],
  },
  {
    id: 'cat-message',
    mode: 'recall',
    title: 'The last file',
    body: ["You've found something.", 'Discover what it contains.'],
    expect: HIDDEN,
    done: (e) => e.type === 'cat' && e.files.some((f) => f.path === `${HIDDEN}/message.txt`),
    success: () => 'You found the message.',
    hints: [
      "There's a file in here. You want to read it.",
      "Use the command that prints a file's contents. Not sure of the name? List the directory first.",
      'Type <code>cat message.txt</code>.',
    ],
  },
];

export const finale = {
  title: 'You explored the machine.',
  body: 'You found your location, looked around, moved between directories, went back up, revealed hidden entries and read files. All with a keyboard.',
  recap: [['pwd', 'where am I?'], ['ls', "what's here?"], ['ls -a', 'include hidden'], ['cd NAME', 'go into'], ['cd ..', 'go up'], ['cat FILE', 'read']],
};

export const practice = {
  title: 'An unfamiliar machine',
  objective: 'Somewhere inside this unfamiliar machine is an important message. Explore the filesystem and discover it.',
  // Concept-only nudges: they never name a command or the location.
  hints: [
    'Start by working out where you are, then what is around you.',
    'Text files on this machine contain clues. Read the ones you find: they point to where to look next.',
    'A normal listing does not show everything. When a clue says something is out of sight, look again in that directory and include hidden entries.',
  ],
  success: 'Message recovered. You found it without a guide.',
};
