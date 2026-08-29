import Phaser from 'phaser';
import { CharacterView, CharacterDirection } from '../character/CharacterView';
import { CharacterRegistry } from '../character/CharacterRegistry';
import { SaveService } from '../../services/SaveService';

export type PlayerDirection = CharacterDirection;

/**
 * The player game object. Body id is resolved from SaveService appearance
 * (with a foxie fallback) so adding a second playable body later is a
 * data/save change, not a Player.ts rewrite.
 *
 * All texture/animation/sizing concerns are delegated to CharacterView.
 * Player.ts itself only owns movement-facing decisions.
 */
export class Player {
  public sprite: Phaser.Physics.Arcade.Sprite;
  private view: CharacterView;
  private lastDirection: PlayerDirection = 'down';
  private isMoving = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const savedBody = SaveService.getAppearance().bodyId;
    const characterId = CharacterRegistry.has(savedBody) ? savedBody : 'foxie';
    this.view = new CharacterView(scene, CharacterRegistry, characterId, x, y, 'idle', 'down');
    this.sprite = this.view.sprite;
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(50);
  }

  setVelocity(x: number, y: number): void {
    this.sprite.setVelocity(x, y);
    this.isMoving = x !== 0 || y !== 0;
    this.updateFacing(x, y);
    this.view.play(this.isMoving ? 'walk' : 'idle', this.lastDirection);
  }

  private updateFacing(x: number, y: number): void {
    if (!this.isMoving) return;
    if (Math.abs(x) > Math.abs(y)) {
      this.lastDirection = x > 0 ? 'right' : 'left';
    } else {
      this.lastDirection = y > 0 ? 'down' : 'up';
    }
  }

  get x(): number {
    return this.sprite.x;
  }

  get y(): number {
    return this.sprite.y;
  }

  /** Exposes the underlying CharacterView so callers (dynamic depth
   * sorting, dev-lab) can query socket/ground-line positions generically. */
  getCharacterView(): CharacterView {
    return this.view;
  }

  getBody(): Phaser.Physics.Arcade.Body {
    return this.sprite.body as Phaser.Physics.Arcade.Body;
  }
}
