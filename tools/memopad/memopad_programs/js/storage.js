// js/storage.js

import { STORAGE_KEY_MEMOS, STORAGE_KEY_ACTIVE_TAB } from './constants.js';

/**
 * LocalStorageから全てのメモデータを読み込みます。
 * @returns {object} メモIDをキー、メモオブジェクトを値とするオブジェクト。データがなければ空のオブジェクト。
 */
export function loadAllMemosFromStorage() {
    try {
        const memosJSON = localStorage.getItem(STORAGE_KEY_MEMOS);
        return memosJSON ? JSON.parse(memosJSON) : {};
    } catch (error) {
        console.error('Failed to load memos from localStorage:', error);
        return {}; // エラー時は空のデータを返す
    }
}

/**
 * 全てのメモデータをLocalStorageに保存します。
 * @param {object} memos 保存するメモデータオブジェクト。
 */
export function saveAllMemosToStorage(memos) {
    try {
        localStorage.setItem(STORAGE_KEY_MEMOS, JSON.stringify(memos));
    } catch (error) {
        console.error('Failed to save memos to localStorage:', error);
        // ここでユーザーに通知するなどのフォールバック処理も検討できる
    }
}

/**
 * 特定のメモデータを保存（または更新）します。
 * @param {string} memoId 保存するメモのID
 * @param {object} memoData 保存するメモのデータ (title, items, lastModifiedなど)
 */
export function saveMemoToStorage(memoId, memoData) {
    const allMemos = loadAllMemosFromStorage();
    allMemos[memoId] = memoData;
    saveAllMemosToStorage(allMemos);
}

/**
 * 特定のメモIDのデータをLocalStorageから削除します。
 * @param {string} memoId 削除するメモのID。
 */
export function deleteMemoFromStorage(memoId) {
    const allMemos = loadAllMemosFromStorage();
    if (allMemos[memoId]) {
        delete allMemos[memoId];
        saveAllMemosToStorage(allMemos);
        console.log(`Memo with id ${memoId} deleted from storage.`);
        return true;
    }
    console.warn(`Memo with id ${memoId} not found in storage for deletion.`);
    return false;
}

/**
 * 最後にアクティブだったタブのIDをLocalStorageから読み込みます。(オプション機能)
 * @returns {string | null} アクティブだったタブのID、またはなければnull。
 */
export function loadActiveTabIdFromStorage() {
    try {
        return localStorage.getItem(STORAGE_KEY_ACTIVE_TAB);
    } catch (error) {
        console.error('Failed to load active tab ID from localStorage:', error);
        return null;
    }
}

/**
 * アクティブなタブのIDをLocalStorageに保存します。(オプション機能)
 * @param {string} tabId 保存するアクティブなタブのID。
 */
export function saveActiveTabIdToStorage(tabId) {
    try {
        localStorage.setItem(STORAGE_KEY_ACTIVE_TAB, tabId);
    } catch (error) {
        console.error('Failed to save active tab ID to localStorage:', error);
    }
}

// 必要に応じて、ストレージ全体をクリアする関数なども追加できます。
// export function clearAllStorage() {
//     localStorage.removeItem(STORAGE_KEY_MEMOS);
//     localStorage.removeItem(STORAGE_KEY_ACTIVE_TAB);
//     console.log('All memo app storage cleared.');
// }