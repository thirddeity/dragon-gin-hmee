import { useEffect, useRef } from "react";
import "./App.css";

const FRAME_COUNT = 181;
const framePath = (index: number) =>
  `/frame-hig/ezgif-frame-${String(index + 1).padStart(3, "0")}.png`;

function ScrollFrameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = canvas?.closest<HTMLElement>(".dreamframe");
    if (!canvas || !section) return;

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    const frames: Array<HTMLImageElement | undefined> = Array(FRAME_COUNT);
    let targetFrame = 0;
    let currentFrame = 0;
    let width = 0;
    let height = 0;
    let frameRequest = 0;

    // เก็บภาพล่าสุดที่พร้อมวาดไว้เป็น Fallback กันกระพริบ
    let lastValidImage: HTMLImageElement | null = null;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const drawImageCover = (image: HTMLImageElement, alpha = 1) => {
      const sourceRatio = image.naturalWidth / image.naturalHeight;
      const canvasRatio = width / height;
      const drawWidth =
        sourceRatio > canvasRatio ? height * sourceRatio : width;
      const drawHeight =
        sourceRatio > canvasRatio ? height : width / sourceRatio;
      context.globalAlpha = alpha;
      context.drawImage(
        image,
        (width - drawWidth) / 2,
        (height - drawHeight) / 2,
        drawWidth,
        drawHeight,
      );
    };

    // ฟังก์ชันช่วย load เฟรมตาม index
    const loadFrame = (index: number) => {
      if (index < 0 || index >= FRAME_COUNT || frames[index]) return;
      const image = new Image();
      image.decoding = "async";
      image.src = framePath(index);
      image.onload = () => {
        render();
      };
      frames[index] = image;
    };

    // Smart Preload: โหลดภาพรอบๆ ตำแหน่งที่ Scroll อยู่ปัจจุบันก่อน
    const preloadNearbyFrames = (centerIndex: number) => {
      const RANGE = 8; // โหลดล่วงหน้าและย้อนหลัง 8 เฟรม
      for (let i = -RANGE; i <= RANGE; i++) {
        const target = centerIndex + i;
        if (target >= 0 && target < FRAME_COUNT) {
          loadFrame(target);
        }
      }
    };

    const render = () => {
      const lower = Math.floor(currentFrame);
      const upper = Math.min(FRAME_COUNT - 1, Math.ceil(currentFrame));
      const blend = currentFrame - lower;

      const first = frames[lower];
      const second = frames[upper];

      const isFirstReady = first?.complete;
      const isSecondReady = upper !== lower && second?.complete;

      // อัปเดตภาพล่าสุดที่พร้อมใช้งาน
      if (isFirstReady && first) lastValidImage = first;
      else if (isSecondReady && second) lastValidImage = second;

      // 1. วาด Fallback ภาพที่พร้อมล่าสุดไว้เต็มเฟรมเสมอ (ป้องกันฉากดำกระพริบ)
      if (lastValidImage) {
        drawImageCover(lastValidImage, 1);
      } else {
        context.fillStyle = "#16110b";
        context.fillRect(0, 0, width, height);
      }

      // 2. ถ้าทั้ง 2 ภาพพร้อม จึงทำ Crossfade Blending
      if (isFirstReady && isSecondReady && first && second) {
        drawImageCover(first, 1 - blend);
        drawImageCover(second, blend);
      }

      context.globalAlpha = 1;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      render();
    };

    const updateTargetFrame = () => {
      if (reducedMotion.matches) {
        targetFrame = 0;
        return;
      }
      const start = section.offsetTop;
      const distance = Math.max(section.offsetHeight - window.innerHeight, 1);
      const progress = Math.min(
        1,
        Math.max(0, (window.scrollY - start) / distance),
      );
      targetFrame = progress * (FRAME_COUNT - 1);

      // ทุกครั้งที่ scroll ให้สั่ง preload ภาพรอบๆ ตำแหน่งใหม่ทันที
      preloadNearbyFrames(Math.round(targetFrame));
    };

    // โหลดเฟรมแรกทันที + สั่ง preload ล่วงหน้า 15 เฟรมแรก
    for (let i = 0; i < 15; i++) loadFrame(i);

    const tick = () => {
      currentFrame +=
        (targetFrame - currentFrame) * (reducedMotion.matches ? 1 : 0.12);
      if (Math.abs(targetFrame - currentFrame) < 0.002)
        currentFrame = targetFrame;
      render();
      frameRequest = window.requestAnimationFrame(tick);
    };

    resize();
    updateTargetFrame();
    tick();

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("scroll", updateTargetFrame, { passive: true });
    reducedMotion.addEventListener("change", updateTargetFrame);

    return () => {
      window.cancelAnimationFrame(frameRequest);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", updateTargetFrame);
      reducedMotion.removeEventListener("change", updateTargetFrame);
    };
  }, []);

  return (
    <div className="scene-layer" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}

function App() {
  return (
    <main className="dreamframe">
      <ScrollFrameCanvas />
      <div className="ui-layer">
        <header className="topbar">
          <a className="brand" href="#top" aria-label="Dreamframe home">
            <span className="brand-mark">D</span>
            <span>
              DREAM
              <br />
              FRAME
            </span>
          </a>
          <nav aria-label="Primary navigation">
            <a href="#create">Create</a>
            <a href="#gallery">Gallery</a>
            <a href="#styles">Styles</a>
            <a href="#pricing">Pricing</a>
          </nav>
          <a className="login" href="#login">
            Sign in <span>↗</span>
          </a>
        </header>
        <section className="hero-content" id="top">
          <p className="eyebrow">
            <span /> Website for Apimuk <span />
          </p>
          <h1>
            <div>Dream</div>
            <div>
              <em>Frame</em>
            </div>
          </h1>
          <p className="lede">
            Where imagination takes form.
            <br />
            Craft worlds that linger long after the first glance.
          </p>
          <a className="create-button" href="#create">
            Start Creating <span>→</span>
          </a>
        </section>
      </div>
    </main>
  );
}

export default App;
