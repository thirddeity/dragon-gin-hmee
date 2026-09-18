import { useEffect, useRef } from "react";
import "./App.css";

const FRAME_COUNT = 181;
const framePath = (index: number) => `/frame-hig/ezgif-frame-${String(index + 1).padStart(3, "0")}.png`;

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
    let lastValidImage: HTMLImageElement | null = null;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const drawImageCover = (image: HTMLImageElement, alpha = 1) => {
      const sourceRatio = image.naturalWidth / image.naturalHeight;
      const canvasRatio = width / height;
      const drawWidth = sourceRatio > canvasRatio ? height * sourceRatio : width;
      const drawHeight = sourceRatio > canvasRatio ? height : width / sourceRatio;
      context.globalAlpha = alpha;
      context.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
    };

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

    const preloadNearbyFrames = (centerIndex: number) => {
      const RANGE = 8;
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

      if (isFirstReady && first) lastValidImage = first;
      else if (isSecondReady && second) lastValidImage = second;

      if (lastValidImage) {
        drawImageCover(lastValidImage, 1);
      } else {
        context.fillStyle = "#e8eef0";
        context.fillRect(0, 0, width, height);
      }

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
      const progress = Math.min(1, Math.max(0, (window.scrollY - start) / distance));
      targetFrame = progress * (FRAME_COUNT - 1);
      preloadNearbyFrames(Math.round(targetFrame));
    };

    for (let i = 0; i < 15; i++) loadFrame(i);

    const tick = () => {
      currentFrame += (targetFrame - currentFrame) * (reducedMotion.matches ? 1 : 0.12);
      if (Math.abs(targetFrame - currentFrame) < 0.002) currentFrame = targetFrame;
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

function InkMotif() {
  return (
    <svg className="ink-motif" viewBox="0 0 920 520" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="void" cx="58%" cy="42%" r="42%">
          <stop offset="0%" stopColor="#1c2422" />
          <stop offset="55%" stopColor="#0c1211" />
          <stop offset="100%" stopColor="#070a0a" />
        </radialGradient>
        <radialGradient id="goldCore" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#f6e7b4" />
          <stop offset="45%" stopColor="#d4b56a" />
          <stop offset="100%" stopColor="#9a7a38" />
        </radialGradient>
        <linearGradient id="goldArc" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f0dca0" stopOpacity="0" />
          <stop offset="35%" stopColor="#e6c878" />
          <stop offset="70%" stopColor="#c4a056" />
          <stop offset="100%" stopColor="#e8d9a4" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      <circle cx="250" cy="188" r="188" stroke="url(#goldArc)" strokeWidth="1.15" />
      <circle cx="70" cy="162" r="4.2" fill="#e8d39a" />
      <circle cx="70" cy="162" r="1.5" fill="#fff6d4" />

      <g className="ink-motif-orb">
        <circle cx="790" cy="150" r="108" fill="url(#void)" />
        <circle cx="790" cy="150" r="108" stroke="#c9a86a" strokeWidth="0.6" opacity="0.4" />
        <circle cx="790" cy="150" r="11" fill="url(#goldCore)" />
        <circle cx="790" cy="147" r="3.2" fill="#fff4c8" opacity="0.8" />
        <circle cx="742" cy="98" r="2.1" fill="#e8d39a" />
        <circle cx="848" cy="122" r="1.4" fill="#f0e0a8" />
        <circle cx="820" cy="214" r="1.8" fill="#d4b56a" />
        <circle cx="752" cy="220" r="1.1" fill="#e8d39a" />
      </g>
    </svg>
  );
}

const works = [
  {
    medium: "Scroll installation",
    title: "Hanging Ink",
    detail:
      "A shan-shui room that redraws itself as the visitor walks. Fog, pine, and gold dust stay in the same breath as the hand.",
  },
  {
    medium: "Room-scale 3D",
    title: "Orbit Garden",
    detail:
      "A circular path through mist. Each step opens a new ridge; the last step closes the circle into a single gold point.",
  },
  {
    medium: "Realtime portrait",
    title: "Third Breath",
    detail: "A live figure that inhales proximity. Stand still and the ink settles. Lean in and the landscape splits.",
  },
];

function App() {
  return (
    <main className="dreamframe">
      <ScrollFrameCanvas />
      <div className="ui-layer">
        <section className="hero" id="top">
          <div className="hero-stage">
            <InkMotif />
            <h1>Third</h1>
            <p className="hero-name">Pong-amorn Wongchalermthan</p>
            <p className="hero-role">3D interactive artist &amp; creative developer</p>
            <p className="lede">
              I craft immersive 3D interactive experiences
              <br />
              that blend art, technology, and storytelling.
            </p>
            <div className="hero-actions">
              <a className="pill pill-ink" href="#work">
                <span>+</span> Explore work <span>+</span>
              </a>
              <a className="pill pill-mist" href="#about">
                <span>◇</span> About me <span>◇</span>
              </a>
            </div>
          </div>
        </section>

        <div className="journey" aria-hidden="true" />

        <section className="panel" id="work">
          <header className="panel-head">
            <p>Selected work</p>
            <h2>Pieces you can walk through</h2>
          </header>
          <ul className="work-list">
            {works.map((work) => (
              <li key={work.title}>
                <p className="work-medium">{work.medium}</p>
                <h3>{work.title}</h3>
                <p>{work.detail}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel panel-about" id="about">
          <header className="panel-head">
            <p>About</p>
            <h2>A third path between brush and engine</h2>
          </header>
          <div className="about-grid">
            <p>
              Pong-amorn Wongchalermthan works as Third — a 3D interactive artist and creative developer who treats
              landscape painting as a live system, not a still image.
            </p>
            <p>
              The work sits where ink, spatial computing, and story share a single surface. Visitors do not look at a
              scene. They enter the stroke and leave a trace.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;
