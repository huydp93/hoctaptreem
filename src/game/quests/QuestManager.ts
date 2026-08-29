import Phaser from 'phaser';
import { Quest, QuestObjective } from '../../types/Education';
import { QuestRuntimeState, createInitialQuestState } from './QuestState';
import { evaluateObjective } from './objectiveEvaluators';
import { VocabularyManager } from '../education/VocabularyManager';
import { SaveService } from '../../services/SaveService';
import { questLetterB } from '../../data/quests/questLetterB';

const ALL_QUESTS: Quest[] = [questLetterB];

export type QuestManagerEvent =
  | 'quest-started'
  | 'objective-progress'
  | 'word-correct'
  | 'word-incorrect'
  | 'word-already-collected'
  | 'quest-completed';

/**
 * Generic, data-driven quest engine.
 * Scenes never hard-code quest logic — they call `tryCollectWord()` and
 * listen to events. New quest types are added purely via data +
 * objectiveEvaluators, not by touching this class.
 */
class QuestManagerImpl extends Phaser.Events.EventEmitter {
  private questsById: Map<string, Quest> = new Map();
  private activeState: QuestRuntimeState | null = null;
  private activeQuest: Quest | null = null;

  constructor() {
    super();
    ALL_QUESTS.forEach((quest) => this.questsById.set(quest.id, quest));
  }

  getQuestById(id: string): Quest | undefined {
    return this.questsById.get(id);
  }

  getActiveQuest(): Quest | null {
    return this.activeQuest;
  }

  getActiveState(): QuestRuntimeState | null {
    return this.activeState;
  }

  isQuestActive(questId: string): boolean {
    return this.activeQuest?.id === questId && this.activeState?.status === 'active';
  }

  startQuest(questId: string): void {
    const quest = this.questsById.get(questId);
    if (!quest) {
      console.warn(`[QuestManager] Unknown quest id: ${questId}`);
      return;
    }

    if (SaveService.isQuestCompleted(questId)) {
      // Already completed previously — still allow replay via explicit resetQuest()
    }

    const saved = SaveService.getQuestProgress(questId);
    const state = createInitialQuestState(questId);
    state.status = 'active';
    saved.collectedWordIds.forEach((id) => state.collectedWordIds.add(id));

    this.activeQuest = quest;
    this.activeState = state;

    this.emit('quest-started', quest, state);
  }

  /** Called when the player interacts with a world object tied to a vocabulary word */
  tryCollectWord(vocabularyId: string): void {
    if (!this.activeQuest || !this.activeState || this.activeState.status !== 'active') return;

    const item = VocabularyManager.getById(vocabularyId);
    if (!item) return;

    const objective = this.getCurrentObjective();
    if (!objective) return;

    const isMatch = evaluateObjective(objective, item);

    if (!isMatch) {
      this.emit('word-incorrect', item, objective);
      return;
    }

    if (this.activeState.collectedWordIds.has(vocabularyId)) {
      // Prevent double-counting stars for spamming the same object
      this.emit('word-already-collected', item, objective);
      return;
    }

    this.activeState.collectedWordIds.add(vocabularyId);
    SaveService.markWordLearned(vocabularyId);

    const progressRecord = SaveService.getQuestProgress(this.activeQuest.id);
    progressRecord.collectedWordIds = [...this.activeState.collectedWordIds];
    SaveService.saveQuestProgress(progressRecord);

    const stars = SaveService.addStars(1);

    const collectedCount = this.activeState.collectedWordIds.size;
    this.emit('word-correct', item, objective, collectedCount, stars);
    this.emit('objective-progress', objective, collectedCount, objective.requiredCount);

    if (collectedCount >= objective.requiredCount) {
      this.completeQuest();
    }
  }

  private getCurrentObjective(): QuestObjective | null {
    if (!this.activeQuest) return null;
    // Vertical slice only supports a single objective per quest;
    // structure already supports arrays for future multi-objective quests.
    return this.activeQuest.objectives[0] ?? null;
  }

  private completeQuest(): void {
    if (!this.activeQuest || !this.activeState) return;
    this.activeState.status = 'completed';
    SaveService.markQuestCompleted(this.activeQuest.id);
    this.emit('quest-completed', this.activeQuest);
  }

  /** Restart the active quest's progress (used by the "play again" button) */
  restartActiveQuest(): void {
    if (!this.activeQuest) return;
    SaveService.resetQuest(this.activeQuest.id);
    this.startQuest(this.activeQuest.id);
  }
}

export const QuestManager = new QuestManagerImpl();
