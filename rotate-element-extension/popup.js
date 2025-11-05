document.addEventListener('DOMContentLoaded', () => {
  const animateButton = document.getElementById('animate-button');
  const selectorInput = document.getElementById('selector-input');

  animateButton.addEventListener('click', async () => {
    const selector = selectorInput.value.trim();
    if (!selector) {
      // 入力が空の場合は何もしない
      return;
    }

    // アクティブなタブを取得
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // コンテンツスクリプトを注入して実行
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    }, () => {
      // 注入後、メッセージを送信
      chrome.tabs.sendMessage(tab.id, { 
        command: 'rotate', 
        selector: selector 
      });
    });
  });
});
