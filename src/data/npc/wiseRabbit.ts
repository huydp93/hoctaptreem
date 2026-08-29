import { NPCDef } from '../../types/Education';

/**
 * "Thỏ Thông Thái" — the Wise Rabbit who guards the Magical Storybook.
 * Narrative role: he is the one who tells Hiệp Sĩ Cáo (Foxie) that
 * Công Chúa Tri Thức (the Princess of Knowledge) has been sealed away,
 * and that the only way to free her is to fill the Storybook's missing
 * pages by collecting words. This NPC hands out the first quest.
 */
export const wiseRabbitNPC: NPCDef = {
  id: 'npc_tho_thong_thai',
  name: 'Thỏ Thông Thái',
  characterId: 'wise_rabbit',
  x: 360,
  y: 350,
  greetLines: [
    'Chào Hiệp Sĩ Cáo dũng cảm! Ta là Thỏ Thông Thái, người giữ cuốn Sách Phép của Làng Chữ Cái.',
    'Than ôi, Công Chúa Tri Thức đã bị nhốt trong Tháp Phép Thuật vì những trang sách chữ B đã biến mất!',
    'Chỉ khi con tìm đủ những đồ vật bắt đầu bằng chữ B, các trang sách mới sáng lên và giải cứu được công chúa.'
  ],
  questGiveLines: [
    'Con hãy đi khắp làng, tìm 3 đồ vật bắt đầu bằng chữ B để lấp đầy trang sách còn thiếu nhé!'
  ],
  questId: 'quest_letter_b'
};
