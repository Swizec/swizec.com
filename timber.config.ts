import { nitro } from '@timber-js/app/adapters/nitro';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeShiki from '@shikijs/rehype';
import rehypeSlug from 'rehype-slug';
import { remarkSwizecEmbeds, remarkMdxStaticFiles } from './mdx-plugins/index.mjs';
import { remarkInlineCodeLang } from './mdx-plugins/remark-inline-code-lang.mjs';

const vercelOutputDirectory = new URL('./.vercel/output', import.meta.url).pathname;

export default {
  adapter: nitro({
    preset: 'vercel',
    compress: false,
    nitroConfig: {
      output: {
        dir: vercelOutputDirectory,
      },
    },
  }),
  mdx: {
    remarkPlugins: [remarkSwizecEmbeds, remarkMdxStaticFiles, remarkInlineCodeLang],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: 'wrap' }],
      [rehypeShiki, { themes: { light: 'github-light', dark: 'github-dark' }, inline: 'tailing-curly-colon' }],
    ],
  },
  pageExtensions: ['tsx', 'ts', 'jsx', 'js', 'mdx'],
};
