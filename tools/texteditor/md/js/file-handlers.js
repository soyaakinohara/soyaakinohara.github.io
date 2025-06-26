// tools/textediter/md/js/file-handlers.js
import { getEditorContent, setEditorContent } from './easymde-config.js';
import { showMessage } from './ui-utils.js';

export function saveMarkdownFile() {
    try {
        const content = getEditorContent();
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        const filename = `markdown_document_${new Date().toISOString().slice(0,10)}.md`;

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        showMessage('Markdownファイルとして保存しました。', 'success');
    } catch (error) {
        showMessage(`ファイルの保存に失敗しました: ${error.message}`, 'error');
        console.error("Error saving MD file:", error);
    }
}

export function saveScreenshot(previewAreaId) {
    const elementToCapture = document.getElementById(previewAreaId);
    if (!elementToCapture) {
        showMessage('プレビュー要素が見つかりません。', 'error');
        return;
    }
    if (typeof html2canvas === 'undefined') {
        showMessage('スクリーンショットライブラリ(html2canvas)が読み込まれていません。', 'error');
        return;
    }

    showMessage('スクリーンショットを生成中です...', 'info', 0); // 処理中メッセージ

    html2canvas(elementToCapture, {
        useCORS: true,
        backgroundColor: '#fdfdfd', // プレビューエリアの背景色に合わせる
        onclone: (clonedDoc) => {
            // クローンされたDOMに対して何か操作が必要な場合 (例: スクロールバーを一時的に非表示など)
            // clonedDoc.getElementById(previewAreaId).style.overflow = 'visible';
            // clonedDoc.getElementById(previewAreaId).style.height = 'auto';
        }
    }).then(canvas => {
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        const filename = `markdown_preview_${new Date().toISOString().slice(0,10)}.png`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showMessage('スクリーンショットを保存しました。', 'success');
    }).catch(error => {
        console.error('Screenshot generation failed:', error);
        showMessage(`スクリーンショットの保存に失敗しました: ${error.message}`, 'error');
    });
}

export function loadFileFromInput(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    // 対応するファイルタイプをチェック
    const allowedTypes = ['text/markdown', 'text/plain'];
    const allowedExtensions = ['.md', '.txt'];
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    const extensionIsValid = allowedExtensions.some(ext => fileName.endsWith(ext));

    if (allowedTypes.includes(fileType) || extensionIsValid) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                setEditorContent(e.target.result);
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
        showMessage('非対応のファイル形式です。.md または .txt ファイルを選択してください。', 'warning');
    }
    event.target.value = null; // 同じファイルを再度選択できるようにするため
}