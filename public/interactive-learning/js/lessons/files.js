// Lesson 3 — Files & Folders ("Moving In"). Create, fill and delete files and
// directories. done(event, view, fs) checks the real shell event (and the
// simulated filesystem where it matters), never the raw text typed.

const HOME = '/home/rookie';
const PROJ = `${HOME}/projects`;
const created = (e, path) => (e.fsChange?.created || []).some((c) => c.path === path);
const removed = (e, path) => (e.fsChange?.removed || []).some((r) => r.path === path);

export const story = [
  'A new machine, and the last owner left a mess.',
  'Make some space of your own, then clean up.',
];
export const say = "Welcome to your new machine. The last owner left a mess behind. Let's make some space of your own, then clean up.";

export const steps = [
  {
    id: 'whoami', mode: 'learn', title: 'Who are you?',
    body: ['Check which user you are logged in as.'],
    command: { cmd: 'whoami', name: 'who am I', what: 'Prints your username.' },
    expect: HOME,
    done: (e) => e.type === 'whoami',
    success: () => 'You are <code>rookie</code>. Your home is <code>/home/rookie</code>.',
    remember: ['whoami', 'your username'],
    say: 'First, who does this machine think you are? Type who am I, all as one word.',
    sayDone: "You're logged in as rookie. Everything in your home folder belongs to you.",
    hints: ['Ask the machine for your username.', 'Three words squashed into one.', 'Type <code>whoami</code>.'],
  },
  {
    id: 'mkdir', mode: 'learn', title: 'Make a directory',
    body: ['Create a directory called <b>projects</b>.'],
    command: { cmd: 'mkdir projects', name: 'make directory', what: 'Creates a new, empty directory.' },
    expect: HOME,
    done: (e) => created(e, PROJ),
    success: () => 'A new <code>projects/</code> directory appeared.',
    remember: ['mkdir NAME', 'new directory'],
    say: "Let's make a folder of your own. Type M K D I R, short for make directory, then the name: projects.",
    sayDone: 'There it is. A brand new, empty folder called projects.',
    hints: ['Create a new directory named projects.', 'make + directory, squashed together.', 'Type <code>mkdir projects</code>.'],
  },
  {
    id: 'cd-proj', mode: 'recall', title: 'Move in',
    body: ['Go into <b>projects</b>.'],
    expect: HOME,
    done: (e) => e.type === 'cd' && e.to === PROJ,
    success: () => 'You are inside your new directory.',
    say: 'Now go inside it. You already know how.',
    sayDone: "You're in. It's empty, for now.",
    hints: ['Enter the directory you just made.', 'Change directory, then its name.', 'Type <code>cd projects</code>.'],
  },
  {
    id: 'touch', mode: 'learn', title: 'Make a file',
    body: ['Create an empty file called <b>todo.txt</b>.'],
    command: { cmd: 'touch todo.txt', name: 'touch', what: "Creates an empty file (or updates an existing file's time)." },
    expect: PROJ,
    done: (e) => created(e, `${PROJ}/todo.txt`),
    success: () => '<code>todo.txt</code> exists, but it is empty.',
    remember: ['touch FILE', 'new empty file'],
    say: 'Time for a file. Type touch, then todo dot T X T. Touch creates an empty file.',
    sayDone: "Your file exists. It's empty, so let's put something in it.",
    hints: ['Create an empty file named todo.txt.', 'The command is a word for a light tap.', 'Type <code>touch todo.txt</code>.'],
  },
  {
    id: 'echo', mode: 'learn', title: 'Write into it',
    body: ['Put a line of text into <b>todo.txt</b>.'],
    command: { cmd: 'echo "buy milk" > todo.txt', name: 'echo + redirect', what: '<code>echo</code> prints text. <code>&gt;</code> sends it into a file instead.' },
    expect: PROJ,
    done: (e, v, fs) => e.redirect?.path === `${PROJ}/todo.txt` && !!fs?.get(`${PROJ}/todo.txt`)?.content,
    success: () => 'The text went into the file. <code>&gt;&gt;</code> would add a line instead of replacing.',
    remember: ['echo "TEXT" > FILE', 'write into a file'],
    say: 'Echo prints text. The greater than sign sends that text into a file instead of the screen. Type echo, then buy milk in quotes, then greater than, then todo dot T X T.',
    sayDone: 'Your note is saved. One greater than sign replaces a file. Two of them add to the end.',
    hints: ['Write some text into todo.txt.', 'echo prints text; > sends it into a file.', 'Type <code>echo "buy milk" &gt; todo.txt</code>.'],
  },
  {
    id: 'cat-todo', mode: 'recall', title: 'Check it',
    body: ['Read <b>todo.txt</b> to make sure it worked.'],
    expect: PROJ,
    done: (e) => e.type === 'cat' && e.files.some((f) => f.path === `${PROJ}/todo.txt`),
    success: () => 'Your text is in the file.',
    say: 'Make sure it worked. Read the file.',
    sayDone: 'Perfect. Your words are in the file.',
    hints: ['Print what is inside todo.txt.', 'The file-reading command from Lesson 1.', 'Type <code>cat todo.txt</code>.'],
  },
  {
    id: 'rm', mode: 'learn', title: 'Delete a file',
    body: ['Back home, delete <b>junk.tmp</b>.'],
    command: { cmd: 'rm junk.tmp', name: 'remove', what: 'Deletes a file. There is no trash bin: it is gone for good.' },
    expect: HOME,
    done: (e) => removed(e, `${HOME}/junk.tmp`),
    success: () => '<code>junk.tmp</code> is gone. Always double-check before <code>rm</code>.',
    remember: ['rm FILE', 'delete a file'],
    say: 'Time to clean up. Go back home and remove the junk file. Type R M, short for remove, then junk dot T M P. Careful: Linux has no trash bin. Deleted means gone.',
    sayDone: 'Gone for good. Always double check before you remove something.',
    hints: ['Go up to your home directory, then delete junk.tmp.', 'cd .. first. The delete command is two letters.', 'Type <code>cd ..</code>, then <code>rm junk.tmp</code>.'],
  },
  {
    id: 'rmdir', mode: 'learn', title: 'Remove an empty directory',
    body: ['Remove the empty directory <b>empty_box</b>.'],
    command: { cmd: 'rmdir empty_box', name: 'remove directory', what: 'Deletes a directory, but only if it is empty.' },
    expect: HOME,
    done: (e) => removed(e, `${HOME}/empty_box`),
    success: () => 'Removed. <code>rmdir</code> refuses to delete a directory that still has things in it.',
    remember: ['rmdir DIR', 'delete empty directory'],
    say: 'The empty box can go too. Type R M D I R, remove directory, then empty underscore box. It only works on empty folders, which makes it a safe choice.',
    sayDone: 'Done. Rmdir refuses to delete a folder with things inside, so it can never surprise you.',
    hints: ['Remove the directory called empty_box.', 'remove + dir, squashed together.', 'Type <code>rmdir empty_box</code>.'],
  },
  {
    id: 'rm-r', mode: 'learn', title: 'Remove a full directory',
    body: ['<b>old_stuff</b> has files inside. Remove it all.'],
    command: { cmd: 'rm -r old_stuff', name: 'remove recursively', what: 'Deletes a directory and everything inside it.' },
    expect: HOME,
    done: (e) => removed(e, `${HOME}/old_stuff`),
    success: () => 'Everything inside went with it. Use <code>-r</code> with care.',
    remember: ['rm -r DIR', 'delete directory + contents'],
    say: 'Old stuff still has files inside, so rmdir would refuse. Type R M, space, dash R, then old underscore stuff. Dash R means everything inside, too. This is the most powerful delete there is, so use it with care.',
    sayDone: "Everything is cleaned up. Your machine is tidy, and it's yours.",
    hints: ['Delete old_stuff and everything in it.', 'rmdir only works on empty directories. Add the option that means "recursive" to rm.', 'Type <code>rm -r old_stuff</code>.'],
  },
];

export const finale = {
  title: 'Lesson 3 complete.',
  body: 'You can create, fill and delete files and directories.',
  recap: [['whoami', 'your username'], ['mkdir DIR', 'new directory'], ['touch FILE', 'new empty file'], ['echo "TEXT" > FILE', 'write to a file'], ['rm FILE', 'delete a file'], ['rmdir DIR', 'delete empty dir'], ['rm -r DIR', 'delete everything']],
  say: 'Lesson three complete. You can create and delete files and folders. Next, you will learn to copy, move and rename them.',
};
