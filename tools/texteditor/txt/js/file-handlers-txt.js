// tools/textediter/txt/js/file-handlers-txt.js
import { getEditorContentTxt, setEditorContentTxt } from './text-area-handler.js';
import { showMessage } from './ui-utils-txt.js';

export function saveTextFile() {
    try {
        const content = getEditorContentTxt();
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const filename = `text_document_${new Date().toISOString().slice(0,10)}.txt`;

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        showMessage('テキストファイルとして保存しました。', 'success');
    } catch (error) {
        showMessage(`ファイルの保存に失敗しました: ${error.message}`, 'error');
        console.error("Error saving TXT file:", error);
    }
}

export function saveScreenshotTxt(textareaId) {
    const elementToCapture = document.getElementById(textareaId);
    if (!elementToCapture) {
        showMessage('テキストエリア要素が見つかりません。', 'error');
        return;
    }
    if (typeof html2canvas === 'undefined') {
        showMessage('スクリーンショットライブラリ(html2canvas)が読み込まれていません。', 'error');
        return;
    }

    showMessage('スクリーンショットを生成中です...', 'info', 0);

    // テキストエリアの内容をより綺麗に画像化するための工夫
    // 非表示のdivにテキストエリアのスタイルと内容をコピーして画像化する
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px'; // 画面外に配置
    tempDiv.style.top = '-9999px';
    tempDiv.style.width = elementToCapture.offsetWidth + 'px'; // 元のテキストエリアの幅
    tempDiv.style.fontFamily = getComputedStyle(elementToCapture).fontFamily;
    tempDiv.style.fontSize = getComputedStyle(elementToCapture).fontSize;
    tempDiv.style.lineHeight = getComputedStyle(elementToCapture).lineHeight;
    tempDiv.style.padding = getComputedStyle(elementToCapture).padding;
    tempDiv.style.border = '1px solid #ccc'; // 画像に見栄えのための枠線
    tempDiv.style.backgroundColor = '#fff';  // 背景色
    tempDiv.style.whiteSpace = 'pre-wrap';   // 改行とスペースを保持
    tempDiv.style.wordBreak = 'break-all';   // 長い単語でも折り返す
    tempDiv.textContent = elementToCapture.value;
    document.body.appendChild(tempDiv);


    html2canvas(tempDiv, { // テキストエリアではなくtempDivをキャプチャ
        useCORS: true, // 外部フォントなどを使用している場合
        // backgroundColor: null, // tempDivの背景色を使う
        scale: window.devicePixelRatio, // 高解像度ディスプレイ対応
        logging: false // コンソールログを減らす
    }).then(canvas => {
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        const filename = `text_editor_capture_${new Date().toISOString().slice(0,10)}.png`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showMessage('スクリーンショットを保存しました。', 'success');
    }).catch(error => {
        console.error('Screenshot generation failed:', error);
        showMessage(`スクリーンショットの保存に失敗しました: ${error.message}`, 'error');
    }).finally(() => {
        document.body.removeChild(tempDiv); // 必ず一時要素を削除
    });
}


export function loadFileFromInputTxt(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const allowedTypes = ['text/plain', 'text/markdown']; // .mdもテキストとして読み込む
    const allowedExtensions = ['.txt', '.md'];
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    const extensionIsValid = allowedExtensions.some(ext => fileName.endsWith(ext));

    if (allowedTypes.includes(fileType) || extensionIsValid) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                setEditorContentTxt(e.target.result);
                showMessage(`「${file.name}」を読み込みました。`, 'success');
            } catch (error) {
                showMessage(`ファイル内容のセットに失敗しました: ${error.message}`, 'error');
                console.error("Error setting editor content from file:", error);
            }
        };
        reader.onerror = () => {
            showMessage('ファイルの読み込み中にエラーが発生しました。', 'error');
            console.error("FileReader error:", reader.error);
        };
        reader.readAsText(file);
    } else {
        showMessage('非対応のファイル形式です。.txt または .md ファイルを選択してください。', 'warning');
    }
    event.target.value = null;
}