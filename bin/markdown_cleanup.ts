import fs from "fs"
import OpenAI from "openai"
import path from "path"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Find all mdx files in a directory recursively
const findMdxFiles = (dir: string): string[] => {
  let results: string[] = []

  const list = fs.readdirSync(dir)
  list.forEach((file) => {
    file = path.join(dir, file)
    const stat = fs.statSync(file)
    if (stat && stat.isDirectory()) {
      results = results.concat(findMdxFiles(file))
    } else if (path.extname(file) === ".mdx") {
      results.push(file)
    }
  })

  return results
}

// Use the OpenAI API to clean up markdown content
const cleanupMarkdown = async (content: string): Promise<string | null> => {
  try {
    const response = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You clean up MDX content so it conforms to standard syntax. The user sends you a file and you return the cleaned up file with no additional content. Do not change frontmatter.\n\nMake sure image captions only appear in the [] portion of an image tag, for example [hello](./img/hello.png "hello") -> [hello](./img/hello.png)\n\n${
            content.includes("{")
              ? "Wrap expressions like {abc} in backticks: `{abc}`"
              : ""
          }`,
        },
        {
          role: "user",
          content,
        },
      ],
      model: "gpt-4",
    })
    return response.choices[0].message.content
  } catch (error) {
    console.error("Error cleaning up markdown:", error)
    return content
  }
}

const mdxFiles = findMdxFiles("../src/pages/blog/") // You can replace './' with the desired directory

const file =
  "../src/pages/blog/19-months-from-launch-to-dollar1000000000-acquisition-instagram/index.mdx"

//   "../src/pages/blog/what-i-learned-of-php-by-ignoring-it-for-three-months/index.mdx"

for (const file of mdxFiles) {
  const content = fs.readFileSync(file, "utf8")

  if (content.includes('")') || content.includes("{")) {
    console.log(file)

    const cleanedContent = await cleanupMarkdown(content)
    if (cleanedContent) {
      fs.writeFileSync(file, cleanedContent)
      console.log("done")
    } else {
      console.log("empty return")
    }
  }
}
