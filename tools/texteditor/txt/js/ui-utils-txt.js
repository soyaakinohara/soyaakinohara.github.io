// tools/textediter/txt/js/ui-utils-txt.js
let messageTimer;

export function showMessage(message, type = 'info', duration = 3000) {
    const messageArea = document.getElementById('message-area');
    if (!messageArea) {
        console.warn('Message area not found. Using alert instead.');
        alert(`[${type.toUpperCase()}] ${message}`);
        return;
    }

    messageArea.textContent = message;
    messageArea.className = 'message-area';
    messageArea.classList.add(type);
    messageArea.style.display = 'block';

    clearTimeout(messageTimer);
    if (duration > 0) {
        messageTimer = setTimeout(() => {
            messageArea.style.display = 'none';
        }, duration);
    }
}