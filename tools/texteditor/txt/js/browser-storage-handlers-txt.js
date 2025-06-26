// tools/textediter/txt/js/browser-storage-handlers-txt.js
import { getEditorContentTxt, setEditorContentTxt } from './text-area-handler.js';
import { showMessage } from './ui-utils-txt.js';

const MANUAL_SAVE_KEY_TXT = 'aki_textEditorManualSave_v1';
const AUTOSAVE_KEY_TXT = 'aki_textEditorAutosave_v1';

// 手動保存用
export function saveContentToBrowserManuallyTxt() {
    try {
        const content = getEditorContentTxt();
        localStorage.setItem(MANUAL_SAVE_KEY_TXT, content);
        showMessage('現在の内容をブラウザに手動保存しました。', 'success');
    } catch (e) {
        // ... (エラー処理はMD版と同様) ...
        console.error("Error saving manually to localStorage (TXT):", e);
        if (e.name === 'QuotaExceededError') {
            showMessage('ブラウザの保存容量上限を超えました。手動保存できませんでした。', 'error');
        } else {
            showMessage(`ブラウザへの手動保存中にエラーが発生しました: ${e.message}`, 'error');
        }
    }
}

// 自動保存用
export function autoSaveContentToBrowserTxt() {
    try {
        const content = getEditorContentTxt();
        if (content === null || content === undefined) {
            return;
        }
        localStorage.setItem(AUTOSAVE_KEY_TXT, content);
        // console.log("Autosaved TXT content to browser.");
    } catch (e) {
        // ... (エラー処理はMD版と同様) ...
        console.error("Error autosaving to localStorage (TXT):", e);
        if (e.name === 'QuotaExceededError') {
            console.warn('ブラウザの保存容量上限を超えました。自動保存できませんでした。');
        }
    }
}

// 呼び出し用
export function loadSavedContentFromBrowserTxt() {
    try {
        let contentToLoad = localStorage.getItem(MANUAL_SAVE_KEY_TXT);
        let sourceType = '手動保存';

        if (contentToLoad === null) {
            contentToLoad = localStorage.getItem(AUTOSAVE_KEY_TXT);
            sourceType = '自動保存 (前回セッションの最終状態)';
        }

        if (contentToLoad !== null) {
            setEditorContentTxt(contentToLoad);
            showMessage(`${sourceType}された内容を復元しました。`, 'success');
        } else {
            showMessage('ブラウザに保存されたデータ (手動/自動) はありません。', 'info');
        }
    } catch (e) {
        // ... (エラー処理はMD版と同様) ...
        console.error("Error loading from localStorage (TXT):", e);
        showMessage(`ブラウザからの読み込み中にエラーが発生しました: ${e.message}`, 'error');
    }
}