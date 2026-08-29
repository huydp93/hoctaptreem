import { WorldObjectDef } from '../types/Education';

/**
 * The 6 interactive objects placed in the "Làng Chữ Cái" map for the
 * vertical slice. 3 correct (bàn, bút, bát) + 3 decoys (cốc, ghế, mèo)
 * scattered around the new village_map.jpg landmarks so the child has
 * to explore the whole village. Coordinates were chosen to sit on open
 * grass/path areas, clear of building footprints and the pond.
 */
export const villageWorldObjects: WorldObjectDef[] = [
  { id: 'obj_ban', vocabularyId: 'vocab_ban', x: 540, y: 410, spriteKey: 'obj_ban' }, // grass near mushroom house, off the stone path
  { id: 'obj_but', vocabularyId: 'vocab_but', x: 1000, y: 390, spriteKey: 'obj_but' }, // grass between pond path and school garden
  { id: 'obj_bat', vocabularyId: 'vocab_bat', x: 430, y: 840, spriteKey: 'obj_bat' }, // grass beside candy shop
  { id: 'obj_coc', vocabularyId: 'vocab_coc', x: 1380, y: 800, spriteKey: 'obj_coc' }, // playground interior, off the ring path
  { id: 'obj_ghe', vocabularyId: 'vocab_ghe', x: 780, y: 960, spriteKey: 'obj_ghe' }, // grass west of tower door
  { id: 'obj_meo', vocabularyId: 'vocab_meo', x: 150, y: 560, spriteKey: 'obj_meo' } // fruit garden
];
