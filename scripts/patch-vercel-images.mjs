// Enables Vercel's Image Optimization API for the deployment by merging an
// `images` config into the Build Output config nitro generates. ContentImage
// srcsets point at /_vercel/image?url=&w=&q= — Vercel resizes on first
// request and edge-caches the result, so nothing is pregenerated at build.
//
// Source URLs are content-hashed Vite assets, so a long cache TTL is safe:
// changed images get new URLs.
import { readFileSync, writeFileSync } from 'node:fs';
import { IMAGE_WIDTHS, IMAGE_QUALITY } from '../lib/image-sizes.mjs';

const file = '.vercel/output/config.json';
const config = JSON.parse(readFileSync(file, 'utf8'));

config.images = {
  sizes: IMAGE_WIDTHS,
  domains: [],
  formats: ['image/avif', 'image/webp'],
  qualities: [IMAGE_QUALITY],
  minimumCacheTTL: 31536000, // 1 year
};

writeFileSync(file, JSON.stringify(config, null, 2));
console.log(`  images config (sizes: ${IMAGE_WIDTHS.join(', ')}) → ${file}`);
