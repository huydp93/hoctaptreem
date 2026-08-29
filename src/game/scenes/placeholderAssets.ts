import Phaser from 'phaser';

/**
 * Generates any textures that still don't have real art files yet.
 * As of the "Foxie" art upgrade, all characters/NPC/environment/objects
 * use real image assets loaded in PreloadScene.preload(). The only thing
 * still generated procedurally is the small particle used for the
 * "collected" star-burst effect (a simple soft-glow circle is enough for
 * a particle and not worth shipping as an image file).
 */
export function generatePlaceholderTextures(scene: Phaser.Scene): void {
  const starGraphics = scene.add.graphics();
  starGraphics.fillStyle(0xffd54f, 1);
  starGraphics.fillCircle(8, 8, 8);
  starGraphics.generateTexture('particle_star', 16, 16);
  starGraphics.destroy();
}
