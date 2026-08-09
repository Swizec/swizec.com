import { sql } from "@vercel/postgres"
import fs from "fs"
import path from "path"
import matter from "gray-matter"
import OpenAI from "openai"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// await sql`CREATE EXTENSION vector;`
// await sql`CREATE TABLE IF NOT EXISTS article_embeddings (
//     url TEXT PRIMARY KEY,
//     title TEXT,
//     published_date DATE,
//     embedding VECTOR(1536)
// )`
// await sql`TRUNCATE TABLE article_embeddings`

function findIndexMDXFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir)

  files.forEach((file) => {
    const filePath = path.join(dir, file)
    const fileStat = fs.statSync(filePath)

    if (fileStat.isDirectory()) {
      findIndexMDXFiles(filePath, fileList)
    } else if (path.basename(filePath) === "index.mdx") {
      fileList.push(filePath)
    }
  })

  return fileList
}

// NULL published_date rows sort first on DESC and would poison the cutoff
// (new Date(null) is 1970, so nothing gets skipped)
async function getLastIndexedDate() {
  const { rows } =
    await sql`select published_date from article_embeddings where published_date is not null order by published_date desc limit 1`

  return new Date(rows[0].published_date)
}

async function getIndexedUrls() {
  const { rows } = await sql`select url from article_embeddings`

  return new Set(rows.map((row) => row.url))
}

// articles over ada-002's 8192-token limit get embedded from their head
// instead of failing — a swallowed error here means the article is never
// indexed once its date falls behind the cutoff
async function embed(content: string) {
  let input = content

  for (;;) {
    try {
      const res = await openai.embeddings.create({
        input,
        model: "text-embedding-ada-002",
      })

      return res.data[0].embedding
    } catch (e) {
      const tooLong =
        e instanceof OpenAI.BadRequestError &&
        /maximum context length/.test(e.message)

      if (tooLong && input.length > 1000) {
        input = input.slice(0, Math.floor(input.length * 0.8))
      } else {
        throw e
      }
    }
  }
}

/**
 * Compute and store article embedding,
 * if newer than lastIndexed and not yet indexed
 *
 * @param path path to article
 * @param lastIndexed date of latest indexed article
 * @param indexedUrls urls already in the table
 */
async function indexArticle(
  path: string,
  lastIndexed: Date,
  indexedUrls: Set<string>
) {
  const file = Bun.file(path)
  const { data: frontmatter, content } = matter(await file.text())
  const url = "/" + path.split("/pages/")[1].replace("index.mdx", "")

  const published = new Date(frontmatter.published)

  // a draft without a valid published date must not be inserted — a NULL
  // published_date row breaks getLastIndexedDate on every future run
  if (isNaN(published.getTime())) {
    console.warn(`Skipping ${url} — no valid published date in frontmatter`)
    return
  }

  if (published < lastIndexed) {
    return
  }

  if (indexedUrls.has(url)) {
    return
  }

  console.log(`Indexing ${url}`)

  try {
    const embedding = await embed(content)
    await sql`INSERT INTO article_embeddings VALUES (
            ${url},
            ${frontmatter.title},
            ${frontmatter.published},
            ${JSON.stringify(embedding)}
        )`
  } catch (e) {
    console.error(e)
  }
}

// timber structure: articles live in pages/blog (was src/pages/blog on Gatsby).
// The url derivation (path.split("/pages/")) yields the same /blog/slug/ form.
const articles = findIndexMDXFiles(`${import.meta.dir}/../pages/blog`)

const lastIndexed = await getLastIndexedDate()
const indexedUrls = await getIndexedUrls()

for (const article of articles) {
  await indexArticle(article, lastIndexed, indexedUrls)
}
