import Phaser from 'phaser';
import { Quest, QuestObjective } from '../../types/Education';

/**
 * Small "current quest" tracker panel (📖). Shows the active objective
 * description and a X/required progress counter.
 */
export class QuestUI {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container | null = null;
  private progressText: Phaser.GameObjects.Text | null = null;
  private titleText: Phaser.GameObjects.Text | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  showQuest(quest: Quest, objective: QuestObjective, collected: number): void {
    this.hide();

    const { width } = this.scene.scale;
    const panelWidth = 300;

    const bg = this.scene.add
      .rectangle(0, 0, panelWidth, 78, 0xffffff, 0.94)
      .setStrokeStyle(3, 0x64b5f6)
      .setOrigin(0, 0);

    const icon = this.scene.add.text(10, 8, '📖', { fontSize: '22px' });

    this.titleText = this.scene.add.text(42, 6, quest.title, {
      fontSize: '16px',
      fontFamily: 'Baloo 2, Comic Sans MS, sans-serif',
      color: '#1565c0',
      fontStyle: 'bold'
    });

    const descText = this.scene.add.text(10, 30, objective.description, {
      fontSize: '13px',
      fontFamily: 'Baloo 2, Comic Sans MS, sans-serif',
      color: '#37474f',
      wordWrap: { width: panelWidth - 20 }
    });

    this.progressText = this.scene.add.text(10, 56, this.formatProgress(collected, objective.requiredCount), {
      fontSize: '14px',
      fontFamily: 'Baloo 2, Comic Sans MS, sans-serif',
      color: '#2e7d32',
      fontStyle: 'bold'
    });

    this.container = this.scene.add
      .container(width - panelWidth - 20, 84, [bg, icon, this.titleText, descText, this.progressText])
      .setScrollFactor(0)
      .setDepth(1900);
  }

  updateProgress(collected: number, required: number): void {
    this.progressText?.setText(this.formatProgress(collected, required));
  }

  private formatProgress(collected: number, required: number): string {
    return `⭐ ${collected} / ${required}`;
  }

  hide(): void {
    this.container?.destroy();
    this.container = null;
    this.progressText = null;
    this.titleText = null;
  }
}
