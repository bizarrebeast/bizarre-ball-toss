// Cyberpunk color palette
const COLORS = {
  pink: '#FF10F0',
  pinkHex: 0xFF10F0,
  blue: '#00D4FF',
  blueHex: 0x00D4FF,
  darkBg: '#0a0a0a',
  darkCard: '#1a1a2a',
  white: '#FFFFFF',
  gray: '#D1D5DB',
  yellow: '#FFE135',
  yellowHex: 0xFFE135,
  green: '#39FF14',
  greenHex: 0x39FF14
}

export class StartScene extends Phaser.Scene {
  private clouds: { graphics: Phaser.GameObjects.Graphics; x: number; y: number; speed: number }[] = []

  constructor() {
    super({ key: 'StartScene' })
  }

  init() {
    this.clouds = []
  }

  preload() {
    this.createGradientTextures()

    // Load character and food sprites from Vercel blob
    this.load.image('louie-idle', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/6b07d2de-8a84-4da4-af76-b3c9b3a626a8/Louie%20idle%20yellow-6xFdYDO0R1UqeLl7ZI8r78aFXciYfZ.png')
    this.load.image('burger', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/6b07d2de-8a84-4da4-af76-b3c9b3a626a8/Burger-gNRc6fOp2Cu5gg163B7676PtJNjmAg.png')
    this.load.image('pizza', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/6b07d2de-8a84-4da4-af76-b3c9b3a626a8/Pizza-3qMro3YY7WOPxjkyXDuYbv51RzO0HB.png')
    this.load.image('taco', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/6b07d2de-8a84-4da4-af76-b3c9b3a626a8/taco-6vu6lQI3D05z2lVxkDNwY66TlFmGZB.png')
    this.load.image('egg', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/6b07d2de-8a84-4da4-af76-b3c9b3a626a8/Egg-GMmq1vGhHyrudgdi1xUR0mye91qDcC.png')
  }

  private createGradientTextures() {
    this.createGradientTexture('gradientBtn', 280, 70)
    // Title now uses yellow color, not gradient
  }

  private createGradientTexture(key: string, w: number, h: number) {
    if (this.textures.exists(key)) {
      this.textures.remove(key)
    }

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')!

    const gradient = ctx.createLinearGradient(0, 0, w, 0)
    gradient.addColorStop(0, COLORS.pink)
    gradient.addColorStop(1, COLORS.blue)

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, w, h)

    this.textures.addCanvas(key, canvas)
  }

  private createGradientTextTexture(key: string, text: string, fontSize: number, fontFamily: string = '"Joti One"') {
    if (this.textures.exists(key)) {
      this.textures.remove(key)
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    ctx.font = `${fontSize}px ${fontFamily}`
    const metrics = ctx.measureText(text)
    const w = Math.ceil(metrics.width) + 30
    const h = Math.ceil(fontSize * 1.6)

    canvas.width = w
    canvas.height = h

    const gradient = ctx.createLinearGradient(0, 0, w, 0)
    gradient.addColorStop(0, COLORS.pink)
    gradient.addColorStop(1, COLORS.blue)

    ctx.font = `${fontSize}px ${fontFamily}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 5
    ctx.strokeText(text, w / 2, h / 2)

    ctx.fillStyle = gradient
    ctx.fillText(text, w / 2, h / 2)

    this.textures.addCanvas(key, canvas)
  }

  create() {
    this.createSkyBackground()
    this.createClouds()
    this.createTerrain()
    this.createFloatingFood()
    this.createTitle()
    this.createInstructions()
    this.createPlayButton()
    this.createBranding()
  }

  private createSkyBackground() {
    const { width, height } = this.cameras.main
    const bg = this.add.graphics()

    // Deep space at top
    bg.fillStyle(0x050510, 1)
    bg.fillRect(0, 0, width, height)

    // Gradient sky bands
    const colors = [
      { y: 0, color: 0x050510 },      // Deep purple/black
      { y: 0.2, color: 0x1a0a2a },    // Dark purple
      { y: 0.4, color: 0x2a1040 },    // Purple
      { y: 0.6, color: 0x401050 },    // Magenta
      { y: 0.75, color: 0x601060 },   // Pink-magenta
      { y: 0.9, color: 0x102030 },    // Dark teal (horizon)
    ]

    for (let i = 0; i < colors.length - 1; i++) {
      const from = colors[i]
      const to = colors[i + 1]
      const steps = 20

      for (let s = 0; s < steps; s++) {
        const t = s / steps
        const y = (from.y + t * (to.y - from.y)) * height
        const stepHeight = ((to.y - from.y) / steps) * height

        const r1 = (from.color >> 16) & 0xff
        const g1 = (from.color >> 8) & 0xff
        const b1 = from.color & 0xff
        const r2 = (to.color >> 16) & 0xff
        const g2 = (to.color >> 8) & 0xff
        const b2 = to.color & 0xff

        const r = Math.floor(r1 + t * (r2 - r1))
        const g = Math.floor(g1 + t * (g2 - g1))
        const b = Math.floor(b1 + t * (b2 - b1))
        const color = (r << 16) | (g << 8) | b

        bg.fillStyle(color, 1)
        bg.fillRect(0, y, width, stepHeight + 2)
      }
    }
  }

  private createClouds() {
    const { width, height } = this.cameras.main

    // Balanced pixelated clouds for start screen - kept in upper portion
    const cloudPositions = [
      // Top row - medium clouds
      { x: width * 0.10, y: height * 0.05, size: 80, color: COLORS.pinkHex, type: 0 },
      { x: width * 0.55, y: height * 0.03, size: 70, color: 0x9933FF, type: 3 },
      { x: width * 0.88, y: height * 0.04, size: 90, color: COLORS.blueHex, type: 2 },

      // Second row - varied sizes
      { x: width * 0.30, y: height * 0.12, size: 65, color: 0x00FFFF, type: 1 },
      { x: width * 0.72, y: height * 0.10, size: 75, color: COLORS.pinkHex, type: 0 },

      // Third row - smaller accent clouds
      { x: width * 0.05, y: height * 0.18, size: 50, color: 0x33FFFF, type: 3 },
      { x: width * 0.48, y: height * 0.20, size: 55, color: 0xFF33AA, type: 2 },
      { x: width * 0.95, y: height * 0.16, size: 45, color: 0x9933FF, type: 1 },
    ]

    cloudPositions.forEach(pos => {
      const cloud = this.createNeonCloud(pos.x, pos.y, 0.3, pos.size, pos.color, pos.type)
      this.clouds.push(cloud)
    })
  }

  private createNeonCloud(x: number, y: number, speed: number, size: number, color: number, cloudType?: number) {
    const graphics = this.add.graphics()
    const alpha = 0.4

    // Pixelated classic cloud shapes
    const pixelSize = Math.max(6, size / 14)

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

    const pattern = cloudTypes[cloudType !== undefined ? cloudType : Math.floor(Math.random() * cloudTypes.length)]
    const scale = size / 100

    // Glow layer
    graphics.fillStyle(color, alpha * 0.3)
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
    graphics.fillStyle(color, alpha)
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

    return { graphics, x, y, speed }
  }

  private createTerrain() {
    const { width, height } = this.cameras.main
    const terrain = this.add.graphics()
    const groundY = height * 0.85

    // Generate hills
    const getGroundY = (x: number): number => {
      const hill1 = Math.sin(x * 0.005) * 40
      const hill2 = Math.sin(x * 0.01) * 25
      const hill3 = Math.sin(x * 0.02) * 15
      return groundY - hill1 - hill2 - hill3
    }

    // Ground fill
    terrain.fillStyle(0x0a1a0a, 1)
    terrain.beginPath()
    terrain.moveTo(0, height)
    for (let x = 0; x <= width; x += 10) {
      terrain.lineTo(x, getGroundY(x))
    }
    terrain.lineTo(width, height)
    terrain.closePath()
    terrain.fill()

    // Neon glow line
    terrain.lineStyle(8, COLORS.greenHex, 0.2)
    terrain.beginPath()
    terrain.moveTo(0, getGroundY(0))
    for (let x = 0; x <= width; x += 10) {
      terrain.lineTo(x, getGroundY(x))
    }
    terrain.strokePath()

    // Main terrain line
    terrain.lineStyle(3, COLORS.greenHex, 1)
    terrain.beginPath()
    terrain.moveTo(0, getGroundY(0))
    for (let x = 0; x <= width; x += 10) {
      terrain.lineTo(x, getGroundY(x))
    }
    terrain.strokePath()
  }

  private createFloatingFood() {
    const { width, height } = this.cameras.main

    // Organized food positions - balanced on both sides
    const foodItems = [
      // Left side - descending
      { x: width * 0.12, y: height * 0.14, size: 55, key: 'burger', rotation: -8 },
      { x: width * 0.08, y: height * 0.38, size: 50, key: 'pizza', rotation: 12 },

      // Right side - descending
      { x: width * 0.88, y: height * 0.12, size: 52, key: 'taco', rotation: 10 },
      { x: width * 0.92, y: height * 0.35, size: 48, key: 'egg', rotation: -6 },

      // Near Louie on terrain
      { x: width * 0.22, y: height * 0.68, size: 45, key: 'pizza', rotation: 5 },
      { x: width * 0.78, y: height * 0.70, size: 42, key: 'burger', rotation: -10 },
    ]

    foodItems.forEach((item, i) => {
      const food = this.add.sprite(item.x, item.y, item.key)
      food.setDisplaySize(item.size, item.size)
      food.setAlpha(0.75)
      food.setAngle(item.rotation)

      // Gentle float animation - staggered timing
      this.tweens.add({
        targets: food,
        y: item.y - 12,
        duration: 1800 + i * 200,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
        delay: i * 150
      })

      // Subtle rotation wiggle
      this.tweens.add({
        targets: food,
        angle: item.rotation + 8,
        duration: 2200 + i * 150,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
        delay: i * 100
      })
    })
  }

  private createTitle() {
    const { width, height } = this.cameras.main

    // Yellow title with black stroke - same yellow as Louie
    const titleMain = this.add.text(width / 2, height * 0.10, "LOUIE'S", {
      fontFamily: '"Slackey"',
      fontSize: '58px',
      color: '#FFDD00',
      stroke: '#000000',
      strokeThickness: 8
    })
    titleMain.setOrigin(0.5)

    const titleSub = this.add.text(width / 2, height * 0.17, 'FOOD FLING', {
      fontFamily: '"Slackey"',
      fontSize: '52px',
      color: '#FFDD00',
      stroke: '#000000',
      strokeThickness: 7
    })
    titleSub.setOrigin(0.5)

    // Floating animation
    this.tweens.add({
      targets: [titleMain, titleSub],
      y: '-=5',
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    })

    // Louie character sprite on the terrain
    const louie = this.add.sprite(width / 2, height * 0.72, 'louie-idle')
    louie.setDisplaySize(140, 140)

    // Bounce animation on Louie
    this.tweens.add({
      targets: louie,
      y: louie.y - 30,
      duration: 700,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    })

    // Slight rotation wiggle
    this.tweens.add({
      targets: louie,
      angle: 10,
      duration: 350,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    })
  }

  private createInstructions() {
    const { width, height } = this.cameras.main
    const cardY = height * 0.48
    const cardW = 400
    const cardH = 200
    const borderWidth = 3

    // Card background with transparency
    const cardBg = this.add.graphics()
    cardBg.fillStyle(0x1a1a2a, 0.92)
    cardBg.fillRoundedRect(
      width / 2 - cardW / 2,
      cardY - cardH / 2,
      cardW,
      cardH,
      16
    )
    cardBg.lineStyle(borderWidth, 0x00D4FF, 1)
    cardBg.strokeRoundedRect(width / 2 - cardW / 2, cardY - cardH / 2, cardW, cardH, 16)

    // Instructions header
    const instructions = this.add.text(width / 2, cardY - 68, 'HOW TO PLAY', {
      fontFamily: '"Slackey"',
      fontSize: '24px',
      color: COLORS.blue
    })
    instructions.setOrigin(0.5)

    const step1 = this.add.text(width / 2, cardY - 28, 'Drag back & release to FLING!', {
      fontFamily: '"Slackey"',
      fontSize: '18px',
      color: COLORS.white
    })
    step1.setOrigin(0.5)

    const step2 = this.add.text(width / 2, cardY + 6, 'Collect food for boosts & points', {
      fontFamily: '"Slackey"',
      fontSize: '18px',
      color: COLORS.yellow
    })
    step2.setOrigin(0.5)

    const step3 = this.add.text(width / 2, cardY + 40, 'HOLD to dive down the hills', {
      fontFamily: '"Slackey"',
      fontSize: '18px',
      color: COLORS.pink
    })
    step3.setOrigin(0.5)

    const step4 = this.add.text(width / 2, cardY + 72, 'Build speed & launch off ramps!', {
      fontFamily: '"Slackey"',
      fontSize: '16px',
      color: COLORS.green
    })
    step4.setOrigin(0.5)
  }

  private createPlayButton() {
    const { width, height } = this.cameras.main
    const buttonY = height * 0.92
    const btnW = 280
    const btnH = 65

    const buttonBg = this.add.image(width / 2, buttonY, 'gradientBtn')

    const maskGraphics = this.make.graphics({ add: false })
    maskGraphics.fillStyle(0xffffff)
    maskGraphics.fillRoundedRect(width / 2 - btnW / 2, buttonY - btnH / 2, btnW, btnH, 20)
    buttonBg.setMask(maskGraphics.createGeometryMask())

    const buttonText = this.add.text(width / 2, buttonY, 'FLING!', {
      fontFamily: '"Slackey"',
      fontSize: '40px',
      color: '#0a0a0a'
    })
    buttonText.setOrigin(0.5)

    const hitArea = this.add.rectangle(width / 2, buttonY, btnW, btnH, 0x000000, 0)
    hitArea.setInteractive({ useHandCursor: true })

    hitArea.on('pointerover', () => {
      this.tweens.add({ targets: buttonText, scale: 1.1, duration: 100 })
    })

    hitArea.on('pointerout', () => {
      this.tweens.add({ targets: buttonText, scale: 1, duration: 100 })
    })

    hitArea.on('pointerup', () => {
      this.scene.start('GameScene')
    })
  }

  private createBranding() {
    const { width, height } = this.cameras.main

    const branding = this.add.text(width / 2, height - 20, 'A BizarreBeasts ($BB) Game', {
      fontFamily: '"Joti One"',
      fontSize: '16px',
      color: COLORS.blue
    })
    branding.setOrigin(0.5)
    branding.setAlpha(0.8)
  }
}
