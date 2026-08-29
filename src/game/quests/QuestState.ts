export type QuestStatus = 'not_started' | 'active' | 'completed';

/** Runtime (in-memory) state for the currently active quest, mirrored to SaveService. */
export interface QuestRuntimeState {
  questId: string;
  status: QuestStatus;
  /** vocabulary ids the player has already collected (prevents double counting) */
  collectedWordIds: Set<string>;
}

export function createInitialQuestState(questId: string): QuestRuntimeState {
  return {
    questId,
    status: 'not_started',
    collectedWordIds: new Set()
  };
}
