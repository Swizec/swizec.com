import { defineConfig } from 'vite';
import { timber } from '@timber-js/app';
import fs from 'node:fs';
import path from 'node:path';
import { IMAGE_WIDTHS } from './lib/image-sizes.mjs';

const MIME: Record<string, string> = {
  '.pdf':  'application/pdf',
  '.zip':  'application/zip',
  '.mp3':  'audio/mpeg',
  '.mp4':  'video/mp4',
  '.mov':  'video/quicktime',
  '.txt':  'text/plain',
  '.csv':  'text/csv',
  '.json': 'application/json',
  '.xml':  'application/xml',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

// Serves non-MDX files co-located in pages/ as static assets in dev mode.
const pagesColocatedAssets = {
  name: 'pages-colocated-assets',
  configureServer(server: { middlewares: { use: Function } }) {
    server.middlewares.use((req: { url?: string }, res: { writeHead: Function; end: Function }, next: Function) => {
      const url = req.url?.split('?')[0] ?? '';
      if (!/^\/pages\/.+\.[^./]+$/.test(url) || /\.mdx?$/.test(url)) return next();
      const filePath = path.join(process.cwd(), url);
      let stat: fs.Stats;
      try { stat = fs.statSync(filePath); } catch { return next(); }
      if (!stat.isFile()) return next();
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME[ext] ?? 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(fs.readFileSync(filePath));
    });
  },
};

const IMAGE_MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
};

// Dev implementation of Vercel's Image Optimization endpoint, so ContentImage
// srcsets work locally the same way they do deployed. Same contract:
// /_vercel/image?url=<local path>&w=<width>&q=<quality>, w validated against
// the shared size list. Resizes with sharp on each request — no cache, dev
// only.
const vercelImageDev = {
  name: 'vercel-image-dev',
  configureServer(server: { middlewares: { use: Function } }) {
    server.middlewares.use(async (req: { url?: string }, res: { writeHead: Function; end: Function }, next: Function) => {
      if (!req.url?.startsWith('/_vercel/image')) return next();
      const params = new URL(req.url, 'http://localhost').searchParams;
      const src = decodeURIComponent(params.get('url') ?? '').split(/[?#]/)[0];
      const width = Number(params.get('w'));
      if (!src.startsWith('/') || !IMAGE_WIDTHS.includes(width)) return next();

      const filePath = path.join(process.cwd(), src);
      if (!filePath.startsWith(process.cwd() + path.sep)) return next(); // traversal guard
      const ext = path.extname(filePath).toLowerCase();
      if (!IMAGE_MIME[ext]) return next();
      let stat: fs.Stats;
      try { stat = fs.statSync(filePath); } catch { return next(); }
      if (!stat.isFile()) return next();

      const { default: sharp } = await import('sharp');
      const buf = await sharp(filePath)
        .resize({ width, withoutEnlargement: true })
        .toBuffer();
      res.writeHead(200, { 'Content-Type': IMAGE_MIME[ext], 'Cache-Control': 'no-store' });
      res.end(buf);
    });
  },
};

export default defineConfig({
  plugins: [pagesColocatedAssets, vercelImageDev, timber()],
  resolve: {
    // Lets MDX pages import components without counting ../ hops:
    // import { NewsletterSignup } from '@/components/newsletter-signup'
    alias: {
      '@': new URL('.', import.meta.url).pathname,
    },
  },
});
