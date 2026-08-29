import Phaser from 'phaser';

/**
 * Full-screen quest completion celebration.
 * "Xuất sắc! Con đã hoàn thành nhiệm vụ chữ B." + star burst + Continue/Play again.
 */
export class CompletionUI {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  show(questTitle: string, onContinue: () => void, onPlayAgain: () => void): void {
    this.hide();
    const { width, height } = this.scene.scale;

    const overlay = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.55).setOrigin(0, 0);

    const panelWidth = Math.min(width - 60, 520);
    const panelHeight = 360;

    const panel = this.scene.add
      .rectangle(0, 0, panelWidth, panelHeight, 0xfff8e1, 0.98)
      .setStrokeStyle(6, 0xffca28);

    const titleText = this.scene.add
      .text(0, -panelHeight / 2 + 50, 'Xuất sắc! 🎉', {
        fontSize: '36px',
        fontFamily: 'Baloo 2, Comic Sans MS, sans-serif',
        color: '#e65100',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);

    const subText = this.scene.add
      .text(0, -panelHeight / 2 + 100, `Con đã hoàn thành ${questTitle}.`, {
        fontSize: '20px',
        fontFamily: 'Baloo 2, Comic Sans MS, sans-serif',
        color: '#5d4037',
        align: 'center',
        wordWrap: { width: panelWidth - 60 }
      })
      .setOrigin(0.5);

    const starRow: Phaser.GameObjects.Text[] = [];
    const starSpacing = 60;
    for (let i = 0; i < 3; i++) {
      const star = this.scene.add
        .text((i - 1) * starSpacing, -20, '⭐', { fontSize: '54px' })
        .setOrigin(0.5)
        .setScale(0);
      starRow.push(star);
    }

    const continueButton = this.makeButton(0, 100, '➡ Tiếp tục', 0x4caf50, onContinue);
    const playAgainButton = this.makeButton(0, 160, '🔄 Chơi lại', 0x42a5f5, onPlayAgain);

    this.container = this.scene.add
      .container(width / 2, height / 2, [
        overlay,
        panel,
        titleText,
        subText,
        ...starRow,
        continueButton,
        playAgainButton
      ])
      .setScrollFactor(0)
      .setDepth(5000);

    // Re-parent overlay to fill screen relative to container origin
    overlay.setPosition(-width / 2, -height / 2);

    starRow.forEach((star, i) => {
      this.scene.tweens.add({
        targets: star,
        scale: 1,
        duration: 400,
        delay: 250 + i * 180,
        ease: 'Back.Out'
      });
    });
  }

  private makeButton(
    x: number,
    y: number,
    label: string,
    color: number,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const bg = this.scene.add
      .rectangle(0, 0, 220, 52, color, 1)
      .setStrokeStyle(3, 0xffffff, 0.9);
    const text = this.scene.add
      .text(0, 0, label, {
        fontSize: '20px',
        fontFamily: 'Baloo 2, Comic Sans MS, sans-serif',
        color: '#ffffff',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);

    const container = this.scene.add.container(x, y, [bg, text]).setSize(220, 52);
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerdown', () => {
      this.scene.tweens.add({
        targets: container,
        scale: 0.94,
        duration: 80,
        yoyo: true,
        onComplete: onClick
      });
    });
    return container;
  }

  hide(): void {
    this.container?.destroy();
    this.container = null;
  }
}
