import { nitro } from '@timber-js/app/adapters/nitro';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeShiki from '@shikijs/rehype';
import rehypeSlug from 'rehype-slug';
import { remarkSwizecEmbeds, remarkMdxStaticFiles } from './mdx-plugins/index.mjs';
import { remarkInlineCodeLang } from './mdx-plugins/remark-inline-code-lang.mjs';

const vercelOutputDirectory = new URL('./.vercel/output', import.meta.url).pathname;

// Some headings are markdown links themselves (## [Book](https://...)) —
// wrapping those in an anchor nests <a> inside <a>: invalid HTML that breaks
// React hydration. Skip autolinking for any heading that contains a link.
function containsLink(node) {
  if (node.tagName === 'a') return true;
  return (node.children ?? []).some(containsLink);
}

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
  mdx: {
    remarkPlugins: [remarkSwizecEmbeds, remarkMdxStaticFiles, remarkInlineCodeLang],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: 'wrap', test: (el) => !containsLink(el) }],
      [
        rehypeShiki,
        {
          themes: { light: 'github-light', dark: 'github-dark' },
          inline: 'tailing-curly-colon',
          // Fences with no language (and unknown languages) still get the
          // pre.shiki treatment — styles.css only styles pre.shiki, so
          // unhighlighted blocks would otherwise render as bare <pre>.
          defaultLanguage: 'text',
          fallbackLanguage: 'text',
        },
      ],
    ],
  },
  pageExtensions: ['tsx', 'ts', 'jsx', 'js', 'mdx'],
};
