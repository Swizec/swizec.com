import { visit } from "unist-util-visit"
import type { Node } from "unist"
import fsExtra from "fs-extra"
import path from "path"
import chalk from "chalk"
import * as vfile from "to-vfile"
import mime from "mime-types"
import glob from "glob"
import fetch from "node-fetch"
import util from "util"
import stream from "stream"
import slugify from "slugify"
import { remark } from "remark"
import remarkMdx from "remark-mdx"
import remarkFrontmatter from "remark-frontmatter"
import prettier from "prettier"

const streamPipeline = util.promisify(stream.pipeline)
const articlesPath = path.join(__dirname, "../src/pages/blog")
const ACCEPTED_FILES = ["jpg", "jpeg", "png", "gif", "svg"]

glob(path.join(articlesPath, "/*/*.mdx"), {}, async (err, files) => {
  await Promise.all(files.map((file) => processArticle(file)))

  console.log("Done.")
})

interface ImageNode extends Node {
  type: "image"
  title: string | null
  url: string
  alt: string
}

async function processArticle(file: string) {
  //   console.info(`Processing ${file}`)

  const imgDir = path.join(path.dirname(file), "img")

  const mdxFile = await vfile.read(file)
  let shouldWriteFile = false

  const markdown = await remark()
    .use(remarkMdx)
    .use(remarkFrontmatter)
    .use(() => async (tree) => {
      let nodes: ImageNode[] = []

      visit(tree, "image", (node: ImageNode) => {
        if (node.url && node.url.startsWith("http")) {
          if (!node.url.startsWith("https")) {
            node.url = node.url.replace(/^http/, "https")
            shouldWriteFile = true
          }

          if (!node.url.includes("swizec.com/wp-content")) {
            nodes.push(node)
          }
        }
      })

      await Promise.all(
        nodes.map(async (node) => {
          await fsExtra.ensureDir(imgDir)
          const nodeChanged = await fixImageNodeToLocalFile(node, imgDir)

          if (nodeChanged) {
            shouldWriteFile = true
          }
        })
      )
    })
    .process(mdxFile)

  if (shouldWriteFile) {
    let content = markdown?.toString()
    content = await prettier.format(content, { parser: "mdx" })

    await vfile.write({
      path: file,
      content,
    })
  }

  //   content = content
  //     .replace(/(?<=https?:\/\/.*)\\_(?=.*\n)/g, "_")
  //     .replace(/^\<(http.*)\>$/gm, "$1")
  //   content = await prettier.format(content, { parser: "mdx" })

  //   if (shouldWriteFile) {
  //     await vfile.write({
  //       path: file,
  //       content,
  //     })
  //   }
}

// glob(articlesPath + "/*/*.mdx", {}, async (err, files) => {
//   await Promise.all(
//     files.map(async (file) => {
//       const parentDirectory = path.dirname(file)

//       const mdxFile = await vfile.read(file)
//       let shouldWriteFile = false

//       //I process the file to get the AST
//       const contents = await new Promise((resolve, reject) => {
//         remark()
//           .use(mdx)
//           .use(frontmatter)
//           .use(() => async (tree) => {
//             let nodes = []
//             let paragraphErrorsFixed = 0

//             visit(tree, ["image"], async (node) => {
//               if (node.url && node.url.startsWith("http")) {
//                 if (!node.url.startsWith("https")) {
//                   node.url = node.url.replace(/^http/, "https")
//                   shouldWriteFile = true
//                 }
//                 if (!node.url.includes("swizec.com/wp-content")) {
//                   nodes.push(node)
//                 }
//               }
//             })

//             visit(tree, ["paragraph"], async (node) => {
//               if (node.children.find((x) => x.value === "\\")) {
//                 const findIndex = node.children.findIndex(
//                   (x) => x.value === "\\"
//                 )
//                 if (
//                   node.children.length > findIndex + 1 &&
//                   node.children[findIndex + 1].value === "\\" &&
//                   node.children[findIndex + 2].value === "\\"
//                 ) {
//                   node.children = node.children.filter((x) => x.value !== "\\")
//                   shouldWriteFile = true
//                   paragraphErrorsFixed++
//                 }
//               }
//             })
//             if (paragraphErrorsFixed > 0) {
//               console.log(
//                 `${chalk.green(
//                   `${paragraphErrorsFixed} '\\\\\\\\\\\\' errors corrected`
//                 )} in  ${file}. `
//               )
//             }

