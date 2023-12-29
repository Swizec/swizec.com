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

async function getLastIndexedDate() {
  const { rows } =
    await sql`select published_date from article_embeddings order by published_date desc limit 1`

  return new Date(rows[0].published_date)
}

/**
 * Compute and store article embedding,
 * if newer than lastIndexed and not yet indexed
 *
 * @param path path to article
 * @param lastIndexed date of latest indexed article
 */
async function indexArticle(path: string, lastIndexed: Date) {
  console.log(`Processing ${path}`)

  const file = Bun.file(path)
  const { data: frontmatter, content } = matter(await file.text())
  const url = "/" + path.split("/pages/")[1].replace("index.mdx", "")

  if (new Date(frontmatter.published) < lastIndexed) {
    return
  }

  const { rowCount } =
    await sql`SELECT url FROM article_embeddings WHERE url=${url} LIMIT 1`

  if (rowCount > 0) {
    return
  }

  try {
    const res = await openai.embeddings.create({
      input: content,
      model: "text-embedding-ada-002",
    })

    const embedding = res.data[0].embedding
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

const articles = findIndexMDXFiles(`${import.meta.dir}/../src/pages/blog`)

const lastIndexed = await getLastIndexedDate()

for (const article of articles) {
  await indexArticle(article, lastIndexed)
}
