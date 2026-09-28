import { StartScene } from "./scenes/StartScene"
import { GameScene } from "./scenes/GameScene"
import { ResultsScene } from "./scenes/ResultsScene"
import { initializeRemixSDK, initializeDevelopment } from "./utils/RemixUtils"
import { initializeSDKMock } from "../.remix/mocks/RemixSDKMock"
import GameSettings from "./config/GameSettings"


// Canvas height: Remix's player frame is taller than the game's 2:3 (about 9:16), so a fixed
// 720x1080 canvas letterboxed with bands above and below. Keep the WIDTH at 720 (nothing
// rescales; every scene lays out from the camera size) and grow only the HEIGHT to the frame's
// aspect, so the extra room is more sky. Never shorter than the original 1080; capped so an
// extreme frame can't stretch it absurdly. Wider-than-2:3 frames keep 1080 and letterbox as before.
function canvasHeightForViewport(): number {
  const { width, height } = GameSettings.canvas
  const vw = window.innerWidth, vh = window.innerHeight
  if (!vw || !vh) return height
  return Math.round(Math.min(Math.max(height, width * (vh / vw)), width * 2.2))
}
const CANVAS_HEIGHT = canvasHeightForViewport()

// Game configuration
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  width: GameSettings.canvas.width,
  height: CANVAS_HEIGHT,
  scale: {
    mode: Phaser.Scale.FIT,
    parent: document.body,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GameSettings.canvas.width,
    height: CANVAS_HEIGHT,
  },
  backgroundColor: "#121212",
  scene: [StartScene, GameScene, ResultsScene],
  physics: {
    default: "arcade",
  },
  fps: {
    target: 60,
  },
  pixelArt: false,
  antialias: true,
  render: {
    preserveDrawingBuffer: true,
  },
  loader: {
    baseURL: './',
  },
}

// Wait for fonts to load before starting the game
async function waitForFonts() {
  try {
    await document.fonts.ready
    console.log('[MAIN] Fonts ready event fired')

    // Explicitly load all game fonts - important for mobile
    const fontPromises = [
      document.fonts.load('400 16px "Slackey"'),
      document.fonts.load('400 16px "Joti One"'),
      document.fonts.load('400 16px "Inter"'),
    ]

    await Promise.all(fontPromises)
    console.log('[MAIN] All game fonts loaded')

    // Extra delay for mobile browsers to fully register fonts
    await new Promise(resolve => setTimeout(resolve, 50))
  } catch (error) {
    console.warn('[MAIN] Font loading warning:', error)
    // Longer fallback delay on error
    await new Promise(resolve => setTimeout(resolve, 300))
  }
}

// Initialize the application
async function initializeApp() {
  // Wait for fonts to load first
  await waitForFonts()

  // Initialize SDK mock in development
  if (process.env.NODE_ENV !== 'production') {
    await initializeSDKMock()
  }

  // Create the game instance
  const game = new Phaser.Game(config)

  // Expose game globally for performance plugin
  ;(window as any).game = game

  // Initialize Remix SDK and development features
  game.events.once("ready", () => {
    initializeRemixSDK(game)

    // Initialize development features (only active in dev mode)
    if (process.env.NODE_ENV !== 'production') {
      initializeDevelopment()
    }
  })
}

// Start the application
initializeApp().catch((error) => {
  console.error('[MAIN] Failed to initialize app:', error)
})
