// tools/textediter/md/js/md-editor-main.js
import { initializeEasyMDE } from './easymde-config.js'; // setEditorContent は不要に
import { saveMarkdownFile, saveScreenshot, loadFileFromInput } from './file-handlers.js';
// インポートする関数名を変更
import { saveContentToBrowserManually, loadSavedContentFromBrowser } from './browser-storage-handlers.js';
import { showMessage } from './ui-utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const editorType = params.get('type');

    if (editorType !== 'md') {
        showMessage('エラー: Markdownエディタではありません。', 'error', 0);
        document.body.innerHTML = '<p style="color:red; text-align:center; padding-top: 50px;">起動エラーが発生しました。ゲートページから再度アクセスしてください。</p>';
        return;
    }

    const easyMDE = initializeEasyMDE('markdown-editor-textarea', 'markdown-preview-area');

    if (!easyMDE) {
        document.body.innerHTML = '<p style="color:red; text-align:center; padding-top: 50px;">エディタの初期化に失敗しました。ページをリロードするか、開発者コンソールを確認してください。</p>';
        return;
    }

    // --- イベントリスナー設定 ---
    const saveMdButton = document.getElementById('save-md-button');
    if (saveMdButton) {
        saveMdButton.addEventListener('click', saveMarkdownFile);
    } else {
        console.warn("Save MD button not found");
    }

    const saveScreenshotButton = document.getElementById('save-screenshot-button');
    if (saveScreenshotButton) {
        saveScreenshotButton.addEventListener('click', () => saveScreenshot('markdown-preview-area'));
    } else {
        console.warn("Save Screenshot button not found");
    }

    const loadFileInput = document.getElementById('load-file-input');
    if (loadFileInput) {
        loadFileInput.addEventListener('change', loadFileFromInput);
    } else {
        console.warn("Load File input not found");
    }

    // 「ブラウザに保存」ボタンは手動保存関数を呼び出す
    const saveBrowserButton = document.getElementById('save-browser-button');
    if (saveBrowserButton) {
        saveBrowserButton.addEventListener('click', saveContentToBrowserManually);
    } else {
        console.warn("Save to Browser button not found");
    }

    // 「保存呼び出し」ボタンは統合された呼び出し関数を呼び出す
    const loadBrowserButton = document.getElementById('load-browser-button');
    if (loadBrowserButton) {
        loadBrowserButton.addEventListener('click', loadSavedContentFromBrowser);
        loadBrowserButton.title = "ブラウザに保存された内容を呼び出します (手動保存優先、最大1件)"; // title属性を更新
    } else {
        console.warn("Load from Browser button not found");
    }

    // 初期メッセージ
    showMessage('Markdownエディタが起動しました。', 'info');
});