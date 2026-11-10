/**
 * Room at the top for Remix's own HUD. On phones Remix shows the game full-frame and floats round Back and
 * menu buttons over the top corners (measured on remix.gg at 375 px wide: 8 to 56 CSS px down). Top-anchored
 * game HUD rows start below this. Returns the inset in GAME px for the current scale (2026-10-03).
 */
export const REMIX_HUD_CSS_PX = 64

export function hudTopInset(scene: Phaser.Scene): number {
  const css = scene.scale.displaySize.width || scene.scale.width
  return Math.round((REMIX_HUD_CSS_PX * scene.scale.width) / css)
}
