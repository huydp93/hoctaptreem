/** Persisted save-game shape. SaveService is the only place that reads/writes this. */

export interface QuestProgressRecord {
  questId: string;
  collectedWordIds: string[];
  completed: boolean;
}

export interface AppearanceSave {
  /** CharacterManifest.id of the player body. Unknown ids are cleaned on load. */
  bodyId: string;
}

export interface SaveData {
  version: number;
  stars: number;
  completedQuests: string[];
  learnedWords: string[];
  questProgress: Record<string, QuestProgressRecord>;
  appearance: AppearanceSave;
}

export const DEFAULT_SAVE_DATA: SaveData = {
  version: 2,
  stars: 0,
  completedQuests: [],
  learnedWords: [],
  questProgress: {},
  appearance: { bodyId: 'foxie' }
};
