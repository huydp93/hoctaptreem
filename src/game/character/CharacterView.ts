import Phaser from 'phaser';
import { CharacterRegistryImpl } from './CharacterRegistry';
import { animationKey } from './animationKeys';
import { CharacterDirection, CharacterSocketDef } from '../../types/Character';

export type { CharacterDirection };

/**
 * The single runtime renderer for ANY character body in the game
 * (player, NPC). Wraps a Phaser.Physics.Arcade.Sprite (a static
 * `Phaser.GameObjects.Sprite` also works — physics-add is optional) and
 * drives it purely from CharacterRegistry data:
 *   - which spritesheet/animation to play for (action, direction)
 *   - whether to mirror (flipX)
 *   - where sockets resolve to in world space right now
 *
 * This is intentionally the ONLY place that calls `sprite.play()` /
 * `sprite.setFlipX()` / computes attachment offsets for characters, so
 * Player.ts and NPC.ts become thin wrappers instead of re-implementing
 * texture-swap logic each time a new body is added.
 */
export class CharacterView {
  readonly characterId: string;
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  private registry: CharacterRegistryImpl;
  private currentAction: string;
  private currentDirection: CharacterDirection;
  private displayHeight: number;
  /** Extra uniform scale applied on top of displayHeight (highlight, etc.). */
  private emphasisScale = 1;

  constructor(
    scene: Phaser.Scene,
    registry: CharacterRegistryImpl,
    characterId: string,
    x: number,
    y: number,
    initialAction: string,
    initialDirection: CharacterDirection
  ) {
    this.registry = registry;
    this.characterId = characterId;
    const manifest = registry.get(characterId);
    this.displayHeight = manifest.displayHeight;

    const initialFrames = registry.resolveDirection(characterId, initialAction, initialDirection);
    this.sprite = scene.physics.add.sprite(x, y, initialFrames.frames.textureKey, 0);
    // Center origin (Phaser default) — matches this project's existing
    // convention for Player/NPC/WorldObject, so every existing spawn
    // coordinate (NPCDef.x/y, WorldObjectDef.x/y, player spawn point)
    // keeps meaning "the character's center point" unchanged.

    this.currentAction = initialAction;
    this.currentDirection = initialDirection;

    this.applyDisplaySizing(initialFrames.frames.frameWidth, initialFrames.frames.frameHeight);
    this.applyPhysicsBody();
    this.play(initialAction, initialDirection, true);
  }

  /** Switches (or continues) the active action/direction. Preserves the
   * current animation phase when only the direction changes while the
   * action stays the same (e.g. turning while walking keeps mid-stride),
   * matching the skill's "phase preservation across transitions" rule. */
  play(actionId: string, direction: CharacterDirection, forceRestart = false): void {
    const resolved = this.registry.resolveDirection(this.characterId, actionId, direction);
    const key = animationKey(this.characterId, actionId, resolved.sourceDirection);

    const actionChanged = actionId !== this.currentAction;
    const directionChanged = direction !== this.currentDirection;
    const animChanged = this.sprite.anims.currentAnim?.key !== key;

    this.currentAction = actionId;
    this.currentDirection = direction;
    this.sprite.setFlipX(resolved.flipX);

    if (!animChanged && !forceRestart) {
      // Same underlying animation already playing (e.g. re-issuing
      // "walk left" every frame from PlayerController) — do nothing so
      // we never restart the walk cycle to frame 0 every tick.
      return;
    }

    if (animChanged) {
      // Resize for the new direction's native art dimensions. Idle and
      // walk sheets now share a common frame size so this is a no-op
      // for Foxie, but it still protects mixed-size bodies.
      this.applyDisplaySizing(resolved.frames.frameWidth, resolved.frames.frameHeight);
      this.applyPhysicsBody();
    }

    // If only direction changed within the SAME action (e.g. mirrored
    // left<->right walk), keep the current playback frame index so the
    // stride phase doesn't visibly reset — Phaser's play() with the
    // same underlying frame progress is approximated by reading the
    // current frame index before switching.
    if (!actionChanged && directionChanged && this.sprite.anims.currentAnim) {
      const currentFrameIndex = this.sprite.anims.currentFrame?.index ?? 0;
      this.sprite.anims.play(key, true);
      this.sprite.anims.setCurrentFrame(this.sprite.anims.currentAnim!.frames[currentFrameIndex] ?? this.sprite.anims.currentAnim!.frames[0]);
    } else {
      this.sprite.anims.play(key, forceRestart ? true : undefined);
    }
  }

