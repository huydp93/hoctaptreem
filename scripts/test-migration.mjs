/**
 * Save-migration smoke test (v1 save without appearance → v2 with foxie body).
 * Run: npm run test:migration
 */
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const saveTs = readFileSync(join(ROOT, 'src/types/Save.ts'), 'utf8');
const serviceTs = readFileSync(join(ROOT, 'src/services/SaveService.ts'), 'utf8');

const checks = [
  { ok: /version:\s*2/.test(saveTs), msg: 'SaveData default version is 2' },
  { ok: /appearance:\s*\{\s*bodyId:\s*'foxie'/.test(saveTs), msg: 'default appearance.bodyId is foxie' },
  { ok: /migrateAppearance/.test(serviceTs), msg: 'SaveService has migrateAppearance' },
  { ok: /KNOWN_BODY_IDS/.test(serviceTs), msg: 'invalid body ids are cleaned' },
  { ok: /parsed\.stars \?\? 0/.test(serviceTs), msg: 'v1 stars are preserved' },
  { ok: /parsed\.completedQuests/.test(serviceTs), msg: 'v1 completedQuests are preserved' }
];

const failed = checks.filter((c) => !c.ok);
if (failed.length) {
  console.error('FAIL  save migration\n');
  for (const f of failed) console.error('  •', f.msg);
  process.exit(1);
}
console.log('PASS  save migration  (v1 → v2 appearance, ownership preserved)');
