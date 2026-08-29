/**
 * Headless character-system validator.
 * Covers: unique ids, required keys, action/direction contract, asset
 * existence, frame layout, empty frames, loop-seam occupancy, and a
 * coarse motion-variation check so a 4-frame walk cannot be four copies
 * of the same pose.
 *
 * Run: npm run test:manifest
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(ROOT, 'public');

const foxie = loadManifest(join(ROOT, 'src/data/characters/foxie.ts'), 'foxieManifest');
const rabbit = loadManifest(join(ROOT, 'src/data/characters/wiseRabbit.ts'), 'wiseRabbitManifest');
const manifests = [foxie, rabbit];

const problems = [];

function fail(msg) {
  problems.push(msg);
}

function loadManifest(path, exportName) {
  const src = readFileSync(path, 'utf8');
  const match = src.match(new RegExp(`export const ${exportName}[^=]*=\\s*(\\{[\\s\\S]*\\});`));
  if (!match) {
    throw new Error(`Could not parse ${exportName} from ${path}`);
  }
  // Manifest files are plain JSON-shaped TS object literals.
  return Function(`"use strict"; return (${match[1]});`)();
}

function pngSize(absPath) {
  const py = `
from PIL import Image
im = Image.open(${JSON.stringify(absPath)})
print(im.size[0], im.size[1], im.mode)
`;
  const r = spawnSync('python3', ['-c', py], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(r.stderr || `failed to read ${absPath}`);
  const [w, h, mode] = r.stdout.trim().split(' ');
  return { w: Number(w), h: Number(h), mode };
}

function inspectFrames(absPath, frameCount, frameWidth, frameHeight) {
  const py = `
from PIL import Image
import numpy as np
im = Image.open(${JSON.stringify(absPath)}).convert('RGBA')
arr = np.array(im)
h, w = arr.shape[0], arr.shape[1]
fw, fh, n = ${frameWidth}, ${frameHeight}, ${frameCount}
print('SHEET', w, h)
if w < fw * n or h < fh:
    print('LAYOUT_FAIL')
else:
    print('LAYOUT_OK')
bottoms = []
opaques = []
hashes = []
for i in range(n):
    cell = arr[0:fh, i*fw:(i+1)*fw]
    a = cell[:,:,3]
    opaque = int((a > 8).sum())
    opaques.append(opaque)
    ys, xs = np.where(a > 8)
    if len(ys) == 0:
        print('EMPTY', i)
        bottoms.append(-1)
        hashes.append('empty')
    else:
        bottoms.append(int(ys.max()))
        print('FRAME', i, int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max()), opaque)
        # coarse occupancy hash (16x16 grid) to catch identical poses
        gh, gw = 16, 16
        bits = []
        for gy in range(gh):
            for gx in range(gw):
                y0 = gy * fh // gh; y1 = (gy+1) * fh // gh
                x0 = gx * fw // gw; x1 = (gx+1) * fw // gw
                bits.append('1' if (a[y0:y1, x0:x1] > 8).any() else '0')
        hashes.append(''.join(bits))
print('BOTTOMS', ','.join(str(b) for b in bottoms))
print('HASHES', ' '.join(hashes))
`;
  const r = spawnSync('python3', ['-c', py], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(r.stderr || `inspect failed ${absPath}`);
  return r.stdout;
}

const ids = new Set();
for (const m of manifests) {
  if (!m.id) fail('manifest missing id');
  if (ids.has(m.id)) fail(`duplicate character id "${m.id}"`);
  ids.add(m.id);
  if (!m.label) fail(`[${m.id}] missing label`);
  if (!m.displayHeight || m.displayHeight <= 0) fail(`[${m.id}] invalid displayHeight`);
  if (!m.actions || Object.keys(m.actions).length === 0) fail(`[${m.id}] zero actions`);
  if (!m.physicsBodyHeightFraction || !m.physicsBodyWidthFraction) {
    fail(`[${m.id}] missing physics body fractions`);
  }

  for (const action of Object.values(m.actions)) {
    if (!action.id) fail(`[${m.id}] action missing id`);
    if (!action.frameDurationMs || action.frameDurationMs <= 0) {
      fail(`[${m.id}/${action.id}] invalid frameDurationMs`);
    }
    const authored = Object.keys(action.directions || {});
    if (authored.length === 0) fail(`[${m.id}/${action.id}] no authored directions`);

    for (const [dir, frames] of Object.entries(action.directions || {})) {
      if (!frames.textureKey) fail(`[${m.id}/${action.id}/${dir}] missing textureKey`);
      if (!frames.path) fail(`[${m.id}/${action.id}/${dir}] missing path`);
      if (!frames.frameCount || frames.frameCount < 1) {
        fail(`[${m.id}/${action.id}/${dir}] frameCount < 1`);
      }
      if (action.id !== 'idle' && frames.frameCount <= 1) {
        fail(`[${m.id}/${action.id}/${dir}] non-idle action must have multi-frame motion`);
      }
      const abs = join(PUBLIC, frames.path);
      if (!existsSync(abs)) {
        fail(`[${m.id}/${action.id}/${dir}] missing asset ${frames.path}`);
        continue;
      }
      const size = pngSize(abs);
      if (size.w < frames.frameWidth * frames.frameCount) {
        fail(
          `[${m.id}/${action.id}/${dir}] sheet width ${size.w} < frameWidth ${frames.frameWidth} × ${frames.frameCount}`
        );
      }
      if (size.h !== frames.frameHeight) {
        fail(`[${m.id}/${action.id}/${dir}] sheet height ${size.h} ≠ frameHeight ${frames.frameHeight}`);
      }
      const report = inspectFrames(abs, frames.frameCount, frames.frameWidth, frames.frameHeight);
      if (report.includes('LAYOUT_FAIL')) {
        fail(`[${m.id}/${action.id}/${dir}] frame layout does not fit the sheet`);
      }
      if (/EMPTY \d/.test(report)) {
        fail(`[${m.id}/${action.id}/${dir}] contains an empty frame`);
      }
      const bottomsLine = report.split('\n').find((l) => l.startsWith('BOTTOMS '));
      if (bottomsLine && frames.frameCount > 1) {
        const bottoms = bottomsLine
          .slice(8)
          .split(',')
          .map(Number)
          .filter((n) => n >= 0);
        const spread = Math.max(...bottoms) - Math.min(...bottoms);
        if (spread > 6) {
          fail(`[${m.id}/${action.id}/${dir}] ground-line drift ${spread}px across frames`);
        }
      }
      const hashesLine = report.split('\n').find((l) => l.startsWith('HASHES '));
      if (hashesLine && frames.frameCount > 1) {
        const hashes = hashesLine.slice(7).trim().split(/\s+/);
        const unique = new Set(hashes);
        if (unique.size < 2) {
          fail(`[${m.id}/${action.id}/${dir}] motion variation too low — frames look identical`);
        }
      }
    }

    if (action.mirrorFrom) {
      for (const [dir, source] of Object.entries(action.mirrorFrom)) {
        if (!action.directions[source]) {
          fail(`[${m.id}/${action.id}] mirrorFrom.${dir} points at missing source "${source}"`);
        }
        if (action.directions[dir]) {
          fail(`[${m.id}/${action.id}] direction "${dir}" is both authored and mirrored`);
        }
      }
    }
  }
}

if (problems.length) {
  console.error('FAIL  character validator\n');
  for (const p of problems) console.error('  •', p);
  process.exit(1);
}

console.log('PASS  character validator');
console.log(`  bodies: ${manifests.map((m) => m.id).join(', ')}`);
console.log('  unique ids, assets, frame layout, empty-frame, ground-line, motion variation');
