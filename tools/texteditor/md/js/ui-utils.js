// tools/textediter/md/js/ui-utils.js
let messageTimer;

export function showMessage(message, type = 'info', duration = 3000) {
    const messageArea = document.getElementById('message-area');
    if (!messageArea) {
        console.warn('Message area not found. Using alert instead.');
        alert(`[${type.toUpperCase()}] ${message}`);
        return;
    }

    messageArea.textContent = message;
    // クラスを一度リセットしてから、ベースクラスとタイプ別クラスを付与
    messageArea.className = 'message-area'; // ベースクラスを再適用
    messageArea.classList.add(type);      // タイプ別クラスを追加

    messageArea.style.display = 'block';

    clearTimeout(messageTimer);
    if (duration > 0) {
        messageTimer = setTimeout(() => {
            messageArea.style.display = 'none';
        }, duration);
    }
}