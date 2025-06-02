// js/constants.js

/**
 * LocalStorageにメモデータを保存する際のキー名
 * @type {string}
 */
export const STORAGE_KEY_MEMOS = 'notepad_app_memos';

/**
 * LocalStorageに最後にアクティブだったタブのIDを保存する際のキー名 (オプション機能)
 * @type {string}
 */
export const STORAGE_KEY_ACTIVE_TAB = 'notepad_app_active_tab';

/**
 * 新規メモのデフォルトタイトル
 * @type {string}
 */
export const DEFAULT_MEMO_TITLE = '無題のメモ';

// 他にもアプリ全体で共有したい定数があればここに追加
// 例:
// export const MAX_TABS_ALLOWED = 10;
// export const MAX_MEMO_ITEMS = 100;