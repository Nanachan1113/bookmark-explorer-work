// @ts-check
import {loadChromeBookmarks} from './bookmark-source.js';
import {filterBookmarks, sortBookmarks} from './bookmarks.js';
import {loadPreferences, savePreferences, DEFAULT_PREFERENCES} from './preferences.js';
import {renderBookmarks, renderCounts, renderFolderOptions, renderStatus} from './view.js';
/** @typedef {import('./types.js').BookmarkData} BookmarkData */
/** @typedef {import('./types.js').DisplayPreferences} DisplayPreferences */
const search = document.querySelector('#search-input');
const folder = document.querySelector('#folder-filter');
const sort = document.querySelector('#sort-order');
const urlToggle = document.querySelector('#show-url');
const button = document.querySelector('#reload-button');
const settingsStatus = document.querySelector('#settings-status');
if (!(search instanceof HTMLInputElement) || !(folder instanceof HTMLSelectElement) ||
    !(sort instanceof HTMLSelectElement) || !(urlToggle instanceof HTMLInputElement) ||
    !(button instanceof HTMLButtonElement) || !(settingsStatus instanceof HTMLElement)) {
  throw new Error('入力要素または設定状態の要素がありません');
}
// 関数内でも型が明確になるよう、検証後の要素をまとめる。
const ui = {search, folder, sort, urlToggle, button, settingsStatus};
/** @type {BookmarkData} */ let data = {items:[], folders:[]};
/** @type {DisplayPreferences} */ let prefs = {...DEFAULT_PREFERENCES};
let busy = false;
let loadFailed = false;
let settingsBusy = true;
function redraw() {
  const visible = sortBookmarks(filterBookmarks(data.items, ui.search.value, ui.folder.value), prefs.sortOrder);
  renderBookmarks(document, visible, {showUrl:prefs.showUrl});
  renderCounts(document, data.items.length, visible.length, data.folders.length);
  if (!busy && !loadFailed) renderStatus(document, visible.length ? 'success' : 'empty',
    visible.length ? 'Chromeから読み取りました。' : '対象のブックマークがありません。');
}
function settingsControls() {
  ui.sort.disabled = settingsBusy;
  ui.urlToggle.disabled = settingsBusy;
}
async function reload() {
  if (busy) return;
  busy = true; ui.button.disabled = true; loadFailed = false;
  renderStatus(document, 'loading', 'Chromeブックマーク読込中…');
  try {
    if (typeof chrome === 'undefined' || !chrome.bookmarks) throw new Error('Chrome拡張として読み込んでください。');
    data = await loadChromeBookmarks(chrome.bookmarks);
    renderFolderOptions(document, data.folders);
    busy = false;
    redraw();
  } catch (error) {
    data = {items:[], folders:[]}; loadFailed = true;
    renderFolderOptions(document, []); renderBookmarks(document, []); renderCounts(document, 0, 0, 0);
    renderStatus(document, 'error', '取得に失敗しました。' + (error instanceof Error ? error.message : String(error)));
  } finally {busy = false; ui.button.disabled = false;}
}
async function updateSettings() {
  if (settingsBusy) return;
  settingsBusy = true; settingsControls();
  prefs = {sortOrder:ui.sort.value === 'NEWEST' ? 'NEWEST' : 'TITLE', showUrl:ui.urlToggle.checked};
  redraw();
  ui.settingsStatus.textContent = '設定を保存中…';
  try {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) throw new Error('storage権限が利用できません');
    await savePreferences(chrome.storage.local, prefs);
    ui.settingsStatus.textContent = '設定を保存しました。';
  } catch (error) {
    ui.settingsStatus.textContent = '設定の保存に失敗。今回の画面にだけ反映しています。設定を再変更して再試行してください。' +
      (error instanceof Error ? error.message : String(error));
  } finally {settingsBusy = false; settingsControls();}
}
async function initialize() {
  ui.button.disabled = true; settingsControls();
  ui.settingsStatus.textContent = '設定を読込中…';
  try {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) throw new Error('storage権限が利用できません');
    await chrome.storage.local.setAccessLevel({accessLevel:'TRUSTED_CONTEXTS'});
    prefs = await loadPreferences(chrome.storage.local);
    ui.settingsStatus.textContent = '設定を復元しました。';
  } catch (error) {
    ui.settingsStatus.textContent = '設定を読めませんでした。初期値を使います。' +
      (error instanceof Error ? error.message : String(error));
  }
  ui.sort.value = prefs.sortOrder; ui.urlToggle.checked = prefs.showUrl;
  settingsBusy = false; settingsControls();
  await reload();
}
ui.search.addEventListener('input', redraw);
ui.folder.addEventListener('change', redraw);
ui.sort.addEventListener('change', () => {void updateSettings();});
ui.urlToggle.addEventListener('change', () => {void updateSettings();});
ui.button.addEventListener('click', () => {void reload();});
void initialize();



