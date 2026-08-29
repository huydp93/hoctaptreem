/**
 * Runtime contract checks that don't need Phaser:
 *  - Player body is resolved from SaveService, not a hard-coded pack name
 *    at every call site
 *  - CharacterView is the only sprite.play / setFlipX owner
 *  - Village + DevLab share CharacterView
 *
 * Run: npm run test:runtime
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (p.endsWith('.ts')) acc.push(p);
  }
  return acc;
}

const files = walk(SRC);
const problems = [];

const player = readFileSync(join(SRC, 'game/player/Player.ts'), 'utf8');
if (!/SaveService\.getAppearance\(\)/.test(player)) {
  problems.push('Player.ts does not resolve body from SaveService appearance');
}
if (/const CHARACTER_ID = 'foxie'/.test(player)) {
  problems.push('Player.ts still hard-codes CHARACTER_ID = foxie');
}

const view = readFileSync(join(SRC, 'game/character/CharacterView.ts'), 'utf8');
if (!/anims\.play/.test(view) || !/setFlipX/.test(view)) {
  problems.push('CharacterView is missing play/flipX ownership');
}

for (const file of files) {
  if (file.endsWith('CharacterView.ts')) continue;
  const src = readFileSync(file, 'utf8');
  if (/\.anims\.play\(/.test(src) && /game\/(player|npc)\//.test(file)) {
    problems.push(`${file.replace(SRC, 'src')} calls anims.play — should go through CharacterView`);
  }
}

const lab = readFileSync(join(SRC, 'game/scenes/DevLabScene.ts'), 'utf8');
if (!/new CharacterView/.test(lab)) {
  problems.push('DevLabScene does not construct CharacterView (forbidden demo renderer)');
}
if (!/auditCharacterManifests/.test(lab)) {
  problems.push('DevLabScene does not run auditCharacterManifests');
}

const village = readFileSync(join(SRC, 'game/scenes/VillageScene.ts'), 'utf8');
if (!/new Player\(/.test(village)) {
  problems.push('VillageScene no longer constructs Player');
}

if (problems.length) {
  console.error('FAIL  runtime contract\n');
  for (const p of problems) console.error('  •', p);
  process.exit(1);
}
console.log('PASS  runtime contract  (shared CharacterView, save-driven body, lab audit)');
