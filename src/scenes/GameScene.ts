import {
  SCORING,
  PHYSICS,
  WORLD,
  calculateScore,
  getPowerFromDrag,
  getAngleFromDrag,
  TossResult
} from '../data/BallTossLogic'

const COLORS = {
  pink: 0xFF10F0,
  blue: 0x00D4FF,
  darkBg: 0x0a0a0a,
  white: 0xFFFFFF,
  yellow: 0xFFE135,
  green: 0x39FF14,
  red: 0xFF4444,
  orange: 0xFF8800,
  gray: 0x3a3a4a
}

type GameState = 'ready' | 'aiming' | 'flying' | 'surfing' | 'stopped'
type CollectibleType = 'bouncePad' | 'rocket' | 'star' | 'bomb' | 'barrier' | 'chips' | 'popcorn'

interface Collectible {
  type: CollectibleType
  x: number
  y: number
  graphics: Phaser.GameObjects.Container
  collected: boolean
  radius: number
}

interface Cloud {
  graphics: Phaser.GameObjects.Graphics
  x: number
  y: number
  speed: number
  size: number
}

interface TrailPoint {
  x: number
  y: number
  alpha: number
}

export class GameScene extends Phaser.Scene {
  // Ball
  private ball!: Phaser.GameObjects.Sprite
  private ballVelocityX: number = 0
  private ballVelocityY: number = 0
  private ballRadius: number = 45

  // State
  private gameState: GameState = 'ready'
  private startTime: number = 0
  private maxDistance: number = 0
  private maxHeight: number = 0

  // Dune surfing
  private isDiving: boolean = false
  private surfHint!: Phaser.GameObjects.Text
  private diveBoostTime: number = 0  // Track how long player has been diving
  private slowTime: number = 0       // Track how long ball has been slow

  // Terrain
  private terrainGraphics!: Phaser.GameObjects.Graphics
  private backgroundGraphics!: Phaser.GameObjects.Graphics
  private lastTerrainX: number = 0
  private distanceMarkers: Set<number> = new Set()

  // Collectibles
  private collectibles: Collectible[] = []
  private lastSpawnX: number = 0
  private starsCollected: number = 0
  private rocketsUsed: number = 0
  private bombsHit: number = 0
  private bouncePadsHit: number = 0
  private chipsCollected: number = 0
  private popcornCollected: number = 0

  // Aiming
  private aimLine!: Phaser.GameObjects.Graphics
  private pullMeter!: Phaser.GameObjects.Graphics
  private pullMeterBg!: Phaser.GameObjects.Graphics

  // UI
  private distanceText!: Phaser.GameObjects.Text
  private starsText!: Phaser.GameObjects.Text
  private instructionText!: Phaser.GameObjects.Text

  // World
  private ballStartX: number = 0
  private ballStartY: number = 0

  // Camera
  private currentZoom: number = 1

  // Visual effects
  private clouds: Cloud[] = []
  private trail: TrailPoint[] = []
  private trailGraphics!: Phaser.GameObjects.Graphics
  private speedLines!: Phaser.GameObjects.Graphics
  private flamesGraphics!: Phaser.GameObjects.Graphics

  // UI Camera (fixed, doesn't move)
  private uiCamera!: Phaser.Cameras.Scene2D.Camera

  constructor() {
    super({ key: 'GameScene' })
  }

  init() {
    this.gameState = 'ready'
    this.maxDistance = 0
    this.maxHeight = 0
    this.ballVelocityX = 0
    this.ballVelocityY = 0
    this.clouds = []
    this.collectibles = []
    this.lastSpawnX = 0
    this.lastTerrainX = 0
    this.starsCollected = 0
    this.rocketsUsed = 0
    this.bombsHit = 0
    this.bouncePadsHit = 0
    this.chipsCollected = 0
    this.popcornCollected = 0
    this.currentZoom = 1
    this.trail = []
    this.isDiving = false
    this.diveBoostTime = 0
    this.slowTime = 0
    this.distanceMarkers = new Set()
  }

