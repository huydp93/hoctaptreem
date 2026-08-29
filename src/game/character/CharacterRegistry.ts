import {
  CharacterManifest,
  CharacterActionDef,
  CharacterDirection,
  CharacterDirectionFrames,
  CharacterSocketDef,
  STANDARD_SOCKETS
} from '../../types/Character';

/**
 * Central lookup for all CharacterManifests in the game. Gameplay code
 * (Player, NPC, DevLabScene) resolves everything about a character
 * (textures, frame counts, sockets, physics sizing) through this
 * registry — never by importing a specific manifest file directly or
 * branching on a character id string outside of manifest data.
 *
 * Registering a new character body/action is purely a data operation:
 * call `register()` with a new CharacterManifest. No engine code needs
 * to change.
 */
export class CharacterRegistryImpl {
  private manifests = new Map<string, CharacterManifest>();

  register(manifest: CharacterManifest): void {
    this.manifests.set(manifest.id, manifest);
  }

  getAll(): CharacterManifest[] {
    return Array.from(this.manifests.values());
  }

  get(characterId: string): CharacterManifest {
    const manifest = this.manifests.get(characterId);
    if (!manifest) {
      throw new Error(`CharacterRegistry: unknown character id "${characterId}"`);
    }
    return manifest;
  }

  has(characterId: string): boolean {
    return this.manifests.has(characterId);
  }

  getAction(characterId: string, actionId: string): CharacterActionDef {
    const manifest = this.get(characterId);
    const action = manifest.actions[actionId];
    if (!action) {
      throw new Error(
        `CharacterRegistry: character "${characterId}" has no action "${actionId}". ` +
          `Available actions: ${Object.keys(manifest.actions).join(', ')}`
      );
    }
    return action;
  }

  getSockets(characterId: string): CharacterSocketDef[] {
    return this.get(characterId).sockets ?? STANDARD_SOCKETS;
  }

  /**
   * Resolves the concrete spritesheet + mirror flag to render for a given
   * character/action/direction combination.
   *
   * Resolution order (explicit, no silent guessing):
   *  1. Directly authored direction frames -> no mirror.
   *  2. `mirrorFrom` declares this direction reuses another direction's
   *     art, flipped horizontally.
   *  3. Fails loudly — a manifest gap should never be papered over by
   *     reusing an unrelated action or direction.
   */
  resolveDirection(
    characterId: string,
    actionId: string,
    direction: CharacterDirection
  ): { frames: CharacterDirectionFrames; flipX: boolean; sourceDirection: CharacterDirection } {
    const action = this.getAction(characterId, actionId);

    const authored = action.directions[direction];
    if (authored) {
      return { frames: authored, flipX: false, sourceDirection: direction };
    }

    const mirrorSource = action.mirrorFrom?.[direction];
    if (mirrorSource) {
      const sourceFrames = action.directions[mirrorSource];
      if (sourceFrames) {
        return { frames: sourceFrames, flipX: true, sourceDirection: mirrorSource };
      }
    }

    throw new Error(
      `CharacterRegistry: character "${characterId}" action "${actionId}" has no art for ` +
        `direction "${direction}" (authored or mirrored). Fix the manifest — no silent fallback.`
    );
  }

  /** Every direction this action can render (authored OR mirrored). */
  getSupportedDirections(characterId: string, actionId: string): CharacterDirection[] {
    const action = this.getAction(characterId, actionId);
    const dirs = new Set<CharacterDirection>();
    (Object.keys(action.directions) as CharacterDirection[]).forEach((d) => dirs.add(d));
    if (action.mirrorFrom) {
      (Object.keys(action.mirrorFrom) as CharacterDirection[]).forEach((d) => dirs.add(d));
    }
    return Array.from(dirs);
  }
}

/** Singleton instance — mirrors the existing SaveService/VocabularyManager/QuestManager pattern in this codebase. */
export const CharacterRegistry = new CharacterRegistryImpl();
