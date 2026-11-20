// @ts-check
import {flattenBookmarkTree} from './bookmarks.js';
/** @typedef {import('./types.js').BookmarkData} BookmarkData */
/** @typedef {import('./types.js').BookmarkReadApi} BookmarkReadApi */

/**
 * APIを引数で受け取るので、Nodeの単体テストでは偽物を渡せる。
 * 書込みAPIを参照・呼出ししない。
 * @param {BookmarkReadApi} bookmarksApi
 * @returns {Promise<BookmarkData>}

 */
export async function loadChromeBookmarks(bookmarksApi) {
  const tree = await bookmarksApi.getTree();
  if (!Array.isArray(tree)) throw new TypeError('getTreeの戻り値が配列ではありません');
  return flattenBookmarkTree(tree);
}
