document.addEventListener('DOMContentLoaded', () => {
  const startButton = document.getElementById('start-btn');
  const stopButton = document.getElementById('stop-btn');
  const feedButton = document.getElementById('feed-btn');

  // アクティブなタブにコマンドを送信するだけ
  function sendMessage(command) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { command });
      }
    });
  }

  startButton.addEventListener('click', () => sendMessage('start'));
  stopButton.addEventListener('click', () => sendMessage('stop'));
  feedButton.addEventListener('click', () => sendMessage('feed'));
});