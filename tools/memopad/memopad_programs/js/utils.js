// js/utils.js

/**
 * ユニークなIDを生成します。
 * (簡易的なもので、完全に衝突しない保証はありませんが、この用途では十分でしょう)
 * @returns {string} 生成されたユニークID
 */
export function generateUniqueId() {
    return 'memo-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

/**
 * HTML文字列をエスケープ（サニタイズ）します。
 * innerHTMLに設定する前に、ユーザー入力由来の文字列に対して使用することを推奨します。
 * @param {string} str サニタイズする文字列
 * @returns {string} サニタイズされたHTML文字列
 */
export function sanitizeHTML(str) {
    if (typeof str !== 'string') return '';
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
    // より堅牢なサニタイズが必要な場合は、DOMPurifyなどのライブラリを検討してください。
}

/**
 * 指定されたミリ秒だけ処理を遅延させる Promise を返します。
 * @param {number} ms 遅延させる時間 (ミリ秒)
 * @returns {Promise<void>}
 */
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 他にも汎用的なヘルパー関数があればここに追加