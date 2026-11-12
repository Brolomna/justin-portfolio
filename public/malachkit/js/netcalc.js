import { $, status, copyText, element } from './utils.js';
export function parseIPv4(input) {
  const value = input.trim();
  const parts = value.split('.');
  if (parts.length !== 4 || parts.some(part => !/^(0|[1-9]\d{0,2})$/.test(part) || Number(part) > 255)) throw new Error('Enter four decimal IPv4 octets from 0 to 255, with no leading zeros (for example, 192.168.1.10).');
  return parts.reduce((sum, part) => sum * 256n + BigInt(part), 0n);
}
export function formatIPv4(value) {
  return [24n, 16n, 8n, 0n].map(shift => Number((value >> shift) & 255n)).join('.');
}
const binary = value => value.toString(2).padStart(32, '0').match(/.{8}/g).join('.');
export function calculateSubnet(ipInput, prefixInput) {
  const ip = parseIPv4(ipInput);
  const prefixText = String(prefixInput).trim();
  if (!/^(0|[1-9]\d?)$/.test(prefixText) || Number(prefixText) > 32) throw new Error('Enter a whole CIDR prefix from 0 through 32.');
  const prefix = Number(prefixText);
  const total = 1n << BigInt(32 - prefix);
  const wildcard = total - 1n;
  const mask = 0xffffffffn ^ wildcard;
  const network = ip & mask;
  const broadcast = network + wildcard;
  const usable = prefix >= 31 ? total : total - 2n;
  const first = prefix >= 31 ? network : network + 1n;
  const last = prefix >= 31 ? broadcast : broadcast - 1n;
  return {
    ip: formatIPv4(ip), prefix, mask: formatIPv4(mask), wildcard: formatIPv4(wildcard), network: formatIPv4(network), broadcast: formatIPv4(broadcast), total: total.toString(), usable: usable.toString(), first: formatIPv4(first), last: formatIPv4(last),
    binary: { 'IP address': binary(ip), 'Subnet mask': binary(mask), 'Network address': binary(network), 'Broadcast address': binary(broadcast) },
    explanation: prefix === 31 ? 'Point-to-point exception (RFC 3021): both addresses are usable on a /31 point-to-point link. The high address is shown as the range endpoint, not a directed broadcast.' : prefix === 32 ? 'Single host route: /32 identifies one address, not a normal multi-host subnet. Network, range endpoint, first, and last are the same address; there is no subnet broadcast.' : `This /${prefix} contains ${total.toLocaleString()} addresses from ${formatIPv4(network)} to ${formatIPv4(broadcast)}. Excluding the network and broadcast leaves ${usable.toLocaleString()} usable host addresses. Reserved or special-purpose address space may further limit real-world use.`
  };
}
export function subnetEntries(result) {
  return [['IP address', result.ip], ['CIDR prefix', '/' + result.prefix], ['Subnet mask', result.mask], ['Wildcard mask', result.wildcard], ['Network address', result.network], [result.prefix >= 31 ? 'Range endpoint (no broadcast)' : 'Broadcast address', result.broadcast], ['Total addresses', Number(result.total).toLocaleString()], [result.prefix === 31 ? 'Usable (point-to-point)' : result.prefix === 32 ? 'Host route address' : 'Usable hosts', Number(result.usable).toLocaleString()], ['First usable address', result.first], ['Last usable address', result.last]];
}
export function initNetCalc() {
  let result = null;
  const clearResults = () => { result = null; $('network-results').hidden = true; $('network-grid').replaceChildren(); $('network-binary').replaceChildren(); status($('network-status'), ''); };
  const reset = () => { $('ip-input').value = ''; $('cidr-input').value = ''; clearResults(); };
  $('reset-network').addEventListener('click', reset);
  for (const id of ['ip-input', 'cidr-input']) $(id).addEventListener('input', clearResults);
  $('network-form').noValidate = true;
  $('network-form').addEventListener('submit', event => {
    event.preventDefault();
    clearResults();
    try {
      result = calculateSubnet($('ip-input').value, $('cidr-input').value);
      $('network-title').textContent = `${result.network}/${result.prefix}`;
      for (const [label, value] of subnetEntries(result)) {
        const card = element('div', undefined, 'network-item');
        const heading = element('div');
        const copy = element('button', 'Copy', 'mini-copy');
        copy.type = 'button'; copy.setAttribute('aria-label', `Copy ${label.toLowerCase()}`);
        copy.addEventListener('click', () => copyText(value));
        heading.append(element('span', label), copy);
        card.append(heading, element('strong', value));
        $('network-grid').append(card);
      }
      for (const [label, value] of Object.entries(result.binary)) {
        const row = element('div', label, 'binary-row'); row.append(element('code', value)); $('network-binary').append(row);
      }
      $('network-explanation').textContent = result.explanation;
      $('network-results').hidden = false;
      status($('network-status'), 'Subnet calculated. No network traffic was sent.', 'success');
    } catch (error) { status($('network-status'), error.message, 'error'); }
  });
  $('copy-network').addEventListener('click', () => {
    if (!result) return;
    copyText(subnetEntries(result).map(([label, value]) => `${label}: ${value}`).join('\n') + '\n' + Object.entries(result.binary).map(([label, value]) => `${label} (binary): ${value}`).join('\n') + '\n\n' + result.explanation);
  });
  return { reset };
}
