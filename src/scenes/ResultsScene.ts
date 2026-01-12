import { TossResult } from '../data/BallTossLogic'

const COLORS = {
  pink: '#FF10F0',
  pinkHex: 0xFF10F0,
  blue: '#00D4FF',
  blueHex: 0x00D4FF,
  darkBg: '#0a0a0a',
  darkCard: '#1a1a2a',
  white: '#FFFFFF',
  yellow: '#FFE135',
  green: '#39FF14',
  greenHex: 0x39FF14,
  orange: '#FF8800',
  red: '#FF4444'
}

export class ResultsScene extends Phaser.Scene {
  private results!: TossResult

  constructor() {
    super({ key: 'ResultsScene' })
  }

  init(data: TossResult) {
    this.results = data
  }

  preload() {
    if (this.textures.exists('gradientBtnResults')) {
      this.textures.remove('gradientBtnResults')
    }

    const canvas = document.createElement('canvas')
    canvas.width = 280
    canvas.height = 70
    const ctx = canvas.getContext('2d')!

    const gradient = ctx.createLinearGradient(0, 0, 280, 0)
    gradient.addColorStop(0, COLORS.pink)
    gradient.addColorStop(1, COLORS.blue)

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 280, 70)

    this.textures.addCanvas('gradientBtnResults', canvas)
  }

  create() {
    this.createBackground()
    this.createClouds()
    this.createTerrain()
    this.createTitle()
    this.createScoreBreakdown()
    this.createContinueButton()
    this.createBranding()
  }

  private createBackground() {
    const { width, height } = this.cameras.main
    const bg = this.add.graphics()

    // Deep space at top
    bg.fillStyle(0x050510, 1)
    bg.fillRect(0, 0, width, height)

    // Gradient sky bands (same as splash screen)
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

    // Pixelated clouds for results screen
    const cloudPositions = [
      { x: width * 0.10, y: height * 0.05, size: 80, color: COLORS.pinkHex, type: 0 },
      { x: width * 0.55, y: height * 0.03, size: 70, color: 0x9933FF, type: 3 },
      { x: width * 0.88, y: height * 0.04, size: 90, color: COLORS.blueHex, type: 2 },
      { x: width * 0.30, y: height * 0.12, size: 65, color: 0x00FFFF, type: 1 },
      { x: width * 0.72, y: height * 0.10, size: 75, color: COLORS.pinkHex, type: 0 },
      { x: width * 0.05, y: height * 0.18, size: 50, color: 0x33FFFF, type: 3 },
      { x: width * 0.95, y: height * 0.16, size: 45, color: 0xFF33AA, type: 1 },
    ]

    cloudPositions.forEach(pos => {
      this.createNeonCloud(pos.x, pos.y, pos.size, pos.color, pos.type)
    })
  }

  private createNeonCloud(x: number, y: number, size: number, color: number, cloudType: number) {
    const graphics = this.add.graphics()
    const alpha = 0.4
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
    ]

    const pattern = cloudTypes[cloudType % cloudTypes.length]
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
  }

  private createTerrain() {
    const { width, height } = this.cameras.main
    const terrain = this.add.graphics()
    const groundY = height * 0.88

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

  private createTitle() {
    const { width, height } = this.cameras.main

    const title = this.add.text(width / 2, height * 0.06, 'RESULTS', {
      fontFamily: '"Slackey"',
      fontSize: '42px',
      color: COLORS.blue,
      stroke: '#000000',
      strokeThickness: 4
    })
    title.setOrigin(0.5)
  }

  private createScoreBreakdown() {
    const { width, height } = this.cameras.main
    const cardY = height * 0.45
    const cardW = 400
    const cardH = 500
    const borderWidth = 3

    // Card background
    const cardBg = this.add.graphics()
    cardBg.lineStyle(borderWidth, 0x00D4FF, 1)
    cardBg.strokeRoundedRect(width / 2 - cardW / 2, cardY - cardH / 2, cardW, cardH, 16)
    cardBg.fillStyle(0x1a1a2a, 1)
    cardBg.fillRoundedRect(
      width / 2 - cardW / 2 + borderWidth,
      cardY - cardH / 2 + borderWidth,
      cardW - borderWidth * 2,
      cardH - borderWidth * 2,
      14
    )

    const startY = cardY - cardH / 2 + 35
    const lineHeight = 40

    // Distance
    this.addStatRow('DISTANCE', `${this.results.distance}m`, startY, COLORS.blue)

    // Max Height
    this.addStatRow('MAX HEIGHT', `${this.results.maxHeight}m`, startY + lineHeight, COLORS.blue)

    // Air Time
    this.addStatRow('AIR TIME', `${this.results.airTime.toFixed(1)}s`, startY + lineHeight * 2, COLORS.blue)

    // Burgers (yellow)
    this.addStatRow('BURGERS', `${this.results.starsCollected}`, startY + lineHeight * 3, COLORS.yellow, '500 ea')

    // Pizza (orange) - boost
    this.addStatRow('PIZZA', `${this.results.rocketsUsed}`, startY + lineHeight * 4, COLORS.orange, '200 ea')

    // Eggs (red) - explosion
    this.addStatRow('EGGS', `${this.results.bombsHit}`, startY + lineHeight * 5, COLORS.red, '1000 ea')

    // Tacos (green) - bounce
    this.addStatRow('TACOS', `${this.results.bouncePadsHit}`, startY + lineHeight * 6, COLORS.green, '100 ea')

    // Chips (orange)
    this.addStatRow('CHIPS', `${this.results.chipsCollected}`, startY + lineHeight * 7, COLORS.orange, '300 ea')

    // Popcorn (white)
    this.addStatRow('POPCORN', `${this.results.popcornCollected}`, startY + lineHeight * 8, COLORS.white, '150 ea')

    // Divider
    const dividerY = startY + lineHeight * 9 + 5
    const divider = this.add.graphics()
    divider.lineStyle(2, 0x3a3a4a, 1)
    divider.moveTo(width / 2 - cardW / 2 + 30, dividerY)
    divider.lineTo(width / 2 + cardW / 2 - 30, dividerY)
    divider.strokePath()

    // Total score
    const totalLabel = this.add.text(width / 2 - cardW / 2 + 35, dividerY + 28, 'TOTAL', {
      fontFamily: '"Slackey"',
      fontSize: '28px',
      color: COLORS.blue
    })
    totalLabel.setOrigin(0, 0.5)

    const totalValue = this.add.text(width / 2 + cardW / 2 - 35, dividerY + 28, '0', {
      fontFamily: '"Slackey"',
      fontSize: '34px',
      color: COLORS.pink,
      stroke: '#000000',
      strokeThickness: 3
    })
    totalValue.setOrigin(1, 0.5)

    // Animate score counting
    this.tweens.addCounter({
      from: 0,
      to: this.results.score,
      duration: 1200,
      ease: 'Power2',
      onUpdate: (tween) => {
        totalValue.setText(`${Math.floor(tween.getValue())}`)
      }
    })
  }

  private addStatRow(label: string, value: string, y: number, valueColor: string, subtext?: string) {
    const { width } = this.cameras.main
    const cardW = 400

    const labelText = this.add.text(width / 2 - cardW / 2 + 35, y, label, {
      fontFamily: '"Inter"',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#888888'
    })
    labelText.setOrigin(0, 0.5)

    const valueText = this.add.text(width / 2 + cardW / 2 - 35, y, value, {
      fontFamily: '"Slackey"',
      fontSize: '26px',
      color: valueColor
    })
    valueText.setOrigin(1, 0.5)

    if (subtext) {
      const subtextObj = this.add.text(width / 2 + cardW / 2 - 35 - valueText.width - 12, y, subtext, {
        fontFamily: '"Inter"',
        fontSize: '14px',
        color: '#555555'
      })
      subtextObj.setOrigin(1, 0.5)
    }
  }

  private createContinueButton() {
    const { width, height } = this.cameras.main
    const buttonY = height * 0.82
    const btnW = 280
    const btnH = 70

    const buttonBg = this.add.image(width / 2, buttonY, 'gradientBtnResults')

    const maskGraphics = this.make.graphics({ add: false })
    maskGraphics.fillStyle(0xffffff)
    maskGraphics.fillRoundedRect(width / 2 - btnW / 2, buttonY - btnH / 2, btnW, btnH, 20)
    buttonBg.setMask(maskGraphics.createGeometryMask())

    const buttonText = this.add.text(width / 2, buttonY, 'CONTINUE', {
      fontFamily: '"Slackey"',
      fontSize: '32px',
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
      this.callGameOver()
    })
  }

  private callGameOver() {
    if ((window as any).FarcadeSDK?.singlePlayer?.actions?.gameOver) {
      (window as any).FarcadeSDK.singlePlayer.actions.gameOver({
        score: this.results.score
      })
    } else {
      this.scene.start('StartScene')
    }
  }

  private createBranding() {
    const { width, height } = this.cameras.main

    const branding = this.add.text(width / 2, height - 30, 'A BizarreBeasts ($BB) Game', {
      fontFamily: '"Joti One"',
      fontSize: '18px',
      color: COLORS.blue
    })
    branding.setOrigin(0.5)
  }
}
