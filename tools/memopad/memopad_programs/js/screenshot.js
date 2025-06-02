// js/screenshot.js

import { sanitizeHTML } from './utils.js'; // ファイル名サニタイズ用にインポート

/**
 * 指定されたHTML要素のスクリーンショットを取得し、画像としてダウンロードさせます。
 * @param {HTMLElement} element スクリーンショットを取得するHTML要素
 * @param {string} baseFileName ダウンロード時のベースとなるファイル名 (拡張子なし)
 */
export function captureAndDownloadScreenshot(element, baseFileName = 'memo-screenshot') {
    if (typeof html2canvas !== 'function') {
        console.error('html2canvas is not loaded!');
        alert('スクリーンショット機能の準備ができていません。(html2canvasライブラリの読み込みエラー)');
        return;
    }
    if (!element) {
        console.error('Element to capture is not provided.');
        alert('スクリーンショット対象の要素が見つかりません。');
        return;
    }

    // html2canvasのオプション (必要に応じて調整)
    const options = {
        allowTaint: true, // 外部ドメインの画像を許可 (CORS設定が必要な場合あり)
        useCORS: true,    // CORSを使用して外部ドメインの画像を読み込む
        scrollY: -window.scrollY, // ページ全体のスクロールを考慮
        windowWidth: element.scrollWidth, // 要素の実際の幅を使用
        windowHeight: element.scrollHeight, // 要素の実際の高さを使用
        backgroundColor: '#ffffff', // 背景色を白に指定 (透明な場合など)
        scale: window.devicePixelRatio > 1 ? 2 : 1, // 高解像度ディスプレイ対応 (2倍スケール)
    };

    html2canvas(element, options).then(canvas => {
        const link = document.createElement('a');
        // ファイル名に使えない文字をハイフンに置換
        const safeFileName = sanitizeHTML(baseFileName).replace(/[/\\?%*:|"<>]/g, '-') || 'untitled-memo';
        link.download = `${safeFileName}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        console.log(`Screenshot downloaded: ${link.download}`);
    }).catch(err => {
        console.error("Error taking screenshot with html2canvas:", err);
        alert("スクリーンショットの作成中にエラーが発生しました。");
    });
}