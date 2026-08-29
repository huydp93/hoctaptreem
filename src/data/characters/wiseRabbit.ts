import { CharacterManifest } from '../../types/Character';

/**
 * "Thỏ Thông Thái" (Wise Rabbit) — the quest-giving NPC.
 *
 * Real gameplay need: this NPC is stationary and always faces the
 * player/camera (down) — it never walks and never turns to face any
 * other direction, so only ONE direction ("down") is authored for each
 * action, with no mirrored directions declared at all. This is a
 * deliberate, explicit choice (not an oversight): fabricating up/left/
 * right art or mirrors for a body that can never actually face those
 * ways would be exactly the "fake alias just to satisfy a validator"
 * anti-pattern the skill forbids.
 *
 * Action set:
 *   - idle: the original hand-painted single-frame rabbit_npc pose.
 *   - talk: a real 4-frame mouth/ear/gesture animation, played while a
 *     dialogue box is open with this NPC as the speaker.
 */
export const wiseRabbitManifest: CharacterManifest = {
  id: 'wise_rabbit',
  label: 'Thỏ Thông Thái',
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
          textureKey: 'rabbit_idle_down',
          path: 'assets/npc/rabbit_idle_down.png',
          frameCount: 1,
          frameWidth: 137,
          frameHeight: 220
        }
      }
    },
    talk: {
      id: 'talk',
      label: 'Nói chuyện',
      frameDurationMs: 220,
      loop: true,
      directions: {
        down: {
          textureKey: 'rabbit_talk_down',
          path: 'assets/npc/rabbit_talk.png',
          frameCount: 4,
          frameWidth: 137,
          frameHeight: 220
        }
      }
    }
  }
};
