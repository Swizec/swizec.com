import { defineConfig } from 'vite';
import { timber } from '@timber-js/app';
import fs from 'node:fs';
import path from 'node:path';
import { IMAGE_WIDTHS } from './lib/image-sizes.mjs';

const MIME: Record<string, string> = {
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.bmp':  'image/bmp',
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

// Serves files co-located in pages/ as static assets in dev mode:
//   /pages/<path>        — body assets (images become Vite imports, but PDFs
//                          and other files link through here)
//   /page-assets/<path>  — hero images (frontmatter strings, resolved relative
//                          to the MDX file). In prod these are copied to the
//                          static output by scripts/copy-hero-images.mjs.
//   /wp-content/<path>   — legacy WordPress uploads from static/wp-content;
//                          referenced ones are copied to the static output by
//                          scripts/copy-wp-content.mjs.
//   /pdfs/<path>         — talk slides etc. from static/pdfs, copied to the
//                          static output by the same script.
const pagesColocatedAssets = {
  name: 'pages-colocated-assets',
  configureServer(server: { middlewares: { use: Function } }) {
    const pagesDir = path.join(process.cwd(), 'pages');
    const staticDir = path.join(process.cwd(), 'static');
    server.middlewares.use((req: { url?: string }, res: { writeHead: Function; end: Function }, next: Function) => {
      const url = decodeURIComponent(req.url?.split('?')[0] ?? '');
      let baseDir = pagesDir;
      let rel: string;
      if (url.startsWith('/page-assets/')) {
        rel = url.slice('/page-assets/'.length);
      } else if (url.startsWith('/wp-content/') || url.startsWith('/pdfs/')) {
        baseDir = staticDir;
        rel = url; // static/wp-content and static/pdfs mirror the public paths
      } else if (/^\/pages\/.+\.[^./]+$/.test(url) && !/\.mdx?$/.test(url)) {
        rel = url.slice('/pages/'.length);
      } else {
        return next();
      }
      const filePath = path.join(baseDir, rel);
      if (filePath !== baseDir && !filePath.startsWith(baseDir + path.sep)) return next(); // traversal guard
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

      // /wp-content/ lives under static/; everything else resolves from the
      // repo root (pages/, app/assets, …)
      const filePath = src.startsWith('/wp-content/')
        ? path.join(process.cwd(), 'static', src)
        : path.join(process.cwd(), src);
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
  // public/ is gitignored Gatsby build output that still exists on dev
  // machines. Without this, local builds copy those stale files into
  // .vercel/output (and dev serves them, shadowing routes) while Vercel CI —
  // where public/ is empty — does neither. False makes both match CI.
  publicDir: false,
  // Vite doesn't treat .wasm as a generic asset by default (it reserves the
  // `?init` handling), so takumi's wasm must be opted in for the ?inline
  // import in components/og-image.ts to work.
  assetsInclude: ['**/*.wasm'],
  resolve: {
    // Lets MDX pages import components without counting ../ hops:
    // import { NewsletterSignup } from '@/components/newsletter-signup'
    alias: {
      '@': new URL('.', import.meta.url).pathname,
    },
  },
});
