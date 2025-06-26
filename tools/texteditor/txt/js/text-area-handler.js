// tools/textediter/txt/js/text-area-handler.js
import { autoSaveContentToBrowserTxt } from './browser-storage-handlers-txt.js';

let textAreaElement;
let autoSaveTimer = null;
const AUTOSAVE_DELAY_TXT = 1500; // 自動保存の遅延時間 (ミリ秒)

export function initializeTextArea(textareaId) {
    textAreaElement = document.getElementById(textareaId);
    if (!textAreaElement) {
        console.error(`Error: Textarea with ID '${textareaId}' not found.`);
        return null;
    }

    // 入力変更時に自動保存をトリガー
    textAreaElement.addEventListener('input', () => {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(() => {
            autoSaveContentToBrowserTxt();
        }, AUTOSAVE_DELAY_TXT);
    });

    return textAreaElement;
}

export function getEditorContentTxt() {
    return textAreaElement ? textAreaElement.value : "";
}

export function setEditorContentTxt(content) {
    if (textAreaElement) {
        textAreaElement.value = content;
    }
}