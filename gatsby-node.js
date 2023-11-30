const chalk = require("chalk")
const fs = require("fs")
const { createFilePath } = require("gatsby-source-filesystem")

const sharp = require("sharp")
sharp.cache(false)
sharp.simd(false)

exports.onPreBootstrap = ({ actions }) => {
  // read _redirects
  // call createRedirect for each
}

exports.createPages = async ({ graphql, actions }) => {
  await createArticleRedirects({ graphql, actions })
  await createRedirectsFromConfigFile({ actions })

  console.log("Configuring redirects for self-hosted Plausible Analytics")
  actions.createRedirect({
    fromPath: "/stats/js/script.js",
    toPath: "https://plausible.io/js/plausible.js",
    statusCode: 200,
  })
  actions.createRedirect({
    fromPath: "/stats/js/script.js/",
    toPath: "https://plausible.io/js/plausible.js",
    statusCode: 200,
  })
  actions.createRedirect({
    fromPath: "/stats/api/event/",
    toPath: "https://plausible.io/api/event",
    statusCode: 200,
  })
}

async function createArticleRedirects({ graphql, actions }) {
  const result = await graphql(`
    {
      allMdx(filter: { frontmatter: { redirect_from: { ne: null } } }) {
        nodes {
          fields {
            slug
          }
          frontmatter {
            redirect_from
          }
        }
      }
    }
  `)

  if (result.errors) {
    console.log(result.errors) // eslint-disable-line no-console
    throw result.errors
  }

  const allPosts = result.data.allMdx.nodes

  // For all posts with redirect_from frontmatter,
  // extract all values and push to redirects array
  allPosts.forEach((post) => {
    const from = post.frontmatter.redirect_from
    let to = post.fields.slug

    if (to.endsWith("/index")) {
      console.warn(`Bad redirect for ${to}`)
      to = to.replace(/\/index$/, "")
    }

    if (!from.endsWith("/")) {
      from += "/"
    }

    if (!to.endsWith("/")) {
      to += "/"
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

async function createRedirectsFromConfigFile({ actions }) {
  const redirects = fs.readFileSync("./static/_redirects").toString()

  for (const line of redirects.split("\n")) {
    if (line.trim().length > 0) {
      // found a redirect
      let [fromPath, toPath] = line.trim().split(/\s+/)
      if (!fromPath.endsWith("/")) {
        fromPath += "/"
      }

      console.log(`Creating redirect from ${fromPath} to ${toPath}`)
      actions.createRedirect({
        fromPath,
        toPath,
        redirectInBrowser: true,
      })
    }
  }

  console.log(`${chalk.green("success")} create redirects from _redirects`)
}
