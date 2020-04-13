// Custom plugin that generates social cards
// take from frontmatter.hero by default
// generate custom one otherwise

const path = require("path")
const slugify = require("slugify")
const fsExtra = require("fs-extra")

module.exports = async ({ markdownNode, markdownAST, getNode }) => {
  const frontmatter = markdownNode.frontmatter

  if (
    frontmatter &&
    frontmatter.hero &&
    frontmatter.title &&
    !frontmatter.hero.includes("defaultHero")
  ) {
    const heroPath = path.posix.join(
      getNode(markdownNode.parent).dir,
      frontmatter.hero
    )
    const ext = heroPath.split(".").pop()
    const filename = `${slugify(frontmatter.title)}.${ext}`

    const newPath = path.join(process.cwd(), "public", "social-cards", filename)

    try {
      await fsExtra.ensureDir(
        path.join(process.cwd(), "public", "social-cards")
      )
      await fsExtra.copy(heroPath, newPath)
    } catch (e) {
      console.error(e)
    }
  }

  return markdownAST
}
