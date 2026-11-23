// Lesson 2 — Unpacking Archives ("The Delivery"). Same engine and step format
// as Lesson 1: 'learn' steps introduce a command, 'recall' steps don't.

const HOME = '/home/rookie';
const DL = `${HOME}/Downloads`;

export const story = [
  'Welcome back, rookie.',
  'Two parcels were delivered to this machine overnight.',
  'One opens easily. The other is locked with a password.',
  'Parcels on Linux usually arrive as .zip archives.',
  'Unpack them both and find out what was sent.',
];

export const steps = [
  {
    id: 'find',
    mode: 'recall',
    title: 'A delivery',
    body: ['Two parcels arrived in your <b>Downloads</b> directory.', 'Go there and see what arrived.'],
    expect: null,
    done: (e) => e.type === 'ls' && !e.file && e.path === DL,
    success: () => 'Two files ending in <code>.zip</code>. A <b>zip archive</b> packs many files and directories into one compressed file, like a parcel.',
    hints: [
      'You need to move into Downloads, then look around.',
      'Use the change-directory command, then the list command.',
      'Type <code>cd Downloads</code>, then <code>ls</code>.',
    ],
  },
  {
    id: 'peek',
    mode: 'learn',
    title: 'Peek inside',
    body: ["Before unpacking a parcel, it's smart to check what's in it."],
    command: {
      cmd: 'unzip -l supplies.zip',
      name: 'list archive',
      what: 'Shows the files inside a zip archive without unpacking anything.',
      analogy: 'Like reading the label on a parcel before opening it.',
      format: 'unzip -l file.zip',
    },
    expect: DL,
    done: (e) => e.type === 'unzip-list' && e.path === `${DL}/supplies.zip`,
    success: () => 'Inside: a <code>supplies/</code> directory with two text files. Nothing was unpacked yet. The parcel is still sealed.',
    remember: ['unzip -l FILE', 'peek inside'],
    hints: [
      'You want to see what is inside supplies.zip without opening it.',
      'Use the unzip command with the option for "list": a dash and the letter l.',
      'Type <code>unzip -l supplies.zip</code>.',
    ],
  },
  {
    id: 'extract',
    mode: 'learn',
    title: 'Unpack it',
    body: ['Now open the parcel for real.'],
    command: {
      cmd: 'unzip supplies.zip',
      name: 'extract',
      what: 'Unpacks the archive into the directory you are in right now.',
      analogy: 'Like opening the parcel and putting everything on the table.',
      format: 'unzip file.zip',
    },
    expect: DL,
    done: (e) => e.type === 'unzip' && e.path === `${DL}/supplies.zip`,
    success: () => 'A new <code>supplies/</code> directory appeared. The zip is still there too: unzipping copies the contents out.',
    remember: ['unzip FILE', 'extract here'],
    hints: [
      'You want to unpack supplies.zip.',
      'Use unzip without any option, followed by the file name.',
      'Type <code>unzip supplies.zip</code>.',
    ],
  },
  {
    id: 'manifest',
    mode: 'recall',
    title: 'Read the manifest',
    body: ['The parcel came with a <b>manifest</b>.', 'Read it.'],
    expect: DL,
    done: (e) => e.type === 'cat' && e.files.some((f) => f.path === `${DL}/supplies/manifest.txt`),
    success: () => 'The second parcel is locked. Its password is on a <b>hidden</b> sticky note on your Desktop.',
    hints: [
      'The manifest is a text file inside the new supplies directory.',
      'Print it with the file-reading command. You can give a path: directory name, a slash, then the file name.',
      'Type <code>cat supplies/manifest.txt</code>.',
    ],
  },
  {
    id: 'sticky',
    mode: 'recall',
    title: 'Find the sticky note',
    body: ['The password is on a sticky note on your <b>Desktop</b>.', 'Sticky notes on this machine are hidden files.'],
    expect: null,
    done: (e) => e.type === 'cat' && e.files.some((f) => f.path === `${HOME}/Desktop/.sticky_note.txt`),
    success: () => 'The password is <code>lantern</code>. Remember it. (In real life, never leave passwords in files like this.)',
    hints: [
      'Desktop is in your home directory, next to Downloads.',
      'Go up one level, then into Desktop. A plain listing will not show the note; include hidden entries.',
      'Type <code>cd ~/Desktop</code>, then <code>ls -a</code>, then <code>cat .sticky_note.txt</code>.',
    ],
  },
  {
    id: 'locked',
    mode: 'learn',
    title: 'Open the locked parcel',
    body: ['Go back to Downloads. <b>locked.zip</b> needs the password.'],
    command: {
      cmd: 'unzip locked.zip',
      name: 'extract with a password',
      what: 'For a locked archive, unzip stops and asks for the password. Type it and press Enter.',
      analogy: "The password won't appear while you type. That's normal on Linux: it hides passwords from anyone looking at your screen.",
      format: 'unzip file.zip  → then type the password',
    },
    expect: DL,
    done: (e) => e.type === 'unzip' && e.path === `${DL}/locked.zip`,
    success: () => 'Unlocked. A wrong password would have skipped the files and changed nothing, so you can always try again.',
    remember: ['unzip + password', 'unlock'],
    hints: [
      'Go to Downloads, then unzip the locked archive. It will ask you for the password.',
      'The password is the word from the sticky note. Capital letters matter.',
      'Type <code>cd ~/Downloads</code>, then <code>unzip locked.zip</code>, then <code>lantern</code> when asked.',
    ],
  },
  {
    id: 'note',
    mode: 'recall',
    title: "What's inside?",
    body: ['The locked parcel unpacked a new directory.', 'Read what was sent.'],
    expect: DL,
    done: (e) => e.type === 'cat' && e.files.some((f) => f.path === `${DL}/secret/note.txt`),
    success: () => 'Both parcels delivered.',
    hints: [
      'A new directory appeared when you unlocked the parcel. Look inside it.',
      'List the new directory, then print the file in it.',
      'Type <code>cat secret/note.txt</code>.',
    ],
  },
];

export const finale = {
  title: 'You can unpack anything.',
  body: 'You peeked inside an archive, extracted it, found a hidden password and opened a locked zip. These are everyday skills, and exactly what the Vault will ask of you.',
  recap: [['unzip -l FILE', 'peek inside'], ['unzip FILE', 'extract here'], ['password prompt', 'typed, never shown'], ['cat dir/file', 'read by path']],
};
