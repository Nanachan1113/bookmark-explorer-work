/**
 * @typedef {object} BookmarkItem
 * @property {string} id Chromeブックマークの識別子。URLでは代用しない。
 * @property {string} title ユーザーがChromeに保存した名前。
 * @property {string} url 登録済みのURL。外部へ送らない。
 * @property {string} parentFolderId 直上のChromeフォルダID。
 * @property {string} folderPath 表示用パス（照合キーではない）。
 * @property {number|null} dateAdded 追加日時（Unixミリ秒）。無い場合はnull。
 */
/** @typedef {{id:string, label:string}} FolderOption */
/** @typedef {'TITLE'|'NEWEST'} SortOrder */
/** @typedef {{sortOrder:SortOrder, showUrl:boolean}} DisplayPreferences */
/** @typedef {{items:BookmarkItem[],folders:FolderOption[]}} BookmarkData */
/**
 * 教材で使うChrome BookmarkTreeNodeの一部だけ。MarkNestの公式の型ではない。
 * @typedef {object} BookmarkNode
 * @property {string} id
 * @property {string} title
 * @property {string} [parentId]
 * @property {string} [url]
 * @property {number} [dateAdded]
 * @property {BookmarkNode[]} [children]
 */
/** @typedef {{getTree():Promise<BookmarkNode[]>}} BookmarkReadApi */
/** @typedef {{get(key:string):Promise<Record<string,unknown>>,set(data:Record<string,unknown>):Promise<void>}} StorageArea */
export {};
