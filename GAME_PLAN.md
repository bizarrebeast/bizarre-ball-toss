# Pudgy Penguins Fish Catch - Complete Game Plan

## Game Overview
A vertical mobile game where players control a Pudgy Penguin to catch falling fish, avoid obstacles, and survive shark attacks. Features a frenzy mode system, power-ups, and increasing difficulty.

---

## Core Mechanics

### Player Controls
- **Movement**: Keyboard (Arrow keys, A/D) or Touch (tap left/right side of screen)
- **Sprite**: Pudgy Penguin (160x250px)
- **Waddle Animation**: Rotation tween (0.1 rad) that plays only when moving
- **Mirroring**: Flips horizontally based on movement direction
- **Speed**: 400px/s base, 600px/s during frenzy mode
- **Hitbox**: 70% of sprite size with 15% margins for forgiving gameplay

### Lives System
- **Starting Lives**: 3
- **Display**: Heart icons (45x45px) at top left
- **Damage Sources**: Trash, falling birds, sharks
- **Invincibility**: 1 second after taking damage (50% alpha)
- **Special**: Can collect fish/powerups while invincible

---

## Collectibles & Items

### Fish (Points & Frenzy Progress)
- **Blue Fish** (85x85px)
  - Value: 10 points
  - Most common spawn

- **Red Fish** (85x85px)
  - Value: 15 points
  - Unlocks at score ≥ 150

- **Golden Fish** (85x85px)
  - Value: 50 points
  - Activates 3x multiplier for 7 seconds
  - Unlocks at score ≥ 200

### Power-Ups
- **Heart** (85x85px)
  - Restores 1 life (or 75 points if at max)
  - Unlocks at score ≥ 250
  - 5% spawn chance

- **Shield** (85x85px)
  - 5 seconds of invincibility
  - Cyan tint on player
  - Unlocks at score ≥ 500
  - 3% spawn chance

- **Revive** (85x85px)
  - One-time revival from 0 lives
  - Shows icon (70x70px) at top right when collected
  - Gives 250 points if already owned
  - Unlocks at score ≥ 1000
  - 2% spawn chance

### Obstacles
- **Trash** (70x70px)
  - Two variants: red can, grey can (randomly selected)
  - Removes 1 life and resets frenzy progress
  - Spawn rate: 8% early game → 30% at 3 minutes
  - Hitbox: 20% margins (tighter than items)

- **Birds**
  - **Flying Birds** (85x85px)
    - Fly horizontally near top of screen (y=150)
    - Two frames: wings up, wings down (animated at 8fps)
    - Speed: 100px/s
    - Mirror based on direction
    - 20% spawn chance per wave (outside frenzy)
    - Can be hit by fish to become falling birds

  - **Falling Birds** (85x85px)
    - Birds hit by fish fall and spin
    - Speed: 200px/s downward
    - Cause damage like trash
    - Hitbox: 20% margins

---

## Shark Attack System

### Warning Phase
- **Trigger**: Score ≥ 300, first spawn after 15 seconds
- **Warning Duration**: 1.5 seconds
- **Indicator**: Warning sign (120x120px) at top, shows X position
- **Flash Effect**: Flashes every 0.2 seconds

### Attack Phase
- **Shark Sprite**: 250x500px (tall vertical sprite)
- **Spawn Position**: Top of screen, random X within playable area
- **Movement**: Vertical downward at 700px/s
- **Behavior**: Eats all items in its path (fish, trash, powerups)
- **Damage**: 1 life if hits player
- **Hitbox**: 10% margins

### Spawn Timing (Difficulty Scaling)
- **Frequency**: Scales with score (max at score 2000)
  - Low score (300): 15-20 seconds between sharks
  - High score (2000+): 8-12 seconds between sharks
- **Disabled During**: Frenzy mode

---

## Frenzy Mode System

### Activation
- **Requirement**: Catch 20 fish without hitting obstacles
- **Progress Bar**: Visual bar at top right showing 0-20 fish progress
- **Reset**: Hitting trash/birds resets progress to 0

### Frenzy Effects (10 seconds)
- **Player Speed**: 1.5x (600px/s)
- **Spawns**: Only fish (3-5 per wave), no trash/birds/sharks
- **Screen Clear**: All obstacles removed on activation
- **Multiplier**: Increases by 1 each frenzy (max 5x)
- **Visual**: "FRENZY MODE!!" popup (64px Rubik Bubbles font)
- **Bar Display**: Acts as countdown timer during frenzy

### Frenzy Rules
- Fish caught during frenzy don't count toward next frenzy
- Frenzy multiplier persists across frenzy modes
- Golden fish multiplier stacks with frenzy multiplier

---

## Spawning & Difficulty

### Item Spawning
- **Pattern**: Diagonal lines (positioned diagonally, fall straight down)
- **Wave Size**: 1-3 items normally, 3-5 during frenzy
- **Spawn Interval**: 2 seconds → 0.8 seconds (over 3 minutes)
- **Vertical Spacing**: 100px between items in same wave
- **Horizontal Spacing**: 60px between items
- **Boundaries**: 50px margins from edges (sharks use 130px margins)

