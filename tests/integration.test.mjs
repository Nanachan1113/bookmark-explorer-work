import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderBookmarks, renderCounts, renderFolderOptions, renderStatus} from '../explorer/src/view.js';
class Element {
  constructor(tag='div') {
    this.tagName=tag.toUpperCase(); this.children=[]; this.value=''; this.checked=false;
    this.disabled=false; this.dataset={}; this.className=''; this.textContent=''; this.listeners=new Map();
  }
  addEventListener(type,handler){this.listeners.set(type,handler);}
  dispatch(type){if(!this.disabled)this.listeners.get(type)?.({type,target:this});}
  replaceChildren(...nodes){this.children=[...nodes];}
  append(...nodes){this.children.push(...nodes);}
}
class Input extends Element {}
class Select extends Element {}
class Button extends Element {}
const fixture=JSON.parse(readFileSync(new URL('../examples/05-bookmark-tree.json',import.meta.url),'utf8'));
function environment(options={}) {
  globalThis.HTMLElement=Element; globalThis.HTMLInputElement=Input;
  globalThis.HTMLSelectElement=Select; globalThis.HTMLButtonElement=Button;
  const nodes=new Map([
    ['#search-input',new Input('input')],['#folder-filter',new Select('select')],
    ['#sort-order',new Select('select')],['#show-url',new Input('input')],
    ['#reload-button',new Button('button')],['#bookmark-list',new Element('ul')],
    ['#status',new Element('p')],['#settings-status',new Element('p')],
    ['#total-count',new Element('b')],['#visible-count',new Element('b')],['#folder-count',new Element('b')]
  ]);
  let stored=options.saved; let calls=0; let writes=0; let access;
  const document={querySelector:sel=>nodes.get(sel)??null,createElement:tag=>new Element(tag)};
  globalThis.document=document;
  globalThis.chrome={bookmarks:{getTree:async()=>{
    calls++; if(options.treeGate)await options.treeGate;
    if(options.failTree)throw new Error('Chrome denied');
    return options.tree??fixture;
  }},storage:{local:{
    setAccessLevel:async value=>{access=value;},
    get:async()=>{if(options.getGate)await options.getGate;if(options.failGet)throw new Error('get denied');return {displayPreferences:stored};},
    set:async value=>{writes++;if(options.setGate)await options.setGate;if(options.failSet)throw new Error('no space');stored=value.displayPreferences;}
  }}};
  if(options.missing)nodes.delete(options.missing);
  return {nodes,document,get calls(){return calls;},get stored(){return stored;},get writes(){return writes;},get access(){return access;}};
}
let instance=0;
const flush=async()=>{for(let i=0;i<8;i++)await new Promise(resolve=>setImmediate(resolve));};
async function start(options){const env=environment(options);await import('../explorer/src/main.js?case='+ ++instance);await flush();return env;}
const node=(env,id)=>env.nodes.get('#'+id);
function change(env,id,value,event='change'){
  const n=node(env,id);if(typeof value==='boolean')n.checked=value;else n.value=value;n.dispatch(event);
}
test('一覧・検索・直下絞り込み・設定保存がつながる',async()=>{
  const env=await start();assert.equal(env.calls,1);assert.equal(node(env,'bookmark-list').children.length,2);
  assert.equal(node(env,'status').dataset.state,'success');
  change(env,'search-input','JavaScript','input');assert.equal(node(env,'visible-count').textContent,'1');
  change(env,'search-input','','input');change(env,'folder-filter','1');assert.equal(node(env,'visible-count').textContent,'0');
  change(env,'folder-filter','a');assert.equal(node(env,'visible-count').textContent,'2');
  change(env,'show-url',false);await flush();assert.equal(env.stored.showUrl,false);
  assert.equal(node(env,'bookmark-list').children[0].children.length,2);
  change(env,'sort-order','NEWEST');await flush();assert.equal(env.stored.sortOrder,'NEWEST');
  assert.equal(node(env,'bookmark-list').children[0].children[0].textContent,'もう一つの保存');
  assert.deepEqual(env.access,{accessLevel:'TRUSTED_CONTEXTS'});
});
test('取得失敗は検索後もエラーとして残る',async()=>{
  const env=await start({failTree:true});change(env,'search-input','x','input');
  assert.equal(node(env,'status').dataset.state,'error');assert.match(node(env,'status').textContent,/取得に失敗/);
  assert.equal(node(env,'bookmark-list').children.length,0);assert.equal(node(env,'reload-button').disabled,false);
});
test('空データは失敗ではなくempty',async()=>{
  const env=await start({tree:[]});assert.equal(node(env,'status').dataset.state,'empty');
});
test('保存設定は次のPopupで復元する',async()=>{
  const env=await start({saved:{sortOrder:'NEWEST',showUrl:false}});
  assert.equal(node(env,'sort-order').value,'NEWEST');assert.equal(node(env,'show-url').checked,false);
  assert.equal(node(env,'bookmark-list').children[0].children.length,2);
});
test('設定取得失敗でもブックマーク取得を続け、警告を残す',async()=>{
  const env=await start({failGet:true});assert.equal(env.calls,1);
  change(env,'search-input','x','input');assert.match(node(env,'settings-status').textContent,/設定を読めません/);
});
test('設定保存失敗は再描画で消えない',async()=>{
  const env=await start({failSet:true});change(env,'show-url',false);await flush();
  change(env,'search-input','x','input');assert.match(node(env,'settings-status').textContent,/保存に失敗/);
  assert.equal(node(env,'sort-order').disabled,false);assert.equal(env.stored,undefined);
});
test('取得中の再読み込みは重複しない',async()=>{
  let release;const gate=new Promise(resolve=>{release=resolve;});const env=await start({treeGate:gate});
  assert.equal(node(env,'status').dataset.state,'loading');node(env,'reload-button').dispatch('click');
  assert.equal(env.calls,1);release();await flush();assert.equal(node(env,'status').dataset.state,'success');
});
test('設定復元中は操作を止め、復元後に取得する',async()=>{
  let release;const gate=new Promise(resolve=>{release=resolve;});const env=await start({getGate:gate});
  assert.equal(env.calls,0);assert.equal(node(env,'sort-order').disabled,true);
  assert.equal(node(env,'reload-button').disabled,true);release();await flush();assert.equal(env.calls,1);
});
test('保存中は次の設定変更を止める',async()=>{
  let release;const gate=new Promise(resolve=>{release=resolve;});const env=await start({setGate:gate});
  change(env,'show-url',false);assert.equal(node(env,'sort-order').disabled,true);
  node(env,'sort-order').dispatch('change');assert.equal(env.writes,1);
  release();await flush();assert.equal(node(env,'sort-order').disabled,false);
});
test('必須の入力要素がないと起動時に知らせる',async()=>{
  environment({missing:'#search-input'});
  await assert.rejects(import('../explorer/src/main.js?missing='+ ++instance),/入力要素/);
});
test('文字列のタグを要素として作らない',()=>{
  const env=environment();const title='<img src=x onerror=alert(1)>';
  renderBookmarks(env.document,[{id:'x',title,url:'javascript:alert(1)',parentFolderId:'a',folderPath:'<b>folder</b>',dateAdded:null}]);
  const item=node(env,'bookmark-list').children[0];
  assert.deepEqual(item.children.map(x=>x.tagName),['P','P','P']);
  assert.equal(item.children[0].textContent,title);assert.equal(item.children[2].textContent,'javascript:alert(1)');
});
test('描画先が欠けている場合に黙って続けない',()=>{
  const env=environment();env.nodes.clear();
  assert.throws(()=>renderBookmarks(env.document,[]),/一覧/);
  assert.throws(()=>renderStatus(env.document,'empty','空'),/状態/);
  assert.throws(()=>renderCounts(env.document,0,0,0),/件数/);
  assert.throws(()=>renderFolderOptions(env.document,[]),/フォルダ/);
});
