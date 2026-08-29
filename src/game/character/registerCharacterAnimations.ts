import Phaser from 'phaser';
import { CharacterRegistryImpl } from './CharacterRegistry';
import { animationKey } from './animationKeys';
import { CharacterDirection } from '../../types/Character';

/**
 * Registers a real Phaser AnimationManager animation for every authored
 * (non-mirrored) direction of every action of every character in the
 * registry. Mirrored directions do NOT get their own animation — at
 * playback time CharacterView plays the source direction's animation and
 * applies flipX, so a walk-left and walk-right cycle always stay
 * frame-synchronized (see skill section 8: shared mirror axis).
 *
 * Must run once, after all character spritesheets have finished loading
 * (called from PreloadScene.create()) and before any CharacterView is
 * constructed.
 */
export function registerCharacterAnimations(scene: Phaser.Scene, registry: CharacterRegistryImpl): void {
  registry.getAll().forEach((manifest) => {
    Object.values(manifest.actions).forEach((action) => {
      (Object.keys(action.directions) as CharacterDirection[]).forEach((direction) => {
        const frames = action.directions[direction];
        if (!frames) return;

        const key = animationKey(manifest.id, action.id, direction);
        if (scene.anims.exists(key)) return;

        scene.anims.create({
          key,
          frames: scene.anims.generateFrameNumbers(frames.textureKey, {
            start: 0,
            end: frames.frameCount - 1
          }),
          frameRate: 1000 / action.frameDurationMs,
          repeat: action.loop ? -1 : 0
        });
      });
    });
  });
}

/**
 * Validates that every direction a character action DECLARES it supports
 * (authored or mirrored — i.e. every key returned by
 * `getSupportedDirections`) actually resolves to a playable animation
 * with real frame data. This intentionally does NOT demand all 4
 * cardinal directions for every action — a stationary NPC's "talk"
 * action only ever needs to face the player (down), and requiring the
 * other 3 directions would force fabricating unused mirrored art, which
 * the skill explicitly forbids ("no fake alias frames just to pass a
 * validator"). The action set + declared directions are the manifest
 * author's explicit statement of real gameplay need.
 *
 * Returns a list of human-readable problems; empty = pass. Used by both
 * the npm validator script and the Development Lab audit.
 */
export function auditCharacterManifests(registry: CharacterRegistryImpl): string[] {
  const problems: string[] = [];

  registry.getAll().forEach((manifest) => {
    if (Object.keys(manifest.actions).length === 0) {
      problems.push(`[${manifest.id}] has zero actions defined`);
      return;
    }

    Object.values(manifest.actions).forEach((action) => {
      const declaredDirections = registry.getSupportedDirections(manifest.id, action.id);
      if (declaredDirections.length === 0) {
        problems.push(`[${manifest.id}/${action.id}] declares zero directions (authored or mirrored)`);
        return;
      }

      declaredDirections.forEach((direction) => {
        try {
          const resolved = registry.resolveDirection(manifest.id, action.id, direction);
          if (resolved.frames.frameCount < 1) {
            problems.push(`[${manifest.id}/${action.id}/${direction}] frameCount < 1`);
          }
          if (!action.loop && action.frameDurationMs <= 0) {
            problems.push(`[${manifest.id}/${action.id}/${direction}] invalid frameDurationMs`);
          }
          // Anti-fake-motion guard: a "walk" or "talk" action (i.e. one
          // that should show real motion) must have more than 1 frame.
          // A single-frame idle pose is fine; a single-frame *walk* is
          // exactly the anti-pattern this whole system replaces.
          if (action.id !== 'idle' && resolved.frames.frameCount <= 1) {
            problems.push(
              `[${manifest.id}/${action.id}/${direction}] only ${resolved.frames.frameCount} frame(s) — ` +
                `non-idle actions must have real multi-frame motion, not a static pose`
            );
          }
        } catch (err) {
          problems.push(
            `[${manifest.id}/${action.id}/${direction}] ${err instanceof Error ? err.message : String(err)}`
          );
        }
      });
    });
  });

  return problems;
}
