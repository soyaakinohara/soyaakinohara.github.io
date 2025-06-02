// js/main.js

import { STORAGE_KEY_MEMOS, DEFAULT_MEMO_TITLE, STORAGE_KEY_ACTIVE_TAB } from './constants.js';
import { generateUniqueId, sanitizeHTML } from './utils.js';
import {
    loadAllMemosFromStorage,
    saveMemoToStorage,
    deleteMemoFromStorage,
    loadActiveTabIdFromStorage,
    saveActiveTabIdToStorage
} from './storage.js';
import {
    createTabElement,
    createMemoContentElement,
    setActiveTab
} from './tabManager.js';
import { renderMemoContent } from './memoManager.js';
import { captureAndDownloadScreenshot } from './screenshot.js'; // screenshot.js からインポート


document.addEventListener('DOMContentLoaded', () => {
    console.log('Memo App Initializing...');

    // --- DOM要素の取得 ---
    const tabsBar = document.getElementById('tabsBar');
    const addTabButton = document.getElementById('addTabButton');
    const memoContentsContainer = document.getElementById('memoContentsContainer');
    const actionPopup = document.getElementById('actionPopup');
    const closeActionButton = document.getElementById('closeActionPopupBtn');
    const createNewMemoBtn = document.getElementById('createNewMemoBtn');
    const loadExistingMemoBtn = document.getElementById('loadExistingMemoBtn');
    const existingMemosListContainer = document.getElementById('existingMemosListContainer');
    const searchMemoInput = document.getElementById('searchMemoInput');
    const existingMemosUl = document.getElementById('existingMemosList');

    if (!tabsBar || !addTabButton || !memoContentsContainer || !actionPopup ||
        !closeActionButton || !createNewMemoBtn || !loadExistingMemoBtn || !existingMemosListContainer ||
        !searchMemoInput || !existingMemosUl ) {
        console.error('必要なDOM要素のいずれかが見つかりません。HTMLのIDを確認してください。');
        return;
    }
    console.log('Core DOM elements found.');

    // --- アプリケーションの状態管理用変数 ---
    let openMemosData = {};
    let activeMemoId = null;

    /**
     * メモデータが更新されたときのコールバック。
     * @param {string} memoId 更新されたメモのID
     * @param {object} updatedMemoData 更新後のメモデータ
     * @param {number} [focusedItemIndex=-1] - (オプション) 再描画後にフォーカスを当てるアイテムのインデックス
     */
    function handleMemoUpdate(memoId, updatedMemoData, focusedItemIndex = -1) {
        if (openMemosData[memoId]) {
            const oldMemoData = openMemosData[memoId];
            openMemosData[memoId] = updatedMemoData;
            saveMemoToStorage(memoId, updatedMemoData);
            console.log(`Memo ${memoId} updated:`, updatedMemoData);

            const tabTitleElement = tabsBar.querySelector(`.tab[data-memo-id="${memoId}"] .tab-title`);
            if (tabTitleElement && (tabTitleElement.textContent !== updatedMemoData.title)) {
                tabTitleElement.textContent = sanitizeHTML(updatedMemoData.title) || DEFAULT_MEMO_TITLE;
            }

            if (oldMemoData.items.length !== updatedMemoData.items.length || focusedItemIndex !== -1) {
                const contentArea = memoContentsContainer.querySelector(`.memo-content-area[data-memo-id="${memoId}"]`);
                if (contentArea && activeMemoId === memoId) {
                    renderMemoContent(contentArea, updatedMemoData, handleMemoUpdate, handleRequestDelete, focusedItemIndex);
                }
            }
        } else {
            console.warn(`Attempted to update non-existent memo: ${memoId}`);
        }
    }

    /**
     * memoManagerからメモ削除要求があった場合のコールバック
     * @param {string} memoIdToDelete 削除要求されたメモのID
     */
    function handleRequestDelete(memoIdToDelete) {
        if (memoIdToDelete && openMemosData[memoIdToDelete]) {
            if (deleteMemoFromStorage(memoIdToDelete)) {
                delete openMemosData[memoIdToDelete];
                const tabToClose = tabsBar.querySelector(`.tab[data-memo-id="${memoIdToDelete}"]`);
                if (tabToClose) {
                    const contentElement = memoContentsContainer.querySelector(`.memo-content-area[data-memo-id="${memoIdToDelete}"]`);
                    if (contentElement) contentElement.remove();
                    tabToClose.remove();
                    if (activeMemoId === memoIdToDelete) {
                        activeMemoId = null;
                        const remainingTabs = tabsBar.querySelectorAll('.tab');
                        if (remainingTabs.length > 0) {
                            handleTabClick(remainingTabs[remainingTabs.length - 1].dataset.memoId);
                        } else {
                            saveActiveTabIdToStorage(null);
                            openNewTab();
                        }
                    }
                }
                console.log(`Memo ${memoIdToDelete} deleted successfully.`);
                if (actionPopup.style.display === 'block' && existingMemosListContainer.style.display === 'block') {
                    populateExistingMemosList();
                }
            }
        }
    }

    /**
     * 新しいタブとメモコンテンツエリアを開き、アクティブにします。
     * @param {string} [memoIdToOpen=null]
     * @param {object} [memoDataToOpen=null]
     */
    function openNewTab(memoIdToOpen = null, memoDataToOpen = null) {
        const newMemoId = memoIdToOpen || generateUniqueId();
        let currentMemoData = memoDataToOpen;
        if (!currentMemoData) {
            currentMemoData = { id: newMemoId, title: DEFAULT_MEMO_TITLE, items: [{ text: "", checked: false }], lastModified: Date.now() };
            openMemosData[newMemoId] = currentMemoData;
            saveMemoToStorage(newMemoId, currentMemoData);
        } else if (!openMemosData[newMemoId]) {
            openMemosData[newMemoId] = currentMemoData;
        }
        currentMemoData = openMemosData[newMemoId];

        if (tabsBar.querySelector(`.tab[data-memo-id="${newMemoId}"]`)) {
            activeMemoId = newMemoId;
            setActiveTab(newMemoId, tabsBar, memoContentsContainer);
            saveActiveTabIdToStorage(activeMemoId);
            const existingContentArea = memoContentsContainer.querySelector(`.memo-content-area[data-memo-id="${newMemoId}"]`);
            if (existingContentArea && currentMemoData) {
                renderMemoContent(existingContentArea, currentMemoData, handleMemoUpdate, handleRequestDelete);
            }
            return;
        }
        const tabElement = createTabElement(newMemoId, currentMemoData.title, handleTabClick, handleTabClose);
        tabsBar.insertBefore(tabElement, addTabButton);
        const contentElement = createMemoContentElement(newMemoId);
        memoContentsContainer.appendChild(contentElement);
        if (currentMemoData) {
            renderMemoContent(contentElement, currentMemoData, handleMemoUpdate, handleRequestDelete);
        }
        activeMemoId = newMemoId;
        setActiveTab(activeMemoId, tabsBar, memoContentsContainer);
        saveActiveTabIdToStorage(activeMemoId);
        console.log(`Opened tab for memo: ${activeMemoId}, Title: ${currentMemoData ? currentMemoData.title : 'N/A'}`);
    }

    /**
     * タブがクリックされたときのハンドラ
     * @param {string} memoId
     */
    function handleTabClick(memoId) {
        if (activeMemoId !== memoId) {
            activeMemoId = memoId;
            setActiveTab(activeMemoId, tabsBar, memoContentsContainer);
            saveActiveTabIdToStorage(activeMemoId);
            const contentArea = memoContentsContainer.querySelector(`.memo-content-area[data-memo-id="${memoId}"]`);
            const memoData = openMemosData[memoId];
            if (contentArea && memoData) {
                renderMemoContent(contentArea, memoData, handleMemoUpdate, handleRequestDelete);
            }
        }
    }

    /**
     * タブの閉じるボタンがクリックされたときのハンドラ
     * @param {string} memoId
     * @param {HTMLElement} tabElement
     */
    function handleTabClose(memoId, tabElement) {
        const contentElement = memoContentsContainer.querySelector(`.memo-content-area[data-memo-id="${memoId}"]`);
        if (contentElement) contentElement.remove();
        if (tabElement) tabElement.remove();
        if (activeMemoId === memoId) {
            activeMemoId = null;
            const remainingTabs = tabsBar.querySelectorAll('.tab');
            if (remainingTabs.length > 0) {
                handleTabClick(remainingTabs[remainingTabs.length - 1].dataset.memoId);
            } else {
                saveActiveTabIdToStorage(null);
                openNewTab();
            }
        }
    }

    /**
     * 既存のメモのリストをポップアップ内に表示します。
     */
    function populateExistingMemosList() {
        existingMemosUl.innerHTML = '';
        const allMemos = loadAllMemosFromStorage();
        const searchTerm = searchMemoInput.value.toLowerCase().trim();
        const filteredAndSortedMemos = Object.values(allMemos)
            .filter(memo => memo.title && memo.title.toLowerCase().includes(searchTerm))
            .sort((a, b) => b.lastModified - a.lastModified);
        if (filteredAndSortedMemos.length === 0) {
            const li = document.createElement('li');
            li.textContent = searchTerm ? '該当するメモはありません。' : '保存されているメモはありません。';
            li.style.textAlign = 'center';
            li.style.padding = '10px';
            li.style.color = '#777';
            existingMemosUl.appendChild(li);
            return;
        }
        filteredAndSortedMemos.forEach(memo => {
            const li = document.createElement('li');
            const displayTitle = sanitizeHTML(memo.title) || DEFAULT_MEMO_TITLE;
            li.textContent = displayTitle;
            li.title = displayTitle;
            li.dataset.memoId = memo.id;
            li.addEventListener('click', () => {
                const memoToOpen = openMemosData[memo.id] || allMemos[memo.id];
                if (memoToOpen) {
                    openNewTab(memo.id, memoToOpen);
                } else {
                    console.error(`Failed to load memo data for ID: ${memo.id}`);
                    alert("メモの読み込みに失敗しました。");
                }
                actionPopup.style.display = 'none';
            });
            existingMemosUl.appendChild(li);
        });
    }

    // --- イベントリスナーの設定 ---
    addTabButton.addEventListener('click', () => {
        actionPopup.style.display = 'block';
        existingMemosListContainer.style.display = 'none';
    });
    closeActionButton.addEventListener('click', () => {
        actionPopup.style.display = 'none';
    });
    createNewMemoBtn.addEventListener('click', () => {
        openNewTab();
        actionPopup.style.display = 'none';
    });
    loadExistingMemoBtn.addEventListener('click', () => {
        existingMemosListContainer.style.display = 'block';
        searchMemoInput.value = '';
        populateExistingMemosList();
        searchMemoInput.focus();
    });
    searchMemoInput.addEventListener('input', populateExistingMemosList);

    // ▼▼▼ スクリーンショット要求イベントのリスナーを修正 ▼▼▼
    document.addEventListener('screenshot-request', (event) => {
        const { memoId, element } = event.detail; // element は .memo-content-area
        console.log(`Screenshot requested for memo ${memoId}. Element:`, element);

        if (element && openMemosData[memoId]) {
            const memoTitle = openMemosData[memoId].title;
            // screenshot.js の関数を呼び出す
            captureAndDownloadScreenshot(element, memoTitle);
        } else {
            console.error('Cannot take screenshot: element or memo data for screenshot not found.');
            alert('スクリーンショットの作成に必要な情報が不足しています。');
        }
    });
    // ▲▲▲ ここまで修正 ▲▲▲


    // --- アプリケーション起動時の初期化処理 ---
    function initializeApp() {
        openMemosData = loadAllMemosFromStorage();
        const lastActiveId = loadActiveTabIdFromStorage();
        let didOpenInitialTab = false;
        if (lastActiveId && openMemosData[lastActiveId]) {
            openNewTab(lastActiveId, openMemosData[lastActiveId]);
            didOpenInitialTab = true;
        } else if (Object.keys(openMemosData).length > 0) {
            const sortedMemoIds = Object.values(openMemosData)
                .sort((a,b) => b.lastModified - a.lastModified)
                .map(memo => memo.id);
            if (sortedMemoIds.length > 0) {
                const firstMemoId = sortedMemoIds[0];
                openNewTab(firstMemoId, openMemosData[firstMemoId]);
                didOpenInitialTab = true;
            }
        }
        if (!didOpenInitialTab) {
            openNewTab();
        }
    }
    initializeApp();

}); // DOMContentLoaded end