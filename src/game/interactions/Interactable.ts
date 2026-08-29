import Phaser from 'phaser';

/**
 * Common contract for anything the player can walk up to and interact
 * with (NPCs, world objects). InteractionManager only depends on this
 * interface — it doesn't know about NPC or WorldObject concretely.
 */
export interface Interactable {
  /** Unique id for this interactable instance */
  id: string;
  /** The game object used for proximity/position checks */
  getPosition(): { x: number; y: number };
  /** Radius within which the player can trigger interaction */
  getInteractionRadius(): number;
  /** Called when the player presses interact while in range */
  onInteract(): void;
  /** Optional: called every frame while in/out of range (e.g. show a bubble) */
  setHighlighted?(highlighted: boolean): void;
}
