import { Quest } from '../../types/Education';

export const questLetterB: Quest = {
  id: 'quest_letter_b',
  title: 'Giải Cứu Công Chúa Tri Thức',
  lessonId: 'lesson_letter_b',
  npcId: 'npc_tho_thong_thai',
  objectives: [
    {
      id: 'objective_find_b_words',
      type: 'find_by_initial_letter',
      description: 'Tìm 3 đồ vật bắt đầu bằng chữ B để thắp sáng Sách Phép',
      criteria: 'B',
      targetWordIds: ['vocab_ban', 'vocab_but', 'vocab_bat'],
      requiredCount: 3
    }
  ],
  rewards: {
    stars: 3
  }
};
