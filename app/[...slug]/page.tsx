import { allPages } from "content-collections";
import { deny, getSegmentParams } from "@timber-js/app/server";
import type { Metadata } from "@timber-js/app/server";
import type React from "react";
import { metadataFromFrontmatter } from "../mdx-metadata";
import { slugify } from "../../lib/categories";

// Vite glob: all MDX in pages/, compiled as ES modules via @mdx-js/rollup (RSC-compatible)
const mdxModules = import.meta.glob("/pages/**/*.{mdx,md}");

type MDXModule = { default: React.FC };

function resolvedPath(): string {
    const { slug } = getSegmentParams();
    return Array.isArray(slug) ? slug.join("/") : (slug ?? "");
}

function findPage(path: string) {
    // Support both flat (pages/foo.mdx) and folder (pages/foo/index.mdx) layouts.
    return allPages.find((p) => p._meta.path === path || p._meta.path === `${path}/index`);
}

function findModule(path: string) {
    return (
        mdxModules[`/pages/${path}.mdx`] ??
        mdxModules[`/pages/${path}.md`] ??
        mdxModules[`/pages/${path}/index.mdx`] ??
        mdxModules[`/pages/${path}/index.md`]
    );
}

export async function metadata(): Promise<Metadata> {
    const path = resolvedPath();
    const page = findPage(path);
    if (!page) return {};
    return metadataFromFrontmatter(page, `/${path}`);
}

export default async function Page() {
    const path = resolvedPath();
    const page = findPage(path);

    if (!page) {
        deny(404);
        return null;
    }

    const loadModule = findModule(path);
    if (!loadModule) {
        deny(404);
        return null;
    }

    const { default: MDXContent } = (await loadModule()) as MDXModule;

    const categories = page.categories
        ? page.categories
              .split(",")
              .map((cat) => cat.trim())
              .filter(Boolean)
        : [];

    return (
        <article>
            <h1>{page.title}</h1>
            {page.published && (
                <time dateTime={page.published}>
                    {new Date(page.published).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                </time>
            )}
            <MDXContent />
            {categories.length > 0 && (
                <p className="article-categories">
                    Filed under:{" "}
                    {categories.map((cat, i) => (
                        <span key={cat}>
                            <a href={`/collections/${slugify(cat)}`}>{cat}</a>
                            {i < categories.length - 1 && ", "}
                        </span>
                    ))}
                </p>
            )}
        </article>
    );
}
