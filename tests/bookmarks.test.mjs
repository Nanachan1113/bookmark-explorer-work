import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {filterBookmarks,sortBookmarks,flattenBookmarkTree} from '../explorer/src/bookmarks.js';
import {loadChromeBookmarks} from '../explorer/src/bookmark-source.js';
const tree=JSON.parse(readFileSync(new URL('../examples/05-bookmark-tree.json',import.meta.url),'utf8'));
const sample=flattenBookmarkTree(tree);
test('Chromeの木から2件の同URL別IDを残す',()=>{
 assert.equal(sample.items.length,2);
 assert.deepEqual(sample.items.map(x=>x.id),['b1','b2']);
 assert.equal(sample.folders.length,2);
 assert.equal(sample.items[0].parentFolderId,'a');
 assert.match(sample.items[0].folderPath,/学習/);
});
test('フォルダIDは直上のIDのみで絞り込む',()=>{
 assert.equal(filterBookmarks(sample.items,'','a').length,2);
 assert.equal(filterBookmarks(sample.items,'','1').length,0);
});
test('タイトルとURLを大文字小文字を問わず検索する',()=>{
 assert.equal(filterBookmarks(sample.items,'javascript').length,1);
 assert.equal(filterBookmarks(sample.items,'EXAMPLE.COM').length,2);
 assert.equal(filterBookmarks(sample.items,' 見つからない ').length,0);
});
test('TITLE並べ替えは元配列を変えない',()=>{
 const before=sample.items.map(x=>x.id);
 const sorted=sortBookmarks(sample.items,'TITLE');
 assert.deepEqual(sample.items.map(x=>x.id),before);
 assert.equal(sorted.length,2);
});
test('NEWESTは日時降順、欠損は末尾相当',()=>{
 const input=[{...sample.items[0],dateAdded:null},{...sample.items[1],dateAdded:1700}];
 assert.equal(sortBookmarks(input,'NEWEST')[0].id,'b2');
});
test('空ツリーと空フォルダを区別する',()=>{
 assert.deepEqual(flattenBookmarkTree([]),{items:[],folders:[]});
 assert.equal(flattenBookmarkTree([{id:'0',title:'',children:[{id:'f',title:'空',parentId:'0'}]}]).folders.length,1);
});
test('getTreeを呼ぶ。書込みAPIを使用しない',async()=>{
 const api={getTree:async()=>tree, create:()=>{throw new Error('must not call create');},move:()=>{throw new Error('must not call move');}};
 const data=await loadChromeBookmarks(api);
 assert.equal(data.items.length,2);
});
test('getTree失敗を空一覧へ偽装しない',async()=>{
 await assert.rejects(loadChromeBookmarks({getTree:async()=>{throw new Error('blocked');}}),/blocked/);
});
test('getTree戻り値が不正なら拒否',async()=>{
 await assert.rejects(loadChromeBookmarks({getTree:async()=>null}),/配列/);
});
test('悪意のある文字列もデータとして保持する',()=>{
 const malicious='</script><img src=x onerror=alert(1)>';
 const r=flattenBookmarkTree([{id:'0',title:'',children:[{id:'b',title:malicious,url:'https://example.com'}]}]);
 assert.equal(r.items[0].title,malicious);
});
