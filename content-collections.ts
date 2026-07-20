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
    subtitle: z.string().optional(),
    description: z.string().optional(),
    published: z.coerce.date().transform((d) => d.toISOString()).optional(),
    publishedAt: z.string().optional(),
    categories: z.string().optional(),
    redirect_from: z.array(z.string()).optional(),
    hero: z.string().optional(),
    image: z.string().optional(),
    // Empty YAML frontmatter (`content_upgrade:`) parses to null — accept it and normalize to undefined
    content_upgrade: z.string().nullish().transform((v) => v ?? undefined),
    // Marks a listing page: category-regex, "prefix:interviews/", or "all".
    // The catch-all appends a paginated archive and swaps in the time sidebar.
    archive: z.string().optional(),
    content: z.string(),
  }),
});

export default defineConfig({
  content: [pages],
});
