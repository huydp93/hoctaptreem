/** Persisted save-game shape. SaveService is the only place that reads/writes this. */

export interface QuestProgressRecord {
  questId: string;
  collectedWordIds: string[];
  completed: boolean;
}

export interface SaveData {
  version: number;
  stars: number;
  completedQuests: string[];
  learnedWords: string[];
  questProgress: Record<string, QuestProgressRecord>;
}

export const DEFAULT_SAVE_DATA: SaveData = {
  version: 1,
  stars: 0,
  completedQuests: [],
  learnedWords: [],
  questProgress: {}
};
