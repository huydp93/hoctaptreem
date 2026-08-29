import Phaser from 'phaser';
import { InputSource } from './InputManager';
import { VirtualJoystick } from './VirtualJoystick';

/**
 * Touch input source: virtual joystick (bottom-left) + a big interact
 * button (bottom-right). Implements InputSource so InputManager treats it
 * identically to KeyboardInput.
 */
export class TouchInput implements InputSource {
  private scene: Phaser.Scene;
  private joystick: VirtualJoystick;
  private interactButton: Phaser.GameObjects.Container;
  private interactBg: Phaser.GameObjects.Arc;
  private interactPressedThisFrame = false;
  private interactButtonVisible = true;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const { width, height } = scene.scale;

    const joyX = 110;
    const joyY = height - 130;
    this.joystick = new VirtualJoystick(scene, joyX, joyY);

    const btnX = width - 110;
    const btnY = height - 130;

    this.interactBg = scene.add.circle(0, 0, 55, 0xffb703, 0.9).setStrokeStyle(4, 0xffffff, 0.9);
    const icon = scene.add
      .text(0, 0, '💬', { fontSize: '42px' })
      .setOrigin(0.5);

    this.interactButton = scene.add
      .container(btnX, btnY, [this.interactBg, icon])
      .setScrollFactor(0)
      .setDepth(1002)
      .setSize(110, 110);

    this.interactBg.setInteractive({ useHandCursor: true });
    this.interactBg.on('pointerdown', () => {
      this.interactPressedThisFrame = true;
      this.scene.tweens.add({
        targets: this.interactButton,
        scale: 0.85,
        duration: 80,
        yoyo: true
      });
    });

    scene.scale.on('resize', this.handleResize, this);
  }

  private handleResize(gameSize: Phaser.Structs.Size): void {
    const width = gameSize.width;
    const height = gameSize.height;
    this.joystick.reposition(110, height - 130);
    this.interactButton.setPosition(width - 110, height - 130);
  }

  poll(): { x: number; y: number } {
    return this.joystick.getVector();
  }

  pollInteract(): boolean {
    const pressed = this.interactPressedThisFrame;
    this.interactPressedThisFrame = false;
    return pressed;
  }

  setInteractButtonVisible(visible: boolean): void {
    this.interactButtonVisible = visible;
    this.interactButton.setVisible(visible);
    // Subtle pulse to draw a child's attention when it becomes available
    if (visible) {
      this.interactButton.setScale(1);
      this.scene.tweens.add({
        targets: this.interactButton,
        scale: 1.12,
        duration: 350,
        yoyo: true,
        repeat: 1
      });
    }
  }

  isInteractButtonVisible(): boolean {
    return this.interactButtonVisible;
  }

  destroy(): void {
    this.scene.scale.off('resize', this.handleResize, this);
    this.joystick.destroy();
    this.interactButton.destroy();
  }
}
