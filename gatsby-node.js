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

exports.createPages = async ({ graphql, actions }) => {
  await Promise.allSettled([createArticleRedirects({ graphql, actions })])
}

async function createArticleRedirects({ graphql, actions }) {
  const result = await graphql(`
    {
      allMdx(filter: { frontmatter: { redirect_from: { ne: null } } }) {
        edges {
          node {
            fields {
              slug
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

    if (to.endsWidth("/index")) {
      console.warn(`Bad redirect for ${to}`)
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
