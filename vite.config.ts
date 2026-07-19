import { defineConfig } from 'vite';
import { timber } from '@timber-js/app';
import fs from 'node:fs';
import path from 'node:path';

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
//                          static output by scripts/copy-og-assets.mjs.
const pagesColocatedAssets = {
  name: 'pages-colocated-assets',
  configureServer(server: { middlewares: { use: Function } }) {
    const pagesDir = path.join(process.cwd(), 'pages');
    server.middlewares.use((req: { url?: string }, res: { writeHead: Function; end: Function }, next: Function) => {
      const url = req.url?.split('?')[0] ?? '';
      let rel: string;
      if (url.startsWith('/page-assets/')) {
        rel = url.slice('/page-assets/'.length);
      } else if (/^\/pages\/.+\.[^./]+$/.test(url) && !/\.mdx?$/.test(url)) {
        rel = url.slice('/pages/'.length);
      } else {
        return next();
      }
      const filePath = path.join(pagesDir, rel);
      if (filePath !== pagesDir && !filePath.startsWith(pagesDir + path.sep)) return next(); // traversal guard
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

export default defineConfig({
  plugins: [pagesColocatedAssets, timber()],
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
