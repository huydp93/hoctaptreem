/**
 * Education data models.
 * These types define the "curriculum" shape so new lessons/quests can be
 * added later purely as data, without touching engine code.
 */

export interface Reward {
  stars: number;
  /** Optional extra reward hooks for the future (badges, items, etc.) */
  badgeId?: string;
}

export interface VocabularyItem {
  id: string;
  /** The canonical Vietnamese word, e.g. "bàn" */
  word: string;
  /** Text shown to the player in UI (may include diacritics/emoji) */
  displayText: string;
  /** The initial letter/sound this word is tagged with, e.g. "B" */
  initialLetter: string;
  /** Optional rhyme tag for future "find words with rhyme X" quests */
  rhyme?: string;
  /** Optional tone tag for future tone-recognition quests */
  tone?: 'ngang' | 'sac' | 'huyen' | 'hoi' | 'nga' | 'nang';
  image?: string;
  audio?: string;
  difficulty: number;
}

export interface Lesson {
  id: string;
  title: string;
  ageRange: string;
  difficulty: number;
  learningObjective: string;
  vocabulary: string[]; // VocabularyItem ids
  rewards: Reward;
}

/**
 * Quest objective types. The QuestManager evaluates objects the player
 * interacts with against the active objective's `type`. New quest styles
 * (rhymes, tones, listening, matching, spelling) can be added by adding a
 * new type + evaluator, without rewriting QuestManager itself.
 */
export type QuestObjectiveType =
  | 'find_by_initial_letter'
  | 'find_by_rhyme'
  | 'find_by_tone'
  | 'listen_and_find'
  | 'match_image_to_word'
  | 'spell_word';

export interface QuestObjective {
  id: string;
  type: QuestObjectiveType;
  /** Human readable instruction shown in Quest UI */
  description: string;
  /** The letter/rhyme/tone criteria depending on objective type */
  criteria: string;
  /** Vocabulary ids that satisfy this objective */
  targetWordIds: string[];
  /** How many of targetWordIds must be found to satisfy the objective */
  requiredCount: number;
}

export interface Quest {
  id: string;
  title: string;
  lessonId: string;
  npcId: string;
  objectives: QuestObjective[];
  rewards: Reward;
}

/** A single interactable world object tied to a vocabulary word */
export interface WorldObjectDef {
  id: string;
  vocabularyId: string;
  x: number;
  y: number;
  spriteKey: string;
}

export interface NPCDef {
  id: string;
  name: string;
  /** Character id resolved via CharacterRegistry (src/data/characters/*) — not a raw Phaser texture key. */
  characterId: string;
  x: number;
  y: number;
  greetLines: string[];
  questGiveLines: string[];
  questId?: string;
}
