// @ts-check
/** @typedef {import('./types.js').BookmarkItem} BookmarkItem */
/** @typedef {import('./types.js').BookmarkNode} BookmarkNode */
/** @typedef {import('./types.js').BookmarkData} BookmarkData */
/** @typedef {import('./types.js').SortOrder} SortOrder */

/** @param {BookmarkItem[]} items @param {string} query @param {string} [folderId] @returns {BookmarkItem[]} */
export function filterBookmarks(items, query, folderId = '') {

  const needle = query.trim().toLocaleLowerCase();
    return items.filter((item) =>
    (!folderId || item.parentFolderId === folderId) &&
    (!needle || item.title.toLocaleLowerCase().includes(needle) || item.url.toLocaleLowerCase().includes(needle))
  );
}
/**
 * 元配列を並べ替えず、新しい配列を返す。
 * @param {BookmarkItem[]} items
 * @param {SortOrder} order
 * @returns {BookmarkItem[]}
 */
export function sortBookmarks(items, order) {
  return [...items].sort((a, b) => {
    if (order === 'NEWEST') return (b.dateAdded ?? 0) - (a.dateAdded ?? 0) || a.id.localeCompare(b.id);
    return a.title.localeCompare(b.title, 'ja') || a.id.localeCompare(b.id);
  });
}

/**
 * Chromeからの木構造を閲覧専用データへ変換する。
 * フォルダ名は表示用。判定にはIDを使う。
 * @param {BookmarkNode[]} tree
 * @returns {BookmarkData}
 */
export function flattenBookmarkTree(tree) {
  /** @type {BookmarkItem[]} */ const items = [];
  /** @type {import('./types.js').FolderOption[]} */ const folders = [];
  /** @param {BookmarkNode[]} nodes @param {string[]} ancestors @param {string} parentId */
  function visit(nodes, ancestors, parentId) {
    for (const node of nodes) {
      if (typeof node.url === 'string') {
        items.push({
          id: node.id, title: node.title, url: node.url,
          parentFolderId: node.parentId ?? parentId,
          folderPath: ancestors.join(' / '),
          dateAdded: typeof node.dateAdded === 'number' ? node.dateAdded : null,
        });
      } else {
        const next = node.title ? [...ancestors, node.title] : ancestors;
        if (node.parentId !== undefined) folders.push({id:node.id, label:next.join(' / ') || '（無名のフォルダ）'});
        visit(node.children ?? [], next, node.id);
      }
    }
  }
  visit(tree, [], '');
  return {items, folders};
}