  preload() {
    // Load Louie character sprites from Vercel blob
    this.load.image('louie-idle', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/6b07d2de-8a84-4da4-af76-b3c9b3a626a8/Louie%20idle%20yellow-6xFdYDO0R1UqeLl7ZI8r78aFXciYfZ.png')
    this.load.image('louie-bounce', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/6b07d2de-8a84-4da4-af76-b3c9b3a626a8/Louie%20bouncing%20yellow-HaSZ2rAwd5tLyM153EkGL0i5laPJGt.png')

    // Load food collectible sprites from Vercel blob
    this.load.image('taco', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/6b07d2de-8a84-4da4-af76-b3c9b3a626a8/taco-6vu6lQI3D05z2lVxkDNwY66TlFmGZB.png')
    this.load.image('pizza', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/6b07d2de-8a84-4da4-af76-b3c9b3a626a8/Pizza-3qMro3YY7WOPxjkyXDuYbv51RzO0HB.png')
    this.load.image('burger', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/6b07d2de-8a84-4da4-af76-b3c9b3a626a8/Burger-gNRc6fOp2Cu5gg163B7676PtJNjmAg.png')
    this.load.image('egg', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/6b07d2de-8a84-4da4-af76-b3c9b3a626a8/Egg-GMmq1vGhHyrudgdi1xUR0mye91qDcC.png')
    this.load.image('chips', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/6b07d2de-8a84-4da4-af76-b3c9b3a626a8/chips-yCT3LzHWcoIydxPWGolox6QtwGTPep.png')
    this.load.image('popcorn', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/6b07d2de-8a84-4da4-af76-b3c9b3a626a8/Popped_Popcorn-gTQbm1DhSG3Ljh7YbbujYLjgK6D4kZ.png')

    // Load barrier obstacle
    this.load.image('plant', 'https://remix.gg/blob/5033c1b9-c892-434b-a00a-71dc5db6016f/plant-in-game-JlftMGw0T8-94WnidhaibgJLF5aKyVpYWV9pA5ozs.webp')
  }

  create() {
    const { width, height } = this.cameras.main

    this.ballStartX = width / 2
    this.ballStartY = height * 0.35

    this.createBackground()
    this.createClouds()
    this.createCollectibles()  // Create collectibles first (plants will be behind terrain)
    this.terrainGraphics = this.add.graphics()
    this.terrainGraphics.setDepth(10)  // Terrain renders on top of plants
    this.drawTerrain(-500, 5000)

    // Create trail and flames BEFORE ball so they render behind Louie
    this.trailGraphics = this.add.graphics()
    this.trailGraphics.setDepth(20)
    this.flamesGraphics = this.add.graphics()
    this.flamesGraphics.setDepth(21)
    this.createBall()

    // Speed lines on top of ball
    this.speedLines = this.add.graphics()
    this.speedLines.setDepth(30)

    this.createAimingUI()
    this.setupInput()

    this.cameras.main.setBounds(-1000, -8000, 100000, 15000)

    // Create fixed UI camera that doesn't scroll or zoom
    this.uiCamera = this.cameras.add(0, 0, width, height)
    this.uiCamera.setScroll(0, 0)

    // UI camera ignores all game world objects
    this.uiCamera.ignore([
      this.backgroundGraphics,
      this.terrainGraphics,
      this.trailGraphics,
      this.flamesGraphics,
      this.speedLines,
      this.ball,
      this.aimLine,
      this.pullMeter,
      this.pullMeterBg
    ])

    // Ignore clouds
    this.clouds.forEach(cloud => this.uiCamera.ignore(cloud.graphics))

    // Ignore collectibles
    this.collectibles.forEach(c => this.uiCamera.ignore(c.graphics))

    this.createHUD()
  }

  // ==================== TERRAIN SYSTEM ====================

  private getGroundY(x: number): number {
    // Layered sine waves for natural rolling hills
    const baseY = WORLD.GROUND_Y
    const hill1 = Math.sin(x * 0.002) * 180  // Big rolling hills
    const hill2 = Math.sin(x * 0.005) * 100  // Medium hills
    const hill3 = Math.sin(x * 0.015) * 40   // Small bumps
    const hill4 = Math.sin(x * 0.001) * 120  // Very large waves

    return baseY - hill1 - hill2 - hill3 - hill4
  }

  private getGroundAngle(x: number): number {
    // Calculate slope by checking nearby points
    const delta = 5
    const y1 = this.getGroundY(x - delta)
    const y2 = this.getGroundY(x + delta)
    return Math.atan2(y2 - y1, delta * 2)
  }

  private drawTerrain(startX: number, endX: number) {
    // Draw terrain line and fill
    this.terrainGraphics.clear()

    // Ground fill - dark green (extend far down to cover parallax)
    this.terrainGraphics.fillStyle(0x0a1a0a, 1)
    this.terrainGraphics.beginPath()
    this.terrainGraphics.moveTo(startX, WORLD.GROUND_Y + 3000)

    for (let x = startX; x <= endX; x += 15) {
      this.terrainGraphics.lineTo(x, this.getGroundY(x))
    }

    this.terrainGraphics.lineTo(endX, WORLD.GROUND_Y + 3000)
    this.terrainGraphics.closePath()
    this.terrainGraphics.fill()

    // Neon green glow line
    this.terrainGraphics.lineStyle(12, COLORS.green, 0.2)
    this.terrainGraphics.beginPath()
    this.terrainGraphics.moveTo(startX, this.getGroundY(startX))
    for (let x = startX; x <= endX; x += 15) {
      this.terrainGraphics.lineTo(x, this.getGroundY(x))
    }
    this.terrainGraphics.strokePath()

    // Main terrain line
    this.terrainGraphics.lineStyle(4, COLORS.green, 1)
    this.terrainGraphics.beginPath()
    this.terrainGraphics.moveTo(startX, this.getGroundY(startX))
    for (let x = startX; x <= endX; x += 15) {
      this.terrainGraphics.lineTo(x, this.getGroundY(x))
    }
    this.terrainGraphics.strokePath()

    // Distance markers (only create new ones)
    for (let d = 500; d < endX - this.ballStartX; d += 500) {
      if (this.distanceMarkers.has(d)) continue
      const markerX = this.ballStartX + d
      if (markerX > startX && markerX < endX) {
        const markerY = this.getGroundY(markerX)
        const marker = this.add.text(markerX, markerY + 40, `${d}m`, {
          fontFamily: '"Joti One"',
          fontSize: '14px',
          color: '#39FF14'
        })
        marker.setOrigin(0.5)
        marker.setAlpha(0.4)
        // UI camera ignores game world markers
        if (this.uiCamera) this.uiCamera.ignore(marker)
        this.distanceMarkers.add(d)
      }
    }

    this.lastTerrainX = endX
  }

  // ==================== BACKGROUND ====================

  private createBackground() {
    this.backgroundGraphics = this.add.graphics()

    this.backgroundGraphics.fillStyle(0x050510, 1)
    this.backgroundGraphics.fillRect(-2000, -8000, 100000, 18000)

    const gradientColors = [
      { color: 0x1a0a2e, y: -8000 },
      { color: 0x2d1b4e, y: -6000 },
      { color: 0x4a1942, y: -4000 },
      { color: 0x6b2d5c, y: -2500 },
      { color: 0x3d1a4a, y: -1000 },
      { color: 0x1a1a3a, y: 0 },
      { color: 0x0a1a2a, y: 500 },
      { color: 0x0a0a1a, y: 1200 },  // Extended below terrain (GROUND_Y is 900)
    ]

    for (let i = 0; i < gradientColors.length - 1; i++) {
      const from = gradientColors[i]
      const to = gradientColors[i + 1]
      const steps = 60  // Smoother gradient
      const stepHeight = (to.y - from.y) / steps

      for (let s = 0; s < steps; s++) {
        const t = s / steps
        const r = Math.floor(((from.color >> 16) & 0xff) + ((((to.color >> 16) & 0xff) - ((from.color >> 16) & 0xff)) * t))
        const g = Math.floor(((from.color >> 8) & 0xff) + ((((to.color >> 8) & 0xff) - ((from.color >> 8) & 0xff)) * t))
        const b = Math.floor((from.color & 0xff) + (((to.color & 0xff) - (from.color & 0xff)) * t))
        this.backgroundGraphics.fillStyle((r << 16) | (g << 8) | b, 1)
        this.backgroundGraphics.fillRect(-2000, from.y + s * stepHeight, 100000, stepHeight + 2)
      }
    }
  }

  private createClouds() {
    // Large clouds - high in sky
    for (let i = 0; i < 20; i++) {
      const cloud = this.createNeonCloud(
        Math.random() * 50000 - 3000,
        -3500 - Math.random() * 2500,  // High: -3500 to -6000
        0.1 + Math.random() * 0.2,
        150 + Math.random() * 150  // Large: 150-300
      )
      this.clouds.push(cloud)
    }

    // Medium clouds - mid sky
    for (let i = 0; i < 50; i++) {
      const cloud = this.createNeonCloud(
        Math.random() * 45000 - 2000,
        -2000 - Math.random() * 2500,  // Mid: -2000 to -4500
        0.15 + Math.random() * 0.35,
        80 + Math.random() * 100  // Medium: 80-180
      )
      this.clouds.push(cloud)
    }

    // Small accent clouds - scattered
    for (let i = 0; i < 40; i++) {
      const cloud = this.createNeonCloud(
        Math.random() * 40000 - 1000,
        -1000 - Math.random() * 3000,  // Varied: -1000 to -4000
        0.2 + Math.random() * 0.5,
        40 + Math.random() * 60  // Small: 40-100
      )
      this.clouds.push(cloud)
    }
  }

  private createNeonCloud(x: number, y: number, speed: number, size: number): Cloud {
    const graphics = this.add.graphics()

    const neonColors = [COLORS.pink, COLORS.blue, 0x9933FF, 0xFF33AA, 0x33FFFF]
    const cloudColor = neonColors[Math.floor(Math.random() * neonColors.length)]
    const alpha = 0.2 + speed * 0.2

    // Pixelated classic cloud shapes
    const pixelSize = Math.max(8, size / 12)  // Chunky pixels

    // Generate cloud shape pattern - classic fluffy cloud
    const cloudTypes = [
      // Type 0: Wide fluffy cloud
      [
        [0,0,0,1,1,1,1,0,0,0,0,1,1,1,0,0],
        [0,0,1,1,1,1,1,1,0,0,1,1,1,1,1,0],
        [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
        [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
      ],
      // Type 1: Tall puffy cloud
      [
        [0,0,0,1,1,1,0,0,0],
        [0,0,1,1,1,1,1,0,0],
        [0,1,1,1,1,1,1,1,0],
        [0,1,1,1,1,1,1,1,0],
        [1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1],
        [0,1,1,1,1,1,1,1,0],
      ],
      // Type 2: Long stretched cloud
      [
        [0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0],
        [0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
      ],
      // Type 3: Compact fluffy
      [
        [0,0,1,1,1,0,0],
        [0,1,1,1,1,1,0],
        [1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1],
        [0,1,1,1,1,1,0],
      ],
      // Type 4: Extra wide dramatic
      [
        [0,0,0,1,1,0,0,0,0,1,1,1,0,0,0,0,1,1,0,0],
        [0,0,1,1,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1,0],
        [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
      ],
    ]

    const pattern = cloudTypes[Math.floor(Math.random() * cloudTypes.length)]
    const scale = size / 100  // Scale pattern to size

    // Glow layer
    graphics.fillStyle(cloudColor, alpha * 0.25)
    for (let py = 0; py < pattern.length; py++) {
      for (let px = 0; px < pattern[py].length; px++) {
        if (pattern[py][px]) {
          graphics.fillRect(
            x + px * pixelSize * scale - (pattern[0].length * pixelSize * scale) / 2 - pixelSize * 0.3,
            y + py * pixelSize * scale - (pattern.length * pixelSize * scale) / 2 - pixelSize * 0.3,
            pixelSize * scale + pixelSize * 0.6,
            pixelSize * scale + pixelSize * 0.6
          )
        }
      }
    }

    // Main cloud pixels
    graphics.fillStyle(cloudColor, alpha)
    for (let py = 0; py < pattern.length; py++) {
      for (let px = 0; px < pattern[py].length; px++) {
        if (pattern[py][px]) {
          graphics.fillRect(
            x + px * pixelSize * scale - (pattern[0].length * pixelSize * scale) / 2,
            y + py * pixelSize * scale - (pattern.length * pixelSize * scale) / 2,
            pixelSize * scale - 1,
            pixelSize * scale - 1
          )
        }
      }
    }

    return { graphics, x, y, speed, size }
  }

  // ==================== COLLECTIBLES ====================

  private createCollectibles() {
    this.spawnCollectiblesAhead(5000)
  }

  private spawnCollectiblesAhead(untilX: number) {
    const startX = Math.max(this.lastSpawnX, this.ballStartX + 300)

    for (let x = startX; x < untilX; x += 40) {
      // Stars in sky
      if (Math.random() < 0.04) {
        const y = this.getGroundY(x) - 150 - Math.random() * 3500
        this.createCollectible('star', x, y)
      }
      if (Math.random() < 0.025) {
        const y = this.getGroundY(x) - 1500 - Math.random() * 2500
        this.createCollectible('star', x, y)
      }

      // Rockets in sky
      if (Math.random() < 0.015) {
        const y = this.getGroundY(x) - 200 - Math.random() * 2000
        this.createCollectible('rocket', x, y)
      }
      if (Math.random() < 0.01) {
        const y = this.getGroundY(x) - 1500 - Math.random() * 2000
        this.createCollectible('rocket', x, y)
      }

      // Stars ON the hills (follow terrain)
      if (Math.random() < 0.02) {
        const y = this.getGroundY(x) - 50
        this.createCollectible('star', x, y)
      }

      // Bombs on hills (rare)
      if (x > this.lastSpawnX + 500 && Math.random() < 0.004) {
        const y = this.getGroundY(x) - 30
        this.createCollectible('bomb', x, y)
      }

      // Chips in mid-air (common bonus item)
      if (Math.random() < 0.03) {
        const y = this.getGroundY(x) - 100 - Math.random() * 1500
        this.createCollectible('chips', x, y)
      }

      // Popcorn scattered around (common, lower value)
      if (Math.random() < 0.04) {
        const y = this.getGroundY(x) - 80 - Math.random() * 1000
        this.createCollectible('popcorn', x, y)
      }

      // Plant barriers after 3000m distance (randomly placed on ground)
      const distanceFromStart = x - this.ballStartX
      if (distanceFromStart > 3000 && Math.random() < 0.008) {
        const y = this.getGroundY(x) - 60  // Sits on ground
        this.createCollectible('barrier', x, y)
      }
    }

    this.lastSpawnX = untilX
  }

  private createCollectible(type: CollectibleType, x: number, y: number) {
    const container = this.add.container(x, y)

    const spriteConfig: Record<CollectibleType, { key: string; size: number; radius: number }> = {
      bouncePad: { key: 'taco', size: 80, radius: 40 },
      rocket: { key: 'pizza', size: 75, radius: 38 },
      star: { key: 'burger', size: 70, radius: 35 },
      bomb: { key: 'egg', size: 65, radius: 32 },
      barrier: { key: 'plant', size: 150, radius: 60 },
      chips: { key: 'chips', size: 60, radius: 30 },
      popcorn: { key: 'popcorn', size: 55, radius: 28 }
    }

    const config = spriteConfig[type]
    const sprite = this.add.sprite(0, 0, config.key)
    sprite.setDisplaySize(config.size, config.size)

    // Rotate barrier to match ground angle and place behind terrain
    if (type === 'barrier') {
      const groundAngle = this.getGroundAngle(x)
      sprite.setRotation(groundAngle)
      container.setDepth(5)  // Behind terrain (depth 10)
    } else {
      container.setDepth(15)  // Other collectibles above terrain
    }

    container.add(sprite)

    // UI camera should ignore game world objects
    if (this.uiCamera) {
      this.uiCamera.ignore(container)
    }

    this.collectibles.push({ type, x, y, graphics: container, collected: false, radius: config.radius })
  }

  // ==================== BALL & EFFECTS ====================

  private createBall() {
    this.ball = this.add.sprite(this.ballStartX, this.ballStartY, 'louie-idle')
    this.ball.setDisplaySize(100, 100)
    this.ball.setDepth(25)  // Above terrain and collectibles
  }

  private showCollectAnimation() {
    this.ball.setTexture('louie-bounce')
    this.time.delayedCall(250, () => {
      this.ball.setTexture('louie-idle')
    })
  }

  private updateFlames() {
    this.flamesGraphics.clear()

    const speed = Math.sqrt(this.ballVelocityX * this.ballVelocityX + this.ballVelocityY * this.ballVelocityY)

    // Only show flames when moving fast
    if (speed < 300 || this.gameState === 'ready' || this.gameState === 'aiming') return

    const intensity = Math.min(1, (speed - 300) / 1000)
    const flameLength = 30 + intensity * 50

    // Calculate flame direction (opposite of velocity)
    const angle = Math.atan2(this.ballVelocityY, this.ballVelocityX)
    const flameX = this.ball.x - Math.cos(angle) * 35
    const flameY = this.ball.y - Math.sin(angle) * 35

    // Outer glow
    this.flamesGraphics.fillStyle(COLORS.pink, 0.2 * intensity)
    this.flamesGraphics.fillCircle(flameX - Math.cos(angle) * 20, flameY - Math.sin(angle) * 20, 35 * intensity)

    // Main flame triangles
    const perpAngle = angle + Math.PI / 2
    const spread = 15

    // Outer flame
    this.flamesGraphics.fillStyle(COLORS.pink, 0.7 * intensity)
    this.flamesGraphics.fillTriangle(
      this.ball.x - Math.cos(angle) * 30,
      this.ball.y - Math.sin(angle) * 30,
      flameX - Math.cos(angle) * flameLength + Math.cos(perpAngle) * spread,
      flameY - Math.sin(angle) * flameLength + Math.sin(perpAngle) * spread,
      flameX - Math.cos(angle) * flameLength - Math.cos(perpAngle) * spread,
      flameY - Math.sin(angle) * flameLength - Math.sin(perpAngle) * spread
    )

    // Inner bright flame
    this.flamesGraphics.fillStyle(0xFFFFFF, 0.5 * intensity)
    this.flamesGraphics.fillTriangle(
      this.ball.x - Math.cos(angle) * 30,
      this.ball.y - Math.sin(angle) * 30,
      flameX - Math.cos(angle) * (flameLength * 0.6) + Math.cos(perpAngle) * (spread * 0.5),
      flameY - Math.sin(angle) * (flameLength * 0.6) + Math.sin(perpAngle) * (spread * 0.5),
      flameX - Math.cos(angle) * (flameLength * 0.6) - Math.cos(perpAngle) * (spread * 0.5),
      flameY - Math.sin(angle) * (flameLength * 0.6) - Math.sin(perpAngle) * (spread * 0.5)
    )
  }

  private createAimingUI() {
    this.pullMeterBg = this.add.graphics()
    this.pullMeterBg.setVisible(false)
    this.pullMeterBg.setScrollFactor(0)

    this.pullMeter = this.add.graphics()
    this.pullMeter.setVisible(false)
    this.pullMeter.setScrollFactor(0)

    this.aimLine = this.add.graphics()
    this.aimLine.setVisible(false)
  }

  private createHUD() {
    const { width } = this.cameras.main

    this.distanceText = this.add.text(width / 2, 40, '0m', {
      fontFamily: '"Slackey"',
      fontSize: '42px',
      color: '#00D4FF',
      stroke: '#000000',
      strokeThickness: 4
    })
    this.distanceText.setOrigin(0.5)

    this.starsText = this.add.text(width / 2, 88, 'Burgers: 0', {
      fontFamily: '"Inter"',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#FFE135'
    })
    this.starsText.setOrigin(0.5)

    // Surf hint (hidden initially)
    this.surfHint = this.add.text(width / 2, 120, 'HOLD TO DIVE!', {
      fontFamily: '"Slackey"',
      fontSize: '22px',
      color: '#39FF14'
    })
    this.surfHint.setOrigin(0.5)
    this.surfHint.setVisible(false)

    // Make HUD elements only visible on UI camera, not main camera
    this.cameras.main.ignore([this.distanceText, this.starsText, this.surfHint])

    this.instructionText = this.add.text(width / 2, this.ballStartY + 80, 'DRAG & RELEASE TO TOSS', {
      fontFamily: '"Joti One"',
      fontSize: '22px',
      color: '#39FF14'
    })
    this.instructionText.setOrigin(0.5)
    // NO setScrollFactor - UI camera handles this

    // Main camera ignores instruction text too
    this.cameras.main.ignore(this.instructionText)

    this.tweens.add({
      targets: this.instructionText,
      alpha: 0.5,
      duration: 800,
      yoyo: true,
      repeat: -1
    })
  }

  // ==================== INPUT ====================

  private setupInput() {
    this.input.on('pointerdown', this.onPointerDown, this)
    this.input.on('pointermove', this.onPointerMove, this)
    this.input.on('pointerup', this.onPointerUp, this)
  }

  private onPointerDown(pointer: Phaser.Input.Pointer) {
    if (this.gameState === 'ready') {
      this.gameState = 'aiming'
      this.instructionText.setVisible(false)
      this.pullMeterBg.setVisible(true)
      this.pullMeter.setVisible(true)
      this.aimLine.setVisible(true)
      this.drawPullMeterBg()
      this.updateAiming(pointer)
    } else if (this.gameState === 'surfing' || this.gameState === 'flying') {
      // Dune dive mechanic
      this.isDiving = true
    }
  }

  private onPointerUp(pointer: Phaser.Input.Pointer) {
    if (this.gameState === 'aiming') {
      const { width, height } = this.cameras.main
      const centerX = width / 2
      const centerY = height * 0.35

      const dx = centerX - pointer.x
      const dy = centerY - pointer.y
      const dragDistance = Math.sqrt(dx * dx + dy * dy)

      if (dragDistance < 25) {
        this.gameState = 'ready'
        this.aimLine.setVisible(false)
        this.pullMeter.setVisible(false)
        this.pullMeterBg.setVisible(false)
        this.instructionText.setVisible(true)
        return
      }

      // Launch!
      const maxDrag = 150
      const power = getPowerFromDrag(dragDistance, maxDrag)
      let angle = getAngleFromDrag(centerX, centerY, pointer.x, pointer.y)

      // Clamp angle to only allow forward-right directions
      // Range: -75 degrees (up-right) to 30 degrees (slightly down-right)
      const minAngle = -1.31  // -75 degrees
      const maxAngle = 0.52   // 30 degrees
      angle = Math.max(minAngle, Math.min(maxAngle, angle))

      this.ballVelocityX = Math.cos(angle) * power
      this.ballVelocityY = Math.sin(angle) * power

      this.gameState = 'flying'
      this.startTime = Date.now()
      this.aimLine.setVisible(false)
      this.pullMeter.setVisible(false)
      this.pullMeterBg.setVisible(false)

      this.cameras.main.shake(150, 0.015)
    }

    // Release dive
    this.isDiving = false
  }

  private onPointerMove(pointer: Phaser.Input.Pointer) {
    if (this.gameState === 'aiming') {
      this.updateAiming(pointer)
    }
  }

  private drawPullMeterBg() {
    const { width, height } = this.cameras.main
    const centerX = width / 2
    const centerY = height * 0.35

    this.pullMeterBg.clear()
    this.pullMeterBg.lineStyle(14, 0x1a1a2a, 0.9)
    this.pullMeterBg.strokeCircle(centerX, centerY, 70)
    this.pullMeterBg.lineStyle(2, COLORS.blue, 0.5)
    this.pullMeterBg.strokeCircle(centerX, centerY, 70)
  }

  private updateAiming(pointer: Phaser.Input.Pointer) {
    const { width, height } = this.cameras.main
    const centerX = width / 2
    const centerY = height * 0.35

    const dx = centerX - pointer.x
    const dy = centerY - pointer.y
    const dragDistance = Math.sqrt(dx * dx + dy * dy)
    const maxDrag = 150
    const powerPercent = Math.min(dragDistance / maxDrag, 1)

    this.pullMeter.clear()
    let meterColor = COLORS.green
    if (powerPercent > 0.7) meterColor = 0xFF4444
    else if (powerPercent > 0.4) meterColor = COLORS.yellow

    this.pullMeter.lineStyle(12, meterColor, 1)
    const startAngle = -Math.PI / 2
    const endAngle = startAngle + (Math.PI * 2 * powerPercent)
    this.pullMeter.beginPath()
    this.pullMeter.arc(centerX, centerY, 70, startAngle, endAngle, false)
    this.pullMeter.strokePath()

    this.aimLine.clear()
    if (dragDistance > 15) {
      const power = getPowerFromDrag(dragDistance, maxDrag)
      let angle = getAngleFromDrag(centerX, centerY, pointer.x, pointer.y)

      // Clamp angle to only allow forward-right directions (same as launch)
      const minAngle = -1.31  // -75 degrees
      const maxAngle = 0.52   // 30 degrees
      angle = Math.max(minAngle, Math.min(maxAngle, angle))

      this.aimLine.lineStyle(3, COLORS.pink, 0.8)
      let previewX = this.ball.x
      let previewY = this.ball.y
      let previewVX = Math.cos(angle) * power * 0.4
      let previewVY = Math.sin(angle) * power * 0.4

      this.aimLine.moveTo(previewX, previewY)
      for (let i = 0; i < 50; i++) {
        const nextX = previewX + previewVX * 0.04
        const nextY = previewY + previewVY * 0.04
        previewVY += PHYSICS.GRAVITY * 0.04
        if (i % 3 < 2) this.aimLine.lineTo(nextX, nextY)
        else this.aimLine.moveTo(nextX, nextY)
        previewX = nextX
        previewY = nextY
        if (previewY > this.getGroundY(previewX)) break
      }
      this.aimLine.strokePath()
    }
  }

  // ==================== UPDATE LOOP ====================

  update(time: number, delta: number) {
    const dt = delta / 1000

    if (this.gameState === 'flying') {
      this.updateFlying(dt)
    } else if (this.gameState === 'surfing') {
      this.updateSurfing(dt)
    }

    this.updateClouds()
  }

  private updateFlying(dt: number) {
    // Gravity
    this.ballVelocityY += PHYSICS.GRAVITY * dt

    // Dive mechanic - hold to dive down faster in air
    if (this.isDiving) {
      this.ballVelocityY += 3000 * dt  // Intense downward force
      this.surfHint.setVisible(true)
      this.surfHint.setText('DIVING...')
      this.surfHint.setColor('#FF10F0')
    } else {
      this.surfHint.setVisible(false)
    }

    // Air resistance (frame-rate independent)
    const airDamping = Math.pow(0.9995, dt * 60)
    this.ballVelocityX *= airDamping
    this.ballVelocityY *= airDamping

    // Move ball
    this.ball.x += this.ballVelocityX * dt
    this.ball.y += this.ballVelocityY * dt

    // Check collectibles
    this.checkCollectibleCollisions()

    // Ground collision - transition to surfing
    const groundY = this.getGroundY(this.ball.x)
    if (this.ball.y >= groundY - this.ballRadius) {
      this.ball.y = groundY - this.ballRadius
      this.gameState = 'surfing'
      this.surfHint.setVisible(true)

      // Convert vertical velocity based on slope
      const angle = this.getGroundAngle(this.ball.x)
      const speed = Math.sqrt(this.ballVelocityX * this.ballVelocityX + this.ballVelocityY * this.ballVelocityY)

      // Redirect velocity along slope
      this.ballVelocityX = Math.cos(angle) * speed * 0.8
      this.ballVelocityY = Math.sin(angle) * speed * 0.8

      this.cameras.main.shake(50, 0.005)
    }

    this.updateStats()
    this.updateCamera(dt)
    this.updateFlames()
    this.updateTrail()
    this.updateSpeedLines()
    this.extendWorld()
  }

  private updateSurfing(dt: number) {
    const groundY = this.getGroundY(this.ball.x)
    const groundAngle = this.getGroundAngle(this.ball.x)

    // Gravity pulls ball down
    this.ballVelocityY += PHYSICS.GRAVITY * 0.6 * dt

    // Dive mechanic - hold to push down into slopes
    if (this.isDiving) {
      this.ballVelocityY += 2500 * dt  // Intense downward force
      this.surfHint.setText('DIVING...')
      this.surfHint.setColor('#FF10F0')
    } else {
      this.surfHint.setText('HOLD TO DIVE!')
      this.surfHint.setColor('#39FF14')
    }

    // Slope physics
    const slopeForce = Math.sin(groundAngle) * 1500
    this.ballVelocityX += slopeForce * dt

    // Friction (frame-rate independent)
    const friction = Math.pow(0.995, dt * 60)
    this.ballVelocityX *= friction
    this.ballVelocityY *= friction

    // Move ball
    this.ball.x += this.ballVelocityX * dt
    this.ball.y += this.ballVelocityY * dt

    // Keep ball on ground
    const newGroundY = this.getGroundY(this.ball.x)
    if (this.ball.y >= newGroundY - this.ballRadius) {
      this.ball.y = newGroundY - this.ballRadius

      // Launch off steep uphill!
      const speed = Math.abs(this.ballVelocityX)
      if (groundAngle < -0.25 && speed > 300) {
        // Going uphill fast - LAUNCH!
        this.ballVelocityY = -speed * 0.7 - 200
        this.ballVelocityX *= 0.9
        this.gameState = 'flying'
        this.surfHint.setVisible(false)
        this.cameras.main.shake(100, 0.01)
        this.showLaunchEffect()
      }
    } else {
      // Ball is in air - switch to flying
      this.gameState = 'flying'
      this.surfHint.setVisible(false)
    }

    // Check collectibles
    this.checkCollectibleCollisions()

    // Check if stopped - die quickly when not making forward progress
    const hSpeed = Math.abs(this.ballVelocityX)
    const totalSpeed = Math.sqrt(this.ballVelocityX * this.ballVelocityX + this.ballVelocityY * this.ballVelocityY)

    // Dead immediately if barely moving at all
    if (totalSpeed < 80) {
      this.gameState = 'stopped'
      this.surfHint.setVisible(false)
      this.endGame()
      return
    }

    // Dead quickly if no forward momentum
    if (hSpeed < 120) {
      this.slowTime += dt
      if (this.slowTime > 0.15) {  // 150ms - very quick
        this.gameState = 'stopped'
        this.surfHint.setVisible(false)
        this.endGame()
      }
    } else {
      this.slowTime = 0
    }

    this.updateStats()
    this.updateCamera(dt)
    this.updateFlames()
    this.updateTrail()
    this.updateSpeedLines()
    this.extendWorld()
  }

  private showLaunchEffect() {
    const popup = this.add.text(this.ball.x, this.ball.y - 50, 'LAUNCH!', {
      fontFamily: '"Joti One"',
      fontSize: '32px',
      color: '#39FF14',
      stroke: '#000000',
      strokeThickness: 3
    })
    popup.setOrigin(0.5)
    // UI camera ignores game world popups
    if (this.uiCamera) this.uiCamera.ignore(popup)
    this.tweens.add({
      targets: popup,
      y: popup.y - 60,
      alpha: 0,
      duration: 600,
      onComplete: () => popup.destroy()
    })
  }

  private checkCollectibleCollisions() {
    for (const item of this.collectibles) {
      if (item.collected) continue

      const dx = this.ball.x - item.x
      const dy = this.ball.y - item.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < this.ballRadius + item.radius) {
        item.collected = true
        item.graphics.setVisible(false)
        this.showCollectAnimation()

        switch (item.type) {
          case 'bouncePad':
            this.bouncePadsHit++
            this.ballVelocityY = -Math.abs(this.ballVelocityY) - 800
            this.ballVelocityX *= 1.1
            this.showImpactEffect(item.x, item.y, COLORS.green, 'BOING!')
            this.cameras.main.shake(100, 0.01)
            this.gameState = 'flying'
            this.surfHint.setVisible(false)
            break

          case 'rocket':
            this.rocketsUsed++
            this.ballVelocityX += 600
            this.ballVelocityY -= 200
            this.showImpactEffect(item.x, item.y, COLORS.orange, 'BOOST!')
            this.cameras.main.shake(80, 0.008)
            break

          case 'star':
            this.starsCollected++
            this.showImpactEffect(item.x, item.y, COLORS.yellow, '+500')
            break

          case 'bomb':
            this.bombsHit++
            this.ballVelocityX += 400
            this.ballVelocityY = -1200
            this.showImpactEffect(item.x, item.y, COLORS.red, 'BOOM!')
            this.cameras.main.shake(200, 0.03)
            this.gameState = 'flying'
            this.surfHint.setVisible(false)
            break

          case 'chips':
            this.chipsCollected++
            this.showImpactEffect(item.x, item.y, COLORS.orange, '+300')
            break

          case 'popcorn':
            this.popcornCollected++
            this.showImpactEffect(item.x, item.y, COLORS.white, '+150')
            break

          case 'barrier':
            // Plant barrier stops the player!
            this.ballVelocityX = 0
            this.ballVelocityY = 0
            this.showImpactEffect(item.x, item.y, 0x00FF00, 'BLOCKED!')
            this.cameras.main.shake(300, 0.04)
            this.gameState = 'stopped'
            this.surfHint.setVisible(false)
            this.endGame()
            return  // Exit early since game is over
        }
      }
    }
  }

  private showImpactEffect(x: number, y: number, color: number, text: string) {
    const popup = this.add.text(x, y - 30, text, {
      fontFamily: '"Joti One"',
      fontSize: '28px',
      color: '#' + color.toString(16).padStart(6, '0'),
      stroke: '#000000',
      strokeThickness: 3
    })
    popup.setOrigin(0.5)
    // UI camera ignores game world popups
    if (this.uiCamera) this.uiCamera.ignore(popup)
    this.tweens.add({
      targets: popup,
      y: y - 80,
      alpha: 0,
      duration: 600,
      onComplete: () => popup.destroy()
    })
  }

  private updateStats() {
    const distance = Math.max(0, this.ball.x - this.ballStartX)
    this.maxDistance = Math.max(this.maxDistance, distance)
    const currentHeight = this.getGroundY(this.ball.x) - this.ball.y
    this.maxHeight = Math.max(this.maxHeight, currentHeight)

    this.distanceText.setText(`${Math.floor(this.maxDistance)}m`)
    this.starsText.setText(`Burgers: ${this.starsCollected}`)
  }

  private updateCamera(dt: number = 1/60) {
    const { width, height } = this.cameras.main

    const targetX = this.ball.x - width / 2
    const targetY = Math.min(this.ball.y - height / 2, this.getGroundY(this.ball.x) - height + 150)

    // Frame-rate independent camera smoothing
    const lerpX = 1 - Math.pow(0.00001, dt)  // ~0.1 at 60fps
    const lerpY = 1 - Math.pow(0.0001, dt)   // ~0.08 at 60fps
    this.cameras.main.scrollX = Phaser.Math.Linear(this.cameras.main.scrollX, targetX, lerpX)
    this.cameras.main.scrollY = Phaser.Math.Linear(this.cameras.main.scrollY, targetY, lerpY)

    // Zoom based on height - higher = zoom out more
    const currentHeight = this.getGroundY(this.ball.x) - this.ball.y
    const heightZoom = Math.max(0.3, 1.0 - currentHeight / 3000)  // Zoom out up to 0.3 at 2100m+

    // Also factor in speed slightly
    const speed = Math.sqrt(this.ballVelocityX * this.ballVelocityX + this.ballVelocityY * this.ballVelocityY)
    const speedZoom = Math.max(0.7, 1.0 - speed / 5000)

    // Use the smaller zoom (more zoomed out) for high altitude
    let targetZoom = Math.min(heightZoom, speedZoom)

    // When close to ground, zoom IN for better dive visibility (up to 1.15x)
    if (currentHeight < 250 && this.gameState !== 'ready' && this.gameState !== 'aiming') {
      const closeBonus = (1 - currentHeight / 250) * 0.15
      targetZoom = Math.min(1.15, targetZoom + closeBonus)
    }

    // Frame-rate independent zoom smoothing
    const zoomLerp = 1 - Math.pow(0.001, dt)  // ~0.05 at 60fps
    this.currentZoom = Phaser.Math.Linear(this.currentZoom, targetZoom, zoomLerp)
    this.cameras.main.setZoom(this.currentZoom)
  }

  private updateTrail() {
    this.trail.push({ x: this.ball.x, y: this.ball.y, alpha: 1 })
    if (this.trail.length > 25) this.trail.shift()

    this.trailGraphics.clear()

    const speed = Math.sqrt(this.ballVelocityX * this.ballVelocityX + this.ballVelocityY * this.ballVelocityY)
    const trailColor = this.isDiving ? COLORS.blue : COLORS.pink

    // Only draw trail points that are far enough from the ball (avoid showing through sprite)
    const minDistFromBall = 60

    for (let i = 0; i < this.trail.length - 3; i++) {  // Skip last 3 points (too close)
      const point = this.trail[i]
      const dx = point.x - this.ball.x
      const dy = point.y - this.ball.y
      const distFromBall = Math.sqrt(dx * dx + dy * dy)

      if (distFromBall < minDistFromBall) continue  // Skip points too close to ball

      point.alpha *= 0.85
      const size = 4 + (i / this.trail.length) * 14
      this.trailGraphics.fillStyle(trailColor, point.alpha * 0.4)
      this.trailGraphics.fillCircle(point.x, point.y, size)
    }
  }

  private updateSpeedLines() {
    this.speedLines.clear()
    const speed = Math.sqrt(this.ballVelocityX * this.ballVelocityX + this.ballVelocityY * this.ballVelocityY)

    if (speed > 600) {
      const intensity = Math.min(1, (speed - 600) / 1200)
      this.speedLines.lineStyle(2, this.isDiving ? COLORS.blue : COLORS.pink, intensity * 0.6)

      for (let i = 0; i < 10; i++) {
        const angle = Math.atan2(this.ballVelocityY, this.ballVelocityX) + Math.PI
        const spread = (Math.random() - 0.5) * 1.0
        const len = 40 + Math.random() * 60 * intensity

        const startX = this.ball.x + Math.cos(angle + spread) * 35
        const startY = this.ball.y + Math.sin(angle + spread) * 35

        this.speedLines.moveTo(startX, startY)
        this.speedLines.lineTo(startX + Math.cos(angle + spread) * len, startY + Math.sin(angle + spread) * len)
      }
      this.speedLines.strokePath()
    }
  }

  private updateClouds() {
    const cameraX = this.cameras.main.scrollX
    const cameraY = this.cameras.main.scrollY

    for (const cloud of this.clouds) {
      cloud.graphics.x = -cameraX * cloud.speed * 0.3
      cloud.graphics.y = -cameraY * cloud.speed * 0.2
    }
  }

  private extendWorld() {
    // Redraw terrain around camera view (not just extending)
    const cameraX = this.cameras.main.scrollX
    const viewWidth = this.cameras.main.width / this.currentZoom
    const drawStart = Math.max(-500, cameraX - 500)
    const drawEnd = Math.max(this.ball.x + 3000, cameraX + viewWidth + 2000)

    if (drawEnd > this.lastTerrainX - 1000) {
      this.drawTerrain(drawStart, drawEnd)
    }

    // Spawn more collectibles
    if (this.ball.x > this.lastSpawnX - 2000) {
      this.spawnCollectiblesAhead(this.lastSpawnX + 5000)
    }
  }

  private endGame() {
    const airTime = Date.now() - this.startTime
    const result = calculateScore(
      this.maxDistance,
      airTime,
      this.starsCollected,
      this.rocketsUsed,
      this.bombsHit,
      this.bouncePadsHit,
      this.maxHeight,
      this.chipsCollected,
      this.popcornCollected
    )

    this.time.delayedCall(800, () => {
      this.scene.start('ResultsScene', result)
    })
  }
}
