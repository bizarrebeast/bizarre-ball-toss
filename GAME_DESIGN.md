# Pudgy Penguins - Fish Catch Game Design Document

**Last Updated:** 2025-10-02
**Version:** 1.0
**Status:** Planning Phase

---

## 🎮 Core Concept

An infinite arcade game where players control a Pudgy Penguin running side-to-side at the bottom of the screen, catching falling fish for points while avoiding obstacles. The game features a risk/reward frenzy system, progressive difficulty, and multiple collectible types.

---

## 🎯 Game Objectives

- **Primary Goal:** Achieve the highest score possible by collecting fish
- **Secondary Goal:** Build and maintain frenzy multipliers for massive point bonuses
- **Survival Goal:** Avoid trash and fallen birds to preserve lives

---

## 🕹️ Controls

### Desktop
- **Movement:** A/D keys OR Left/Right arrow keys
- **Speed:** Steady constant pace

### Mobile
- **Movement:** Touch and hold screen
  - Touch/hold left side = move left
  - Touch/hold right side = move right
- **Speed:** Same as desktop

### Technical
- No special moves (dash, jump, etc.)
- Slight screen inset - penguin cannot reach absolute edges
- Movement is smooth and responsive

---

## ⏱️ Game Flow & Session Structure

### Game Mode
- **Type:** Infinite survival
- **Duration:** Until all lives are lost
- **Max Difficulty:** Caps at 5 minutes of continuous play

### Screen Flow
1. **Start Screen**
   - Play button
   - How to Play button
   - Background image (provided)
   - Pudgy Penguins branding

2. **How to Play / Tutorial**
   - Interactive tutorial covering:
     - Basic controls (move left/right)
     - All item types and their effects
     - Frenzy bar mechanics
     - Multiplier system
   - Skip Tutorial button (uses local storage to remember if played before)
   - Auto-shows for first-time players

3. **Countdown**
   - 3...2...1...GO! before gameplay starts

4. **Gameplay**
   - Main game loop

5. **Game Over**
   - Handled by Remix SDK (built-in leaderboard)

### Pause System
- **No pause functionality** - maintains game intensity

---

## 💯 Scoring System

### Fish Points (Base Values)
- **Red Fish:** 15 points
- **Blue Fish:** 10 points
- **Golden Fish:** 3x multiplier for 7 seconds (timer resets if another golden fish collected)

### Bonus Items (When Collected at Max)
- **Heart (at max health):** 75 points
- **Revive (when already holding one):** 250 points

### Score Unlocks (Progressive Item Introduction)
- **0 points:** Blue fish available from start
- **150 points:** Red fish unlock
- **200 points:** Golden fish unlock
- **250 points:** Hearts unlock
- **1000 points:** Revive items unlock

### Leaderboard
- Handled by Remix SDK (no custom implementation needed)

---

## 🔥 Frenzy System

### Frenzy Bar Mechanics
- **Activation Requirement:** Collect 20 fish consecutively without missing any
- **Progress Tracking:**
  - Each consecutive fish caught adds progress to frenzy bar
  - Missing a fish does NOT reset the bar
  - Collecting trash or bird resets bar to zero
- **Bar Behavior:**
  - Progress stays and doesn't drain over time
  - Only resets on trash/bird collection

### Frenzy Mode (5 seconds)
- **Visual:** "FRENZY MODE!!" popup appears
- **Spawning:** Constant stream of fish raining down
  - Much higher spawn rate
  - Faster falling speed
  - NO trash or birds during frenzy
- **Player Boost:** Penguin movement speed increased
- **During Frenzy:** Frenzy bar locks (cannot start filling again until frenzy ends)

### Frenzy Completion Multiplier (1x - 5x)
- **Location:** Displayed to the right of frenzy meter
- **Starting Value:** 1x
- **Progression:**
  - Complete frenzy bar 1st time → 2x
  - Complete again without collecting trash/birds → 3x
  - Continue pattern → 4x → 5x (max)
- **Reset Condition:** Collecting ANY trash or bird resets multiplier to 1x AND resets frenzy bar
- **Stacking:** This multiplier is SEPARATE from golden fish 3x multiplier

---

## ❤️ Lives & Survival

### Lives System
- **Starting Lives:** 3
- **Life Loss:** Hitting trash or fallen bird removes 1 life
- **Invincibility:** 1 second of invincibility after taking damage (prevents rapid multiple hits)
- **Game Over:** When all lives are lost (unless revive is active)

### Revive Mechanic
- **Collection:** Drops from top like other items (very rare)
- **Display:** Appears next to health when collected
- **Capacity:** Can only hold 1 revive at a time
- **Effect:** Auto-activates when player reaches 0 lives, restores 1 life
- **Bonus:** If collected when already holding one = 250 points
- **Rarity:** Rare drop requiring a good streak to obtain

