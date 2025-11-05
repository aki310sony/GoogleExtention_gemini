(() => {
  let lastAnimatedElement = null;

  // アニメーション用のスタイルを<head>に追加する
  const styleId = 'rotator-animation-style';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      @keyframes gemini-rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.command === 'rotate') {
      // 以前にアニメーションさせた要素があれば停止する
      if (lastAnimatedElement) {
        lastAnimatedElement.style.animation = '';
      }

      const element = document.querySelector(request.selector);

      if (element) {
        element.style.animation = 'gemini-rotate 2s linear infinite';
        lastAnimatedElement = element;
        sendResponse({ status: 'success' });
      } else {
        alert(`Element not found for selector: "${request.selector}"`);
        sendResponse({ status: 'error', message: 'Element not found' });
      }
    }
    // 非同期のsendResponseのためにtrueを返す
    return true;
  });
})();
