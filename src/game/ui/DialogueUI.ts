import Phaser from 'phaser';

/**
 * A simple dialogue box for NPC lines. Shows one line at a time with a
 * "tiếp" (next) button; calls onComplete when all lines are shown.
 */
export class DialogueUI {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  show(speakerName: string, lines: string[], onComplete: () => void): void {
    this.hide();

    let index = 0;
    const { width, height } = this.scene.scale;

    const boxWidth = Math.min(width - 60, 640);
    const boxHeight = 150;
    const boxY = height - boxHeight / 2 - 24;

    const bg = this.scene.add
      .rectangle(0, 0, boxWidth, boxHeight, 0xffffff, 0.97)
      .setStrokeStyle(4, 0xffca28);

    const nameTag = this.scene.add
      .text(-boxWidth / 2 + 20, -boxHeight / 2 - 16, speakerName, {
        fontSize: '18px',
        fontFamily: 'Baloo 2, Comic Sans MS, sans-serif',
        color: '#ffffff',
        backgroundColor: '#ff7043',
        padding: { x: 12, y: 6 }
      })
      .setOrigin(0, 1);

    const lineText = this.scene.add
      .text(-boxWidth / 2 + 24, -boxHeight / 2 + 22, lines[index], {
        fontSize: '22px',
        fontFamily: 'Baloo 2, Comic Sans MS, sans-serif',
        color: '#3e2723',
        wordWrap: { width: boxWidth - 48 }
      })
      .setOrigin(0, 0);

    const nextButton = this.scene.add
      .text(boxWidth / 2 - 24, boxHeight / 2 - 20, 'Tiếp ▶', {
        fontSize: '18px',
        fontFamily: 'Baloo 2, Comic Sans MS, sans-serif',
        color: '#ffffff',
        backgroundColor: '#4caf50',
        padding: { x: 14, y: 8 }
      })
      .setOrigin(1, 1)
      .setInteractive({ useHandCursor: true });

    this.container = this.scene.add
      .container(width / 2, boxY, [bg, nameTag, lineText, nextButton])
      .setScrollFactor(0)
      .setDepth(3500)
      .setAlpha(0)
      .setScale(0.9);

    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      scale: 1,
      duration: 200,
      ease: 'Back.Out'
    });

    nextButton.on('pointerdown', () => {
      index += 1;
      if (index >= lines.length) {
        this.hide();
        onComplete();
      } else {
        lineText.setText(lines[index]);
      }
    });
  }

  isVisible(): boolean {
    return this.container !== null;
  }

  hide(): void {
    this.container?.destroy();
    this.container = null;
  }
}
