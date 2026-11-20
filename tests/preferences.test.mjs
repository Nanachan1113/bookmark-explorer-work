import {test} from 'node:test';
import assert from 'node:assert/strict';
import {loadPreferences,savePreferences} from '../explorer/src/preferences.js';
function fakeStorage(value){
 let state=value;
 return {get:async()=>({displayPreferences:state}),set:async(data)=>{state=data.displayPreferences;},current:()=>state};
}
test('初期値: TITLE / URL表示=true',async()=>assert.deepEqual(await loadPreferences(fakeStorage(undefined)),{sortOrder:'TITLE',showUrl:true}));
test('不正な設定を安全な初期値へ正規化',async()=>assert.deepEqual(await loadPreferences(fakeStorage({sortOrder:'bad',showUrl:'yes'})),{sortOrder:'TITLE',showUrl:true}));
test('設定の保存と再読込',async()=>{
 const storage=fakeStorage(undefined);await savePreferences(storage,{sortOrder:'NEWEST',showUrl:false});
 assert.deepEqual(await loadPreferences(storage),{sortOrder:'NEWEST',showUrl:false});
});
test('不正な設定は保存前に拒否',async()=>{
 const storage=fakeStorage(undefined);
 await assert.rejects(savePreferences(storage,{sortOrder:'BAD',showUrl:false}),/不正/);
 assert.equal(storage.current(),undefined);
});
test('保存エラーを呼び出し元へ伝える',async()=>{
 await assert.rejects(savePreferences({get:async()=>({}),set:async()=>{throw new Error('no space')}},{sortOrder:'TITLE',showUrl:true}),/no space/);
});

test('null・配列の設定は初期値へ戻す',async()=>{
 for(const value of [null,[],42,'bad'])assert.deepEqual(await loadPreferences(fakeStorage(value)),{sortOrder:'TITLE',showUrl:true});
});
test('設定の読込失敗を空の設定へ偽装しない',async()=>{
 await assert.rejects(loadPreferences({get:async()=>{throw new Error('denied');},set:async()=>{}}),/denied/);
});
