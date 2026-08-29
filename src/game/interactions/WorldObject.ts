import Phaser from 'phaser';
import { Interactable } from './Interactable';
import { WorldObjectDef } from '../../types/Education';
import { WORLD_OBJECT_SOCKETS } from '../../types/Character';
import { resolveSocketPosition } from '../character/socketMath';

const INTERACTION_RADIUS = 75;

/**
 * A world object the player can interact with to attempt collecting a
 * vocabulary word (e.g. "bàn", "cốc"). Purely presentational + proximity
 * logic lives here; the actual "is this correct?" decision is delegated
 * to QuestManager via the onInteractCallback.
 *
 * Label/prompt/badge positions are resolved through the same generic
 * socket contract used by characters (WORLD_OBJECT_SOCKETS), instead of
 * hard-coded pixel offsets scattered per call site.
 */
export class WorldObject implements Interactable {
  id: string;
  public sprite: Phaser.Physics.Arcade.Sprite;
  private label: Phaser.GameObjects.Text;
  private prompt: Phaser.GameObjects.Text;
  private def: WorldObjectDef;
  private onInteractCallback: (def: WorldObjectDef) => void;
  private collectedGlow: Phaser.GameObjects.Arc | null = null;

  constructor(
    scene: Phaser.Scene,
    def: WorldObjectDef,
    displayLabel: string,
    onInteractCallback: (def: WorldObjectDef) => void
  ) {
    this.id = def.id;
    this.def = def;
    this.onInteractCallback = onInteractCallback;

    this.sprite = scene.physics.add.staticSprite(def.x, def.y, def.spriteKey).setDepth(30);

    const labelPos = resolveSocketPosition(this.sprite, 'label', WORLD_OBJECT_SOCKETS);
    this.label = scene.add
      .text(labelPos.x, labelPos.y, displayLabel, {
        fontSize: '14px',
        fontFamily: 'Baloo 2, Comic Sans MS, sans-serif',
        color: '#2f2f2f',
        backgroundColor: '#ffffffcc',
        padding: { x: 6, y: 2 }
      })
      .setOrigin(0.5)
      .setDepth(31);

    const promptPos = resolveSocketPosition(this.sprite, 'prompt', WORLD_OBJECT_SOCKETS);
    this.prompt = scene.add
      .text(promptPos.x, promptPos.y, '💬 Xem', {
        fontSize: '14px',
        fontFamily: 'Baloo 2, Comic Sans MS, sans-serif',
        color: '#ffffff',
        backgroundColor: '#4caf50',
        padding: { x: 8, y: 4 }
      })
      .setOrigin(0.5)
      .setDepth(32)
      .setVisible(false);
  }

  getDef(): WorldObjectDef {
    return this.def;
  }

  getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  getInteractionRadius(): number {
    return INTERACTION_RADIUS;
  }

  setHighlighted(highlighted: boolean): void {
    this.prompt.setVisible(highlighted);
    this.sprite.setScale(highlighted ? 1.08 : 1);
  }

  markCollected(scene: Phaser.Scene): void {
    if (this.collectedGlow) return;
    this.collectedGlow = scene.add
      .circle(this.def.x, this.def.y, 46, 0xffd54f, 0.35)
      .setDepth(29);
    scene.tweens.add({
      targets: this.collectedGlow,
      scale: { from: 0.6, to: 1.3 },
      alpha: { from: 0.6, to: 0 },
      duration: 700,
      ease: 'Cubic.Out'
    });
    // A little star badge above the object to show it's been found.
    const badgePos = resolveSocketPosition(this.sprite, 'badge', WORLD_OBJECT_SOCKETS);
    scene.add
      .text(badgePos.x, badgePos.y, '⭐', { fontSize: '22px' })
      .setOrigin(0.5)
      .setDepth(33);
  }

  onInteract(): void {
    this.onInteractCallback(this.def);
  }
}
