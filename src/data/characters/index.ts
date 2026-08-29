import { CharacterRegistry } from '../../game/character/CharacterRegistry';
import { foxieManifest } from './foxie';
import { wiseRabbitManifest } from './wiseRabbit';

/**
 * Registers every CharacterManifest the game knows about. Adding a new
 * character body/pack is purely: (1) drop its manifest file in
 * src/data/characters/, (2) register it here. No engine code changes.
 */
export function registerAllCharacterManifests(): void {
  CharacterRegistry.register(foxieManifest);
  CharacterRegistry.register(wiseRabbitManifest);
}
