import Phaser from 'phaser';
import { Interactable } from './Interactable';
import { InputManager } from '../input/InputManager';
import { Player } from '../player/Player';

/**
 * Tracks all registered Interactables, finds the nearest one within range
 * of the player each frame, highlights it, and triggers onInteract() when
 * the InputManager reports an interact press.
 */
export class InteractionManager extends Phaser.Events.EventEmitter {
  private interactables: Interactable[] = [];
  private currentTarget: Interactable | null = null;

  register(interactable: Interactable): void {
    this.interactables.push(interactable);
  }

  unregister(id: string): void {
    this.interactables = this.interactables.filter((i) => i.id !== id);
  }

  update(player: Player, inputManager: InputManager): void {
    const playerPos = { x: player.x, y: player.y };
    let nearest: Interactable | null = null;
    let nearestDist = Infinity;

    for (const interactable of this.interactables) {
      const pos = interactable.getPosition();
      const dist = Phaser.Math.Distance.Between(playerPos.x, playerPos.y, pos.x, pos.y);
      if (dist <= interactable.getInteractionRadius() && dist < nearestDist) {
        nearest = interactable;
        nearestDist = dist;
      }
    }

    if (nearest !== this.currentTarget) {
      this.currentTarget?.setHighlighted?.(false);
      nearest?.setHighlighted?.(true);
      this.currentTarget = nearest;
      this.emit('target-changed', nearest);
    }

    if (this.currentTarget && inputManager.getState().interactJustPressed) {
      this.currentTarget.onInteract();
    }
  }

  getCurrentTarget(): Interactable | null {
    return this.currentTarget;
  }
}
