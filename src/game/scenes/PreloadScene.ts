import Phaser from 'phaser';
import { generatePlaceholderTextures } from './placeholderAssets';
import { CharacterRegistry } from '../character/CharacterRegistry';
import { registerAllCharacterManifests } from '../../data/characters';
import { preloadCharacterAssets } from '../character/preloadCharacterAssets';
import { registerCharacterAnimations } from '../character/registerCharacterAnimations';

/**
 * Loads all real art assets (village map, environment obstacles,
 * vocabulary object icons, and every character body's spritesheets —
 * loaded generically from the CharacterRegistry manifests, see
 * preloadCharacterAssets), generates the few remaining procedural
 * textures (particle effects), registers real Phaser animations for
 * every character action/direction, then hands off to the main
 * gameplay scene + parallel UI scene.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload(): void {
    // --- Character manifests (data-driven; no hard-coded texture keys here) ---
    registerAllCharacterManifests();
    preloadCharacterAssets(this, CharacterRegistry);

    // --- Environment ---
    this.load.image('village_map', 'assets/environment/village_map.jpg');
    this.load.image('env_tree', 'assets/environment/tree.png');
    this.load.image('env_rock', 'assets/environment/rock.png');

    // --- Vocabulary object icons ---
    this.load.image('obj_ban', 'assets/objects/obj_ban.png');
    this.load.image('obj_but', 'assets/objects/obj_but.png');
    this.load.image('obj_bat', 'assets/objects/obj_bat.png');
    this.load.image('obj_coc', 'assets/objects/obj_coc.png');
    this.load.image('obj_ghe', 'assets/objects/obj_ghe.png');
    this.load.image('obj_meo', 'assets/objects/obj_meo.png');
  }

  create(): void {
    generatePlaceholderTextures(this);
    registerCharacterAnimations(this, CharacterRegistry);
    const openLab = new URLSearchParams(window.location.search).get('lab') === '1';
    this.scene.start(openLab ? 'DevLabScene' : 'VillageScene');
    if (!openLab) this.scene.start('UIScene');
  }
}
