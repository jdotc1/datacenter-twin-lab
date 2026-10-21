import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath, pathToFileURL} from 'node:url';

export function validateReactVersions(react, dom, types, domTypes) {
  assert.equal(react.version, dom.version, 'React and React DOM must exactly match');
  const parts = pkg => pkg.version.split('.').map(Number);
  const runtimeMajor = parts(react)[0];
  assert.equal(parts(types)[0], runtimeMajor, 'React types must match the runtime major');
  assert.equal(parts(domTypes)[0], runtimeMajor, 'React DOM types must match the runtime major');
  const peer = domTypes.peerDependencies['@types/react'];
  const match = /^\^(\d+)\.(\d+)\.(\d+)$/.exec(peer);
  assert.ok(match, `Unsupported React type peer range: ${peer}`);
  const floor = match.slice(1).map(Number), actual = parts(types);
  assert.ok(actual[0] === floor[0] &&
    (actual[1] > floor[1] || (actual[1] === floor[1] && actual[2] >= floor[2])),
  `React type peer ${peer} is not satisfied by ${types.version}`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const modules = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../apps/web/node_modules');
  const read = name => JSON.parse(fs.readFileSync(path.join(modules, name, 'package.json'), 'utf8'));
  validateReactVersions(...['react', 'react-dom', '@types/react', '@types/react-dom'].map(read));
  console.log('Installed React runtimes and type peer versions are consistent');
}
