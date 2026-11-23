// Lesson 4 — Organizing ("The Messy Desk"). Copy, move, rename, wildcards, ls -l.

const HOME = '/home/rookie';
const DESK = `${HOME}/Desktop`;
const PHOTOS = `${DESK}/photos`;

export const story = [
  'Your Desktop is a mess of photos and documents.',
  'Sort it out, and keep a backup.',
];
export const say = 'Your Desktop is a mess of photos and documents. Time to organise it, and keep a backup while you are at it.';

export const steps = [
  {
    id: 'look', mode: 'recall', title: 'See the mess',
    body: ['Go to your <b>Desktop</b> and look around.'],
    expect: null,
    done: (e) => e.type === 'ls' && !e.file && e.path === DESK && !e.long,
    success: () => 'Photos and documents, all mixed together.',
    say: 'First, go to your Desktop and see what is there.',
    sayDone: 'Photos and documents, all mixed together. Let us sort them.',
    hints: ['Go into Desktop, then list it.', 'Change directory, then list.', 'Type <code>cd Desktop</code>, then <code>ls</code>.'],
  },
  {
    id: 'ls-l', mode: 'learn', title: 'Look in detail',
    body: ['See sizes and times too.'],
    command: { cmd: 'ls -l', name: 'long listing', what: 'Lists one item per line with size and time.' },
    expect: DESK,
    done: (e) => e.type === 'ls' && e.long && e.path === DESK,
    success: () => 'Each line: permissions, owner, size in bytes, time, then the name.',
    remember: ['ls -l', 'details: size, time'],
    say: 'Want more detail? Type L S, space, dash L. The L means long: one file per line, with its size and the time it changed.',
    sayDone: 'Now you can see how big each file is, and when it last changed.',
    hints: ['List the Desktop with details.', 'Add the "long" option to ls.', 'Type <code>ls -l</code>.'],
  },
  {
    id: 'mkdir-photos', mode: 'recall', title: 'A place for photos',
    body: ['Make a directory called <b>photos</b> here.'],
    expect: DESK,
    done: (e) => (e.fsChange?.created || []).some((c) => c.path === PHOTOS),
    success: () => 'Now the photos have somewhere to go.',
    say: 'Make a folder called photos, right here on the Desktop.',
    sayDone: 'Now the photos have somewhere to go.',
    hints: ['Create a directory named photos.', 'You learned this in Lesson 3: make directory.', 'Type <code>mkdir photos</code>.'],
  },
  {
    id: 'mv', mode: 'learn', title: 'Move a file',
    body: ['Move <b>beach.jpg</b> into <b>photos</b>.'],
    command: { cmd: 'mv beach.jpg photos/', name: 'move', what: 'Moves a file into a directory.' },
    expect: DESK,
    done: (e) => e.type === 'mv' && e.moves.some((m) => m.to.startsWith(`${PHOTOS}/`)),
    success: () => 'Moved. Look: it flew into the photos directory.',
    remember: ['mv FILE DIR/', 'move'],
    say: 'Let us move a photo. Type M V, short for move, then beach dot J P G, then photos slash.',
    sayDone: 'Moved. It flew right into the photos folder.',
    hints: ['Move beach.jpg into the photos directory.', 'Two letters for move: source first, then where it goes.', 'Type <code>mv beach.jpg photos/</code>.'],
  },
  {
    id: 'glob', mode: 'learn', title: 'Move them all at once',
    body: ['Move every remaining <b>.jpg</b> in one go.'],
    command: { cmd: 'mv *.jpg photos/', name: 'wildcard', what: '<code>*</code> matches any name. <code>*.jpg</code> means every .jpg here.' },
    expect: DESK,
    done: (e, v, fs) => e.type === 'mv' && ![...(fs?.get(DESK)?.children.keys() || [])].some((n) => n.endsWith('.jpg')),
    success: () => 'Every photo moved with one command.',
    remember: ['*.jpg', 'every .jpg'],
    say: 'Moving photos one at a time is slow. The star is a wildcard: it matches any name. So star dot J P G means every J P G file here. Type M V, star dot J P G, photos slash.',
    sayDone: 'Every photo, moved with one command. Wildcards save a lot of typing.',
    hints: ['Move all the .jpg files at once.', 'Use the * wildcard in front of .jpg.', 'Type <code>mv *.jpg photos/</code>.'],
  },
  {
    id: 'rename', mode: 'learn', title: 'Rename a file',
    body: ['Rename <b>report_draft.txt</b> to <b>report.txt</b>.'],
    command: { cmd: 'mv report_draft.txt report.txt', name: 'rename', what: 'Moving to a new name in the same place renames it.' },
    expect: DESK,
    done: (e) => e.type === 'mv' && e.moves.some((m) => m.from === `${DESK}/report_draft.txt` && m.to === `${DESK}/report.txt`),
    success: () => 'There is no separate rename command: <code>mv</code> does it.',
    remember: ['mv OLD NEW', 'rename'],
    say: 'Linux has no rename command. Moving a file to a new name, in the same place, renames it. Type M V, report underscore draft dot T X T, then report dot T X T.',
    sayDone: 'Renamed. Same file, new name.',
    hints: ['Give report_draft.txt the new name report.txt.', 'mv works for renaming too: old name, then new name.', 'Type <code>mv report_draft.txt report.txt</code>.'],
  },
  {
    id: 'cp', mode: 'learn', title: 'Make a copy',
    body: ['Copy <b>report.txt</b> to <b>report_backup.txt</b>.'],
    command: { cmd: 'cp report.txt report_backup.txt', name: 'copy', what: 'Makes a copy. The original stays.' },
    expect: DESK,
    done: (e) => e.type === 'cp' && e.copies.some((c) => c.to === `${DESK}/report_backup.txt`),
    success: () => 'Two files now: the original and its copy.',
    remember: ['cp FILE COPY', 'copy a file'],
    say: 'Always keep a backup of important work. Type C P, short for copy, then report dot T X T, then report underscore backup dot T X T.',
    sayDone: 'Now you have the original and a copy.',
    hints: ['Copy report.txt to a new file called report_backup.txt.', 'Two letters for copy: original first, then the new name.', 'Type <code>cp report.txt report_backup.txt</code>.'],
  },
  {
    id: 'cp-r', mode: 'learn', title: 'Copy a whole directory',
    body: ['Back up the <b>photos</b> directory as <b>photos_backup</b>.'],
    command: { cmd: 'cp -r photos photos_backup', name: 'copy recursively', what: 'Copies a directory and everything in it.' },
    expect: DESK,
    done: (e) => e.type === 'cp' && e.recursive && e.copies.some((c) => c.to === `${DESK}/photos_backup`),
    success: () => 'The whole directory, photos and all, was copied.',
    remember: ['cp -r DIR COPY', 'copy a directory'],
    say: 'To copy a whole folder, add dash R, just like when you deleted one. Type C P, dash R, photos, then photos underscore backup.',
    sayDone: 'The whole folder was copied, photos and all. Your desk is organised and backed up.',
    hints: ['Copy the photos directory to photos_backup.', 'cp needs the "recursive" option for directories.', 'Type <code>cp -r photos photos_backup</code>.'],
  },
];

export const finale = {
  title: 'Lesson 4 complete.',
  body: 'You can copy, move and rename, one file or many.',
  recap: [['ls -l', 'details'], ['mv FILE DIR/', 'move'], ['mv OLD NEW', 'rename'], ['*.jpg', 'wildcard'], ['cp FILE COPY', 'copy'], ['cp -r DIR COPY', 'copy a directory']],
  say: 'Lesson four complete. You can copy, move and rename files, even many at once. Next, you will learn to read and search through files like a detective.',
};
