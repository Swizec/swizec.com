import { allPages } from "content-collections"
import { deny, getSegmentParams } from "@timber-js/app/server"
import type { Metadata } from "@timber-js/app/server"
import type React from "react"
import { metadataFromFrontmatter, dateValue } from "../mdx-metadata"
import { parseCategories } from "../../lib/categories"
import { heroUrl } from "../../lib/hero-asset.mjs"
import {
  SITE_URL,
  blogPostingJsonLd,
  breadcrumbsJsonLd,
  profilePageJsonLd,
} from "../../lib/structured-data"
import { JsonLd } from "react-schemaorg"
import { NewsletterSignup } from "../../components/newsletter-signup"
import { RelatedArticles } from "../../components/related-articles"
import { Byline } from "../../components/byline"
import { BookPromo } from "../../components/book-promo"
import { BookSidebar } from "../../components/book-sidebar"
import { ArticleArchive } from "../../components/article-archive"
import { ArchiveSidebar } from "../../components/archive-sidebar"
import { SmartLink } from "../../components/link"
import { parseArchiveFrontmatter } from "../../lib/article-archive"

// Vite glob: all MDX in pages/, compiled as ES modules via @mdx-js/rollup (RSC-compatible)
const mdxModules = import.meta.glob("/pages/**/*.{mdx,md}")

type MDXModule = { default: React.FC }

function resolvedPath(): string {
  const { slug } = getSegmentParams()
  return Array.isArray(slug) ? slug.join("/") : slug ?? ""
}

function findPage(path: string) {
  // Support both flat (pages/foo.mdx) and folder (pages/foo/index.mdx) layouts.
  return allPages.find(
    (p) => p._meta.path === path || p._meta.path === `${path}/index`
  )
}

function findModule(path: string) {
  return (
    mdxModules[`/pages/${path}.mdx`] ??
    mdxModules[`/pages/${path}.md`] ??
    mdxModules[`/pages/${path}/index.mdx`] ??
    mdxModules[`/pages/${path}/index.md`]
  )
}

export async function metadata(): Promise<Metadata> {
  const path = resolvedPath()
  const page = findPage(path)
  if (!page) return {}
  return metadataFromFrontmatter(page, `/${path}`)
}

export default async function Page() {
  const path = resolvedPath()
  const page = findPage(path)

  if (!page) {
    deny(404)
    return null
  }

  const loadModule = findModule(path)
  if (!loadModule) {
    deny(404)
    return null
  }

  const { default: MDXContent } = (await loadModule()) as MDXModule

  const categories = parseCategories(page.categories)

  // Blog posts get article chrome (categories, newsletter footer, related
  // articles); standalone content pages render just their content — they
  // embed their own forms and listings where needed.
  const isBlogPost = path.startsWith("blog/")

  // URL format matches what index-articles.ts stores: /blog/slug/
  const articleUrl = `/${page._meta.path.replace(/\/index$/, "")}/`

  // Listing pages (archive frontmatter): MDX body is the intro copy, the
  // paginated listing is appended, and the time-jump rail replaces books.
  const archiveQuery = page.archive
    ? parseArchiveFrontmatter(page.archive)
    : undefined
  const basePath = `/${path}`

  // JSON-LD uses canonical production URLs — Google only indexes swizec.com,
  // so unlike og:image there's no request-origin dance for previews.
  const pageUrl = `${SITE_URL}/${path}`
  const heroLink = heroUrl(page._meta.directory, page.hero)
  const jsonLdImage = heroLink
    ? /^https?:\/\//.test(heroLink)
      ? heroLink
      : `${SITE_URL}${heroLink}`
    : `${pageUrl}/opengraph-image.png`

  return (
    <>
      {isBlogPost && (
        <JsonLd
          item={blogPostingJsonLd({
            title: page.title,
            description: page.description,
            url: pageUrl,
            image: jsonLdImage,
            datePublished: dateValue(page.publishedAt ?? page.published),
          })}
        />
      )}
      {isBlogPost && categories.length > 0 && (
        <JsonLd
          item={breadcrumbsJsonLd([
            { name: "Home", url: SITE_URL },
            {
              name: categories[0].name,
              url: `${SITE_URL}/categories/${categories[0].slug}`,
            },
            { name: page.title },
          ])}
        />
      )}
      {path === "about" && <JsonLd item={profilePageJsonLd()} />}
      <article>
        <h1>{page.title}</h1>
        {page.subtitle && <p className="article-subtitle">{page.subtitle}</p>}
        <Byline published={page.published} />
        <MDXContent />
        {archiveQuery && (
          <ArticleArchive query={archiveQuery} basePath={basePath} />
        )}
        {isBlogPost && categories.length > 0 && (
          <p className="article-categories">
            Filed under:{" "}
            {categories.map(({ name, slug }, i) => (
              <span key={slug}>
                <SmartLink href={`/categories/${slug}`}>{name}</SmartLink>
              </span>
            ))}
          </p>
        )}
        {isBlogPost && (
          <NewsletterSignup formKey={page.content_upgrade ?? undefined} />
        )}
        {isBlogPost && (
          <BookPromo upgradeKey={page.content_upgrade ?? undefined} />
        )}
        {isBlogPost && <RelatedArticles url={articleUrl} />}
      </article>
      {/* Listing pages get the time-jump rail; everything else gets books. */}
      {archiveQuery ? (
        <ArchiveSidebar query={archiveQuery} basePath={basePath} />
      ) : (
        <BookSidebar />
      )}
    </>
  )
}
