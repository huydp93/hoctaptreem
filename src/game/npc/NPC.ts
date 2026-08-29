import Phaser from 'phaser';
import { Interactable } from '../interactions/Interactable';
import { NPCDef } from '../../types/Education';
import { CharacterView } from '../character/CharacterView';
import { CharacterRegistry } from '../character/CharacterRegistry';

const INTERACTION_RADIUS = 90;

/**
 * A talkable NPC. Implements Interactable so InteractionManager can treat
 * it the same as any world object. Dialogue content comes purely from
 * NPCDef data; rendering/animation comes purely from CharacterView +
 * the character's CharacterManifest (def.characterId).
 *
 * Label/prompt positions are resolved through CharacterView's socket
 * contract (STANDARD_SOCKETS: 'label', 'prompt') instead of hard-coded
 * pixel offsets, so any NPC body — regardless of its art's native
 * width/height — gets correctly placed floating text.
 */
export class NPC implements Interactable {
  id: string;
  private view: CharacterView;
  public sprite: Phaser.Physics.Arcade.Sprite;
  private nameLabel: Phaser.GameObjects.Text;
  private prompt: Phaser.GameObjects.Text;
  private def: NPCDef;
  private onInteractCallback: (npc: NPC) => void;
  private isTalking = false;

  constructor(scene: Phaser.Scene, def: NPCDef, onInteractCallback: (npc: NPC) => void) {
    this.id = def.id;
    this.def = def;
    this.onInteractCallback = onInteractCallback;

    this.view = new CharacterView(scene, CharacterRegistry, def.characterId, def.x, def.y, 'idle', 'down');
    this.sprite = this.view.sprite;
    this.sprite.setDepth(40);
    // NPCs are stationary — no physics movement needed, but we keep the
    // Arcade body (created by CharacterView) immovable so the player's
    // collider against it still works without the NPC being pushed.
    this.sprite.setImmovable(true);

    const labelPos = this.view.getSocketPosition('label');
    this.nameLabel = scene.add
      .text(labelPos.x, labelPos.y, def.name, {
        fontSize: '16px',
        fontFamily: 'Baloo 2, Comic Sans MS, sans-serif',
        color: '#4a2c00',
        backgroundColor: '#fff6d8',
        padding: { x: 8, y: 4 }
      })
      .setOrigin(0.5)
      .setDepth(41);

    const promptPos = this.view.getSocketPosition('prompt');
    this.prompt = scene.add
      .text(promptPos.x, promptPos.y, '💬 Nói chuyện', {
        fontSize: '15px',
        fontFamily: 'Baloo 2, Comic Sans MS, sans-serif',
        color: '#ffffff',
        backgroundColor: '#4caf50',
        padding: { x: 10, y: 5 }
      })
      .setOrigin(0.5)
      .setDepth(42)
      .setVisible(false);
  }

  getDef(): NPCDef {
    return this.def;
  }

  getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  getInteractionRadius(): number {
    return INTERACTION_RADIUS;
  }

  setHighlighted(highlighted: boolean): void {
    this.prompt.setVisible(highlighted);
    this.view.setEmphasisScale(highlighted ? 1.06 : 1);
  }

  /** Plays the NPC's real "talk" animation (mouth/ear/gesture motion)
   * while a dialogue box is open with this NPC as the speaker, then
   * returns to idle when the dialogue ends. Called by VillageScene's
   * dialogue-requested/dialogue-closed wiring. */
  setTalking(talking: boolean): void {
    if (talking === this.isTalking) return;
    this.isTalking = talking;
    this.view.play(talking ? 'talk' : 'idle', 'down');
  }

  onInteract(): void {
    this.onInteractCallback(this);
  }
}
