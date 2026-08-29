import { CharacterManifest } from '../../types/Character';

/**
 * "Foxie" (Hiệp Sĩ Cáo) — the player character.
 *
 * Action set is scaled to this game's REAL gameplay: a top-down
 * exploration game with no combat/jump/mount, so only two actions
 * exist:
 *   - idle: a true single-frame standing pose per direction (the
 *     original hand-painted fox_front/back/side art — kept as-is, not
 *     replaced, since a still pose IS the correct contract for idle).
 *   - walk: a real 4-frame walk cycle per direction, generated to match
 *     the existing art style/palette (see asset pipeline notes in
 *     README). This replaces the old fake "sine-wave scale bob" — Foxie
 *     now visibly moves his legs/tail while walking.
 *
 * Only 3 directions are authored for each action ("down", "up", "left")
 * — "right" is declared as a mirror of "left" for both actions, exactly
 * matching this project's original art (fox_side.png always faced left
 * and was flipped for rightward movement) and the skill's "share one
 * mirror axis across the whole body" rule.
 */
export const foxieManifest: CharacterManifest = {
  id: 'foxie',
  label: 'Foxie (Hiệp Sĩ Cáo)',
  displayHeight: 96,
  physicsBodyHeightFraction: 0.35,
  physicsBodyWidthFraction: 0.5,
  actions: {
    idle: {
      id: 'idle',
      label: 'Đứng yên',
      frameDurationMs: 1000,
      loop: true,
      directions: {
        down: {
          textureKey: 'foxie_idle_down',
          path: 'assets/characters/foxie_idle_down.png',
          frameCount: 1,
          frameWidth: 192,
          frameHeight: 220
        },
        up: {
          textureKey: 'foxie_idle_up',
          path: 'assets/characters/foxie_idle_up.png',
          frameCount: 1,
          frameWidth: 192,
          frameHeight: 220
        },
        left: {
          textureKey: 'foxie_idle_left',
          path: 'assets/characters/foxie_idle_left.png',
          frameCount: 1,
          frameWidth: 192,
          frameHeight: 220
        }
      },
      mirrorFrom: { right: 'left' }
    },
    walk: {
      id: 'walk',
      label: 'Đi bộ',
      frameDurationMs: 180,
      loop: true,
      directions: {
        down: {
          textureKey: 'foxie_walk_down',
          path: 'assets/characters/foxie_walk_down.png',
          frameCount: 4,
          frameWidth: 192,
          frameHeight: 220
        },
        up: {
          textureKey: 'foxie_walk_up',
          path: 'assets/characters/foxie_walk_up.png',
          frameCount: 4,
          frameWidth: 192,
          frameHeight: 220
        },
        left: {
          textureKey: 'foxie_walk_left',
          path: 'assets/characters/foxie_walk_side.png',
          frameCount: 4,
          frameWidth: 192,
          frameHeight: 220
        }
      },
      mirrorFrom: { right: 'left' }
    }
  }
};
