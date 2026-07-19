// One command to run after writing a new article: `pnpm article`
//
//   1. fix-images      — downloads remote images referenced in recent articles
//                        into the article's img/ folder and rewrites the
//                        markdown to local paths (bun, bin/download-images.ts)
//   2. index-articles  — embeds new articles into Postgres for the
//                        related-articles widget; needs OPENAI_API_KEY and
//                        POSTGRES_URL, which bun loads from .env files
//                        (bun, bin/index-articles.ts)
//   3. image manifest  — refreshes lib/image-manifest.json with dimensions +
//                        LQIP for any new images, including ones step 1 just
//                        downloaded (node, scripts/build-image-manifest.mjs)
//
// Steps run in that order — the manifest must see step 1's downloads. A
// failing step doesn't stop the rest; the summary at the end says what needs
// attention.
import { spawnSync } from 'node:child_process';

const steps = [
  {
    name: 'fix-images',
    cmd: ['bun', 'bin/download-images.ts'],
    hint: 'remote image download failed — rerun `bun bin/download-images.ts` to retry',
  },
  {
    name: 'index-articles',
    cmd: ['bun', 'bin/index-articles.ts'],
    hint: 'needs OPENAI_API_KEY and POSTGRES_URL (bun reads .env / .env.local)',
  },
  {
    name: 'image manifest',
    cmd: ['node', 'scripts/build-image-manifest.mjs'],
    hint: 'rerun `pnpm images`',
  },
];

const failed = [];

for (const step of steps) {
  console.log(`\n▶ ${step.name}`);
  const result = spawnSync(step.cmd[0], step.cmd.slice(1), { stdio: 'inherit' });
  if (result.status !== 0) {
    failed.push(step);
    console.error(`✗ ${step.name} failed — ${step.hint}`);
  }
}

if (failed.length > 0) {
  console.error(`\n${failed.length} of ${steps.length} steps failed: ${failed.map((s) => s.name).join(', ')}`);
  process.exit(1);
}
console.log('\n✓ all done — commit the article, any downloaded images, and lib/image-manifest.json');
