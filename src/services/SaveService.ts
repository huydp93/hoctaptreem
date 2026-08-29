import { DEFAULT_SAVE_DATA, SaveData, QuestProgressRecord, AppearanceSave } from '../types/Save';

const STORAGE_KEY = 'lang-chu-cai-save-v1';

/**
 * The ONLY place in the codebase that touches localStorage.
 * Gameplay code (managers/scenes) must go through this service so that
 * swapping localStorage for a remote backend later requires changing
 * only this file.
 */
class SaveServiceImpl {
  private data: SaveData;

  constructor() {
    this.data = this.load();
  }

  private load(): SaveData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredCloneSafe(DEFAULT_SAVE_DATA);
      const parsed = JSON.parse(raw) as Partial<SaveData>;
      // Basic shape defense + v1→v2 appearance migration. Re-runnable:
      // missing/invalid bodyId falls back to the default Foxie body without
      // wiping stars/quests the player already owns.
      const appearance = migrateAppearance(parsed.appearance);
      return {
        version: 2,
        stars: parsed.stars ?? 0,
        completedQuests: parsed.completedQuests ?? [],
        learnedWords: parsed.learnedWords ?? [],
        questProgress: parsed.questProgress ?? {},
        appearance
      };
    } catch (e) {
      console.warn('[SaveService] Failed to load save, using defaults.', e);
      return structuredCloneSafe(DEFAULT_SAVE_DATA);
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('[SaveService] Failed to persist save.', e);
    }
  }

  getStars(): number {
    return this.data.stars;
  }

  addStars(amount: number): number {
    this.data.stars += amount;
    this.persist();
    return this.data.stars;
  }

  isWordLearned(wordId: string): boolean {
    return this.data.learnedWords.includes(wordId);
  }

  markWordLearned(wordId: string): void {
    if (!this.data.learnedWords.includes(wordId)) {
      this.data.learnedWords.push(wordId);
      this.persist();
    }
  }

  getQuestProgress(questId: string): QuestProgressRecord {
    if (!this.data.questProgress[questId]) {
      this.data.questProgress[questId] = {
        questId,
        collectedWordIds: [],
        completed: false
      };
    }
    return this.data.questProgress[questId];
  }

  saveQuestProgress(record: QuestProgressRecord): void {
    this.data.questProgress[record.questId] = record;
    this.persist();
  }

  isQuestCompleted(questId: string): boolean {
    return this.data.completedQuests.includes(questId);
  }

  markQuestCompleted(questId: string): void {
    if (!this.data.completedQuests.includes(questId)) {
      this.data.completedQuests.push(questId);
    }
    const progress = this.getQuestProgress(questId);
    progress.completed = true;
    this.persist();
  }

  resetQuest(questId: string): void {
    this.data.questProgress[questId] = {
      questId,
      collectedWordIds: [],
      completed: false
    };
    this.data.completedQuests = this.data.completedQuests.filter((id) => id !== questId);
    this.persist();
  }

  resetAll(): void {
    this.data = structuredCloneSafe(DEFAULT_SAVE_DATA);
    this.persist();
  }

  getAppearance(): AppearanceSave {
    return this.data.appearance;
  }

  setAppearanceBody(bodyId: string): void {
    this.data.appearance = migrateAppearance({ bodyId });
    this.persist();
  }
}

function structuredCloneSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

const KNOWN_BODY_IDS = new Set(['foxie']);

function migrateAppearance(raw: AppearanceSave | undefined): AppearanceSave {
  const bodyId =
    raw?.bodyId && KNOWN_BODY_IDS.has(raw.bodyId)
      ? raw.bodyId
      : DEFAULT_SAVE_DATA.appearance.bodyId;
  return { bodyId };
}

/** Singleton export — one save-state for the whole game session. */
export const SaveService = new SaveServiceImpl();
