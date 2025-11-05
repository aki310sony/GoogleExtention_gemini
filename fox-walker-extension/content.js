// このスクリプトがページのトップフレームで実行されている場合のみ、すべてのロジックを実行する
if (window.self === window.top) {

  // --- グローバル変数定義 ---
  let fox, bubble, food, animationFrameId;
  let isRunning = false;
  let foxState = 'walking'; // 'walking', 'goingToFood', 'eating', 'fleeing', 'spinning', 'napping'
  let target = null;
  let stateTimer = 0, commentCooldownTimer = 0;
  let walkSteps = 0;
  let canComment = true;

  let pos = { x: 100, y: 100 };
  let vel = { x: 1.5, y: 1.5 };
  const foxSize = 70;

  // --- AIコメント生成システム ---
  const soliloquy = ['次どこ行こうかな？', 'このページ、きれいだなあ。', 'お腹すいたなあ…🍓', 'ふぁ〜、ちょっと眠いかも…'];
  const commentTemplates = {
    a: ['「[text]」っていうリンクだ！ [hostname] に行くのかな？', 'このリンク、押してみたいな！「[text]」だって！'],
    youtube: ['YouTubeのリンクだ！面白い動画かな？🎥'],
    twitter: ['Twitterだ！みんな何をつぶやいてるんだろう？🐦'],
    img: ['わー、写真だ！「[alt]」って書いてあるね。🖼️', 'この画像、きれいだなあ。ファイル名は [filename] だって！'],
    h1: ['おっきな見出し！「[text]」！一番大事なことかな？🧐'],
    welcome: ['「ようこそ」だって！歓迎されてるみたいで嬉しいな！😊'],
    p: ['「[snippet]」…って書いてある。勉強になるなあ。📝', 'ふむふむ、色々なことが書いてあるんだね。'],
    button: ['「[text]」ボタン発見！🔘 押すと何が起きるんだろう？'],
    default: ['これは…なんだろう？不思議な形をしてるね！🤔', 'この要素、なんていう名前なのかな？', 'いろんなものでページはできてるんだなあ。']
  };

  function generateSmartComment(element) {
    const tagName = element.tagName.toLowerCase();
    const text = (element.textContent || '').trim();
    if (tagName === 'a') {
      try {
        const hostname = new URL(element.href).hostname;
        if (hostname.includes('youtube.com')) return commentTemplates.youtube[0];
        if (hostname.includes('twitter.com') || hostname.includes('x.com')) return commentTemplates.twitter[0];
      } catch (e) {}
    }
    if (tagName.startsWith('h') && text.includes('ようこそ')) return commentTemplates.welcome[0];
    const templates = commentTemplates[tagName] || commentTemplates.default;
    const template = templates[Math.floor(Math.random() * templates.length)];
    let comment = template.replace(/\\\[text\\\\]/g, text.substring(0, 20) || 'テキスト').replace(/\\\[snippet\\\\]/g, (text.substring(0, 15) || '…') + '…');
    try { comment = comment.replace(/\\\[hostname\\\\]/g, new URL(element.href).hostname); } catch (e) { comment = comment.replace(/\\\[hostname\\\\]/g, 'どこか'); }
    comment = comment.replace(/\\\[alt\\\\]/g, element.alt || '説明').replace(/\\\[filename\\\\]/g, (element.src || '').substring((element.src || '').lastIndexOf('/') + 1) || '画像');
    return comment;
  }

  // --- 行動に関する関数 ---
  function walkRandomly() {
    walkSteps++;
    if (Math.random() < 0.001 && canComment) {
      bubble.textContent = soliloquy[Math.floor(Math.random() * soliloquy.length)];
      canComment = false;
      clearTimeout(commentCooldownTimer);
      commentCooldownTimer = setTimeout(() => { canComment = true; }, 3000);
    }
    if (walkSteps > 500 && Math.random() < 0.02) {
      foxState = 'napping';
      bubble.textContent = 'Zzz... 😴';
      clearTimeout(stateTimer);
      stateTimer = setTimeout(() => { foxState = 'walking'; walkSteps = 0; }, 5000);
      return;
    }
    if (pos.x + foxSize > window.innerWidth || pos.x < 0) vel.x *= -1;
    if (pos.y + foxSize > window.innerHeight || pos.y < 0) vel.y *= -1;
    pos.x += vel.x; pos.y += vel.y;
  }

  function goToTarget() {
    const speed = 2.5;
    const dx = target.x - pos.x; const dy = target.y - pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 10) {
      foxState = 'eating'; if(food) food.remove(); food = null; target = null;
      bubble.textContent = 'もぐもぐ…おいしい！😋';
      stateTimer = setTimeout(() => { foxState = 'walking'; }, 2000);
    } else {
      vel.x = (dx / distance) * speed; vel.y = (dy / distance) * speed;
      pos.x += vel.x; pos.y += vel.y;
    }
  }

  function fleeFrom(fleeTarget) {
    const speed = 3.5;
    const dx = fleeTarget.x - pos.x; const dy = fleeTarget.y - pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    vel.x = -(dx / distance) * speed; vel.y = -(dy / distance) * speed;
    pos.x += vel.x; pos.y += vel.y;
    pos.x = Math.max(0, Math.min(window.innerWidth - foxSize, pos.x));
    pos.y = Math.max(0, Math.min(window.innerHeight - foxSize, pos.y));
  }

  function updateFoxDisplay() {
    const bobbingOffset = (foxState === 'walking') ? Math.sin(walkSteps * 0.1) * 3 : 0;
    fox.style.left = pos.x + 'px';
    fox.style.top = (pos.y + bobbingOffset) + 'px';
    fox.style.transform = vel.x > 0 ? 'scaleX(-1)' : 'scaleX(1)';
    bubble.style.left = (pos.x + foxSize + 5) + 'px';
    bubble.style.top = (pos.y + bobbingOffset) + 'px';
  }

  // --- メインのループ ---
  function animate() {
    if (!isRunning) return;
    switch (foxState) {
      case 'walking':
        walkRandomly();
        if (canComment) {
          const elementUnder = document.elementFromPoint(pos.x + (foxSize / 2), pos.y + (foxSize / 2));
          if (elementUnder && !elementUnder.id.startsWith('fox-')) {
            const comment = generateSmartComment(elementUnder);
            bubble.textContent = comment;
            canComment = false;
            clearTimeout(commentCooldownTimer);
            commentCooldownTimer = setTimeout(() => { canComment = true; }, 2500);
          }
        }
        break;
      case 'goingToFood': goToTarget(); break;
      case 'fleeing': fleeFrom(target); break;
      case 'eating': case 'spinning': case 'napping': break;
    }
    updateFoxDisplay();
    animationFrameId = requestAnimationFrame(animate);
  }

  // --- 初期化とイベントリスナー ---
  function initialize() {
    if (document.getElementById('fox-walker')) return;
    fox = document.createElement('img');
    fox.id = 'fox-walker';
    fox.src = chrome.runtime.getURL('images/kitune.png');
    bubble = document.createElement('div');
    bubble.id = 'fox-bubble';
    document.body.appendChild(fox);
    document.body.appendChild(bubble);

    document.addEventListener('mousemove', (e) => {
      if (foxState !== 'walking') return;
      const distance = Math.sqrt(Math.pow(e.clientX - pos.x, 2) + Math.pow(e.clientY - pos.y, 2));
      if (distance < 100) {
        foxState = 'fleeing';
        target = { x: e.clientX, y: e.clientY };
        bubble.textContent = 'わっ！びっくりした！';
        clearTimeout(stateTimer);
        stateTimer = setTimeout(() => { foxState = 'walking'; }, 1500);
      }
    });
    document.addEventListener('click', (e) => {
      if (foxState === 'spinning') return;
      const distance = Math.sqrt(Math.pow(e.clientX - pos.x - (foxSize/2), 2) + Math.pow(e.clientY - pos.y - (foxSize/2), 2));
      if (distance < foxSize / 2) {
        const originalState = foxState;
        clearTimeout(stateTimer);
        foxState = 'spinning';
        bubble.textContent = 'えへへ、見つかっちゃった！😄';
        fox.style.transition = 'transform 0.5s ease';
        fox.style.transform += ' rotate(360deg)';
        stateTimer = setTimeout(() => {
          fox.style.transition = 'transform 0.2s linear';
          foxState = originalState === 'spinning' ? 'walking' : originalState;
        }, 1000);
      }
    });
  }

  // --- メッセージ受信 ---
  chrome.runtime.onMessage.addListener((request) => {
    if (request.command === 'start' && !isRunning) {
      isRunning = true;
      fox.style.display = 'block';
      bubble.style.display = 'block';
      foxState = 'walking';
      animate();
    } else if (request.command === 'stop') {
      isRunning = false;
      fox.style.display = 'none';
      bubble.style.display = 'none';
      if(food) food.remove();
      cancelAnimationFrame(animationFrameId);
    } else if (request.command === 'feed') {
      if (!isRunning || foxState === 'eating') return;
      if (food) food.remove();
      food = document.createElement('div');
      food.textContent = '🍓';
      food.style.cssText = 'position:fixed; font-size:30px; z-index:99998;';
      const foodX = Math.random() * (window.innerWidth - 50);
      const foodY = Math.random() * (window.innerHeight - 50);
      food.style.left = foodX + 'px';
      food.style.top = foodY + 'px';
      document.body.appendChild(food);
      target = { x: foodX, y: foodY };
      foxState = 'goingToFood';
      bubble.textContent = 'あ、えさだ！🍓';
    }
  });

  initialize();
}
