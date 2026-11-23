// Simulated filesystem. Pure data + lookups: no DOM, no rendering, no real OS access.
// A machine spec describes the tree with plain objects: an object is a directory,
// a string is a text file's contents.

export const isHidden = (name) => name.startsWith('.');

/** Build an immutable-shaped tree of nodes from a nested spec. */
export function createFilesystem(spec) {
  const root = { name: '/', type: 'dir', path: '/', parent: null, children: new Map() };
  const index = new Map([['/', root]]);

  const add = (parent, name, value) => {
    const path = parent.path === '/' ? `/${name}` : `${parent.path}/${name}`;
    const node = typeof value === 'string'
      ? { name, type: 'file', path, parent, content: value }
      : { name, type: 'dir', path, parent, children: new Map() };
    parent.children.set(name, node);
    index.set(path, node);
    if (node.type === 'dir') for (const [n, v] of Object.entries(value)) add(node, n, v);
  };
  for (const [n, v] of Object.entries(spec)) add(root, n, v);

  return {
    root,
    get: (path) => index.get(path) || null,
    /** Every node, parents before children (stable order for layout). */
    all: () => [...index.values()],
  };
}

/** Sort like `ls`: case-insensitive, ignoring a leading dot. */
export function sortNames(names) {
  const key = (n) => n.replace(/^\.+/, '').toLowerCase();
  return [...names].sort((a, b) => key(a).localeCompare(key(b)) || a.localeCompare(b));
}

/** File kind drives how the 3D world draws it. */
export function fileKind(name) {
  if (/\.zip$/i.test(name)) return 'archive';
  if (/\.log$/i.test(name)) return 'log';
  return 'text';
}

// ---------------------------------------------------------------------------
// Machines
// ---------------------------------------------------------------------------

// The lesson machine (Topic 01 story: "The Forgotten Machine").
export function lessonMachine() {
  return {
    id: 'lesson',
    user: 'rookie',
    host: 'machine',
    home: '/home/rookie',
    start: '/home/rookie',
    tree: {
      home: {
        rookie: {
          Desktop: {
            'welcome.txt': 'Welcome to the machine.\nEverything you see here is a file or a directory.',
          },
          Documents: {
            'notes.txt': 'This machine contains more than it appears.\nKeep exploring.',
            project: {
              'clue.txt': 'Not every name shows up the first time you look.\nNames that start with a dot like to stay out of sight.',
            },
          },
          Downloads: {
            'old_file.zip': 'PK\u0003\u0004\u0014\u0000\u0008\u0000 §Òþ´old_file/\u0000ÿè ▒▒Ø¤',
          },
          '.hidden': {
            'message.txt': 'You found me.\n\nThis machine was never empty.\nYou simply needed to learn how to explore it.',
          },
        },
      },
    },
  };
}

// The independent-practice machine: a different user, different layout, different names.
export const PRACTICE_TARGET = '/home/operator/projects/radio/.archive/transmission.txt';

export function practiceMachine() {
  return {
    id: 'practice',
    user: 'operator',
    host: 'relay',
    home: '/home/operator',
    start: '/home/operator',
    target: PRACTICE_TARGET,
    tree: {
      home: {
        operator: {
          'readme.txt': 'Relay station log-in successful.\nThe radio team kept their work in projects.',
          logs: {
            'system.log': '[04:12] relay boot ok\n[04:13] antenna array online\n[04:20] transmission archived by operator',
            'access.log': '[04:11] operator logged in\n[04:19] operator opened projects/radio',
          },
          backups: {
            'site_backup.zip': 'PK\u0003\u0004\u0014\u0000\u0000\u0000 å\u0091backup/\u0000▒¶¥ð',
            '.old': {
              'readme.txt': 'Nothing in here but old backups.\nThe archive was never stored with the backups.',
            },
          },
          projects: {
            'todo.txt': '- recalibrate antenna\n- archive the last transmission\n- tell nobody where',
            radio: {
              'frequencies.txt': '121.5 MHz  emergency\n243.0 MHz  military\n\nThe last transmission was archived right here,\nwhere a normal listing will never show it.',
              '.archive': {
                'transmission.txt': 'TRANSMISSION 07 // RECOVERED\n\nIf you are reading this, you no longer need a guide.\nYou found your location, listed what was there,\nlooked for what was hidden, and opened it.\n\nThe machine is yours to explore.',
              },
            },
          },
          '.config': {
            'settings.txt': 'theme=dark\nprompt=minimal\nbeacon=off',
          },
        },
      },
    },
  };
}

/** Attach a filesystem to a machine spec. Each call builds a fresh, independent tree. */
export function buildMachine(spec) {
  return { ...spec, fs: createFilesystem(spec.tree) };
}
