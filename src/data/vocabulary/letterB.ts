import { VocabularyItem } from '../../types/Education';

/**
 * Vocabulary pool for the "Chữ B" (letter B) quest.
 * Correct answers: bàn, bút, bát
 * Decoys (start with a different letter, used as "close but not quite"):
 *   cốc, ghế, mèo
 */
export const letterBVocabulary: VocabularyItem[] = [
  {
    id: 'vocab_ban',
    word: 'bàn',
    displayText: 'Bàn',
    initialLetter: 'B',
    difficulty: 1
  },
  {
    id: 'vocab_but',
    word: 'bút',
    displayText: 'Bút',
    initialLetter: 'B',
    difficulty: 1
  },
  {
    id: 'vocab_bat',
    word: 'bát',
    displayText: 'Bát',
    initialLetter: 'B',
    difficulty: 1
  },
  {
    id: 'vocab_coc',
    word: 'cốc',
    displayText: 'Cốc',
    initialLetter: 'C',
    difficulty: 1
  },
  {
    id: 'vocab_ghe',
    word: 'ghế',
    displayText: 'Ghế',
    initialLetter: 'G',
    difficulty: 1
  },
  {
    id: 'vocab_meo',
    word: 'mèo',
    displayText: 'Mèo',
    initialLetter: 'M',
    difficulty: 1
  }
];
