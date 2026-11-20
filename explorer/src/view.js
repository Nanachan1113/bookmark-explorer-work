// @ts-check
/** @typedef {import('./types.js').BookmarkItem} BookmarkItem */
/** @typedef {import('./types.js').FolderOption} FolderOption */
/**
 * タイトル・URLは不特定な入力。innerHTMLへ連結せずtextContentで表示する。
 * @param {Document} document
 * @param {BookmarkItem[]} items
 * @param {{showUrl?:boolean}} [options]
 */
export function renderBookmarks(document, items, options = {}) {
  const list = document.querySelector('#bookmark-list');
  if (!(list instanceof HTMLElement)) throw new Error('一覧要素がありません');
  list.replaceChildren();
  for (const item of items) {
    const li = document.createElement('li');
    const title = document.createElement('p');
    title.className = 'item-title';
    title.textContent = item.title || '（名前なし）';
    const folder = document.createElement('p');
    folder.className = 'item-folder';
    folder.textContent = item.folderPath || '（ルート）';
    li.append(title, folder);
    if (options.showUrl !== false) {
      const url = document.createElement('p');
      url.className = 'item-url';
      url.textContent = item.url;
      li.append(url);
    }
    list.append(li);
  }
}
/** @param {Document} document @param {'loading'|'success'|'empty'|'error'} state @param {string} message */
export function renderStatus(document, state, message) {
  const status = document.querySelector('#status');
  if (!(status instanceof HTMLElement)) throw new Error('状態表示要素がありません');
  status.dataset.state = state;
  status.textContent = message;
}
/** @param {Document} document @param {number} total @param {number} visible @param {number} folders */
export function renderCounts(document, total, visible, folders) {
  /** @type {Array<[string,number]>} */
  const metrics = [['#total-count',total],['#visible-count',visible],['#folder-count',folders]];
  for (const [id, count] of metrics) {
    const node = document.querySelector(id);
    if (!node) throw new Error('件数表示要素がありません: '+id);
    node.textContent = String(count);
  }
}
/** @param {Document} document @param {FolderOption[]} folders */
export function renderFolderOptions(document, folders) {
  const select = document.querySelector('#folder-filter');
  if (!(select instanceof HTMLSelectElement)) throw new Error('フォルダ選択要素がありません');
  const current = select.value;
  select.replaceChildren();
  const all = document.createElement('option');
  all.value = '';
  all.textContent = 'すべてのフォルダ';
  select.append(all);
  for (const folder of [...folders].sort((a,b)=>a.label.localeCompare(b.label,'ja'))) {
    const option = document.createElement('option');
    option.value = folder.id;
    option.textContent = folder.label;
    select.append(option);
  }
  select.value = folders.some(f=>f.id===current) ? current : '';
}
