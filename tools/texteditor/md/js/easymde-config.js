// tools/textediter/md/js/easymde-config.js
import { showMessage } from './ui-utils.js';
import { autoSaveContentToBrowser } from './browser-storage-handlers.js'; // インポート

let easyMDEInstance;
let previewElement;
let autoSaveTimer = null;
const AUTOSAVE_DELAY = 1500; // 1.5秒

export function initializeEasyMDE(textareaId, previewAreaId) {
    const textarea = document.getElementById(textareaId);
    previewElement = document.getElementById(previewAreaId);

    if (!textarea) {
        showMessage(`Error: Textarea with ID '${textareaId}' not found.`, 'error', 0);
        return null;
    }
    if (!previewElement) {
        showMessage(`Error: Preview area with ID '${previewAreaId}' not found.`, 'error', 0);
        return null;
    }

    try {
        easyMDEInstance = new EasyMDE({
            element: textarea,
            spellChecker: false,
            placeholder: "ここにMarkdownを入力してください...",
            status: ["lines", "words"],
            toolbar: [
                "heading", "bold", "italic", "strikethrough", "|",
                "quote", "code", "unordered-list", "ordered-list", "horizontal-rule", "|",
                "link", "image", "table", "|",
                "fullscreen", "undo", "redo", "|",
                "guide"
            ],
            autosave: {
                enabled: false, // EasyMDE標準の自動保存は使いません
            },
        });

        easyMDEInstance.codemirror.on("change", () => {
            updatePreview();
            // 自動保存処理 (debounce)
            clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(() => {
                autoSaveContentToBrowser();
            }, AUTOSAVE_DELAY);
        });
        updatePreview(); // 初期表示用

    } catch (error) {
        showMessage(`EasyMDEの初期化に失敗しました: ${error.message}`, 'error', 0);
        console.error("EasyMDE initialization failed:", error);
        return null;
    }

    return easyMDEInstance;
}

function updatePreview() {
    if (easyMDEInstance && previewElement && typeof easyMDEInstance.markdown === 'function') {
        const markdownText = easyMDEInstance.value();
        previewElement.innerHTML = easyMDEInstance.markdown(markdownText);
    }
}

export function getEditorContent() {
    return easyMDEInstance ? easyMDEInstance.value() : "";
}

export function setEditorContent(content) {
    if (easyMDEInstance) {
        easyMDEInstance.value(content);
        updatePreview(); // 値設定後もプレビュー更新
    }
}