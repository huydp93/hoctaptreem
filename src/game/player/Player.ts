import Phaser from 'phaser';
import { CharacterView, CharacterDirection } from '../character/CharacterView';
import { CharacterRegistry } from '../character/CharacterRegistry';

export type PlayerDirection = CharacterDirection;

const CHARACTER_ID = 'foxie';

/**
 * The player game object: "Foxie" (Hiệp Sĩ Cáo).
 *
 * All texture/animation/sizing concerns are delegated to CharacterView,
 * which resolves everything from the 'foxie' CharacterManifest
 * (src/data/characters/foxie.ts). Player.ts itself only owns
 * movement-facing decisions (which direction/action to request) — it
 * never touches a texture key or pixel offset directly anymore.
 */
export class Player {
  public sprite: Phaser.Physics.Arcade.Sprite;
  private view: CharacterView;
  private lastDirection: PlayerDirection = 'down';
  private isMoving = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.view = new CharacterView(scene, CharacterRegistry, CHARACTER_ID, x, y, 'idle', 'down');
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
