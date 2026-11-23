// Lesson 2 — Unpacking Archives ("The Delivery"). Same engine and step format
// as Lesson 1. Card text is short; the narrator (say / sayDone) explains out loud.

const HOME = '/home/rookie';
const DL = `${HOME}/Downloads`;

export const story = [
  'Two parcels arrived as <b>.zip</b> files.',
  'One is locked with a password. Open both.',
];
export const say = "Welcome back. Two parcels arrived on this machine as zip files, and one of them is locked with a password. Let's open both.";

export const steps = [
  {
    id: 'find',
    mode: 'recall',
    title: 'A delivery',
    body: ['Go to <b>Downloads</b> and look around.'],
    expect: null,
    done: (e) => e.type === 'ls' && !e.file && e.path === DL,
    success: () => 'Two <code>.zip</code> files: archives that pack many files into one.',
    say: 'First, go to your Downloads folder and see what arrived.',
    sayDone: 'Two zip files. A zip archive packs lots of files into one, like a parcel.',
    hints: [
      'Move into Downloads, then look around.',
      'Change directory, then list.',
      'Type <code>cd Downloads</code>, then <code>ls</code>.',
    ],
  },
  {
    id: 'peek',
    mode: 'learn',
    title: 'Peek inside',
    body: ["Check what's in <b>supplies.zip</b> first."],
    command: { cmd: 'unzip -l supplies.zip', name: 'list archive', what: 'Lists the contents without unpacking.' },
    expect: DL,
    done: (e) => e.type === 'unzip-list' && e.path === `${DL}/supplies.zip`,
    success: () => 'A <code>supplies/</code> directory with two files. Nothing unpacked yet.',
    remember: ['unzip -l FILE', 'peek inside'],
    say: "Before opening a parcel, check what's inside. Type unzip, space, dash L, then the file name. Dash L means list.",
    sayDone: 'Now you know what is inside, and nothing has been unpacked yet.',
    hints: [
      'See inside supplies.zip without opening it.',
      'unzip with the "list" option: a dash and the letter l.',
      'Type <code>unzip -l supplies.zip</code>.',
    ],
  },
  {
    id: 'extract',
    mode: 'learn',
    title: 'Unpack it',
    body: ['Open the parcel for real.'],
    command: { cmd: 'unzip supplies.zip', name: 'extract', what: 'Unpacks it right here.' },
    expect: DL,
    done: (e) => e.type === 'unzip' && e.path === `${DL}/supplies.zip`,
    success: () => 'A <code>supplies/</code> directory appeared.',
    remember: ['unzip FILE', 'extract here'],
    say: "Now unpack it. Type unzip, then the file name. If it asks whether to replace files, answer Y for yes.",
    sayDone: 'A new supplies folder appeared, and the zip file is still there too.',
    hints: [
      'Unpack supplies.zip.',
      'unzip, then the file name. No option needed.',
      'Type <code>unzip supplies.zip</code>.',
    ],
  },
  {
    id: 'manifest',
    mode: 'recall',
    title: 'Read the manifest',
    body: ['Read the manifest in <b>supplies</b>.'],
    // the manifest is wherever supplies.zip was extracted, and can be read from anywhere
    expect: null,
    done: (e) => e.type === 'cat' && e.files.some((f) => f.path.endsWith('/supplies/manifest.txt')),
    success: () => 'The password is on a <b>hidden</b> sticky note on your Desktop.',
    say: 'The parcel came with a manifest. Read it.',
    sayDone: 'The second parcel is locked, and the password is on a hidden sticky note on your Desktop.',
    hints: [
      'The manifest is a text file inside supplies.',
      'Print it. A path works too: directory, slash, file.',
      'Inside supplies, type <code>cat manifest.txt</code>. From Downloads, type <code>cat supplies/manifest.txt</code>.',
    ],
  },
  {
    id: 'sticky',
    mode: 'recall',
    title: 'Find the password',
    body: ["It's a hidden file on your <b>Desktop</b>."],
    expect: null,
    done: (e) => e.type === 'cat' && e.files.some((f) => f.path === `${HOME}/Desktop/.sticky_note.txt`),
    success: () => 'The password is <code>lantern</code>.',
    say: 'Go to your Desktop and find the hidden sticky note. Remember, hidden files need L S dash A.',
    sayDone: 'The password is lantern. Remember it.',
    hints: [
      'Desktop is in your home directory, next to Downloads.',
      'Go there and list including hidden names.',
      'Type <code>cd ~/Desktop</code>, <code>ls -a</code>, then <code>cat .sticky_note.txt</code>.',
    ],
  },
  {
    id: 'locked',
    mode: 'learn',
    title: 'Open the locked parcel',
    body: ['Back in <b>Downloads</b>, unzip it and enter the password.'],
    command: { cmd: 'unzip locked.zip', name: 'extract + password', what: "Asks for the password. It stays hidden as you type." },
    expect: DL,
    done: (e) => e.type === 'unzip' && e.path === `${DL}/locked.zip`,
    success: () => 'Unlocked.',
    remember: ['unzip + password', 'unlock'],
    say: "Go back to Downloads and unzip the locked parcel. When it asks for the password, type it and press Enter. You won't see it as you type. That's normal on Linux.",
    sayDone: 'Unlocked. A wrong password would simply change nothing, so you can always try again.',
    hints: [
      'Go to Downloads and unzip locked.zip.',
      'When asked, type the word from the sticky note.',
      'Type <code>cd ~/Downloads</code>, <code>unzip locked.zip</code>, then <code>lantern</code>.',
    ],
  },
  {
    id: 'note',
    mode: 'recall',
    title: "What's inside?",
    body: ['Read what was in the locked parcel.'],
    expect: null,
    done: (e) => e.type === 'cat' && e.files.some((f) => f.path.endsWith('/secret/note.txt')),
    success: () => 'Both parcels delivered.',
    say: 'The locked parcel unpacked a new folder. Read what is inside.',
    sayDone: 'Both parcels delivered. You can now open any zip file, even a locked one.',
    hints: [
      'A new directory called secret appeared. The message is inside.',
      'List it, then print the file.',
      'Inside secret, type <code>cat note.txt</code>. From Downloads, type <code>cat secret/note.txt</code>.',
    ],
  },
];

export const finale = {
  title: 'Lesson 2 complete.',
  body: 'You can open any zip file, even a locked one.',
  recap: [['unzip -l FILE', 'peek inside'], ['unzip FILE', 'extract here'], ['password prompt', 'hidden as you type'], ['cat dir/file', 'read by path']],
  say: "Lesson two complete. You're ready for the tests. Start with test one, then take on the vault.",
};
