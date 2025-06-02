// js/memoManager.js

import { DEFAULT_MEMO_TITLE } from './constants.js';
import { sanitizeHTML } from './utils.js';

/**
 * メモの内容を特定のDOMコンテナにレンダリング（描画）します。
 * この関数は主に初回描画やアイテムの追加/削除など、大きな構造変更時に呼び出されます。
 * @param {HTMLElement} contentAreaElement メモ内容を描画する .memo-content-area 要素
 * @param {object} memoData 表示するメモのデータオブジェクト { id, title, items, lastModified }
 * @param {function} onMemoUpdateCallback メモデータが更新されたときに呼び出されるコールバック関数 (memoId, updatedMemoData, focusedItemIndex) => {}
 * @param {function} onRequestDeleteCallback メモ削除が要求されたときに呼び出されるコールバック (memoId) => {}
 * @param {number} [focusedItemIndex=-1] - (オプション) 再描画後にフォーカスを当てるアイテムのインデックス
 */
export function renderMemoContent(contentAreaElement, memoData, onMemoUpdateCallback, onRequestDeleteCallback, focusedItemIndex = -1) {
    contentAreaElement.innerHTML = ''; // 既存の内容をクリア

    // 1. タイトル入力欄の作成
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.classList.add('memo-title-input');
    titleInput.placeholder = DEFAULT_MEMO_TITLE;
    titleInput.value = sanitizeHTML(memoData.title);
    titleInput.addEventListener('input', (event) => {
        onMemoUpdateCallback(memoData.id, { ...memoData, title: event.target.value, lastModified: Date.now() });
    });
    contentAreaElement.appendChild(titleInput);

    // 2. メモ本文(アイテムリスト)のコンテナ作成
    const memoBody = document.createElement('div');
    memoBody.classList.add('memo-body');
    memoBody.id = `memoBody-${memoData.id}`;
    contentAreaElement.appendChild(memoBody);

    // 3. メモアイテムのレンダリング
    renderMemoItems(memoBody, memoData, onMemoUpdateCallback, focusedItemIndex);

    // 4. 「行を追加」ボタンの作成
    const addItemButton = document.createElement('button');
    addItemButton.classList.add('add-memo-item-btn');
    addItemButton.textContent = '行を追加';
    addItemButton.addEventListener('click', () => {
        const newItem = { text: "", checked: false };
        const updatedItems = [...memoData.items, newItem];
        onMemoUpdateCallback(memoData.id, { ...memoData, items: updatedItems, lastModified: Date.now() }, updatedItems.length - 1);
    });
    contentAreaElement.appendChild(addItemButton);

    // 5. アクションボタン（画像保存、削除）の作成
    const actionsDiv = document.createElement('div');
    actionsDiv.classList.add('memo-actions');

    const screenshotButton = document.createElement('button');
    screenshotButton.classList.add('screenshot-btn');
    screenshotButton.textContent = '画像保存';
    screenshotButton.addEventListener('click', () => {
        console.log(`Screenshot for memo ${memoData.id}`);
        const event = new CustomEvent('screenshot-request', { detail: { memoId: memoData.id, element: contentAreaElement } });
        document.dispatchEvent(event);
    });
    actionsDiv.appendChild(screenshotButton);

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-memo-btn');
    deleteButton.textContent = 'このメモを削除';
    deleteButton.addEventListener('click', () => {
        if (window.confirm(`「${sanitizeHTML(memoData.title)}」を削除しますか？この操作は元に戻せません。`)) {
            onRequestDeleteCallback(memoData.id);
        }
    });
    actionsDiv.appendChild(deleteButton);
    contentAreaElement.appendChild(actionsDiv);
}

/**
 * メモアイテムのリストを指定されたコンテナにレンダリングします。
 * @param {HTMLElement} memoBodyElement アイテムを描画する .memo-body 要素
 * @param {object} memoData メモデータ { id, items, ... }
 * @param {function} onMemoUpdateCallback データ更新用コールバック
 * @param {number} focusedItemIndex フォーカスを当てるアイテムのインデックス
 */
function renderMemoItems(memoBodyElement, memoData, onMemoUpdateCallback, focusedItemIndex) {
    memoBodyElement.innerHTML = '';
    if (memoData.items && memoData.items.length > 0) {
        memoData.items.forEach((item, index) => {
            const memoItemElement = createMemoItemElement(item, index, memoData, onMemoUpdateCallback);
            memoBodyElement.appendChild(memoItemElement);
            if (index === focusedItemIndex) {
                const textDiv = memoItemElement.querySelector('.memo-item-text');
                if (textDiv) {
                    setTimeout(() => textDiv.focus(), 0);
                }
            }
        });
    }
}

