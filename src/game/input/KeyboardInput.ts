import Phaser from 'phaser';
import { InputSource } from './InputManager';

/**
 * Reads WASD / Arrow keys / E / Space and exposes normalized intent
 * through the InputSource interface. Knows nothing about gameplay.
 */
export class KeyboardInput implements InputSource {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keyE!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene) {
    const keyboard = scene.input.keyboard;
    this.cursors = keyboard!.createCursorKeys();
    this.keyW = keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyE = keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keySpace = keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  poll(): { x: number; y: number } {
    let x = 0;
    let y = 0;
    if (this.cursors.left.isDown || this.keyA.isDown) x -= 1;
    if (this.cursors.right.isDown || this.keyD.isDown) x += 1;
    if (this.cursors.up.isDown || this.keyW.isDown) y -= 1;
    if (this.cursors.down.isDown || this.keyS.isDown) y += 1;
    return { x, y };
  }

  pollInteract(): boolean {
    return (
      Phaser.Input.Keyboard.JustDown(this.keyE) || Phaser.Input.Keyboard.JustDown(this.keySpace)
    );
  }
}
