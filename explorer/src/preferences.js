// @ts-check
/** @typedef {import('./types.js').DisplayPreferences} DisplayPreferences */
/** @typedef {import('./types.js').StorageArea} StorageArea */
/** @type {DisplayPreferences} */
export const DEFAULT_PREFERENCES = {sortOrder: 'TITLE', showUrl: true};
/** @param {StorageArea} storageArea @returns {Promise<DisplayPreferences>} */
export async function loadPreferences(storageArea) {
  const saved = await storageArea.get('displayPreferences');
  const raw = saved.displayPreferences;
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return {...DEFAULT_PREFERENCES};
  const values = /** @type {Record<string,unknown>} */ (raw);
  const sortOrder = values.sortOrder === 'NEWEST' ? 'NEWEST' : 'TITLE';
  const showUrl = typeof values.showUrl === 'boolean' ? values.showUrl : true;
  return {sortOrder, showUrl};
}
/** @param {StorageArea} storageArea @param {DisplayPreferences} prefs @returns {Promise<void>} */
export async function savePreferences(storageArea, prefs) {
  if (!['TITLE','NEWEST'].includes(prefs.sortOrder) || typeof prefs.showUrl !== 'boolean') throw new TypeError('表示設定が不正です');
  await storageArea.set({displayPreferences: {...prefs}});
}
