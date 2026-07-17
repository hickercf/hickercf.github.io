/* ===============================================================
 * prisma-animations.js —— framer-motion 风格动效的原生实现
 * 对应原 React 组件：
 *   WordsPullUp          → [data-pull-up]   单词/字符逐个上拉，stagger 0.08s
 *   fade-up              → [data-fade-up]   延迟淡入上移（data-delay 秒）
 *   card stagger         → [data-card-stagger] 子卡片错峰入场，stagger 0.15s
 *   scroll-linked reveal → [data-char-reveal] 滚动进度映射字符透明度 0.2→1
 * =============================================================== */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 首页标记（供 CSS 做首页专属调整）
  if (document.querySelector('.prisma-hero')) {
    document.body.classList.add('is-home');
    // 「开始阅读」锚点目标
    var mainInner = document.querySelector('.main-inner');
    if (mainInner) mainInner.id = 'prisma-posts';
  }

  // 降低动画偏好：不加 .prisma-anim，所有内容静态呈现
  if (prefersReduced) return;

  document.documentElement.classList.add('prisma-anim');

  var EASE_PULL = 'cubic-bezier(0.16, 1, 0.3, 1)';
  var EASE_CARD = 'cubic-bezier(0.22, 1, 0.36, 1)';

  /* ---------- 文本切分：英文按词、中文按字，保留子元素样式分段 ---------- */
  function splitIntoWords(container) {
    var text = container.textContent;
    container.textContent = '';
    container.setAttribute('aria-label', (container.getAttribute('aria-label') || text).trim());
    var words = [];
    var tokens = text.match(/[A-Za-z0-9'&@.\-]+|\s+|[^\sA-Za-z0-9'&@.\-]/g) || [];
    var pendingSpace = false;
    tokens.forEach(function (tok) {
      if (/^\s+$/.test(tok)) {
        pendingSpace = true;
        return;
      }
      if (pendingSpace) {
        container.appendChild(document.createTextNode(' '));
        pendingSpace = false;
      }
      var w = document.createElement('span');
      w.className = 'pu-word';
      w.setAttribute('aria-hidden', 'true');
      w.textContent = tok;
      container.appendChild(w);
      words.push(w);
    });
    return words;
  }

  /* ---------- WordsPullUp ---------- */
  function initPullUp() {
    document.querySelectorAll('[data-pull-up]').forEach(function (el) {
      var words = [];
      var segments = el.children.length ? Array.prototype.slice.call(el.children) : [el];
      segments.forEach(function (seg) {
        words = words.concat(splitIntoWords(seg));
      });

      // 末尾上标星号（对应原设计的 showAsterisk）
      if (el.hasAttribute('data-asterisk')) {
        var sup = document.createElement('sup');
        sup.className = 'pu-word prisma-hero-asterisk';
        sup.setAttribute('aria-hidden', 'true');
        sup.textContent = '*';
        el.appendChild(sup);
        words.push(sup);
      }

      words.forEach(function (w, i) {
        w.style.transitionDelay = (i * 0.08) + 's';
      });

      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          words.forEach(function (w) { w.classList.add('pu-in'); });
          io.disconnect();
        });
      }, { threshold: 0.2 });
      io.observe(el);
    });
  }

  /* ---------- 延迟淡入上移 ---------- */
  function initFadeUp() {
    var els = document.querySelectorAll('[data-fade-up]');
    if (!els.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.style.transitionDelay = (parseFloat(el.getAttribute('data-delay') || '0')) + 's';
        el.classList.add('fu-in');
        io.unobserve(el);
      });
    }, { threshold: 0.2 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 卡片错峰入场 ---------- */
  function initCardStagger() {
    document.querySelectorAll('[data-card-stagger]').forEach(function (container) {
      var cards = Array.prototype.slice.call(container.children);
      cards.forEach(function (card, i) {
        card.style.transitionDelay = (i * 0.15) + 's';
      });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          cards.forEach(function (card, i) {
            card.classList.add('cs-in');
            // 入场结束后清掉 delay，避免 hover 过渡也被推迟
            setTimeout(function () { card.style.transitionDelay = '0s'; }, i * 150 + 900);
          });
          io.disconnect();
        });
      }, { rootMargin: '0px 0px -100px 0px', threshold: 0.05 });
      io.observe(container);
    });
  }

  /* ---------- 滚动联动字符渐显（对应 useScroll offset ['start 0.8', 'end 0.2']） ---------- */
  function initCharReveal() {
    document.querySelectorAll('[data-char-reveal]').forEach(function (el) {
      var text = el.textContent;
      el.textContent = '';
      el.setAttribute('aria-label', text.trim());
      var chars = [];
      Array.prototype.forEach.call(text, function (ch) {
        var s = document.createElement('span');
        s.className = 'cr-char';
        s.setAttribute('aria-hidden', 'true');
        s.textContent = ch;
        s.style.opacity = ch.trim() ? '0.2' : '1';
        el.appendChild(s);
        chars.push(s);
      });

      var n = chars.length;
      function update() {
        var rect = el.getBoundingClientRect();
        var vh = window.innerHeight || document.documentElement.clientHeight;
        var startLine = 0.8 * vh;
        var endLine = 0.2 * vh;
        var progress = (startLine - rect.top) / ((startLine - endLine) + rect.height);
        progress = Math.min(1, Math.max(0, progress));
        for (var i = 0; i < n; i++) {
          if (!chars[i].textContent.trim()) continue;
          var p = i / n;
          // 每个字符的映射区间 [p - 0.1, p + 0.05]
          var local = (progress - (p - 0.1)) / 0.15;
          var o = 0.2 + 0.8 * Math.min(1, Math.max(0, local));
          chars[i].style.opacity = o.toFixed(3);
        }
      }

      var ticking = false;
      function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          update();
          ticking = false;
        });
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      update();
    });
  }

  initPullUp();
  initFadeUp();
  initCardStagger();
  initCharReveal();
})();
