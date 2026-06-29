import { defineCollection, defineConfig } from '@content-collections/core';
import { z } from 'zod';

// Metadata-only collection: validates frontmatter and builds a typed index.
// Actual MDX rendering goes through Vite's @mdx-js/rollup pipeline via
// import.meta.glob in the catch-all route — RSC-compatible.
const pages = defineCollection({
  name: 'pages',
  directory: 'pages',
  include: '**/*.{mdx,md}',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    published: z.coerce.date().transform((d) => d.toISOString()).optional(),
    publishedAt: z.string().optional(),
    categories: z.string().optional(),
    redirect_from: z.array(z.string()).optional(),
    hero: z.string().optional(),
    image: z.string().optional(),
    content: z.string(),
  }),
});

export default defineConfig({
  content: [pages],
});
