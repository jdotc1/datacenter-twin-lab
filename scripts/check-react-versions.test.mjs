import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateReactVersions} from './check-react-versions.mjs';
const react={version:'19.3.1'}, dom={version:'19.3.1'};
const types={version:'19.3.0'}, domTypes={version:'19.3.0',peerDependencies:{'@types/react':'^19.3.0'}};
test('matching runtimes accept compatible type versions with different patches',()=>{
 validateReactVersions(react,dom,types,domTypes);
 validateReactVersions(react,dom,{version:'19.3.4'},domTypes);
});
test('mismatched runtime fails before a renderer can load',()=>{
 assert.throws(()=>validateReactVersions(react,{version:'19.2.8'},types,domTypes),/exactly match/);
});
test('type peer floor and runtime major are enforced',()=>{
 assert.throws(()=>validateReactVersions(react,dom,{version:'19.2.18'},domTypes),/type peer/);
 assert.throws(()=>validateReactVersions(react,dom,{version:'20.0.0'},domTypes),/major/);
});
