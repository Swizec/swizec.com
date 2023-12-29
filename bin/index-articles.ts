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

async function indexArticle(path: string) {
  console.log(`Processing ${path}`)

  const file = Bun.file(path)
  const { data: frontmatter, content } = matter(await file.text())
  const url = path.split("/src/")[1].replace("index.mdx", "")

  try {
    const res = await openai.embeddings.create({
      input: content,
      model: "text-embedding-ada-002",
    })

    const embedding = res.data[0].embedding
    console.log(url)
  } catch (e) {
    console.error(e)
  }
}

const articles = findIndexMDXFiles(`${import.meta.dir}/../src/pages/blog`)

for (const article of articles) {
  await indexArticle(article)
}
