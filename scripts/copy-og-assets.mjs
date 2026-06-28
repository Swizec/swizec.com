// @vercel/og reads resvg.wasm, yoga.wasm, and Geist-Regular.ttf via
// fs.readFileSync(new URL("./file", import.meta.url)) at runtime.
// After Rolldown bundles @vercel/og into _chunks/, import.meta.url points
// to the chunk file, so these assets must live in _chunks/ too.
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const src = 'node_modules/@vercel/og/dist';
const dst = '.vercel/output/functions/__server.func/_chunks';

mkdirSync(dst, { recursive: true });
for (const file of ['resvg.wasm', 'yoga.wasm', 'Geist-Regular.ttf']) {
  copyFileSync(`${src}/${file}`, `${dst}/${file}`);
  console.log(`  copied ${file} → ${dst}/`);
}

// Nitro's Vercel preset generates config.json for routing. vercel.json rewrites
// are ignored when the Build Output API is used, so we patch config.json directly.
// This adds a 302 redirect from */opengraph-image.png → */opengraph-image so
// the og:image URL with .png extension resolves to the actual image handler.
const configPath = '.vercel/output/config.json';
const config = JSON.parse(readFileSync(configPath, 'utf8'));

const redirect = {
  src: '/(.+)/opengraph-image\\.png',
  dest: '/$1/opengraph-image',
  status: 302,
};

const catchAllIndex = config.routes.findIndex((r) => r.src === '/(.*)');
config.routes.splice(
  catchAllIndex === -1 ? config.routes.length : catchAllIndex,
  0,
  redirect,
);

writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log('  patched config.json: /*/opengraph-image.png → /*/opengraph-image (302)');
