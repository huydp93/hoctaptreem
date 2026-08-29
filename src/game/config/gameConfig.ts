import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { PreloadScene } from '../scenes/PreloadScene';
import { VillageScene } from '../scenes/VillageScene';
import { UIScene } from '../scenes/UIScene';

/**
 * Central Phaser game configuration.
 * Uses Phaser.Scale.RESIZE so the canvas fills the #app container and
 * adapts responsively to PC / tablet / phone viewports; UI/HUD elements
 * position themselves relative to `scene.scale` at runtime.
 */
export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  backgroundColor: '#7ec850',
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  render: {
    pixelArt: false,
    antialias: true
  },
  scene: [BootScene, PreloadScene, VillageScene, UIScene]
};
