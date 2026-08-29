import Phaser from 'phaser';

/**
 * Friendly floating feedback messages ("Giỏi lắm!", "Gần đúng rồi!").
 * Never shows negative/punitive language — callers are responsible for
 * passing child-friendly copy (see design constraints in the quest logic).
 */
export class FeedbackToast {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  show(message: string, tone: 'success' | 'gentle' = 'success'): void {
    this.container?.destroy();

    const { width } = this.scene.scale;
    const bgColor = tone === 'success' ? 0x66bb6a : 0xffb74d;
    const emoji = tone === 'success' ? '🎉' : '🤔';

    const text = this.scene.add.text(0, 0, `${emoji} ${message}`, {
      fontSize: '22px',
      fontFamily: 'Baloo 2, Comic Sans MS, sans-serif',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 420 }
    }).setOrigin(0.5);

    const paddingX = 28;
    const paddingY = 18;
    const bg = this.scene.add
      .rectangle(0, 0, text.width + paddingX * 2, text.height + paddingY * 2, bgColor, 0.96)
      .setStrokeStyle(4, 0xffffff, 0.9);

    this.container = this.scene.add
      .container(width / 2, 130, [bg, text])
      .setScrollFactor(0)
      .setDepth(3000)
      .setAlpha(0);

    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      y: 150,
      duration: 220,
      ease: 'Back.Out'
    });

    this.scene.time.delayedCall(2200, () => {
      if (!this.container) return;
      this.scene.tweens.add({
        targets: this.container,
        alpha: 0,
        y: 110,
        duration: 300,
        onComplete: () => {
          this.container?.destroy();
          this.container = null;
        }
      });
    });
  }

  destroy(): void {
    this.container?.destroy();
  }
}
