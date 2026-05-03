// autumn-leaves.js - 真实一点的 canvas 枫叶飘落
(() => {
  const prefersReducedMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) return;

  const leafSources = [
    "/img/leaves/leaf-orange.svg",
    "/img/leaves/leaf-gold.svg",
    "/img/leaves/leaf-red.svg"
  ];

  const canvas = document.createElement("canvas");
  canvas.id = "autumn-leaf-canvas";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let leaves = [];
  let images = [];
  let animationId = null;

  const isMobile = () => window.innerWidth <= 768;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const targetCount = isMobile() ? 10 : 22;

    if (leaves.length < targetCount) {
      while (leaves.length < targetCount) leaves.push(createLeaf(true));
    } else {
      leaves = leaves.slice(0, targetCount);
    }
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  function random(min, max) {
    return min + Math.random() * (max - min);
  }

  function createLeaf(initial = false) {
    const layer = Math.random();

    return {
      x: random(-width * 0.1, width * 1.1),
      y: initial ? random(-height * 0.2, height * 1.05) : random(-180, -40),

      // layer 越大越靠前，叶子越大越快
      size: layer < 0.25 ? random(14, 22) : layer < 0.75 ? random(22, 36) : random(36, 54),
      speedY: layer < 0.25 ? random(0.35, 0.75) : layer < 0.75 ? random(0.75, 1.35) : random(1.2, 2.2),
      speedX: random(-0.55, 0.55),

      swing: random(0, Math.PI * 2),
      swingSpeed: random(0.008, 0.025),
      swingRange: random(0.25, 1.15),

      rotation: random(0, Math.PI * 2),
      rotationSpeed: random(-0.018, 0.018),

      opacity: layer < 0.25 ? random(0.22, 0.42) : layer < 0.75 ? random(0.42, 0.68) : random(0.58, 0.82),
      blur: layer < 0.25 ? random(0.6, 1.4) : layer > 0.82 ? random(0.2, 0.8) : 0,

      img: images[Math.floor(Math.random() * images.length)]
    };
  }

  function drawLeaf(leaf) {
    ctx.save();

    ctx.globalAlpha = leaf.opacity;
    ctx.translate(leaf.x, leaf.y);
    ctx.rotate(leaf.rotation);

    if (leaf.blur > 0) {
      ctx.filter = `blur(${leaf.blur}px)`;
    }

    // 模拟一点翻转感：宽度轻微变化
    const flip = 0.82 + Math.sin(leaf.swing * 1.7) * 0.18;
    ctx.drawImage(
      leaf.img,
      -leaf.size * flip / 2,
      -leaf.size / 2,
      leaf.size * flip,
      leaf.size
    );

    ctx.restore();
  }

  function updateLeaf(leaf) {
    leaf.swing += leaf.swingSpeed;
    leaf.x += leaf.speedX + Math.sin(leaf.swing) * leaf.swingRange;
    leaf.y += leaf.speedY;
    leaf.rotation += leaf.rotationSpeed + Math.sin(leaf.swing) * 0.002;

    if (leaf.y > height + 80 || leaf.x < -120 || leaf.x > width + 120) {
      Object.assign(leaf, createLeaf(false));
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (const leaf of leaves) {
      updateLeaf(leaf);
      drawLeaf(leaf);
    }

    animationId = requestAnimationFrame(animate);
  }

  async function start() {
    try {
      images = await Promise.all(leafSources.map(loadImage));
      resize();
      window.addEventListener("resize", resize, { passive: true });
      animate();
    } catch (err) {
      console.warn("[autumn-leaves] leaf images failed to load:", err);
    }
  }

  document.addEventListener("DOMContentLoaded", start);

  window.addEventListener("beforeunload", () => {
    if (animationId) cancelAnimationFrame(animationId);
  });
})();
