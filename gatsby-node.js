/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */
const chalk = require('chalk');

const sharp = require("sharp")
sharp.cache(false)
sharp.simd(false)


exports.createPages = ({ graphql, actions }) => {
    const { createRedirect } = actions
  
    return new Promise((resolve, reject) => {
      resolve(
        graphql(
          `
            {
              allMdx (
                filter: { frontmatter: { redirect_from: { ne: null } } }
              ) {
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
          `
        ).then((result) => {
          if (result.errors) {
            console.log(result.errors) // eslint-disable-line no-console
            reject(result.errors)
          }
  
          const allPosts = result.data.allMdx.edges
  
          const redirects = []
  
          // For all posts with redirect_from frontmatter,
          // extract all values and push to redirects array
          allPosts.forEach((post) => {
            redirects.push({
              from: post.node.frontmatter.redirect_from,
              to: `/blog${post.node.fields.slug}`
            //   to: post.node.fields.slug
            })
          })

  
          // Create redirects from the just constructed array
          redirects.forEach(({ from, to }) => {
            // iterate through all `from` array items
            from.forEach((from) => {
              createRedirect({
                fromPath: from,
                toPath: to,
                isPermanent: true,
                redirectInBrowser: true
              })
            })
          })
  
          resolve(
            console.log(`${chalk.green('Success')} create redirects`) // eslint-disable-line no-console
          )
        })
      )
    })
  }