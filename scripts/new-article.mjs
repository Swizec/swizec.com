// One command to run after writing a new article: `pnpm article` (optionally
// `pnpm article "commit message"`)
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
//   4. git             — commits pages/ + the manifest and pushes; only runs
//                        when steps 1-3 all succeeded, and only pushes master
//                        when the current branch IS master (on a feature
//                        branch it pushes that branch and says so)
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
  console.error('skipping git commit/push — fix the steps above and rerun');
  process.exit(1);
}

// ---- git: commit pages/ + manifest, push ----
console.log('\n▶ git');
const git = (...args) => spawnSync('git', args, { stdio: 'inherit' });
const gitRead = (...args) => spawnSync('git', args, { encoding: 'utf8' }).stdout.trim();

// Stage only the pipeline's outputs — new article files, downloaded images,
// and the manifest. Other working-tree changes stay untouched (the pathspec
// commit below ignores anything else already staged).
git('add', 'pages', 'lib/image-manifest.json');
const staged = spawnSync('git', ['diff', '--cached', '--quiet', '--', 'pages', 'lib/image-manifest.json']);
if (staged.status === 0) {
  console.log('nothing to commit in pages/ — done');
  process.exit(0);
}

const message = process.argv[2] ?? 'Update articles';
const commit = git('commit', '-m', message, '--', 'pages', 'lib/image-manifest.json');
if (commit.status !== 0) {
  console.error('✗ git commit failed');
  process.exit(1);
}

const branch = gitRead('rev-parse', '--abbrev-ref', 'HEAD');
const push = git('push', 'origin', branch);
if (push.status !== 0) {
  console.error(`✗ git push failed — run \`git push origin ${branch}\` manually`);
  process.exit(1);
}
if (branch !== 'master') {
  console.log(`note: on branch "${branch}", pushed there — master untouched`);
}
console.log('\n✓ all done — article processed, committed, and pushed');