### Hearts (Health Restore)
- **Collection:** Drops from top occasionally
- **Effect:** Restores 1 life when below max
- **Bonus:** 75 points if collected at max health (3 lives)

---

## 🐟 Items & Collectibles

### Item Categories

#### Fish (Collectible - Points)
1. **Blue Fish**
   - 10 points
   - Available from game start
   - Standard collectible

2. **Red Fish**
   - 15 points
   - Unlocks at 150 points
   - Higher value standard collectible

3. **Golden Fish**
   - Activates 3x score multiplier for 7 seconds
   - Unlocks at 200 points
   - Can appear alone or mixed with other items/trash
   - Timer resets if another golden fish collected during active multiplier
   - Can be placed in risky formations (surrounded by trash)

#### Obstacles (Avoid - Damage)
1. **Trash**
   - Removes 1 life on contact
   - Resets frenzy bar to zero
   - Resets frenzy completion multiplier to 1x
   - Percentage increases over time (starts low, ramps up)

2. **Birds (Two-Stage Hazard)**
   - **Stage 1 - Flying:**
     - Fly in straight horizontal line near top of screen
     - Player cannot reach them while flying
   - **Stage 2 - Falling:**
     - When fish hits top of bird's head, both bounce
     - Fish: Bounces off, changes trajectory, keeps spinning BUT still collectible for points
     - Bird: Falls down spinning (becomes obstacle)
     - Fall speed matches other items
   - Removes 1 life on contact
   - Resets frenzy bar and multiplier like trash
   - Appears occasionally throughout game

#### Recovery Items
1. **Hearts**
   - Restores 1 life (if below max)
   - 75 points if at max health
   - Unlocks at 250 points
   - Spawns occasionally

2. **Revive**
   - Very rare drop
   - Stores next to health display
   - Auto-activates at 0 lives → restores 1 life
   - 250 points if collected when already holding one
   - Max capacity: 1
   - Unlocks at 1000 points

---

## 🎨 Spawning & Patterns

### Spawn Mechanics
- **Spawn Location:** Items spawn off-screen at top, fall down onto playable area
- **Screen Boundaries:**
  - Slight inset on sides (no items spawn at absolute edges)
  - Items that reach bottom without collection simply disappear (no penalty)
- **Spawn Density:** Manageable amount (not unlimited) - performance capped
- **No Overlap:** Items should not overlap with each other

### Formation Types (Mix It Up!)
- Columns (vertical lines)
- Diagonal lines
- Wave patterns
- Clusters
- Risky choices (golden fish surrounded by trash)
- "Trash Wall" obstacle (see below)

### Special Obstacle: Trash Wall
- **Pattern:** Full horizontal wall of trash with ONE gap/hole
- **Player Action:** Must navigate through the single gap
- **Frequency:** Appears occasionally like missiles in Jetpack Joyride
- **Difficulty:** Becomes more common as game progresses

---

## 📈 Difficulty Progression

### Time-Based Scaling
- **Progression Type:** Gradual increase over time
- **Max Difficulty:** Caps at 5 minutes of continuous play
- **No Cues:** Difficulty increases silently (no visual/audio notification)

### Spawn Rate Scaling
- **Starting Rate:** New wave every 3 seconds
- **Max Rate:** New wave every 1 second (at 5 minutes)
- **Scaling:** Gradual linear progression

### Item Introduction (Score-Based)
| Score | Item Unlocked |
|-------|---------------|
| 0     | Blue Fish (start) |
| 150   | Red Fish |
| 200   | Golden Fish |
| 250   | Hearts |
| 1000  | Revive |

### Trash Percentage Scaling
- **Starting:** Low percentage (sparse trash)
- **Ending:** High percentage (frequent trash)
- **Method:** Gradually ramps up over 5-minute period

### Formation Complexity
- **Early Game:** Simple patterns, single items
- **Mid Game:** Mixed formations, occasional trash walls
- **Late Game:** Complex patterns, frequent trash walls, risky golden fish placements

---

## 🎨 Visual & Audio Design

### Art Assets
- Custom sprites provided by client
  - Pudgy Penguin character
  - Red fish
  - Blue fish
  - Golden fish
  - Trash
  - Birds
  - Hearts
  - Revive item
  - Background image(s)
  - UI elements

### Animations
- **Penguin:** Idle and run animations
- **Fish Collection:** No freeze frame or special animation
- **Bird Hit:** Bird spins while falling
- **Fish Bounce:** Fish spins after bouncing off bird (still collectible)
- **Frenzy Mode:** "FRENZY MODE!!" popup text

### Particle Effects
- Fish collection particles
- Trash hit particles
- Bird collision particles
- Golden fish collection special effect
- Frenzy mode activation effect

### UI Elements
- **Top HUD:**
  - Score display
  - Lives display (3 hearts)
  - Frenzy bar with fill progress
  - Frenzy completion multiplier (1x-5x) to right of frenzy bar
  - Revive icon (when collected)
  - Golden fish multiplier timer/indicator (when active)

