/**
 * Ball Toss Game Logic
 * Scoring and physics calculations
 */

// Scoring multipliers
export const SCORING = {
  DISTANCE_MULTIPLIER: 0.5,     // Points per unit distance (lowered for slower climb)
  AIR_TIME_MULTIPLIER: 10,      // Points per second of air time
  STAR_POINTS: 500,             // Points per burger collected
  ROCKET_POINTS: 200,           // Points per pizza used
  BOMB_POINTS: 1000,            // Points per egg hit
  BOUNCE_PAD_POINTS: 100,       // Points per taco hit
  HEIGHT_MULTIPLIER: 0.1,       // Points per unit of max height
  CHIPS_POINTS: 300,            // Points per chips collected
  POPCORN_POINTS: 150,          // Points per popcorn collected
}

// Physics settings
export const PHYSICS = {
  GRAVITY: 600,
  MAX_POWER: 2500,
  MIN_POWER: 800,
  BOUNCE_DAMPENING: 0.3,        // Weak natural bounce (collectibles provide real bounces)
  GROUND_FRICTION: 0.9,
  AIR_RESISTANCE: 0.9995,
}

// World settings
export const WORLD = {
  GROUND_Y: 900,                // Y position of ground
  START_X: 100,                 // Starting X position
  START_Y: 700,                 // Starting Y position
  SCROLL_THRESHOLD: 300,        // X position to start scrolling camera
}

export interface TossResult {
  distance: number
  airTime: number
  starsCollected: number
  rocketsUsed: number
  bombsHit: number
  bouncePadsHit: number
  maxHeight: number
  chipsCollected: number
  popcornCollected: number
  score: number
}

export function calculateScore(
  distance: number,
  airTimeMs: number,
  starsCollected: number,
  rocketsUsed: number,
  bombsHit: number,
  bouncePadsHit: number,
  maxHeight: number,
  chipsCollected: number = 0,
  popcornCollected: number = 0
): TossResult {
  const airTimeSeconds = airTimeMs / 1000

  const distancePoints = Math.floor(distance * SCORING.DISTANCE_MULTIPLIER)
  const airTimePoints = Math.floor(airTimeSeconds * SCORING.AIR_TIME_MULTIPLIER)
  const heightPoints = Math.floor(maxHeight * SCORING.HEIGHT_MULTIPLIER)

  const starPoints = starsCollected * SCORING.STAR_POINTS
  const rocketPoints = rocketsUsed * SCORING.ROCKET_POINTS
  const bombPoints = bombsHit * SCORING.BOMB_POINTS
  const bouncePoints = bouncePadsHit * SCORING.BOUNCE_PAD_POINTS
  const chipsPoints = chipsCollected * SCORING.CHIPS_POINTS
  const popcornPoints = popcornCollected * SCORING.POPCORN_POINTS

  const score = distancePoints + airTimePoints + starPoints + rocketPoints + bombPoints + bouncePoints + heightPoints + chipsPoints + popcornPoints

  return {
    distance: Math.floor(distance),
    airTime: airTimeSeconds,
    starsCollected,
    rocketsUsed,
    bombsHit,
    bouncePadsHit,
    maxHeight: Math.floor(maxHeight),
    chipsCollected,
    popcornCollected,
    score
  }
}

export function getPowerFromDrag(dragDistance: number, maxDrag: number): number {
  const normalizedPower = Math.min(dragDistance / maxDrag, 1)
  return PHYSICS.MIN_POWER + normalizedPower * (PHYSICS.MAX_POWER - PHYSICS.MIN_POWER)
}

export function getAngleFromDrag(startX: number, startY: number, endX: number, endY: number): number {
  // Angle is opposite of drag direction (slingshot style)
  const dx = startX - endX
  const dy = startY - endY
  return Math.atan2(dy, dx)
}
