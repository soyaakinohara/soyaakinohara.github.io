// tools/textediter/md/js/browser-storage-handlers.js
import { getEditorContent, setEditorContent } from './easymde-config.js';
import { showMessage } from './ui-utils.js';

const MANUAL_SAVE_KEY = 'aki_markdownEditorManualSave_v1'; // 手動保存用キー
const AUTOSAVE_KEY = 'aki_markdownEditorAutosave_v1';     // 自動保存用キー

// 手動保存用
export function saveContentToBrowserManually() {
    try {
        const content = getEditorContent();
        localStorage.setItem(MANUAL_SAVE_KEY, content);
        showMessage('現在の内容をブラウザに手動保存しました。', 'success');
    } catch (e) {
        console.error("Error saving manually to localStorage:", e);
        if (e.name === 'QuotaExceededError') {
            showMessage('ブラウザの保存容量上限を超えました。手動保存できませんでした。', 'error');
        } else {
            showMessage(`ブラウザへの手動保存中にエラーが発生しました: ${e.message}`, 'error');
        }
    }
}

// 自動保存用 (通知なし)
export function autoSaveContentToBrowser() {
    try {
        const content = getEditorContent();
        if (content === null || content === undefined) {
            return;
        }
        localStorage.setItem(AUTOSAVE_KEY, content);
        // console.log("Autosaved content to browser."); // デバッグ用
    } catch (e) {
        console.error("Error autosaving to localStorage:", e);
        if (e.name === 'QuotaExceededError') {
            console.warn('ブラウザの保存容量上限を超えました。自動保存できませんでした。');
        }
    }
}

// 呼び出し用 (手動保存を優先し、なければ自動保存を試みる)
export function loadSavedContentFromBrowser() {
    try {
        let contentToLoad = localStorage.getItem(MANUAL_SAVE_KEY);
        let sourceType = '手動保存';

        if (contentToLoad === null) {
            contentToLoad = localStorage.getItem(AUTOSAVE_KEY);
            sourceType = '自動保存 (前回セッションの最終状態)';
        }

        if (contentToLoad !== null) {
            setEditorContent(contentToLoad);
            showMessage(`${sourceType}された内容を復元しました。`, 'success');
        } else {
            showMessage('ブラウザに保存されたデータ (手動/自動) はありません。', 'info');
        }
    } catch (e) {
        console.error("Error loading from localStorage:", e);
        showMessage(`ブラウザからの読み込み中にエラーが発生しました: ${e.message}`, 'error');
    }
}