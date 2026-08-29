import Phaser from 'phaser';
import { NPC } from './NPC';
import { NPCDef } from '../../types/Education';
import { InteractionManager } from '../interactions/InteractionManager';

/**
 * Spawns NPCs from data definitions and registers them with the
 * InteractionManager. Scenes call spawnFromDefs() rather than
 * constructing NPC instances by hand.
 */
export class NPCManager {
  private npcs: Map<string, NPC> = new Map();

  spawnFromDefs(
    scene: Phaser.Scene,
    defs: NPCDef[],
    interactionManager: InteractionManager,
    onInteract: (npc: NPC) => void
  ): void {
    defs.forEach((def) => {
      const npc = new NPC(scene, def, onInteract);
      this.npcs.set(def.id, npc);
      interactionManager.register(npc);
    });
  }

  getById(id: string): NPC | undefined {
    return this.npcs.get(id);
  }

  getAll(): NPC[] {
    return Array.from(this.npcs.values());
  }
}
