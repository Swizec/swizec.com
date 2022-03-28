const chalk = require("chalk")
const fs = require("fs")
const { createFilePath } = require("gatsby-source-filesystem")

const sharp = require("sharp")
sharp.cache(false)
sharp.simd(false)

exports.onPreBootstrap = ({ actions }) => {
  // read _redirects
  // call createRedirect for each

  const redirects = fs.readFileSync("./static/_redirects").toString()

  for (const line of redirects.split("\n")) {
    if (line.trim().length > 0) {
      // found a redirect
      const [fromPath, toPath] = line.trim().split(/\s+/)
      actions.createRedirect({
        fromPath,
        toPath,
      })
    }
  }

  console.log(`${chalk.green("success")} create redirects from _redirects`)
}

exports.onCreateNode = ({ node, actions }) => {
  const { createNodeField } = actions

  if (node.internal.type === "MarkdownRemark" || node.internal.type === "Mdx") {
    if (node.fileAbsolutePath.includes("/pages/blog/")) {
      const slug = node.fileAbsolutePath
        .split("/pages/")[1]
        .replace("/index.mdx", "")

      createNodeField({
        node,
        name: "slug_custom",
        value: `/${slug}`,
      })
    }
  }
}

exports.createPages = async ({ graphql, actions }) => {
  await Promise.allSettled([
    // createArticleRedirects({ graphql, actions }),
    createCategoryPages({ graphql, actions }),
  ])
}

async function createArticleRedirects({ graphql, actions }) {
  const result = await graphql(`
    {
      allMdx(filter: { frontmatter: { redirect_from: { ne: null } } }) {
        edges {
          node {
            fields {
              slug
              slug_custom
            }
            frontmatter {
              redirect_from
            }
          }
        }
      }
    }
  `)

  if (result.errors) {
    console.log(result.errors) // eslint-disable-line no-console
    throw result.errors
  }

  const allPosts = result.data.allMdx.edges

  // For all posts with redirect_from frontmatter,
  // extract all values and push to redirects array
  allPosts.forEach((post) => {
    const from = post.node.frontmatter.redirect_from
    let to = post.node.fields.slug
    const slugCustom = post.node.fields.slug_custom

    if (to === "/index") {
      to = slugCustom
    }

    from.forEach((from) => {
      actions.createRedirect({
        fromPath: from,
        toPath: to,
        isPermanent: true,
        redirectInBrowser: true,
      })
    })
  })

  console.log(`${chalk.green("success")} create redirects`) // eslint-disable-line no-console
}

async function createCategoryPages({ graphql, actions }) {
  const result = await graphql(`
    query Categories {
      allMdx(filter: { fileAbsolutePath: { regex: "/blog/.+/" } }) {
        nodes {
          frontmatter {
            categories
          }
        }
      }
    }
  `)

  if (result.errors) {
    console.error(result.errors) // eslint-disable-line no-console
    throw result.errors
  }

  // extract categories out of graphql and make a set
  const allCategories = new Set(
    result.data.allMdx.nodes
      .filter((node) => !!node.frontmatter.categories)
      .map((node) => node.frontmatter.categories)
      .map((categories) => categories.split(","))
      .flat()
      .map((category) => category.trim().toLowerCase())
  )

  for (const category of allCategories) {
    console.log("creating page", `/categories/${category}`)
    await actions.createPage({
      path: `/categories/${category}`,
      component: require.resolve("./src/templates/category.js"),
      context: { category, categoryRegex: `/${category}/gi` },
    })
  }
}
