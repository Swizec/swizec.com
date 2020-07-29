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
  
  
          // For all posts with redirect_from frontmatter,
          // extract all values and push to redirects array
          allPosts.forEach((post) => {

            const from = post.node.frontmatter.redirect_from;
            const to = `/blog${post.node.fields.slug}`;

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
            console.log(`${chalk.green('success')} create redirects`) // eslint-disable-line no-console
          )
        })
      )
    })
  }