import Phaser from 'phaser';
import { InputState } from '../../types/Input';

export interface InputSource {
  /** Return current movement intent, both axes in -1..1 */
  poll(): { x: number; y: number };
  /** Return true only on the frame the interact action was triggered */
  pollInteract(): boolean;
}

/**
 * Single source of truth for player input intent.
 *
 *   Keyboard ─┐
 *   Touch     ├─► InputManager ─► PlayerController / InteractionManager
 *   Joystick ─┘
 *
 * Gameplay code (PlayerController, InteractionManager) only ever reads
 * `getState()` here. It never touches keyboard/touch APIs directly, so
 * behaviour is identical regardless of device.
 */
export class InputManager {
  private sources: InputSource[] = [];
  private state: InputState = { moveX: 0, moveY: 0, interactJustPressed: false };
  private movementLocked = false;

  registerSource(source: InputSource): void {
    this.sources.push(source);
  }

  /** Freeze WASD/joystick while a dialogue or completion overlay is open. */
  setMovementLocked(locked: boolean): void {
    this.movementLocked = locked;
  }

  isMovementLocked(): boolean {
    return this.movementLocked;
  }

  /** Call once per scene update, BEFORE reading getState() */
  update(): void {
    let x = 0;
    let y = 0;
    let interact = false;

    for (const source of this.sources) {
      const vec = this.movementLocked ? { x: 0, y: 0 } : source.poll();
      // First source with non-zero input this frame wins on that axis.
      if (vec.x !== 0 && x === 0) x = vec.x;
      if (vec.y !== 0 && y === 0) y = vec.y;
      if (!this.movementLocked && source.pollInteract()) interact = true;
    }

    const length = Math.hypot(x, y);
    if (length > 1) {
      x /= length;
      y /= length;
    }

    this.state = {
      moveX: Phaser.Math.Clamp(x, -1, 1),
      moveY: Phaser.Math.Clamp(y, -1, 1),
      interactJustPressed: interact
    };
  }

  getState(): InputState {
    return this.state;
  }
}
