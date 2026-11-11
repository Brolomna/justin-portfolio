import { $, status, notify, copyText, formatBytes, downloadText } from './utils.js';
export const MAX_FILE_BYTES = 50000000;
export async function hashFile(file) {
  if (!file) throw new Error('Choose a file first.');
  if (file.size > MAX_FILE_BYTES) throw new Error('File too large. Choose a file of 50 MB (50,000,000 bytes) or less.');
  if (!globalThis.crypto?.subtle?.digest) throw new Error('Web Crypto is unavailable. Use a modern browser on HTTPS or localhost.');
  let buffer;
  try { buffer = await file.arrayBuffer(); }
  catch { throw new Error('This file could not be read. Choose it again or try another file.'); }
  try {
    const digest = await crypto.subtle.digest('SHA-256', buffer);
    return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
  } catch { throw new Error('Hashing failed. Your browser may not support SHA-256 or may be low on memory.'); }
}
export function compareHash(actual, expected) {
  const value = expected.trim();
  if (!/^[a-fA-F0-9]{64}$/.test(value)) return 'INVALID HASH';
  if (!actual) return 'NO CHECKSUM';
  return actual.toLowerCase() === value.toLowerCase() ? 'MATCH' : 'MISMATCH';
}
export function initHashCheck() {
  let selected = null;
  let checksum = '';
  let generation = 0;
  const clearOutput = () => {
    checksum = '';
    $('hash-output').textContent = 'Your checksum will appear here.';
    $('copy-hash').disabled = $('download-hash').disabled = true;
    status($('compare-result'), '');
  };
  const idle = () => { $('generate-hash').disabled = false; $('generate-hash').removeAttribute('aria-busy'); };
  const select = file => {
    generation++;
    clearOutput();
    idle();
    selected = file || null;
    $('file-details').hidden = !file;
    if (file) {
      $('file-name').textContent = file.name;
      $('file-meta').textContent = `${formatBytes(file.size)} · ${file.type || 'Type not reported'}`;
      status($('hash-status'), file.size > MAX_FILE_BYTES ? 'File too large. Maximum: 50 MB (50,000,000 bytes).' : 'File selected. Ready to generate SHA-256.', file.size > MAX_FILE_BYTES ? 'error' : '');
      $('generate-hash').disabled = file.size > MAX_FILE_BYTES;
    } else status($('hash-status'), 'No file selected.');
  };
  $('hash-file').addEventListener('change', event => select(event.target.files[0]));
  const drop = $('drop-zone');
  for (const name of ['dragenter', 'dragover']) drop.addEventListener(name, event => { event.preventDefault(); drop.classList.add('is-over'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('is-over'));
  drop.addEventListener('drop', event => {
    event.preventDefault();
    drop.classList.remove('is-over');
    $('hash-file').value = '';
    select(event.dataTransfer.files[0]);
  });
  $('generate-hash').addEventListener('click', async () => {
    if (!selected) { status($('hash-status'), 'Choose a file first.', 'error'); return; }
    const run = ++generation;
    clearOutput();
    $('generate-hash').disabled = true;
    $('generate-hash').setAttribute('aria-busy', 'true');
    status($('hash-status'), 'Reading and hashing locally…', 'processing');
    try {
      const result = await hashFile(selected);
      if (run !== generation) return;
      checksum = result;
      $('hash-output').textContent = result;
      $('copy-hash').disabled = $('download-hash').disabled = false;
      status($('hash-status'), 'SHA-256 ready. File never uploaded.', 'success');
    } catch (error) { if (run === generation) status($('hash-status'), error.message, 'error'); }
    finally { if (run === generation) idle(); }
  });
  const clear = () => { select(null); $('hash-file').value = ''; $('expected-hash').value = ''; };
  $('clear-file').addEventListener('click', clear);
  $('expected-hash').addEventListener('input', () => status($('compare-result'), ''));
  $('compare-hash').addEventListener('click', () => {
    const result = compareHash(checksum, $('expected-hash').value);
    const message = result === 'INVALID HASH' ? 'INVALID HASH - enter exactly 64 hexadecimal characters.' : result === 'NO CHECKSUM' ? 'Generate a checksum first.' : result === 'MATCH' ? 'MATCH - the checksums are identical.' : 'MISMATCH - the checksums are different.';
    status($('compare-result'), message, result === 'MATCH' ? 'success' : result === 'INVALID HASH' ? 'warning-text' : 'error');
  });
  $('copy-hash').addEventListener('click', () => checksum && copyText(checksum));
  $('download-hash').addEventListener('click', () => {
    if (!checksum) return;
    downloadText(checksum + '\n', (selected?.name || 'file') + '.sha256.txt');
    notify('Checksum text file prepared. Check your downloads.');
  });
  return { clear };
}
