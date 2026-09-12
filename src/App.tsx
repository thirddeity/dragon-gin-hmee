import { useEffect, useRef } from 'react'
import './App.css'

const FRAME_COUNT = 181
const framePath = (index: number) => `/frames/ezgif-frame-${String(index + 1).padStart(3, '0')}.png`

function ScrollFrameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const section = canvas?.closest<HTMLElement>('.dreamframe')
    if (!canvas || !section) return

    const context = canvas.getContext('2d', { alpha: false })
    if (!context) return
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'

    const frames: Array<HTMLImageElement | undefined> = Array(FRAME_COUNT)
    let targetFrame = 0
    let currentFrame = 0
    let width = 0
    let height = 0
    let frameRequest = 0
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    const drawImageCover = (image: HTMLImageElement, alpha = 1) => {
      const sourceRatio = image.naturalWidth / image.naturalHeight
      const canvasRatio = width / height
      const drawWidth = sourceRatio > canvasRatio ? height * sourceRatio : width
      const drawHeight = sourceRatio > canvasRatio ? height : width / sourceRatio
      context.globalAlpha = alpha
      context.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight)
    }

    const render = () => {
      context.fillStyle = '#16110b'
      context.fillRect(0, 0, width, height)
      const lower = Math.floor(currentFrame)
      const upper = Math.min(FRAME_COUNT - 1, Math.ceil(currentFrame))
      const blend = currentFrame - lower
      const first = frames[lower]
      const second = frames[upper]
      if (first?.complete) drawImageCover(first, 1 - blend)
      if (upper !== lower && second?.complete) drawImageCover(second, blend)
      context.globalAlpha = 1
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      render()
    }

    const updateTargetFrame = () => {
      if (reducedMotion.matches) {
        targetFrame = 0
        return
      }
      const start = section.offsetTop
      const distance = Math.max(section.offsetHeight - window.innerHeight, 1)
      const progress = Math.min(1, Math.max(0, (window.scrollY - start) / distance))
      targetFrame = progress * (FRAME_COUNT - 1)
    }

    const loadFrame = (index: number, onSettled?: () => void) => {
      if (frames[index]) return
      const image = new Image()
      image.decoding = 'async'
      image.src = framePath(index)
      image.onload = () => {
        render()
        onSettled?.()
      }
      image.onerror = () => onSettled?.()
      frames[index] = image
    }

    loadFrame(0)
    let nextFrameToLoad = 1
    let activeLoads = 0
    const preloadFrames = () => {
      while (activeLoads < 4 && nextFrameToLoad < FRAME_COUNT) {
        const frameIndex = nextFrameToLoad
        nextFrameToLoad += 1
        activeLoads += 1
        loadFrame(frameIndex, () => {
          activeLoads -= 1
          preloadFrames()
        })
      }
    }
    const preloadTimer = window.setTimeout(preloadFrames, 80)

    const tick = () => {
      currentFrame += (targetFrame - currentFrame) * (reducedMotion.matches ? 1 : 0.12)
      if (Math.abs(targetFrame - currentFrame) < 0.002) currentFrame = targetFrame
      render()
      frameRequest = window.requestAnimationFrame(tick)
    }

    resize()
    updateTargetFrame()
    tick()
    window.addEventListener('resize', resize, { passive: true })
    window.addEventListener('scroll', updateTargetFrame, { passive: true })
    reducedMotion.addEventListener('change', updateTargetFrame)

    return () => {
      window.cancelAnimationFrame(frameRequest)
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', updateTargetFrame)
      reducedMotion.removeEventListener('change', updateTargetFrame)
      window.clearTimeout(preloadTimer)
    }
  }, [])

  return <div className="scene-layer" aria-hidden="true"><canvas ref={canvasRef} /></div>
}

function App() { return <main className="dreamframe">
  <ScrollFrameCanvas />
  <div className="ui-layer">
    <header className="topbar"><a className="brand" href="#top" aria-label="Dreamframe home"><span className="brand-mark">D</span><span>DREAM<br />FRAME</span></a><nav aria-label="Primary navigation"><a href="#create">Create</a><a href="#gallery">Gallery</a><a href="#styles">Styles</a><a href="#pricing">Pricing</a></nav><a className="login" href="#login">Sign in <span>↗</span></a></header>
    <section className="hero-content" id="top"><p className="eyebrow"><span /> AI IMAGE GENERATOR <span /></p><h1>Dream<br /><em>Frame</em></h1><p className="lede">Where imagination takes form.<br />Craft worlds that linger long after the first glance.</p><a className="create-button" href="#create">Start Creating <span>→</span></a></section>
    <div className="scroll-cue"><span>SCROLL TO EXPLORE</span><b>⌄</b></div>
  </div>
</main> }

export default App