/**
 * 個々のメモアイテム（チェックボックス＋テキスト＋削除ボタン）のDOM要素を生成します。
 * @param {object} itemData アイテムのデータ { text, checked }
 * @param {number} itemIndex アイテムのインデックス (items配列内での)
 * @param {object} fullMemoData このアイテムを含む完全なメモデータ
 * @param {function} onMemoUpdateCallback メモデータが更新されたときに呼び出されるコールバック関数
 * @returns {HTMLElement} 生成されたメモアイテム要素 (div.memo-item)
 */
function createMemoItemElement(itemData, itemIndex, fullMemoData, onMemoUpdateCallback) {
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('memo-item');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = itemData.checked;
    checkbox.id = `chk-${fullMemoData.id}-${itemIndex}`;
    checkbox.addEventListener('change', (event) => {
        const newItems = fullMemoData.items.map((it, idx) =>
            idx === itemIndex ? { ...it, checked: event.target.checked } : it
        );
        onMemoUpdateCallback(fullMemoData.id, { ...fullMemoData, items: newItems, lastModified: Date.now() });
    });
    itemDiv.appendChild(checkbox);

    const textDiv = document.createElement('div');
    textDiv.classList.add('memo-item-text');
    textDiv.contentEditable = 'true';
    textDiv.setAttribute('aria-labelledby', checkbox.id);
    textDiv.textContent = sanitizeHTML(itemData.text);

    let isComposing = false;
    textDiv.addEventListener('compositionstart', () => { isComposing = true; });
    textDiv.addEventListener('compositionend', (event) => {
        isComposing = false;
        const newText = event.target.textContent;
        if (fullMemoData.items[itemIndex] && fullMemoData.items[itemIndex].text !== newText) {
            const newItems = fullMemoData.items.map((it, idx) =>
                idx === itemIndex ? { ...it, text: newText } : it
            );
            onMemoUpdateCallback(fullMemoData.id, { ...fullMemoData, items: newItems, lastModified: Date.now() });
        }
    });
    textDiv.addEventListener('blur', () => {
        if (isComposing) return;
        const newText = textDiv.textContent;
        if (fullMemoData.items[itemIndex] && fullMemoData.items[itemIndex].text !== newText) {
            const newItems = fullMemoData.items.map((it, idx) =>
                idx === itemIndex ? { ...it, text: newText } : it
            );
            onMemoUpdateCallback(fullMemoData.id, { ...fullMemoData, items: newItems, lastModified: Date.now() });
        }
    });
    textDiv.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            if (isComposing) return;
            event.preventDefault();
            const currentText = textDiv.textContent;
            let itemsArrayBeforeUpdate = [...fullMemoData.items];
            if (itemsArrayBeforeUpdate[itemIndex] && itemsArrayBeforeUpdate[itemIndex].text !== currentText) {
                itemsArrayBeforeUpdate[itemIndex] = { ...itemsArrayBeforeUpdate[itemIndex], text: currentText };
            }
            const newItem = { text: "", checked: false };
            const newItems = [
                ...itemsArrayBeforeUpdate.slice(0, itemIndex + 1),
                newItem,
                ...itemsArrayBeforeUpdate.slice(itemIndex + 1)
            ];
            onMemoUpdateCallback(fullMemoData.id, { ...fullMemoData, items: newItems, lastModified: Date.now() }, itemIndex + 1);
        }
    });
    itemDiv.appendChild(textDiv);

    const deleteItemButton = document.createElement('button');
    deleteItemButton.classList.add('delete-memo-item-btn');
    deleteItemButton.innerHTML = '×';
    deleteItemButton.title = 'この行を削除';
    // インラインスタイルは一時的なものとして、CSSファイルでの定義を推奨
    // deleteItemButton.style.marginLeft = 'auto';
    // deleteItemButton.style.padding = '2px 6px';
    // deleteItemButton.style.fontSize = '0.9em';
    // deleteItemButton.style.border = '1px solid #ccc';
    // deleteItemButton.style.borderRadius = '3px';
    // deleteItemButton.style.cursor = 'pointer';
    // deleteItemButton.style.lineHeight = '1';
    deleteItemButton.addEventListener('click', () => {
        const newItems = fullMemoData.items.filter((_, idx) => idx !== itemIndex);
        onMemoUpdateCallback(fullMemoData.id, { ...fullMemoData, items: newItems, lastModified: Date.now() });
    });
    itemDiv.appendChild(deleteItemButton);

    return itemDiv;
}