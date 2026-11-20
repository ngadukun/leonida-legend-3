// Leonida Legend — hand-in program (Node 22, standard library only).
//
// The guide itself is the static app in app/ (open app/index.html in a
// browser; it works fully offline). This program hands the entry in: it
// sanity-checks the trophy data, copies app/ and screenshots/ into the
// output directory, and writes dossier.json there with buildDossier from
// vendor/makefun-frontend.ts — the vendored library stays byte-identical to
// the kit's, because the scorer rebuilds the dossier with its own copy and
// compares the two byte for byte.
//
// Where the output goes: MAKEFUN_OUTPUT_DIR when set, else /output (the
// grader's mount). Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Pre-flight: the data file must name all 55 official trophies, each with a
// guide of its own — the same two things the gate's trophies row checks.
const data = JSON.parse(readFileSync(join(repoRoot, 'app', 'data', 'trophies.json'), 'utf8'));
const list = Array.isArray(data) ? data : data.trophies;
if (!Array.isArray(list) || list.length !== 55) {
  throw new Error(`trophies.json must hold exactly 55 trophies, found ${Array.isArray(list) ? list.length : 'none'}`);
}
const unguided = list.filter((t) => typeof t.guide !== 'string' || t.guide.trim() === '');
if (unguided.length > 0) {
  throw new Error(`trophies with no guide: ${unguided.map((t) => t.name).join(', ')}`);
}

// Copy the entry into the output directory.
mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// Write the dossier with the scorer's own caps, so an entry the scorer would
// refuse (too many or too-large screenshots, an oversized app/) fails here
// first instead of at the gate.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);

console.log(`Leonida Legend handed in: app/ and screenshots/ copied to ${outputDir}, dossier.json written.`);
