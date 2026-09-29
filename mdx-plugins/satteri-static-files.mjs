// Transforms relative image src and file href values into Vite asset imports.
// Images become ES default imports rendered through <ContentImage> (responsive
// srcset + full-size link); other files (PDFs, etc.) use the ?url suffix so
// Vite copies them as static assets and returns the hashed URL.
//
// Each image also gets its intrinsic width/height (the browser reserves the
// aspect-ratio box before loading — no layout shift) and, for opaque rasters,
// a ~20px LQIP inlined as a data URI that ContentImage stretches under the
// real image while it loads. Both come from the committed manifest
// (lib/image-manifest.json, regenerated with `pnpm images`) — a sync lookup,
// so the Vite build does no image decoding. Running 3k+ sharp decodes inside
// the build OOM'd Vercel's builder; images missing from the manifest fall
// back to on-the-fly sharp with a warning, so a forgotten regen degrades to a
// slightly slower build, not broken pages.
//
// Satteri MDAST plugin (factory: the import table resets per document). Must
// run AFTER satteri-embeds so giphy:/youtube/etc. are already gone.
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { defineMdastPlugin } from 'satteri';
import { esm, componentImportNodes, filePathOf } from './helpers.mjs';
import { wpContentUrlPath, wpContentDiskPath } from '../lib/wp-content.mjs';

const manifest = createRequire(import.meta.url)('../lib/image-manifest.json');
const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

const LQIP_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif']);

// Fallback results for images not in the manifest, one entry per process.
const fallbackCache = new Map();

function imageMeta(absPath, ext) {
  // SVGs are never in the manifest: no LQIP (vector), and they pass through
  // ContentImage untouched.
  if (ext === '.svg') return null;
  // NFC-normalize: macOS stores some filenames NFD, markdown URLs arrive NFC —
  // APFS opens either, but a JSON key lookup is normalization-sensitive.
  const key = path.relative(repoRoot, absPath).split(path.sep).join('/').normalize('NFC');
  const entry = manifest[key];
  if (entry) {
    return { width: entry.w, height: entry.h, placeholder: entry.lqip };
  }

  const cached = fallbackCache.get(absPath);
  if (cached) return cached;

  console.warn(`[images] ${key} missing from lib/image-manifest.json — run \`pnpm images\``);
  const promise = (async () => {
    try {
      const { default: sharp } = await import('sharp');
      const image = sharp(absPath);
      const meta = await image.metadata();
      if (!meta.width || !meta.height) return null;
      const rotated = (meta.orientation ?? 1) >= 5;
      const result = {
        width: rotated ? meta.height : meta.width,
        height: rotated ? meta.width : meta.height,
      };
      if (LQIP_EXTS.has(ext) && !meta.hasAlpha) {
        const buf = await image.rotate().resize(20).webp({ quality: 20 }).toBuffer();
        result.placeholder = `data:image/webp;base64,${buf.toString('base64')}`;
      }
      return result;
    } catch {
      return null; // corrupt/unreadable — render without dimensions
    }
  })();
  fallbackCache.set(absPath, promise);
  return promise;
}

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.avif', '.ico', '.bmp']);

const ASSET_EXTS = new Set([
  '.pdf', '.zip', '.tar', '.gz',
  '.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt',
  '.mp3', '.mp4', '.mov', '.avi', '.webm', '.ogg',
  '.txt', '.csv', '.json', '.xml',
]);

function getExt(url) {
  const clean = url.split('?')[0].split('#')[0];
  const name = clean.slice(clean.lastIndexOf('/') + 1);
  const dot = name.lastIndexOf('.');
  return dot >= 0 ? name.slice(dot).toLowerCase() : '';
}

function isRelative(url) {
  if (!url) return false;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) return false;
  if (url.startsWith('/') || url.startsWith('#')) return false;
  if (url.startsWith('data:') || url.startsWith('mailto:') || url.startsWith('tel:')) return false;
  return true;
}

function jsxExpr(source) {
  return { type: 'mdxJsxAttributeValueExpression', value: source };
}

function attr(name, value) {
  return { type: 'mdxJsxAttribute', name, value };
}

function isLinkNode(node) {
  if (node.type === 'link' || node.type === 'linkReference') return true;
  return (
    (node.type === 'mdxJsxTextElement' || node.type === 'mdxJsxFlowElement') && node.name === 'a'
  );
}

