// @vercel/og reads resvg.wasm, yoga.wasm, and Geist-Regular.ttf via
// fs.readFileSync(new URL("./file", import.meta.url)) at runtime.
// After Rolldown bundles @vercel/og into _chunks/, import.meta.url points
// to the chunk file, so these assets must live in _chunks/ too.
//
// (The old config.json 302 patch for /opengraph-image.png is gone: the .png
// URLs are now served directly by app/**/opengraph-image.png/route.ts —
// Slack requires the extension and won't follow redirects.)
import { copyFileSync, mkdirSync } from 'node:fs';

const src = 'node_modules/@vercel/og/dist';
const dst = '.vercel/output/functions/__server.func/_chunks';

mkdirSync(dst, { recursive: true });
for (const file of ['resvg.wasm', 'yoga.wasm', 'Geist-Regular.ttf']) {
  copyFileSync(`${src}/${file}`, `${dst}/${file}`);
  console.log(`  copied ${file} → ${dst}/`);
}
