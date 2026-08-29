import { VocabularyItem } from '../../types/Education';
import { letterBVocabulary } from '../../data/vocabulary/letterB';

/**
 * Central registry of all vocabulary items across all lessons.
 * Adding a new lesson's vocabulary = adding a new data file + registering
 * it here. No engine code changes required.
 */
const ALL_VOCABULARY: VocabularyItem[] = [...letterBVocabulary];

class VocabularyManagerImpl {
  private byId: Map<string, VocabularyItem> = new Map();

  constructor() {
    ALL_VOCABULARY.forEach((item) => this.byId.set(item.id, item));
  }

  getById(id: string): VocabularyItem | undefined {
    return this.byId.get(id);
  }

  getMany(ids: string[]): VocabularyItem[] {
    return ids.map((id) => this.byId.get(id)).filter(Boolean) as VocabularyItem[];
  }

  getAll(): VocabularyItem[] {
    return [...this.byId.values()];
  }
}

export const VocabularyManager = new VocabularyManagerImpl();
