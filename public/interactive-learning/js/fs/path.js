// Path resolution for the simulated filesystem. Purely lexical, like a shell:
// it can never point outside the simulated tree because "/" is the top and
// ".." at "/" stays at "/".

/** Turn user input into a normalized absolute path (string only, no lookup). */
export function resolvePath(cwd, input, home) {
  let raw = input;
  if (raw === '~') raw = home;
  else if (raw.startsWith('~/')) raw = home + raw.slice(1);
  const parts = (raw.startsWith('/') ? [] : cwd.split('/')).concat(raw.split('/'));
  const out = [];
  for (const part of parts) {
    if (!part || part === '.') continue;
    if (part === '..') out.pop();
    else out.push(part);
  }
  return '/' + out.join('/');
}

export const parentOf = (path) => (path === '/' ? '/' : path.slice(0, path.lastIndexOf('/')) || '/');
export const baseName = (path) => (path === '/' ? '/' : path.slice(path.lastIndexOf('/') + 1));

/** How a shell prompt shows a directory: the home directory becomes "~". */
export function displayPath(path, home) {
  if (path === home) return '~';
  if (path.startsWith(home + '/')) return '~' + path.slice(home.length);
  return path;
}

/** Ancestors from "/" down to and including `path`. */
export function pathChain(path) {
  const chain = ['/'];
  let acc = '';
  for (const part of path.split('/').filter(Boolean)) {
    acc += '/' + part;
    chain.push(acc);
  }
  return chain;
}
