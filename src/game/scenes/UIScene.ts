import Phaser from 'phaser';
import { HUD } from '../ui/HUD';
import { DialogueUI } from '../ui/DialogueUI';
import { QuestUI } from '../ui/QuestUI';
import { CompletionUI } from '../ui/CompletionUI';
import { FeedbackToast } from '../ui/FeedbackToast';
import { SaveService } from '../../services/SaveService';
import { Quest, QuestObjective } from '../../types/Education';

/**
 * A parallel UI-only scene (runs alongside VillageScene) so HUD/dialogue
 * elements are never affected by world camera scrolling and touch
 * controls (drawn here) stay on top. Communicates with VillageScene
 * purely through Phaser events — no direct references to gameplay classes.
 */
export class UIScene extends Phaser.Scene {
  private hud!: HUD;
  private dialogueUI!: DialogueUI;
  private questUI!: QuestUI;
  private completionUI!: CompletionUI;
  private feedbackToast!: FeedbackToast;
  private villageScene!: Phaser.Scene;

  constructor() {
    super({ key: 'UIScene', active: true });
  }

  create(): void {
    this.villageScene = this.scene.get('VillageScene');

    this.dialogueUI = new DialogueUI(this);
    this.questUI = new QuestUI(this);
    this.completionUI = new CompletionUI(this);
    this.feedbackToast = new FeedbackToast(this);

    this.hud = new HUD(this, SaveService.getStars(), () => this.handleSettingsClick());

    this.villageScene.events.on('dialogue-requested', this.handleDialogueRequested, this);
    this.villageScene.events.on('toast', this.handleToast, this);
    this.villageScene.events.on('stars-updated', this.handleStarsUpdated, this);
    this.villageScene.events.on('quest-ui-show', this.handleQuestUIShow, this);
    this.villageScene.events.on('quest-progress-updated', this.handleQuestProgress, this);
    this.villageScene.events.on('quest-completed', this.handleQuestCompleted, this);
    this.villageScene.events.on('village-restarted', this.handleVillageRestarted, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup());
  }

  private handleDialogueRequested = (speaker: string, lines: string[], onComplete: () => void): void => {
    // Pause player movement input feel by simply relying on dialogue box
    // grabbing pointer focus; movement keys are harmless while talking
    // since child attention is on the dialogue box.
    this.dialogueUI.show(speaker, lines, onComplete);
  };

  private handleToast = (message: string, tone: 'success' | 'gentle'): void => {
    this.feedbackToast.show(message, tone);
  };

  private handleStarsUpdated = (stars: number): void => {
    this.hud.setStars(stars);
  };

  private handleQuestUIShow = (quest: Quest, objective: QuestObjective, collected: number): void => {
    this.questUI.showQuest(quest, objective, collected);
  };

  private handleQuestProgress = (collected: number, required: number): void => {
    this.questUI.updateProgress(collected, required);
  };

  private handleQuestCompleted = (quest: Quest): void => {
    this.questUI.hide();
    this.completionUI.show(
      quest.title,
      () => this.completionUI.hide(),
      () => this.villageScene.events.emit('restart-quest-requested')
    );
  };

  private handleVillageRestarted = (): void => {
    // VillageScene.scene.restart() creates a brand new scene instance;
    // re-fetch the reference so future events keep working.
    this.villageScene = this.scene.get('VillageScene');
    this.hud.setStars(SaveService.getStars());
    this.completionUI.hide();
    this.dialogueUI.hide();
    this.questUI.hide();
  };

  private handleSettingsClick(): void {
    // Minimal settings affordance for the vertical slice: reset progress.
    // Kept intentionally simple; a full settings panel is out of scope.
    const confirmed = window.confirm('Bạn có muốn chơi lại từ đầu không? (Xóa tiến trình đã lưu)');
    if (confirmed) {
      SaveService.resetAll();
      this.hud.setStars(0);
      this.villageScene.scene.restart();
    }
  }

  private cleanup(): void {
    this.villageScene?.events.off('dialogue-requested', this.handleDialogueRequested, this);
    this.villageScene?.events.off('toast', this.handleToast, this);
    this.villageScene?.events.off('stars-updated', this.handleStarsUpdated, this);
    this.villageScene?.events.off('quest-ui-show', this.handleQuestUIShow, this);
    this.villageScene?.events.off('quest-progress-updated', this.handleQuestProgress, this);
    this.villageScene?.events.off('quest-completed', this.handleQuestCompleted, this);
    this.villageScene?.events.off('village-restarted', this.handleVillageRestarted, this);
  }
}
