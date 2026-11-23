// One rule for what the learner has discovered, shared by the 3D world, the
// no-WebGL fallback and the screen-reader description. Derived only from the
// simulated filesystem + view state, so every view always agrees.
//
// view = { cwd, visited: Set<path>, listed: Map<dirPath, { visible, hidden }> }
//   'shown' : discovered (listed, visited, or on the path you walked)
//   'ghost' : a visible entry next to you that you haven't listed yet (faint hint)
//   'none'  : not discovered; hidden entries stay 'none' until `ls -a`

import { isHidden } from '../fs/filesystem.js';
import { pathChain, parentOf } from '../fs/path.js';

export function visibilityOf(node, view, home) {
  if (node.path === '/' || pathChain(home).includes(node.path)) return 'shown';
  if (pathChain(view.cwd).includes(node.path) || view.visited.has(node.path)) return 'shown';
  const parent = parentOf(node.path);
  const listed = view.listed.get(parent);
  if (isHidden(node.name)) return listed?.hidden ? 'shown' : 'none';
  if (listed?.visible || listed?.hidden) return 'shown';
  if (view.visited.has(parent) || parent === view.cwd) return 'ghost';
  return 'none';
}
