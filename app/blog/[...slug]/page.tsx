import { allPages } from "content-collections";
import { deny, getSegmentParams } from "@timber-js/app/server";
import type { Metadata } from "@timber-js/app/server";
import type React from "react";
import { metadataFromFrontmatter } from "../../mdx-metadata";

// Vite glob: all MDX in src/pages/blog/, compiled as ES modules via @mdx-js/rollup (RSC-compatible)
const mdxModules = import.meta.glob("/src/pages/blog/**/index.{mdx,md}");

type MDXModule = { default: React.FC };

function resolvedSlug(): string {
    const { slug } = getSegmentParams();
    return Array.isArray(slug) ? slug.join("/") : (slug ?? "");
}

function findPage(slug: string) {
    // _meta.path is relative to content-collections directory (src/pages/blog)
    // Files are at <slug>/index.mdx so _meta.path is "<slug>/index"
    return allPages.find((p) => p._meta.path === `${slug}/index` || p._meta.path === slug);
}

function findModule(slug: string) {
    return (
        mdxModules[`/src/pages/blog/${slug}/index.mdx`] ??
        mdxModules[`/src/pages/blog/${slug}/index.md`] ??
        mdxModules[`/src/pages/blog/${slug}.mdx`] ??
        mdxModules[`/src/pages/blog/${slug}.md`]
    );
}

export async function metadata(): Promise<Metadata> {
    const slug = resolvedSlug();
    const page = findPage(slug);
    if (!page) return {};
    return metadataFromFrontmatter(page, `/blog/${slug}`);
}

export default async function Page() {
    const slug = resolvedSlug();
    const page = findPage(slug);

    if (!page) {
        deny(404);
        return null;
    }

    const loadModule = findModule(slug);
    if (!loadModule) {
        deny(404);
        return null;
    }

    const { default: MDXContent } = (await loadModule()) as MDXModule;

    return (
        <article>
            <h1>{page.title}</h1>
            {page.published && (
                <time dateTime={page.published}>
                    {new Date(page.published).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                </time>
            )}
            <MDXContent />
        </article>
    );
}
