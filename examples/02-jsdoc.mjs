// @ts-check
/** @typedef {{id:string,title:string,url:string}} BookmarkItem */
/** @param {BookmarkItem[]} items @param {string} keyword @returns {BookmarkItem[]} */
export function findBookmarks(items,keyword){
 const text=keyword.trim().toLowerCase();
 return items.filter(item=>item.title.toLowerCase().includes(text));
}
const result=findBookmarks([{id:'a',title:'Chrome入門',url:'https://example.com'}],'chrome');
console.log(result.length); // 1
