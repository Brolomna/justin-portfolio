// Lesson 6 — Codes & Ciphers ("The Cipher Room"). Encode/decode (base64),
// verify (sha256sum), encrypt/decrypt (gpg).

const HOME = '/home/rookie';
const DL = `${HOME}/downloads`;

export const story = [
  'Coded messages, a download to check, and a locked file.',
  'Learn the difference between encoding, hashing and encryption.',
];
export const say = 'Welcome to the cipher room. There is a coded message, a download to check, and a locked file. Along the way you will learn the difference between encoding, hashing and encryption.';

export const steps = [
  {
    id: 'look', mode: 'recall', title: 'A strange message',
    body: ['Read <b>message.b64</b>.'],
    expect: HOME,
    done: (e) => e.type === 'cat' && e.files.some((f) => f.path === `${HOME}/message.b64`),
    success: () => 'Gibberish? It is <b>Base64</b>: text written in a safe alphabet.',
    say: 'There is a message here. Read message dot B 6 4.',
    sayDone: 'It looks like gibberish, but it is Base 64. A way of writing any data with plain letters and numbers.',
    hints: ['Print message.b64.', 'The file-reading command.', 'Type <code>cat message.b64</code>.'],
  },
  {
    id: 'decode', mode: 'learn', title: 'Decode it',
    body: ['Turn the Base64 back into text.'],
    command: { cmd: 'base64 -d message.b64', name: 'decode', what: 'Turns Base64 back into the original text.' },
    expect: HOME,
    done: (e) => e.type === 'base64' && e.decode && e.path === `${HOME}/message.b64`,
    success: () => 'The passphrase is <code>moonlight</code>. Encoding hides nothing: anyone can decode it.',
    remember: ['base64 -d FILE', 'decode'],
    say: 'Type base 64, dash D for decode, then message dot B 6 4.',
    sayDone: 'The passphrase is moonlight. Remember: encoding is not secret. Anyone can decode it.',
    hints: ['Decode message.b64.', 'The base64 command with the option for decode.', 'Type <code>base64 -d message.b64</code>.'],
  },
  {
    id: 'encode', mode: 'learn', title: 'Encode your own',
    body: ['Encode the word <b>hello</b>.'],
    command: { cmd: 'echo hello | base64', name: 'encode', what: 'Pipes text into base64 to encode it.' },
    expect: null,
    done: (e) => e.type === 'base64' && !e.decode && (e.pipe || []).includes('echo'),
    success: () => '<code>aGVsbG8K</code>: the same on every computer in the world.',
    remember: ['echo TEXT | base64', 'encode'],
    say: 'Now encode something yourself. Echo the word hello and pipe it into base 64.',
    sayDone: 'That is hello in Base 64. Every computer in the world would encode it exactly the same way.',
    hints: ['Encode the word hello.', 'echo it, then pipe (|) it into base64.', 'Type <code>echo hello | base64</code>.'],
  },
  {
    id: 'hash', mode: 'learn', title: 'Fingerprint a file',
    body: ['In <b>downloads</b>, get the fingerprint of <b>installer.sh</b>.'],
    command: { cmd: 'sha256sum installer.sh', name: 'hash', what: 'Makes a unique fingerprint of a file. Change one letter, and it changes completely.' },
    expect: DL,
    done: (e) => e.type === 'sha256sum' && (e.sums || []).some((x) => x.path === `${DL}/installer.sh`),
    success: () => 'That long code is the file\'s <b>hash</b>, its fingerprint.',
    remember: ['sha256sum FILE', 'fingerprint'],
    say: 'Go to downloads. Before running anything you downloaded, check it. Type S H A 2 5 6 sum, then installer dot S H. It prints a fingerprint called a hash.',
    sayDone: 'That long code is the file\'s fingerprint. Change a single letter in the file, and it changes completely.',
    hints: ['Go to downloads and hash installer.sh.', 'The command is sha256sum, then the file.', 'Type <code>cd downloads</code>, then <code>sha256sum installer.sh</code>.'],
  },
  {
    id: 'verify', mode: 'learn', title: 'Check it',
    body: ['Compare it with the official fingerprint in <b>installer.sha256</b>.'],
    command: { cmd: 'sha256sum -c installer.sha256', name: 'check', what: 'Compares files with a list of known fingerprints.' },
    expect: DL,
    done: (e) => e.type === 'sha256sum' && e.check && e.checked?.length > 0,
    success: () => '<code>OK</code>: the download is exactly what its author published.',
    remember: ['sha256sum -c LIST', 'verify'],
    say: 'Now check it against the official fingerprint. Type S H A 2 5 6 sum, dash C for check, then installer dot S H A 2 5 6.',
    sayDone: 'O K. The file is exactly what its author published. If anyone had tampered with it, this would say failed.',
    hints: ['Check installer.sh against installer.sha256.', 'sha256sum with the option for "check", then the list file.', 'Type <code>sha256sum -c installer.sha256</code>.'],
  },
  {
    id: 'decrypt', mode: 'learn', title: 'Decrypt',
    body: ['Open <b>vault.txt.gpg</b> in your home with the passphrase you decoded.'],
    command: { cmd: 'gpg -d vault.txt.gpg', name: 'decrypt', what: 'Asks for the passphrase, then shows the secret.' },
    expect: HOME,
    done: (e) => e.type === 'gpg-decrypt' && e.path === `${HOME}/vault.txt.gpg`,
    success: () => 'Unlike Base64, this needed the passphrase. That is <b>encryption</b>.',
    remember: ['gpg -d FILE', 'decrypt'],
    say: 'Go back home. Vault dot T X T dot G P G is encrypted. Type G P G, dash D for decrypt, then the file name. When it asks, type the passphrase you decoded. It stays hidden as you type.',
    sayDone: 'Decrypted. Unlike Base 64, this was impossible without the passphrase. That is the difference between encoding and encryption.',
    hints: ['Go home and decrypt vault.txt.gpg.', 'gpg with the decrypt option. The passphrase was in the decoded message.', 'Type <code>cd ~</code>, <code>gpg -d vault.txt.gpg</code>, then <code>moonlight</code>.'],
  },
  {
    id: 'encrypt', mode: 'learn', title: 'Encrypt your own',
    body: ['Lock <b>diary.txt</b> with a passphrase of your choice.'],
    command: { cmd: 'gpg -c diary.txt', name: 'encrypt', what: 'Asks for a passphrase twice, then writes diary.txt.gpg.' },
    expect: HOME,
    done: (e) => e.type === 'gpg-encrypt' && e.path === `${HOME}/diary.txt`,
    success: () => '<code>diary.txt.gpg</code> is locked. But the original is still there, unlocked.',
    remember: ['gpg -c FILE', 'encrypt'],
    say: 'Now lock your own diary. Type G P G, dash C, then diary dot T X T. Choose a passphrase, and type it twice.',
    sayDone: 'Your diary is locked in diary dot T X T dot G P G. But careful: the original, unlocked file is still there.',
    hints: ['Encrypt diary.txt.', 'gpg with the option for symmetric encryption (c), then the file.', 'Type <code>gpg -c diary.txt</code>, then any passphrase twice.'],
  },
  {
    id: 'shred', mode: 'recall', title: 'Remove the original',
    body: ['Delete the unlocked <b>diary.txt</b>.'],
    expect: HOME,
    done: (e) => (e.fsChange?.removed || []).some((r) => r.path === `${HOME}/diary.txt`),
    success: () => 'Only the encrypted copy is left.',
    say: 'Encryption is pointless if the original is still lying around. Delete the plain diary dot T X T.',
    sayDone: 'Only the encrypted copy is left. Your secrets are safe.',
    hints: ['Delete the plain diary.txt, not the .gpg one.', 'The delete command from Lesson 3.', 'Type <code>rm diary.txt</code>.'],
  },
];

export const finale = {
  title: 'Lesson 6 complete.',
  body: 'Encoding is for transport, hashing is for checking, encryption is for secrets.',
  recap: [['base64 / -d', 'encode / decode'], ['sha256sum FILE', 'fingerprint'], ['sha256sum -c', 'verify'], ['gpg -c FILE', 'encrypt'], ['gpg -d FILE', 'decrypt']],
  say: 'Lesson six complete. Encoding is for moving data, hashing is for checking it, and encryption is for keeping it secret. You are ready for the final exam.',
};
