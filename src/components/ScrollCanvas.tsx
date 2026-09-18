import { Component, createRef } from "react";

const FRAME_COUNT = 181;
const framePath = (index: number) =>
  `/frame-hig/ezgif-frame-${String(index + 1).padStart(3, "0")}.png`;

class ScrollFrameCanvas extends Component {
  canvasRef = createRef<HTMLCanvasElement>();
  section: HTMLElement | null = null;
  context: CanvasRenderingContext2D | null = null;
  frames: Array<HTMLImageElement | undefined> = Array(FRAME_COUNT);
  targetFrame = 0;
  currentFrame = 0;
  width = 0;
  height = 0;
  frameRequest = 0;
  lastValidImage: HTMLImageElement | null = null;
  reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  private drawImageCover = (image: HTMLImageElement, alpha = 1) => {
    if (!this.context) return;

    const { context } = this;
    const sourceRatio = image.naturalWidth / image.naturalHeight;
    const canvasRatio = this.width / this.height;
    const drawWidth =
      sourceRatio > canvasRatio ? this.height * sourceRatio : this.width;
    const drawHeight =
      sourceRatio > canvasRatio ? this.height : this.width / sourceRatio;

    context.globalAlpha = alpha;
    context.drawImage(
      image,
      (this.width - drawWidth) / 2,
      (this.height - drawHeight) / 2,
      drawWidth,
      drawHeight,
    );
  };

  private loadFrame = (index: number) => {
    if (index < 0 || index >= FRAME_COUNT || this.frames[index]) return;

    const image = new Image();
    image.decoding = "async";
    image.src = framePath(index);
    image.onload = () => {
      this.paintScene();
    };
    this.frames[index] = image;
  };

  preloadNearbyFrames = (centerIndex: number) => {
    const RANGE = 8;
    for (let i = -RANGE; i <= RANGE; i++) {
      const target = centerIndex + i;
      if (target >= 0 && target < FRAME_COUNT) {
        this.loadFrame(target);
      }
    }
  };

  paintScene = () => {
    if (!this.context) return;

    const { context } = this;
    const lower = Math.floor(this.currentFrame);
    const upper = Math.min(FRAME_COUNT - 1, Math.ceil(this.currentFrame));
    const blend = this.currentFrame - lower;

    const first = this.frames[lower];
    const second = this.frames[upper];

    const isFirstReady = first?.complete;
    const isSecondReady = upper !== lower && second?.complete;

    if (isFirstReady && first) this.lastValidImage = first;
    else if (isSecondReady && second) this.lastValidImage = second;

    if (this.lastValidImage) {
      this.drawImageCover(this.lastValidImage, 1);
    } else {
      context.fillStyle = "#e8eef0";
      context.fillRect(0, 0, this.width, this.height);
    }

    if (isFirstReady && isSecondReady && first && second) {
      this.drawImageCover(first, 1 - blend);
      this.drawImageCover(second, blend);
    }

    context.globalAlpha = 1;
  };

  resize = () => {
    const canvas = this.canvasRef.current;
    if (!canvas || !this.context) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    canvas.width = Math.round(this.width * dpr);
    canvas.height = Math.round(this.height * dpr);
    canvas.style.width = `${this.width}px`;
    canvas.style.height = `${this.height}px`;
    this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.paintScene();
  };

  updateTargetFrame = () => {
    if (!this.section) return;

    if (this.reducedMotion.matches) {
      this.targetFrame = 0;
      return;
    }

    const start = this.section.offsetTop;
    const distance = Math.max(
      this.section.offsetHeight - window.innerHeight,
      1,
    );
    const progress = Math.min(
      1,
      Math.max(0, (window.scrollY - start) / distance),
    );

    this.targetFrame = progress * (FRAME_COUNT - 1);
    this.preloadNearbyFrames(Math.round(this.targetFrame));
  };

  tick = () => {
    this.currentFrame +=
      (this.targetFrame - this.currentFrame) *
      (this.reducedMotion.matches ? 1 : 0.12);

    if (Math.abs(this.targetFrame - this.currentFrame) < 0.002) {
      this.currentFrame = this.targetFrame;
    }

    this.paintScene();
    this.frameRequest = window.requestAnimationFrame(this.tick);
  };

  componentDidMount() {
    const canvas = this.canvasRef.current;
    this.section = canvas?.closest<HTMLElement>(".dreamframe") ?? null;
    if (!canvas || !this.section) return;

    this.context = canvas.getContext("2d", { alpha: false });
    if (!this.context) return;

    this.context.imageSmoothingEnabled = true;
    this.context.imageSmoothingQuality = "high";

    for (let i = 0; i < 15; i++) this.loadFrame(i);

    this.resize();
    this.updateTargetFrame();
    this.tick();

    window.addEventListener("resize", this.resize, { passive: true });
    window.addEventListener("scroll", this.updateTargetFrame, {
      passive: true,
    });
    this.reducedMotion.addEventListener("change", this.updateTargetFrame);
  }

  componentWillUnmount() {
    window.cancelAnimationFrame(this.frameRequest);
    window.removeEventListener("resize", this.resize);
    window.removeEventListener("scroll", this.updateTargetFrame);
    this.reducedMotion.removeEventListener("change", this.updateTargetFrame);
  }

  render() {
    return (
      <div className="scene-layer" aria-hidden="true">
        <canvas ref={this.canvasRef} />
      </div>
    );
  }
}

export default ScrollFrameCanvas;