### Sound & Music
- Handled by client (Remix SDK sound toggle available)

---

## 🎯 Collision & Physics

### Hitboxes
- **Type:** Slightly forgiving (smaller than full sprite)
- **Purpose:** Prevents frustrating "unfair" deaths from pixel-perfect collisions

### Collision Rules
- **Fish Collection:** Instant collection on contact
- **Multiple Items:** Items don't overlap, so only one collision at a time
- **Damage:** 1-second invincibility prevents multiple rapid hits
- **Bird Bounce:** Fish bounces off bird head, bird falls
  - Fish remains collectible after bounce
  - Bird becomes falling obstacle after hit

### Item Behavior
- **Fall Speed:** Consistent for all items (except during frenzy)
- **Frenzy Speed:** Much faster falling during frenzy mode
- **Despawn:** Items disappear when reaching bottom of screen (no penalty)

---

## ⚙️ Technical Specifications

### Tech Stack
- **Engine:** Phaser.js (latest version)
- **Language:** TypeScript
- **Framework:** Remix
- **Platform:** Web (Desktop + Mobile)

### Performance
- **Frame Rate Independence:** Delta time based (consistent gameplay regardless of FPS)
- **Aspect Ratio:** 2:3 (portrait-ish)
- **Responsive:** Fully playable on all screen sizes
- **Optimization:**
  - Object pooling for all sprites (fish, trash, birds, hearts, revives)
  - Maximum objects on screen capped for performance
  - Efficient sprite reuse

### Data Persistence
- **Local Storage:**
  - Tutorial completion flag (skip tutorial for returning players)
  - High score (optional, as Remix handles leaderboard)

### Mobile Considerations
- Touch controls optimized for mobile
- UI elements sized appropriately for touch
- Performance optimized for mobile devices

---

## 🧪 Polish & Game Feel

### Screen Effects
- Particle effects on collection
- Screen shake on damage (optional)
- Frenzy mode visual effects (color shifts, background change)
- Golden fish multiplier visual indicator

### Feedback Systems
- Visual feedback on every collection
- Damage feedback (invincibility flash, screen shake)
- Frenzy bar fill animation
- Multiplier increment celebration

### Player Agency
- No penalty for missing fish (only for hitting obstacles)
- Risk/reward choices (golden fish in dangerous spots)
- Strategic decisions (go for risky fish vs. play safe)
- Frenzy system rewards consistent performance

---

## 📋 Development Phases (Future Reference)

### Phase 1: Core Mechanics
- [ ] Player movement (keyboard + touch)
- [ ] Basic fish spawning and collection
- [ ] Score system
- [ ] Lives system
- [ ] Collision detection

### Phase 2: Items & Obstacles
- [ ] Multiple fish types (blue, red, golden)
- [ ] Trash obstacles
- [ ] Bird flying and falling mechanics
- [ ] Hearts and revive items
- [ ] Golden fish multiplier system

### Phase 3: Frenzy System
- [ ] Frenzy bar tracking
- [ ] Frenzy mode activation
- [ ] Frenzy completion multiplier (1x-5x)
- [ ] Frenzy mode visuals and spawning

### Phase 4: Difficulty Scaling
- [ ] Time-based spawn rate scaling
- [ ] Score-based item unlocks
- [ ] Trash percentage ramping
- [ ] Formation system
- [ ] Trash wall obstacle

### Phase 5: UI & Screens
- [ ] Start screen
- [ ] Interactive tutorial
- [ ] HUD elements
- [ ] Score display
- [ ] Multiplier indicators

### Phase 6: Polish & Effects
- [ ] Particle effects
- [ ] Screen effects
- [ ] Animations
- [ ] Sound integration (Remix SDK)
- [ ] Mobile optimization

### Phase 7: Testing & Balance
- [ ] Difficulty curve tuning
- [ ] Spawn rate balancing
- [ ] Score balancing
- [ ] Mobile testing
- [ ] Performance optimization

---

## 🔄 Living Document Notes

This document should be updated as:
- New mechanics are discovered during development
- Balance changes are needed after playtesting
- Technical constraints require design adjustments
- New ideas emerge during implementation

**When stuck or need a refresher, refer to this document!**

---

## 📝 Quick Reference

### Core Numbers
- Lives: 3
- Invincibility: 1 second
- Frenzy duration: 5 seconds
- Frenzy requirement: 20 consecutive fish
- Golden fish timer: 7 seconds
- Max difficulty: 5 minutes
- Spawn rate: 3s → 1s
- Aspect ratio: 2:3

### Point Values
- Blue fish: 10
- Red fish: 15
- Golden fish: 3x multiplier
- Heart (max HP): 75
- Revive (when full): 250

### Unlock Scores
- 0: Blue fish
- 150: Red fish
- 200: Golden fish
- 250: Hearts
- 1000: Revive

---

**End of Game Design Document**
