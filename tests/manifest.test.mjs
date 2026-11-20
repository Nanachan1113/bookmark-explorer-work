import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
const manifest=JSON.parse(readFileSync(new URL('../explorer/manifest.json',import.meta.url),'utf8'));
test('MV3・最小権限・Popupだけを登録する',()=>{
  assert.equal(manifest.manifest_version,3);assert.equal(manifest.action.default_popup,'popup.html');
  assert.deepEqual(manifest.permissions,['bookmarks','storage']);
  for(const key of ['host_permissions','content_scripts','background','externally_connectable'])assert.equal(Object.hasOwn(manifest,key),false);
  assert.equal(manifest.minimum_chrome_version,'120');
});
test('外部スクリプト・通信・HTML文字列挿入・書込APIを導入しない',()=>{
  assert.match(manifest.content_security_policy.extension_pages,/connect-src 'none'/);
  for(const name of readdirSync(new URL('../explorer/src/',import.meta.url))){
    const source=readFileSync(new URL('../explorer/src/'+name,import.meta.url),'utf8');
    assert.doesNotMatch(source,/chrome\.bookmarks\.(?:create|move|update|remove|removeTree)\s*\(/);
    assert.doesNotMatch(source,/\b(?:fetch|XMLHttpRequest|WebSocket|eval)\s*\(/);
    assert.doesNotMatch(source,/\.innerHTML\s*=|insertAdjacentHTML/);
  }
});
