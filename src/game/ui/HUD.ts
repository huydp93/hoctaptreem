import Phaser from 'phaser';

/**
 * Top-level HUD: star counter + settings button.
 * Pure presentation — reacts to events, never reaches into game state
 * directly.
 */
export class HUD {
  private scene: Phaser.Scene;
  private starIcon: Phaser.GameObjects.Text;
  private starText: Phaser.GameObjects.Text;
  private starContainer: Phaser.GameObjects.Container;
  private settingsButton: Phaser.GameObjects.Text;
  private currentStars = 0;

  constructor(scene: Phaser.Scene, initialStars: number, onSettingsClick: () => void) {
    this.scene = scene;
    this.currentStars = initialStars;

    const bg = scene.add
      .rectangle(0, 0, 118, 52, 0xffffff, 0.92)
      .setStrokeStyle(3, 0xffca28)
      .setOrigin(0, 0);

    this.starIcon = scene.add.text(10, 8, '⭐', { fontSize: '30px' });
    this.starText = scene.add.text(52, 12, `${initialStars}`, {
      fontSize: '26px',
      fontFamily: 'Baloo 2, Comic Sans MS, sans-serif',
      color: '#5d4037',
      fontStyle: 'bold'
    });

    this.starContainer = scene.add
      .container(20, 20, [bg, this.starIcon, this.starText])
      .setScrollFactor(0)
      .setDepth(2000);

    this.settingsButton = scene.add
      .text(0, 0, '⚙', {
        fontSize: '30px',
        color: '#ffffff',
        backgroundColor: '#78909c',
        padding: { x: 12, y: 6 }
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(2000)
      .setInteractive({ useHandCursor: true });

    this.settingsButton.on('pointerdown', onSettingsClick);

    this.layout();
    scene.scale.on('resize', this.layout, this);
  }

  private layout(): void {
    const { width } = this.scene.scale;
    this.settingsButton.setPosition(width - 20, 20);
  }

  setStars(stars: number): void {
    this.currentStars = stars;
    this.starText.setText(`${stars}`);
    this.scene.tweens.add({
      targets: this.starContainer,
      scale: { from: 1.25, to: 1 },
      duration: 220,
      ease: 'Back.Out'
    });
  }

  destroy(): void {
    this.scene.scale.off('resize', this.layout, this);
    this.starContainer.destroy();
    this.settingsButton.destroy();
  }
}
