import { StartScene } from "./scenes/StartScene"
import { GameScene } from "./scenes/GameScene"
import { ResultsScene } from "./scenes/ResultsScene"
import { initializeRemixSDK, initializeDevelopment } from "./utils/RemixUtils"
import { initializeSDKMock } from "../.remix/mocks/RemixSDKMock"
import GameSettings from "./config/GameSettings"


// Game configuration
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  width: GameSettings.canvas.width,
  height: GameSettings.canvas.height,
  scale: {
    mode: Phaser.Scale.FIT,
    parent: document.body,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GameSettings.canvas.width,
    height: GameSettings.canvas.height,
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
