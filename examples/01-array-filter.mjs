const bookmarks = [
  {id:'b1', title:'JavaScript入門', url:'https://example.com/js'},
  {id:'b2', title:'Chrome拡張', url:'https://example.com/chrome'},
  {id:'b3', title:'JSDocの使い方', url:'https://example.com/jsdoc'},
];
const keyword = 'js';
const results = bookmarks.filter(item => item.title.toLowerCase().includes(keyword) || item.url.includes(keyword));
console.log(results.map(item=>item.title)); // URLにjsを含む項目と、JSDocのタイトルが一致
