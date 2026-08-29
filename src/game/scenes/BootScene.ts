import Phaser from 'phaser';

/**
 * First scene: minimal setup before asset generation/loading begins.
 * Kept separate from PreloadScene so later a real asset manifest / loading
 * bar can be inserted here without touching gameplay scenes.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    this.scene.start('PreloadScene');
  }
}