// Images already wrapped in a markdown/JSX link keep that link — ContentImage
// only self-links to the full-size original when it's not inside one.
function insideLink(node, ctx) {
  for (let parent = ctx.parent(node); parent; parent = ctx.parent(parent)) {
    if (isLinkNode(parent)) return true;
  }
  return false;
}

// Resolve a relative image URL against the document. Prefer the URL as
// written — some scraped files literally contain %3F/%20 in their on-disk
// names (Vite resolves them raw too); decode only when the raw path doesn't
// exist.
function localImagePath(filePath, url) {
  const dir = path.dirname(filePath);
  const rawPath = path.resolve(dir, url.split('#')[0]);
  if (existsSync(rawPath)) return rawPath;
  try {
    const decoded = path.resolve(dir, decodeURIComponent(url.split(/[?#]/)[0]));
    if (existsSync(decoded)) return decoded;
  } catch {
    /* malformed escapes — keep the raw path */
  }
  return rawPath;
}

function contentImage(src, image, meta, linked) {
  return {
    type: 'mdxJsxTextElement',
    name: 'ContentImage',
    attributes: [
      attr('src', src),
      attr('alt', image.alt ?? ''),
      ...(image.title ? [attr('title', image.title)] : []),
      ...(linked ? [attr('linked', jsxExpr('false'))] : []),
      ...(meta ? [attr('width', String(meta.width)), attr('height', String(meta.height))] : []),
      ...(meta?.placeholder ? [attr('placeholder', meta.placeholder)] : []),
    ],
    children: [],
  };
}

export function satteriStaticFiles(options) {
  return () => {
    const urlToName = new Map();
    const newImports = [];
    let usesContentImage = false;
    let counter = 0;

    function ensureImport(url) {
      if (urlToName.has(url)) return urlToName.get(url);
      const name = `_static${counter++}`;
      const importUrl = IMAGE_EXTS.has(getExt(url)) ? url : `${url}?url`;
      // JSON.stringify: file names can contain quotes and other characters that
      // would break a bare string literal.
      newImports.push(esm(`import ${name} from ${JSON.stringify(importUrl)};`));
      urlToName.set(url, name);
      return name;
    }

    return defineMdastPlugin({
      name: 'swizec-static-files',

      async image(node, ctx) {
        // Legacy https://swizec.com/wp-content/ images whose file exists in
        // static/wp-content: rewrite to the root-relative path (same public
        // URL, served from this deployment) and give them the full
        // ContentImage treatment. Refs whose files are gone stay external.
        const wpPath = wpContentUrlPath(node.url);
        const diskPath = wpPath && wpContentDiskPath(wpPath, repoRoot);
        if (diskPath) {
          usesContentImage = true;
          const meta = await imageMeta(diskPath, getExt(wpPath));
          return contentImage(wpPath, node, meta, insideLink(node, ctx));
        }

        if (isRelative(node.url) && IMAGE_EXTS.has(getExt(node.url))) {
          const name = ensureImport(node.url);
          usesContentImage = true;
          const filePath = filePathOf(ctx);
          const meta = filePath
            ? await imageMeta(localImagePath(filePath, node.url), getExt(node.url))
            : null;
          return contentImage(jsxExpr(name), node, meta, insideLink(node, ctx));
        }
      },

      link(node, ctx) {
        // Links to wp-content files (e.g. a linked full-size image) become
        // root-relative too, so they resolve on this deployment.
        const wpPath = wpContentUrlPath(node.url);
        if (wpPath && wpContentDiskPath(wpPath, repoRoot)) {
          ctx.setProperty(node, 'url', wpPath);
          return;
        }

        if (isRelative(node.url) && ASSET_EXTS.has(getExt(node.url))) {
          const name = ensureImport(node.url);
          // Reusing node.children keeps their identity, so an image inside
          // the link is still rewritten by the image visitor.
          return {
            type: 'mdxJsxTextElement',
            name: 'a',
            attributes: [attr('href', jsxExpr(name))],
            children: [...node.children],
          };
        }
      },

      after(root, ctx) {
        const imports = [
          ...(usesContentImage
            ? componentImportNodes(filePathOf(ctx), new Set(['ContentImage']), options)
            : []),
          ...newImports,
        ];
        if (imports.length > 0) ctx.prependChild(root, imports);
      },
    });
  };
}
