document.addEventListener('DOMContentLoaded', () => {
  const startButton = document.getElementById('start-btn');
  const stopButton = document.getElementById('stop-btn');

  async function sendMessageToContentScript(command) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // stopの場合はリロードするだけなので、スクリプト注入は不要
    if (command === 'stop') {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.location.reload()
      });
      return;
    }

    // startの場合
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    }, () => {
      chrome.tabs.sendMessage(tab.id, { command });
    });
  }

  startButton.addEventListener('click', () => sendMessageToContentScript('start'));
  stopButton.addEventListener('click', () => sendMessageToContentScript('stop'));
});
