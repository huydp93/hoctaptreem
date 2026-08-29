import Phaser from 'phaser';
import { CharacterRegistryImpl } from './CharacterRegistry';

/**
 * Loads every spritesheet referenced by every registered CharacterManifest
 * generically — PreloadScene never lists a character's texture keys or
 * file paths by hand. Adding a new character/action/direction to a
 * manifest is automatically picked up here with zero preload code
 * changes (skill section 3: no hard-coded asset paths in engine code).
 *
 * A 1-frame "idle" direction is still loaded via `load.spritesheet` (not
 * `load.image`) with frameWidth/frameHeight equal to the full image, so
 * CharacterView/AnimationController can treat idle and walk uniformly —
 * there is no special-case branch anywhere for "this one has only 1 frame".
 */
export function preloadCharacterAssets(scene: Phaser.Scene, registry: CharacterRegistryImpl): void {
  const seenKeys = new Set<string>();

  registry.getAll().forEach((manifest) => {
    Object.values(manifest.actions).forEach((action) => {
      Object.values(action.directions).forEach((frames) => {
        if (!frames || seenKeys.has(frames.textureKey)) return;
        seenKeys.add(frames.textureKey);

        scene.load.spritesheet(frames.textureKey, frames.path, {
          frameWidth: frames.frameWidth,
          frameHeight: frames.frameHeight
        });
      });
    });
  });
}
