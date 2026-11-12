import { $, status, copyText, renderJSON, element } from './utils.js';
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
export function decodeBase64URL(segment, label, allowEmpty = false) {
  if (!segment && allowEmpty) return new Uint8Array();
  if (!segment || !/^[A-Za-z0-9_-]+={0,2}$/.test(segment)) throw new Error(`${label}: invalid Base64URL encoding.`);
  const raw = segment.replace(/=+$/, '');
  if (raw.length % 4 === 1) throw new Error(`${label}: invalid Base64URL length.`);
  const needed = (4 - raw.length % 4) % 4;
  if (segment.includes('=') && segment.length - raw.length !== needed) throw new Error(`${label}: invalid Base64URL padding.`);
  let decoded;
  try { decoded = atob(raw.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(needed)); }
  catch { throw new Error(`${label}: invalid Base64URL encoding.`); }
  // Reject non-zero trailing pad bits, rather than silently decoding invalid encodings.
  const canonical = btoa(decoded).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  if (canonical !== raw) throw new Error(`${label}: non-canonical Base64URL encoding.`);
  return Uint8Array.from(decoded, char => char.charCodeAt(0));
}
function decodeJSON(segment, label) {
  const bytes = decodeBase64URL(segment, label);
  let text;
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
  catch { throw new Error(`${label}: invalid UTF-8 content.`); }
  let data;
  try { data = JSON.parse(text); }
  catch { throw new Error(`${label}: decoded content is not valid JSON.`); }
  if (!object(data)) throw new Error(`${label}: expected a JSON object.`);
  return data;
}
export function inspectToken(input, now = Date.now() / 1000) {
  const token = input.trim();
  if (!token) throw new Error('Paste a JWT first.');
  if (token.length > 100000) throw new Error('Token too large. This inspector accepts up to 100,000 characters.');
  const segments = token.split('.');
  if (segments.length !== 3) throw new Error('Expected three JWT segments: header.payload.signature. Encrypted five-segment tokens are not supported.');
  const header = decodeJSON(segments[0], 'Header');
  const payload = decodeJSON(segments[1], 'Payload');
  if (typeof header.alg !== 'string' || !header.alg.trim()) throw new Error('Missing expected JWT structure: header.alg must be a non-empty string.');
  decodeBase64URL(segments[2], 'Signature', header.alg === 'none');
  if (header.alg === 'none' && segments[2] !== '') throw new Error('Malformed unsecured JWT: alg "none" requires an empty signature.');
  const warnings = [];
  if (header.alg === 'none') warnings.push('Unsecured token (alg: none).');
  for (const key of ['exp', 'nbf', 'iat']) {
    if (Object.hasOwn(payload, key) && (typeof payload[key] !== 'number' || !Number.isFinite(payload[key]) || !Number.isFinite(new Date(payload[key] * 1000).getTime()))) warnings.push(`${key} is not a supported numeric Unix timestamp.`);
  }
  const numeric = key => typeof payload[key] === 'number' && Number.isFinite(payload[key]) && Number.isFinite(new Date(payload[key] * 1000).getTime());
  const expired = numeric('exp') && now >= payload.exp;
  const notYetValid = numeric('nbf') && now < payload.nbf;
  if (expired) warnings.push('Expired according to exp and your device clock.');
  if (notYetValid) warnings.push('Not yet valid according to nbf and your device clock.');
  if (!Object.hasOwn(payload, 'exp')) warnings.push('No expiration (exp) claim is present.');
  return { header, payload, signature: segments[2], expired, notYetValid, warnings };
}
export function safeExample() {
  const encode = data => btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(data)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: 'local-example', iss: 'MalachKit demo', iat: Math.floor(Date.now() / 1000), note: 'Example only. No real signature.' })}.${btoa('not-a-real-signature').replace(/=+$/, '')}`;
}
export function initTokenLens() {
  let result = null;
  const clearResults = () => {
    result = null;
    $('token-results').hidden = true;
    for (const id of ['jwt-header', 'jwt-payload', 'jwt-signature', 'jwt-claims']) $(id).replaceChildren();
    status($('token-status'), '');
  };
  const clear = () => { $('jwt-input').value = ''; clearResults(); };
  $('clear-token').addEventListener('click', clear);
  $('jwt-input').addEventListener('input', clearResults);
  $('token-example').addEventListener('click', () => { clear(); $('jwt-input').value = safeExample(); status($('token-status'), 'Safe demonstration token loaded. Its signature is deliberately not real.'); });
  $('inspect-token').addEventListener('click', () => {
    clearResults();
    try {
      result = inspectToken($('jwt-input').value);
      renderJSON($('jwt-header'), result.header);
      renderJSON($('jwt-payload'), result.payload);
      $('jwt-signature').textContent = result.signature || '(empty signature for alg: none)';
      const names = { iss: 'Issuer', sub: 'Subject', aud: 'Audience', exp: 'Expiration time', nbf: 'Not before', iat: 'Issued at', jti: 'JWT identifier' };
      let count = 0;
      for (const [key, label] of Object.entries(names)) {
        if (!Object.hasOwn(result.payload, key)) continue;
        count++;
        const row = element('div', undefined, 'claim-row');
        row.append(element('code', key));
        const value = element('div', `${label}: ${JSON.stringify(result.payload[key])}`);
        if (['exp', 'nbf', 'iat'].includes(key)) {
          const stamp = result.payload[key];
          const date = typeof stamp === 'number' ? new Date(stamp * 1000) : null;
          const readable = date && Number.isFinite(date.getTime()) ? `${date.toLocaleString()} (${Intl.DateTimeFormat().resolvedOptions().timeZone}) · ${date.toISOString()}` : 'Not a supported numeric Unix timestamp.';
          value.append(element('small', readable));
          if (key === 'exp' && date && Number.isFinite(date.getTime())) value.append(element('small', result.expired ? 'EXPIRED (device time)' : 'Not expired by device time. Signature still unverified.', result.expired ? 'error' : ''));
          if (key === 'nbf' && result.notYetValid) value.append(element('small', 'NOT YET VALID (device time)', 'warning-text'));
        }
        row.append(value); $('jwt-claims').append(row);
      }
      if (!count) $('jwt-claims').append(element('p', 'No common registered claims are present. They are optional; this does not establish authenticity.', 'helper'));
      status($('token-status'), 'Three-segment structure decoded. Signature NOT verified. ' + result.warnings.join(' '), result.warnings.length ? 'warning-text' : '');
      $('token-results').hidden = false;
    } catch (error) { status($('token-status'), error.message, 'error'); }
  });
  $('copy-token').addEventListener('click', () => result && copyText(JSON.stringify({ header: result.header, payload: result.payload }, null, 2)));
  return { clear };
}
