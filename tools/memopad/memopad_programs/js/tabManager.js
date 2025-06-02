// js/tabManager.js

import { DEFAULT_MEMO_TITLE } from './constants.js';
import { sanitizeHTML } from './utils.js';

/**
 * 新しいタブ要素を生成します。
 * @param {string} memoId 対応するメモのID
 * @param {string} title タブに表示するタイトル
 * @param {function} onTabClick タブがクリックされたときのコールバック関数
 * @param {function} onCloseClick 閉じるボタンがクリックされたときのコールバック関数
 * @returns {HTMLElement} 生成されたタブ要素 (div)
 */
export function createTabElement(memoId, title, onTabClick, onCloseClick) {
    const tab = document.createElement('div');
    tab.classList.add('tab');
    tab.dataset.memoId = memoId; // メモIDをdata属性として保持
    tab.setAttribute('role', 'tab'); // ARIA属性
    tab.setAttribute('aria-selected', 'false');
    tab.setAttribute('tabindex', '-1'); // 初期はフォーカス不可

    const tabTitle = document.createElement('span');
    tabTitle.classList.add('tab-title');
    tabTitle.textContent = sanitizeHTML(title) || DEFAULT_MEMO_TITLE; // サニタイズして設定
    tab.appendChild(tabTitle);

    const closeButton = document.createElement('span');
    closeButton.classList.add('close-tab-btn');
    closeButton.innerHTML = '×'; // ×記号
    closeButton.title = 'このタブを閉じる';
    closeButton.setAttribute('role', 'button');
    closeButton.addEventListener('click', (event) => {
        event.stopPropagation(); // タブ自体のクリックイベントを発火させない
        onCloseClick(memoId, tab);
    });
    tab.appendChild(closeButton);

    tab.addEventListener('click', () => {
        onTabClick(memoId);
    });

    return tab;
}

/**
 * 新しいメモコンテンツエリア要素を生成します。
 * @param {string} memoId 対応するメモのID
 * @returns {HTMLElement} 生成されたメモコンテンツエリア要素 (div)
 */
export function createMemoContentElement(memoId) {
    const contentArea = document.createElement('div');
    contentArea.classList.add('memo-content-area');
    contentArea.dataset.memoId = memoId;
    // 初期状態では内容は空。この後 memoManager.js などで中身が作られる。
    // 仮の内容表示
    // contentArea.innerHTML = `
    //     <input type="text" class="memo-title-input" placeholder="${DEFAULT_MEMO_TITLE}" value="${DEFAULT_MEMO_TITLE}">
    //     <div class="memo-body" id="memoBody-${memoId}">
    //         <p>メモID: ${memoId} の内容エリア</p>
    //     </div>
    //     <button class="add-memo-item-btn" data-target-body-id="memoBody-${memoId}">行を追加</button>
    //     <div class="memo-actions">
    //         <button class="screenshot-btn">画像保存</button>
    //         <button class="delete-memo-btn">このメモを削除</button>
    //     </div>
    // `;
    return contentArea;
}

/**
 * 指定されたタブをアクティブにし、他を非アクティブにします。
 * 対応するメモコンテンツエリアも表示/非表示を切り替えます。
 * @param {string} memoId アクティブにするメモのID
 * @param {HTMLElement} tabsBar タブバーのコンテナ要素
 * @param {HTMLElement} memoContentsContainer メモコンテンツのコンテナ要素
 */
export function setActiveTab(memoId, tabsBar, memoContentsContainer) {
    // 全てのタブを非アクティブにする
    tabsBar.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
        tab.setAttribute('tabindex', '-1');
    });
    // 全てのメモコンテンツエリアを非表示にする
    memoContentsContainer.querySelectorAll('.memo-content-area').forEach(content => {
        content.classList.remove('active');
    });

    // 指定されたIDのタブをアクティブにする
    const activeTab = tabsBar.querySelector(`.tab[data-memo-id="${memoId}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
        activeTab.setAttribute('aria-selected', 'true');
        activeTab.setAttribute('tabindex', '0'); // アクティブタブはフォーカス可能に
        activeTab.focus(); // アクティブタブにフォーカスを当てる
    }

    // 指定されたIDのメモコンテンツエリアを表示する
    const activeContent = memoContentsContainer.querySelector(`.memo-content-area[data-memo-id="${memoId}"]`);
    if (activeContent) {
        activeContent.classList.add('active');
    }
    console.log(`Tab ${memoId} is now active.`);
}