import { Player } from './Player';
import { InputManager } from '../input/InputManager';

const MOVE_SPEED = 220; // pixels per second — Arcade Physics velocity is already frame-rate independent

/**
 * Bridges InputManager → Player. Contains zero device-specific logic:
 * whatever wrote into InputManager (keyboard, touch joystick) is treated
 * identically.
 *
 * No longer fakes walking with a scale "bob" — Player/CharacterView now
 * plays a real multi-frame walk animation whenever velocity is non-zero,
 * so this controller is purely responsible for translating input intent
 * into velocity.
 */
export class PlayerController {
  private player: Player;
  private inputManager: InputManager;

  constructor(player: Player, inputManager: InputManager) {
    this.player = player;
    this.inputManager = inputManager;
  }

  update(_delta: number): void {
    const { moveX, moveY } = this.inputManager.getState();

    const vx = moveX * MOVE_SPEED;
    const vy = moveY * MOVE_SPEED;
    this.player.setVelocity(vx, vy);
  }
}
