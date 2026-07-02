import { defineConfig } from 'vite';
import { timber } from '@timber-js/app';
import fs from 'node:fs';
import path from 'node:path';

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

export default defineConfig({
  plugins: [pagesColocatedAssets, timber()],
});
