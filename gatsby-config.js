
require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
})

module.exports = {
  siteMetadata: {
    title: "swizec.com",
    description: "Swizec turns coders into high value JavaScript experts with books, articles, talks, and workshops",
    author: `@swizec`,
    coverImageStaticPath: "metaimage.png",
    hasAuthentication: false,
    convertkit: {
      userId: "785fc7ef1f",
      formId: "772ba7c9ba",
      url: "https://pages.convertkit.com/785fc7ef1f/772ba7c9ba",
      defaultFormId: "826419",
      serverlessHandbookFormId: "1655570",
      seniorMindsetFormId: "1712642",
    },
    articles: {
      title: `Swizec - A geek with a hat`,
      description: `
        This is where some intro copy comes talking about why you should read these articles.

        Also signup for the mailing list etc.
      `,
      titleSeo: `Swizec Teller`,
      descriptionSeo: `Swizec turns coders into high value JavaScript experts with books, articles, talks, and workshops`,
    },
    reaction: {
      title: "Did you enjoy this article?",
      id: "aab01040-bb89-40d9-8a2e-92ede0f8d82b"
    },
    siteUrl: "https://swizec.com",
    // articles: {
    //   title: `React for Dataviz`,
    //   description: `
    //     A monthly data visualization built with React, D3, and others.
    //     Livecoded last Sunday of the month. 
    //     <a href="https://www.youtube.com/channel/UCoyHgaeLLI7Knp7LDHOwZMw">
    //       Join live
    //     </a>
    //     or subscribe to the newsletter 💌
    //   `,
    //   titleSeo: `React for Data Visualization Articles`,
    //   descriptionSeo: `A monthly data visualization built with React, D3, and others`,
    // },
  },
  plugins: [
    "@swizec/gatsby-theme-course-platform",
    "gatsby-plugin-netlify",
    // {
    //   resolve: "gatsby-source-filesystem",
    //   options: {
    //     name: "posts",
    //     path: `${__dirname}/src/pages/blog`,
    //   },
    // },
    // {
    //   resolve: "gatsby-plugin-mdx",
    //   options: {
    //     extensions: [".mdx", ".md"],
    //     remarkPlugins,
    //     gatsbyRemarkPlugins: [
          
    //       {
    //         resolve: "gatsby-remark-embedder",
    //         options: {
    //           customTransformers: [YoutubeTransformer],
    //           services: {
    //             Instagram: {
    //               accessToken: process.env.INSTAGRAM_OEMBED_TOKEN,
    //             },
    //           },
    //         },
    //       },
    //     ],
    //   },
    // },
    // add a gatsby-source-filesystem entry for every article's images
    // have to filter out empty folders for Zeit
    // ...fs
    //   .readdirSync(`${__dirname}/src/pages/blog`)
    //   .map((path) => `${__dirname}/src/pages/blog/${path}`)
    //   .filter((path) => fs.lstatSync(path).isDirectory())
    //   .map((path) => `${path}/img`)
    //   .filter((path) => fs.existsSync(path) && fs.readdirSync(path).length > 0)
    //   .map((path) => ({
    //     resolve: "gatsby-source-filesystem",
    //     options: {
    //       path,
    //     },
    //   })),
    // "gatsby-plugin-instagram-embed",
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        name: "swizec.com",
        short_name: "swizec.com",
        description: "Swizec turns coders into high value JavaScript experts with books, articles, talks, and workshops",
        start_url: "/",
        background_color: "#fff",
        theme_color: "#FF002B",
        display: "standalone",
        icon: "./static/favicon.png",
      },
    },
    {
      resolve: "gatsby-plugin-feed",
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                description
                siteUrl
                site_url: siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            output: "/rss.xml",
            title: "swizec.com RSS Feed",
            match: "^/blog/",
            query: `
              {
                allSitePage(
                    filter: { path: { regex: "/blog/.+/" } }
                    sort: { fields: context___frontmatter___published, order: DESC }
                ) {
                    nodes {
                        path
                        context {
                            frontmatter {
                                title
                                description
                                published
                            }
                        }
                    }
                }
            }
              `,
            serialize: ({ query: { site, allSitePage } }) => {
              return allSitePage.nodes.map((node) => {
                return Object.assign({}, node.context.frontmatter, {
                  date: node.context.frontmatter.published,
                  url: site.siteMetadata.siteUrl + node.path,
                  guid: site.siteMetadata.siteUrl + node.path,
                })
              })
            },
          },
        ],
      },
    },
  ],
}
