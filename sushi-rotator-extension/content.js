(() => {
  if (window.hasSushiRotatorRun) return;
  window.hasSushiRotatorRun = true;

  let animationFrameId;
  let sushiItems = [];

  function start() {
    if (sushiItems.length > 0) return;

    // 背景を暗くする
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:997;';
    document.body.appendChild(overlay);

    // レーンを設置
    const laneY = window.innerHeight / 2 - 100; // 画面中央に設定
    const belt = document.createElement('div');
    belt.className = 'sushi-conveyor-belt';
    belt.style.top = laneY + 'px';
    document.body.appendChild(belt);

    const elements = document.querySelectorAll('p, img, h1, h2, h3, video');

    elements.forEach((el, index) => {
      if (el.offsetHeight < 20 || el.offsetWidth < 20 || el.textContent.trim() === '' && el.tagName !== 'IMG') {
        el.style.display = 'none';
        return;
      }

      // お皿を作成
      const plate = document.createElement('div');
      plate.className = 'sushi-plate';

      // 元の要素（ネタ）のスタイルを調整
      el.className += ' sushi-content';
      el.style.position = 'static'; // 元のfixed指定などをリセット

      // 画像なら絵本風デザインを適用
      if (el.tagName === 'IMG') {
        el.className += ' sushi-image-book';
        // 少し傾けて遊び心を出す
        plate.style.transform = `rotate(${Math.random() * 8 - 4}deg)`;
      }

      // お皿にネタを乗せる
      plate.appendChild(el);
      document.body.appendChild(plate);

      const item = {
        plate: plate,
        x: window.innerWidth + index * 300, // 画面外の右側からスタート
        y: laneY + 25, // レーンの中央に配置
        speed: Math.random() * 1.5 + 1
      };
      
      plate.style.top = item.y + 'px';
      sushiItems.push(item);
    });

    animate();
  }

  function animate() {
    sushiItems.forEach(item => {
      item.x -= item.speed; // 右から左へ流す
      if (item.x < -item.plate.offsetWidth) {
        item.x = window.innerWidth;
      }
      item.plate.style.left = item.x + 'px';
    });
    animationFrameId = requestAnimationFrame(animate);
  }

  chrome.runtime.onMessage.addListener((request) => {
    if (request.command === 'start') {
      start();
    }
  });
})();