//             await Promise.all(
//               nodes.map(async function (node) {
//                 let title =
//                   node.title || node.alt || node.url.slice(node.url.length - 10)
//                 title += Math.random().toString(20).substr(2, 6)
//                 const slugTitle = slugify(title, {
//                   remove: /[*+~.()'"!?/:@,]/g,
//                 })

//                 const imagesPath = path.join(parentDirectory, "img")
//                 const destFileWithoutExtension = path.join(
//                   imagesPath,
//                   slugTitle
//                 )

//                 try {
//                   await fsExtra.ensureDir(imagesPath)
//                   await downloadFile(node.url, destFileWithoutExtension)
//                     .then((fileInfo) => {
//                       console.log(
//                         `Image ${slugTitle}.${fileInfo.extension} downloaded in ${imagesPath}`
//                       )
//                       node.url = `./img/${slugTitle}.${fileInfo.extension}`
//                       shouldWriteFile = true
//                     })
//                     .catch((err) =>
//                       console.log(
//                         `${chalk.red(
//                           "Error downloading image"
//                         )} in ${imagesPath} from ${node.url}: `,
//                         err
//                       )
//                     )
//                 } catch (e) {
//                   console.log(
//                     `${chalk.red(
//                       "Error downloading image"
//                     )} in ${imagesPath} from ${node.url}: `,
//                     e
//                   )
//                 }
//               })
//             )

//             visit(tree, ["paragraph"], async (node) => {
//               if (node.children.some((x) => x.value && x.value.includes("$"))) {
//                 //Then it's a node that's probably to be fixed
//                 node.children
//                   .filter((c) => c.value && c.value.includes("\\"))
//                   .forEach((c) => {
//                     c.value = c.value.replace(/\\/g, "")
//                     shouldWriteFile = true
//                   })

//                 paragraphErrorsFixed++
//               }
//             })
//             if (paragraphErrorsFixed > 0) {
//               console.log(
//                 `${chalk.green(
//                   `${paragraphErrorsFixed} '\\\\' errors corrected`
//                 )} in  ${file}. `
//               )
//             }
//           })
//           .process(mdxFile, (err, markdown) => {
//             if (err) {
//               reject(err)
//             } else {
//               let content = markdown.contents
//               content = content
//                 .replace(/(?<=https?:\/\/.*)\\_(?=.*\n)/g, "_")
//                 .replace(/^\<(http.*)\>$/gm, "$1")
//               content = prettier.format(content, { parser: "mdx" })

//               resolve(content)
//             }
//           })
//       })

//       if (shouldWriteFile) {
//         await vfile.write({
//           path: file,
//           contents,
//         })
//       }
//     })
//   )

// })

async function fixImageNodeToLocalFile(
  node: ImageNode,
  imgDir: string
): Promise<boolean> {
  let title = node.title || node.alt || node.url.slice(node.url.length - 10)
  title += Math.random().toString(20).substr(2, 6)

  const slugTitle = slugify(title, {
    remove: /[*+~.()'"!?/:@,]/g,
  })

  const destFileWithoutExtension = path.join(imgDir, slugTitle)

  try {
    const fileInfo = await downloadImage(node.url, destFileWithoutExtension)

    node.url = `./img/${slugTitle}.${fileInfo.extension}`
    return true
  } catch (err: unknown) {
    console.error(
      `Error downloading image from ${node.url}:`,
      (err as Error).message
    )
  }

  return false
}

async function downloadImage(url: string, filePath: string) {
  console.info(`Downloading ${url} to ${filePath}`)

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`unexpected response ${response.statusText}`)
  }

  const ext = mime.extension(
    response.headers.get("content-type") || "image/png"
  )

  if (!ext || !ACCEPTED_FILES.includes(ext)) {
    throw new Error(`Format ${ext} not allowed`)
  }

  const fileInfo = {
    extension: ext,
    size: Number(response.headers.get("content-length")),
  }

  await streamPipeline(
    response.body,
    fsExtra.createWriteStream(`${filePath}.${ext}`)
  )

  return fileInfo
}
