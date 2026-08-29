import Phaser from 'phaser';
import { gameConfig } from './game/config/gameConfig';
import { setupOrientationGuard } from './game/orientation';

setupOrientationGuard();

const nativeLoading = document.getElementById('native-loading');

const game = new Phaser.Game(gameConfig);

game.events.once(Phaser.Core.Events.READY, () => {
  if (nativeLoading) {
    nativeLoading.style.display = 'none';
  }
});

// Fallback: hide loading screen shortly after boot even if READY event
// timing differs across browsers.
window.setTimeout(() => {
  if (nativeLoading) nativeLoading.style.display = 'none';
}, 1500);
