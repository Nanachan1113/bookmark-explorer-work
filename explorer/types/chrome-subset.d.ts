/** 教材専用の最小宣言。公式API全体の代替ではない。 */
declare const chrome: {
  bookmarks: import('../src/types.js').BookmarkReadApi;
  storage: {local: import('../explorer/src/types.js').StorageArea & {
    setAccessLevel(options:{accessLevel:'TRUSTED_CONTEXTS'}):Promise<void>;
  }};
};