  getCurrentAction(): string {
    return this.currentAction;
  }

  getCurrentDirection(): CharacterDirection {
    return this.currentDirection;
  }

  /** Resolves a named socket (root/label/prompt/badge/...) to current
   * world coordinates, based on the sprite's live display box (center
   * origin). Replaces every hard-coded `y - 62` style offset in
   * NPC.ts/WorldObject.ts with a single generic lookup. */
  getSocketPosition(socketId: string): { x: number; y: number } {
    const sockets = this.registry.getSockets(this.characterId);
    const socket = sockets.find((s: CharacterSocketDef) => s.id === socketId);
    if (!socket) {
      throw new Error(`CharacterView: character "${this.characterId}" has no socket "${socketId}"`);
    }
    const xSign = this.sprite.flipX ? -1 : 1;
    const x = this.sprite.x + socket.xOffsetFraction * xSign * this.sprite.displayWidth;
    const y = this.sprite.y + socket.yOffsetFraction * this.sprite.displayHeight;
    return { x, y };
  }

  /** The bottom edge (ground line) of the sprite in world Y — used by
   * dev-lab overlays to visually verify root/foot stability across
   * walk-cycle frames (skill section 6: "ground line", "root drift"). */
  getGroundLineY(): number {
    return this.sprite.y + this.sprite.displayHeight / 2;
  }

  /**
   * Visual emphasis (e.g. NPC highlight) without mutating Phaser's
   * scaleX/scaleY — those are owned by applyDisplaySizing so a highlight
   * that called sprite.setScale(1.06) used to fight the display-size
   * contract and jitter the physics body.
   */
  setEmphasisScale(scale: number): void {
    this.emphasisScale = scale;
    const frames = this.registry.resolveDirection(
      this.characterId,
      this.currentAction,
      this.currentDirection
    );
    this.applyDisplaySizing(frames.frames.frameWidth, frames.frames.frameHeight);
  }

  /** Pause/resume the current Phaser animation without changing action. */
  setPaused(paused: boolean): void {
    if (paused) this.sprite.anims.pause();
    else this.sprite.anims.resume();
  }

  isPaused(): boolean {
    return this.sprite.anims.isPaused;
  }

  /** Seek to a 0-based frame inside the current animation (dev-lab scrubber). */
  seekFrame(frameIndex: number): void {
    const anim = this.sprite.anims.currentAnim;
    if (!anim) return;
    const frame = anim.frames[Phaser.Math.Clamp(frameIndex, 0, anim.frames.length - 1)];
    if (frame) this.sprite.anims.setCurrentFrame(frame);
  }

  getCurrentFrameIndex(): number {
    return this.sprite.anims.currentFrame?.index ?? 0;
  }

  getCurrentFrameCount(): number {
    return this.sprite.anims.currentAnim?.frames.length ?? 1;
  }

  private applyDisplaySizing(nativeWidth: number, nativeHeight: number): void {
    const scale = (this.displayHeight / nativeHeight) * this.emphasisScale;
    this.sprite.setDisplaySize(nativeWidth * scale, this.displayHeight * this.emphasisScale);
  }

  /** Sizes the Arcade Physics collider to just the "feet" area of a tall
   * character render (matches the original Player.ts convention: a
   * center-origin sprite with the collider sitting at the bottom ~35%),
   * so collision feels grounded rather than head-height. */
  private applyPhysicsBody(): void {
    const manifest = this.registry.get(this.characterId);
    const bodyWidth = this.sprite.displayWidth * manifest.physicsBodyWidthFraction;
    const bodyHeight = this.sprite.displayHeight * manifest.physicsBodyHeightFraction;
    this.sprite.setSize(bodyWidth / this.sprite.scaleX, bodyHeight / this.sprite.scaleY);
    this.sprite.setOffset(
      (this.sprite.width - bodyWidth / this.sprite.scaleX) / 2,
      this.sprite.height - bodyHeight / this.sprite.scaleY - 4
    );
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
