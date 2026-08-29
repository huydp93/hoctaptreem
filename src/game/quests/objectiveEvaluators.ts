import { QuestObjective, VocabularyItem } from '../../types/Education';

/**
 * An evaluator decides whether interacting with a given vocabulary item
 * satisfies a specific objective. Adding a brand new quest style (rhymes,
 * tones, listening, image-matching, spelling) means adding one function
 * here + registering it — QuestManager itself never changes.
 */
export type ObjectiveEvaluator = (objective: QuestObjective, item: VocabularyItem) => boolean;

const evaluators: Record<string, ObjectiveEvaluator> = {
  find_by_initial_letter: (objective, item) => {
    return (
      objective.targetWordIds.includes(item.id) &&
      item.initialLetter.toUpperCase() === objective.criteria.toUpperCase()
    );
  },
  find_by_rhyme: (objective, item) => {
    return objective.targetWordIds.includes(item.id) && item.rhyme === objective.criteria;
  },
  find_by_tone: (objective, item) => {
    return objective.targetWordIds.includes(item.id) && item.tone === objective.criteria;
  },
  listen_and_find: (objective, item) => {
    return objective.targetWordIds.includes(item.id);
  },
  match_image_to_word: (objective, item) => {
    return objective.targetWordIds.includes(item.id);
  },
  spell_word: (objective, item) => {
    return objective.targetWordIds.includes(item.id);
  }
};

export function evaluateObjective(objective: QuestObjective, item: VocabularyItem): boolean {
  const evaluator = evaluators[objective.type];
  if (!evaluator) {
    console.warn(`[QuestManager] No evaluator registered for objective type "${objective.type}"`);
    return false;
  }
  return evaluator(objective, item);
}
