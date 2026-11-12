export const $ = id => document.getElementById(id);
export function status(element, message, kind = '') {
  element.textContent = message;
  element.className = 'inline-status' + (kind ? ' ' + kind : '');
}
let toastTimer;
export function notify(message, error = false) {
  const toast = $('notification');
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.className = 'toast' + (error ? ' error' : '');
  toast.hidden = false;
  toastTimer = setTimeout(() => { toast.hidden = true; }, 4200);
}
export async function copyText(text) {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(text);
    notify('Copied to clipboard.');
    return true;
  } catch {
    notify('Clipboard access was blocked. Select the result and copy it manually.', true);
    return false;
  }
}
export function formatBytes(bytes) {
  if (bytes < 1000) return `${bytes.toLocaleString()} bytes`;
  if (bytes < 1000000) return `${(bytes / 1000).toFixed(1)} kB (${bytes.toLocaleString()} bytes)`;
  return `${(bytes / 1000000).toFixed(2)} MB (${bytes.toLocaleString()} bytes)`;
}
export function element(tag, text, className = '') {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
export function downloadText(text, filename) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const link = element('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
// Highlight JSON using text nodes, never HTML from the inspected token.
export function renderJSON(target, value) {
  const source = JSON.stringify(value, null, 2);
  const pattern = /("(?:\\.|[^"\\])*"\s*:)|("(?:\\.|[^"\\])*")|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|\b(true|false|null)\b/g;
  target.replaceChildren();
  let last = 0;
  for (const match of source.matchAll(pattern)) {
    target.append(document.createTextNode(source.slice(last, match.index)));
    target.append(element('span', match[0], match[1] ? 'json-key' : match[2] ? 'json-string' : match[3] ? 'json-number' : 'json-bool'));
    last = match.index + match[0].length;
  }
  target.append(document.createTextNode(source.slice(last)));
}
