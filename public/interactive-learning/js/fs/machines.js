// The machines (story filesystems) for every mission. Plain data: objects are
// directories, strings are text files, zip(...) is an archive. Every machine's
// root holds only /home, so `cd ..` from home leads to /home and then to /.

import { zip } from './filesystem.js';


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
            'old_file.zip': zip({ 'old_file.txt': 'An old download. Nothing important in here.' }),
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
            'site_backup.zip': zip({ site: { 'index.html': '<h1>Relay station</h1>\n<p>Under construction.</p>' } }),
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


// ---------------------------------------------------------------------------
// Lesson 2 — The Delivery: unpacking archives.
export function archivesMachine() {
  return {
    id: 'archives',
    user: 'rookie',
    host: 'depot',
    home: '/home/rookie',
    start: '/home/rookie',
    tree: {
      home: {
        rookie: {
          'welcome.txt': 'Two parcels arrived for you in Downloads.\nParcels on this machine come as .zip archives.',
          Desktop: {
            'todo.txt': '- unpack the supplies\n- open the locked parcel\n- do not lose the sticky note',
            '.sticky_note.txt': 'Password for locked.zip:\n\n    lantern\n\nNever leave passwords lying around like this. :)',
          },
          Downloads: {
            'supplies.zip': zip({
              supplies: {
                'manifest.txt': 'DELIVERY MANIFEST\n\n1. supplies.zip  (this one, unpacked)\n2. locked.zip    (password protected)\n\nThe password for locked.zip is on a sticky note on your Desktop.\nSticky notes on this machine are hidden files.',
                'map.txt': 'Desktop/    your notes\nDownloads/  incoming parcels',
              },
            }),
            'locked.zip': zip({
              secret: {
                'note.txt': 'You unlocked the parcel.\n\nPassword-protected archives are everywhere:\nbackups, invoices, CTF challenges.\nYou now know how to open them.',
              },
            }, { password: 'lantern' }),
          },
        },
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Test 2 — The Vault (ultimate). Three password fragments hide in hidden files
// across the machine; joined in order they open vault/top_secret.zip.
export const VAULT_PASSWORD = 'ORION-47-ECHO';
export const VAULT_ARCHIVE = '/home/agent/vault/top_secret.zip';

export function vaultMachine() {
  const fiction = '\n\n[ This file is fictional, for a training game. ]';
  return {
    id: 'vault',
    user: 'agent',
    host: 'blacksite',
    home: '/home/agent',
    start: '/home/agent',
    target: VAULT_ARCHIVE,
    tree: {
      home: {
        agent: {
          'briefing.txt': 'BRIEFING // EYES ONLY\n\nThe vault is in vault/top_secret.zip and it is locked.\nThe previous agent split the password into 3 parts\nand hid each part in a file no ordinary listing shows.\n\nFind all three. Join them in order, with dashes:\n    PART1-PART2-PART3\n\nStart with the mail.',
          '.bash_history': 'ls\ncd mail\nls\ncat inbox/msg_002.txt\ncd ..\nclear\n# nice try. history was wiped.',
          mail: {
            inbox: {
              'msg_001.txt': 'From: HQ\nSubject: part one\n\nPart one is filed away with the old reports,\nin the archive. You know how we hide things.',
              'msg_002.txt': 'From: canteen\nSubject: TACO TUESDAY\n\nTacos are back. Bring your own hot sauce.',
            },
            sent: {
              'msg_003.txt': 'To: HQ\nSubject: re: part one\n\nDone. Nobody looks in the archive anyway.',
            },
          },
          reports: {
            '2025': {
              'q4_summary.txt': 'Q4: coffee consumption up 300%.\nMorale: questionable.',
            },
            archive: {
              'old_report.txt': 'REPORT 1997-03\nWeather balloon. Definitely a weather balloon.',
              '.part1.txt': 'PASSWORD // PART 1 OF 3\n\n    ORION\n\nPart two is somewhere among the tools.\nTools keep their secrets in a cache.',
            },
          },
          tools: {
            'readme.txt': 'Field tools. Do not touch the scanner.',
            scanner: {
              'manual.txt': 'SCANNER MANUAL\nStep 1: point at things.\nStep 2: be amazed.',
              '.cache': {
                'part2.txt': 'PASSWORD // PART 2 OF 3\n\n    47\n\nThe last part: the previous agent never let anyone\nlook through their personal photos.',
              },
            },
            radio: {
              'frequencies.txt': '121.5  emergency\n243.0  military\n147.0  pizza delivery',
            },
          },
          personal: {
            '.diary': {
              'day_12.txt': 'Day 12. Split the vault password today.\nPhotos seemed like a good hiding place. Nobody looks at holiday photos.',
            },
            photos: {
              'beach.txt': '[photo] a beach. very sunny. 10/10.',
              'cat.txt': '[photo] a cat sitting on a classified document.',
              '.part3.txt': 'PASSWORD // PART 3 OF 3\n\n    ECHO\n\nJoin all three parts in order, with dashes.\nThen open the vault.',
            },
          },
          vault: {
            'README.txt': 'top_secret.zip is password protected.\nunzip will ask for the password.',
            'top_secret.zip': zip({
              top_secret: {
                'README_FIRST.txt': 'CLEARANCE GRANTED.\n\nWelcome to the vault, agent. Everything in here is\na joke written for a Linux training game. Enjoy.' + fiction,
                'nuclear_launch_codes.txt': 'NUCLEAR LAUNCH CODES\n\n    0000-0000\n\nRumour says a real code was once eight zeros.\nThese ones launch nothing but confetti.' + fiction,
                'world_bank_vault.txt': 'WORLD BANK VAULT // COMBINATION\n\n    12-34-56-78\n\nContents: 3 gold bars, 1 stapler, a very old sandwich.' + fiction,
                'military_secrets.txt': 'MILITARY SECRETS\n\n1. The canteen coffee is a weapon.\n2. Camouflage works on everyone except the colonel.\n3. Operation Pancake is about actual pancakes.' + fiction,
                'area_54_secrets.txt': 'AREA 54\n\nEveryone asks about Area 51.\nNobody asks about Area 54, where the snacks are kept.\nStatus: heavily guarded. Mostly by raccoons.' + fiction,
                'aliens_documentary.txt': 'ALIENS: A DOCUMENTARY (script draft 3)\n\nINT. FLYING SAUCER - NIGHT\nZORG: "They still use tabs AND spaces?"\nBLIP: "Leave this planet. Immediately."\n\nRunning time: 90 minutes of humans arguing about pizza toppings.' + fiction,
                'ufo_sightings.log': '[1947] Roswell: balloon (officially)\n[1997] Phoenix: lights (definitely planes)\n[2026] Blacksite: someone left the microwave open' + fiction,
                classified: {
                  'cat_videos.txt': 'TOP SECRET: 4,812 cat videos.\nThe real reason the internet was invented.' + fiction,
                  'moon_landing_bloopers.txt': 'Take 17: astronaut trips over flag.\nTake 18: perfect.' + fiction,
                },
              },
            }, { password: VAULT_PASSWORD }),
          },
        },
      },
    },
  };
}
