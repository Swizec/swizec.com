import { nitro } from '@timber-js/app/adapters/nitro';
import {
  satteriEmbeds,
  satteriStaticFiles,
  satteriInlineCodeLang,
  satteriHeadings,
  satteriShiki,
} from './mdx-plugins/index.mjs';

const vercelOutputDirectory = new URL('./.vercel/output', import.meta.url).pathname;

export default {
  // Dedupe refetching of matching layouts across client navigations
  // (disabled by default as of alpha.181).
  clientSegmentCache: true,
  adapter: nitro({
    preset: 'vercel',
    compress: false,
    nitroConfig: {
      output: {
        dir: vercelOutputDirectory,
      },
    },
  }),
  // MDX pipeline (Satteri visitor plugins, see mdx-plugins/). Order matters:
  // embeds must run before static files so giphy:/youtube image URLs are
  // gone by the time it looks for local files.
  mdx: {
    mdastPlugins: [satteriEmbeds(), satteriStaticFiles(), satteriInlineCodeLang],
    hastPlugins: [satteriHeadings(), satteriShiki],
    // The old @mdx-js pipeline had no remark-gfm, and ~700 articles contain
    // GFM-looking syntax (~tildes~, [^footnotes], tables) that renders
    // literally today. Keep that behavior; enabling gfm is a content
    // decision, not an upgrade step.
    features: { gfm: false, frontmatter: true },
  },
  pageExtensions: ['tsx', 'ts', 'jsx', 'js', 'mdx'],
};
