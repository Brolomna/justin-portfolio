// Lesson 5 — Reading & Searching ("The Server Logs"). head, tail, wc, grep,
// pipes, find, history.

const HOME = '/home/rookie';
const LOGS = `${HOME}/logs`;
const APP = `${LOGS}/app.log`;
const CONF = `${HOME}/server/settings/backup.conf`;

export const story = [
  'The website went down in the middle of the night.',
  'The answer is somewhere in the logs. Find it.',
];
export const say = 'The website went down in the middle of the night, and it is your job to find out why. The answer is somewhere in the logs.';

export const steps = [
  {
    id: 'logs', mode: 'recall', title: 'Find the logs',
    body: ['Go to <b>logs</b> and look around.'],
    expect: null,
    done: (e) => e.type === 'ls' && !e.file && e.path === LOGS,
    success: () => '<code>app.log</code> is the website\'s log. It is long.',
    say: 'Go to the logs folder and see what is there.',
    sayDone: 'App dot log is the website log. It is long, so reading all of it would take a while.',
    hints: ['Move into logs, then list it.', 'Change directory, then list.', 'Type <code>cd logs</code>, then <code>ls</code>.'],
  },
  {
    id: 'head', mode: 'learn', title: 'Read the start',
    body: ['Look at the first lines of <b>app.log</b>.'],
    command: { cmd: 'head app.log', name: 'head', what: 'Shows the first 10 lines of a file.' },
    expect: LOGS,
    done: (e) => e.type === 'head' && e.files.includes(APP),
    success: () => 'All normal at the start.',
    remember: ['head FILE', 'first lines'],
    say: 'Logs can be huge. Head shows just the first ten lines. Type head, then app dot log.',
    sayDone: 'Everything looks normal at the start. Trouble usually shows up at the end.',
    hints: ['See the top of app.log.', 'The command is the top part of your body.', 'Type <code>head app.log</code>.'],
  },
  {
    id: 'tail', mode: 'learn', title: 'Read the end',
    body: ['Look at the last 5 lines.'],
    command: { cmd: 'tail -n 5 app.log', name: 'tail', what: 'Shows the last lines. <code>-n 5</code> means five of them.' },
    expect: LOGS,
    done: (e) => e.type === 'tail' && e.files.includes(APP),
    success: () => 'Errors at the end: something filled the disk.',
    remember: ['tail -n N FILE', 'last lines'],
    say: 'The newest lines are at the bottom. Tail shows the end of a file. Type tail, dash N, five, then app dot log.',
    sayDone: 'Errors at the very end. Something filled up the disk.',
    hints: ['See the last few lines of app.log.', 'The opposite of head. -n chooses how many lines.', 'Type <code>tail -n 5 app.log</code>.'],
  },
  {
    id: 'wc', mode: 'learn', title: 'How long is it?',
    body: ['Count the lines in <b>app.log</b>.'],
    command: { cmd: 'wc -l app.log', name: 'word count', what: 'Counts lines (<code>-l</code>), words or bytes.' },
    expect: LOGS,
    done: (e) => e.type === 'wc' && e.files.includes(APP),
    success: () => '42 lines. Too many to read one by one. Time to search.',
    remember: ['wc -l FILE', 'count lines'],
    say: 'How long is this log? Type W C, short for word count, dash L for lines, then app dot log.',
    sayDone: 'Forty two lines. Too many to read one by one. Let us search instead.',
    hints: ['Count how many lines app.log has.', 'word count, with the option for lines.', 'Type <code>wc -l app.log</code>.'],
  },
  {
    id: 'grep', mode: 'learn', title: 'Search for errors',
    body: ['Show only the lines that contain <b>ERROR</b>.'],
    command: { cmd: 'grep ERROR app.log', name: 'search', what: 'Shows only the lines that contain your text.' },
    expect: LOGS,
    done: (e) => e.type === 'grep' && /error/i.test(e.pattern) && e.matches > 0,
    success: () => 'Three errors, all about the disk. One says "see backup settings".',
    remember: ['grep TEXT FILE', 'search inside files'],
    say: 'Grep is a search tool. It shows only the lines that contain your text. Type grep, ERROR in capitals, then app dot log.',
    sayDone: 'Three errors, all about a full disk. One of them says: see backup settings. That is a clue.',
    hints: ['Show only the lines containing ERROR.', 'The search command, then the text, then the file. Capitals matter.', 'Type <code>grep ERROR app.log</code>.'],
  },
  {
    id: 'pipe', mode: 'learn', title: 'Combine commands',
    body: ['How many lines mention <b>disk</b>, in any capitals?'],
    command: { cmd: 'grep -i disk app.log | wc -l', name: 'pipe', what: '<code>|</code> sends one command\'s output into the next. <code>-i</code> ignores capitals.' },
    expect: LOGS,
    done: (e) => e.type === 'wc' && (e.pipe || []).includes('grep'),
    success: () => 'Five. grep found the lines, wc counted them.',
    remember: ['A | B', 'pipe output into B'],
    say: 'Commands can work together. The vertical bar is called a pipe: it sends one command\'s output into the next. Grep dash I ignores capital letters. Type grep dash I disk app dot log, then a pipe, then W C dash L.',
    sayDone: 'Five lines. Grep found them and W C counted them. Pipes are one of the most powerful ideas in Linux.',
    hints: ['Find lines with "disk", then count them.', 'grep -i for any capitals, then a | into the line counter.', 'Type <code>grep -i disk app.log | wc -l</code>.'],
  },
  {
    id: 'find', mode: 'learn', title: 'Find the settings',
    body: ['The error said "see backup settings". Find any <b>.conf</b> file in your home.'],
    command: { cmd: 'find ~ -name "*.conf"', name: 'find', what: 'Searches directories for files by name.' },
    expect: null,
    done: (e) => e.type === 'find' && e.found.includes(CONF),
    success: () => 'Found <code>backup.conf</code>, deep in <code>server/settings</code>.',
    remember: ['find DIR -name "PAT"', 'find files by name'],
    say: 'Settings files often end in dot conf. Find searches folders for files by name. Type find, then the tilde for home, then dash name, then star dot conf in quotes.',
    sayDone: 'Found it, deep inside server slash settings. Find saves you from opening folder after folder.',
    hints: ['Search your whole home for files ending in .conf.', 'find, where to start (~), then -name with a wildcard in quotes.', 'Type <code>find ~ -name "*.conf"</code>.'],
  },
  {
    id: 'read-conf', mode: 'recall', title: 'The cause',
    body: ['Read <b>backup.conf</b>.'],
    expect: null,
    done: (e) => e.type === 'cat' && e.files.some((f) => f.path === CONF),
    success: () => 'Backups every 5 minutes, kept forever. That filled the disk. Case closed.',
    say: 'Read the backup settings file. You know where it is now.',
    sayDone: 'Backups every five minutes, kept forever. That filled the disk. Case closed.',
    hints: ['Print the backup.conf file you just found.', 'Use cat with the full path find printed.', 'Type <code>cat ~/server/settings/backup.conf</code>.'],
  },
  {
    id: 'history', mode: 'learn', title: 'Review your work',
    body: ['See every command you typed.'],
    command: { cmd: 'history', name: 'history', what: 'Lists the commands you have run. ↑ recalls them too.' },
    expect: null,
    done: (e) => e.type === 'history',
    success: () => 'Every step of your investigation, in order.',
    remember: ['history', 'past commands'],
    say: 'Finally, type history. It lists every command you have typed, in order. Great for remembering how you solved something.',
    sayDone: 'Your whole investigation, step by step. Detective work, done.',
    hints: ['List the commands you typed.', 'The command is the word for the past.', 'Type <code>history</code>.'],
  },
];

export const finale = {
  title: 'Lesson 5 complete.',
  body: 'You can read, count and search through files like a detective.',
  recap: [['head / tail', 'start / end'], ['wc -l FILE', 'count lines'], ['grep TEXT FILE', 'search'], ['A | B', 'pipe'], ['find DIR -name', 'find files'], ['history', 'past commands']],
  say: 'Lesson five complete. You can read, count and search through files like a detective. Next, the cipher room: secret codes and encryption.',
};
