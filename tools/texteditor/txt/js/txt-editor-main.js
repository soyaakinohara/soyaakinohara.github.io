// tools/textediter/txt/js/txt-editor-main.js
import { initializeTextArea } from './text-area-handler.js';
import { saveTextFile, saveScreenshotTxt, loadFileFromInputTxt } from './file-handlers-txt.js';
import { saveContentToBrowserManuallyTxt, loadSavedContentFromBrowserTxt } from './browser-storage-handlers-txt.js';
import { showMessage } from './ui-utils-txt.js';

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const editorType = params.get('type');

    if (editorType !== 'txt') {
        showMessage('エラー: テキストエディタではありません。', 'error', 0);
        document.body.innerHTML = '<p style="color:red; text-align:center; padding-top: 50px;">起動エラーが発生しました。ゲートページから再度アクセスしてください。</p>';
        return;
    }

    const textArea = initializeTextArea('text-editor-textarea');

    if (!textArea) {
        showMessage('エディタのテキストエリアが見つかりません。', 'error', 0);
        document.body.innerHTML = '<p style="color:red; text-align:center; padding-top: 50px;">テキストエリアの初期化に失敗しました。</p>';
        return;
    }

    // --- イベントリスナー設定 ---
    const saveTxtButton = document.getElementById('save-txt-button');
    if (saveTxtButton) {
        saveTxtButton.addEventListener('click', saveTextFile);
    }

    const saveScreenshotButton = document.getElementById('save-screenshot-button-txt');
    if (saveScreenshotButton) {
        saveScreenshotButton.addEventListener('click', () => saveScreenshotTxt('text-editor-textarea'));
    }

    const loadFileInput = document.getElementById('load-file-input-txt');
    if (loadFileInput) {
        loadFileInput.addEventListener('change', loadFileFromInputTxt);
    }

    const saveBrowserButton = document.getElementById('save-browser-button-txt');
    if (saveBrowserButton) {
        saveBrowserButton.addEventListener('click', saveContentToBrowserManuallyTxt);
    }

    const loadBrowserButton = document.getElementById('load-browser-button-txt');
    if (loadBrowserButton) {
        loadBrowserButton.addEventListener('click', loadSavedContentFromBrowserTxt);
    }

    showMessage('テキストエディタが起動しました。', 'info');
});