### Speed
- **Normal Items**: 200px/s
- **Frenzy Items**: 400px/s
- **Birds**: 100px/s horizontal
- **Falling Birds**: 200px/s vertical
- **Sharks**: 700px/s vertical

### Difficulty Progression
- **Time Scale**: 3 minutes to max difficulty
- **Spawn Speed**: Linear increase from 2s to 0.8s
- **Trash %**: Linear increase from 8% to 30%
- **Shark Frequency**: Scales with score (0-2000 range)
- **Item Unlocks**: Progressive unlock based on score thresholds

---

## UI & Visual Design

### Layout
- **Top Left**:
  - Score text (32px Rubik Bubbles, white with black outline)
  - 3 heart icons showing remaining lives

- **Top Right**:
  - Frenzy bar (400px border with custom image)
  - Frenzy multiplier text (32px, gold)
  - Revive icon (70x70px, when owned)

- **Center** (conditional):
  - Golden multiplier timer (28px, gold)
  - Shield timer (28px, cyan)
  - Frenzy popup (64px, gold with red outline)

- **Countdown**: 3-2-1-GO (128px Rubik Bubbles)

### Fonts
- **All UI Text**: "Rubik Bubbles" (Google Font)
- **Sizes**: Score/Multiplier (32px), Timers (28px), Popup (64px), Countdown (128px)
- **Colors**: White (score), Gold (multipliers/frenzy), Cyan (shield)
- **Stroke**: Black outline (3-8px) for readability

### Visual Effects
- **Spinning**: Trash and falling birds rotate continuously
- **Tints**: Cyan tint on player during shield
- **Alpha**: 50% alpha during damage invincibility
- **Debug**: Red rectangle outlines showing hitboxes (development mode)

---

## Assets List

### Sprites Implemented
✅ **Player**: Pudgy Penguin (rectangular, taller than wide)
✅ **Fish**: Blue, Red, Golden (all use custom sprites)
✅ **Birds**: Up and down wing frames (animated)
✅ **Trash**: Red can, Grey can (randomly selected)
✅ **Power-ups**: Heart, Shield, Revive icons
✅ **Shark**: Large vertical shark sprite
✅ **Warning**: Shark warning sign
✅ **UI**: Frenzy bar border, heart icons

### Backgrounds
✅ **Menu Background**: Proportionally scaled ocean scene
✅ **Game Background**: Proportionally scaled ocean scene

---

## Game States & Flow

### Start Menu
- Background image (proportionally scaled)
- Play button (350px proportional image button)
- How to Play button (350px proportional image button)
- Checks localStorage for tutorial completion

### Tutorial Scene
- Triggered on first play
- Can be replayed via "How to Play" button

### Game Scene
- 3-2-1-GO countdown
- Continuous spawning based on intervals
- Ends when lives reach 0 (unless revive available)
- 2-second delay before returning to menu

---

## Technical Implementation

### Collision Detection
- **Fixed Hitboxes**: Use displayWidth/displayHeight (prevents pulsing during rotation)
- **Player**: 70% sprite size + 15% margins
- **Items**: Base size + 15% margins
- **Obstacles**: Base size + 20% margins (tighter)
- **Sharks**: Base size + 10% margins

### Performance
- **Object Pooling**: Reuse sprites when possible
- **Cleanup**: Remove items when off-screen
- **Sprite Limits**: Max 50 items in pool

### Browser Compatibility
- **Fonts**: Preloaded from Google Fonts
- **Touch**: Both touch and mouse input supported
- **Aspect Ratio**: Designed for 720x1080 (2:3 mobile)

---

## Future Enhancements (Not Yet Implemented)

### Audio
- Background music
- Sound effects (collect, damage, frenzy, shark warning)
- Missile whoosh trail effect

### Visual Effects
- Particle effects on collection
- Shark trail/wake effect
- Screen shake on damage
- More elaborate frenzy activation effect

### Gameplay
- Multiple difficulty modes
- Boss encounters
- Combo system
- Achievement system
- Leaderboards

---

## File Structure

```
/src/scenes/
  PudgyGameScene.ts    - Main gameplay scene
  StartScene.ts        - Menu scene
  TutorialScene.ts     - Tutorial (referenced but not modified)

/index.html            - Font loading and base HTML
/ASSETS_NEEDED.md      - Original asset requirements
/GAME_PLAN.md         - This document
```

---

## Development Notes

### Debug Features
- Console logging for hits and game over
- Red hitbox visualization (toggle-able)
- All sharks spawn frequently for testing (can be reverted)

### Known Adjustments Made
- Shark spawn timing made more aggressive for testing
- Debug logs added for troubleshooting life loss
- Hitbox visualization available for balancing

### Balance Tuning Points
- Shark frequency (currently 15-20s → 8-12s)
- Frenzy duration (currently 10s)
- Item spawn rates (trash 8-30%)
- Difficulty ramp time (currently 3 minutes)

---

**Last Updated**: Session completion after implementing frenzy bar, shark system, and all visual polish
