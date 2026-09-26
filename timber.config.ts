import { nitro } from '@timber-js/app/adapters/nitro';

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
  // timber >= alpha.209 compiles MDX with Satteri, whose visitor plugins can't
  // run our remark/rehype pipeline (custom embeds, static-file rewriting,
  // shiki, slug + autolink). Per the MDX docs, opt out and register
  // @mdx-js/rollup ourselves — see the mdx() plugin in vite.config.ts.
  mdx: false,
  pageExtensions: ['tsx', 'ts', 'jsx', 'js', 'mdx'],
};
