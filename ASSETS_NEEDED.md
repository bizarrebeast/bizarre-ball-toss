# Pudgy Penguins Fish Catch - Asset List

## Required Game Assets

### Character Sprites

#### 1. Pudgy Penguin (Player)
- **File:** `player.png` or `penguin.png`
- **Size:** ~80x80px (or larger, will be scaled)
- **Description:** The playable Pudgy Penguin character
- **States needed:**
  - Idle/standing pose
  - Running animation (optional - can use single sprite)
- **Notes:** Should face forward, will move left/right horizontally

---

### Collectible Items

#### 2. Blue Fish
- **File:** `blue_fish.png`
- **Size:** ~50x50px
- **Description:** Standard fish worth 10 points
- **Notes:** Should be clearly identifiable as a fish, blue colored

#### 3. Red Fish
- **File:** `red_fish.png`
- **Size:** ~50x50px
- **Description:** Premium fish worth 15 points
- **Notes:** Should be clearly identifiable as a fish, red colored, slightly more special than blue

#### 4. Golden Fish
- **File:** `golden_fish.png`
- **Size:** ~50x50px
- **Description:** Special fish that activates 3x multiplier for 7 seconds
- **Notes:** Should look valuable/special, golden/shiny appearance, could have sparkle effects

---

### Power-Up Items

#### 5. Heart
- **File:** `heart.png`
- **Size:** ~50x50px
- **Description:** Restores 1 life (or gives 75 points if at max health)
- **Notes:** Classic heart icon, bright pink/red color

#### 6. Revive
- **File:** `revive.png`
- **Size:** ~50x50px
- **Description:** Brings player back from 0 lives (one-time use)
- **Notes:** Medical/revival themed (could be cross, star, angel wings, etc.)

---

### Obstacles

#### 7. Trash
- **File:** `trash.png`
- **Size:** ~50x50px
- **Description:** Obstacle that removes 1 life and resets frenzy progress
- **Notes:** Could be trash bag, trash can, garbage, plastic bottle, etc.

#### 8. Bird (Flying)
- **File:** `bird.png`
- **Size:** ~60x60px
- **Description:** Flies horizontally near top of screen
- **States needed:**
  - Flying pose (wings spread or mid-flap)
- **Notes:** Will be flipped horizontally based on flight direction

#### 9. Bird (Falling) - OPTIONAL
- **File:** `bird_falling.png` (optional - can reuse flying bird)
- **Size:** ~60x60px
- **Description:** Bird after being hit by fish, falls as obstacle
- **Notes:** If provided, should look stunned/dizzy; otherwise will reuse flying bird

---

### Background & Environment

#### 10. Background Image
- **File:** `background.png` or `ocean_bg.png`
- **Size:** 720x1080px (2:3 aspect ratio)
- **Description:** Ocean/underwater scene for gameplay area
- **Notes:** Should not be too busy/distracting, light blue tones work well

#### 11. Start Screen Background
- **File:** `start_bg.png` (optional - can reuse gameplay background)
- **Size:** 720x1080px
- **Description:** Background for start screen with logo/branding
- **Notes:** Could include Pudgy Penguins branding, title art

---

### UI Elements

#### 12. Tutorial/UI Background (Optional)
- **File:** `ui_panel.png`
- **Size:** Variable
- **Description:** Panel/frame background for tutorial screens
- **Notes:** Can be handled with code - not strictly necessary

#### 13. Button Assets (Optional)
- **File:** `button.png`, `button_hover.png`, `button_pressed.png`
- **Size:** ~300x80px
- **Description:** Styled buttons for UI
- **Notes:** Can be handled with code - not strictly necessary

---

### Particle Effects (Optional but Recommended)

#### 14. Particle/Sparkle Effect
- **File:** `particle.png` or `sparkle.png`
- **Size:** ~16x16px to 32x32px
- **Description:** Small particle for collection effects
- **Notes:** Simple star, circle, or sparkle shape

---

## File Organization

Suggested folder structure:
```
/public/assets/
  /characters/
    player.png
  /items/
    blue_fish.png
    red_fish.png
    golden_fish.png
    heart.png
    revive.png
  /obstacles/
    trash.png
    bird.png
    bird_falling.png (optional)
  /backgrounds/
    background.png
    start_bg.png
  /ui/
    button.png (optional)
    panel.png (optional)
  /particles/
    sparkle.png (optional)
```

---

## Asset Specifications

### General Requirements
- **Format:** PNG with transparency (alpha channel)
- **Resolution:** @2x or @3x for retina displays recommended
- **Color Space:** RGB
- **Optimization:** Compress PNGs for web (tools like TinyPNG)

### Style Guidelines
- **Consistent Art Style:** All assets should match the Pudgy Penguins brand
- **Clear Silhouettes:** Items should be recognizable at small sizes
- **High Contrast:** Ensure items stand out against ocean background
- **Vibrant Colors:** Use bright, appealing colors that pop

---

## Priority Levels

### Critical (Must Have)
1. Player penguin
2. Blue fish
3. Red fish
4. Golden fish
5. Trash
6. Background

### High Priority (Should Have)
7. Heart
8. Revive
9. Bird

### Nice to Have (Can Add Later)
10. Particle effects
11. Custom UI elements
12. Falling bird variant
13. Start screen background

---

## Notes for Asset Creation

1. **Pixel Art vs Vector:** Either style works, but keep consistent
2. **Animation Frames:** For animated sprites, provide sprite sheets
3. **Margins/Padding:** Leave small margins around sprites for effects
4. **Size Consistency:** Keep similar items roughly the same size
5. **Testing:** Test assets at actual game size (50x50px for items)

---

## Current Placeholder Status

All assets currently use procedurally generated graphics:
- Shapes and colors coded in `PudgyGameScene.ts`
- Located in `createPlaceholderTextures()` method
- Replace by loading images in `preload()` method

Example replacement code:
```typescript
preload() {
  this.load.image('player', '/assets/characters/player.png')
  this.load.image('blue_fish', '/assets/items/blue_fish.png')
  this.load.image('red_fish', '/assets/items/red_fish.png')
  // ... etc
}
```

---

**Total Assets Needed:** 9-14 assets (depending on optional items)

**Recommended Delivery Format:** PNG files in organized folder structure
