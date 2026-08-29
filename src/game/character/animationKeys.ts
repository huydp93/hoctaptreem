import { CharacterDirection } from '../../types/Character';

/**
 * Deterministic Phaser animation key naming so PreloadScene (registration)
 * and AnimationController (playback) always agree without either side
 * hard-coding a string literal per character.
 */
export function animationKey(
  characterId: string,
  actionId: string,
  sourceDirection: CharacterDirection
): string {
  return `${characterId}__${actionId}__${sourceDirection}`;
}
