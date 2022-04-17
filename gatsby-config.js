require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
})

module.exports = {
  siteMetadata: {
    title: "Swizec Teller",
    description:
      "Swizec turns coders into high value JavaScript experts with books, articles, talks, and workshops",
    author: `@swizec`,
    coverImageStaticPath: "metaimage.jpg",
    hasAuthentication: false,
    convertkit: {
      userId: "785fc7ef1f",
      formId: "826419",
      defaultFormId: "826419",
      serverlessHandbookFormId: "2103715",
      seniorMindsetFormId: "1712642",
      ServerlessHandbookCUFormId: "1655570",
      javascriptFormId: "2507452",
      fullstackWebFormId: "2507619",
      ComputerScienceFormId: "2720965",
      ReactCUFormId: "2753675",
      IndieHackingFormId: "2753667",
      ServerlessFormId: "2849380",
    },
    articles: {
      title: `Swizec - A geek with a hat`,
      description: `I aim to write mindblowing emails with real insight into the career and skills of a modern software engineer. <em>"Raw and honest from the heart!"</em> as one reader described them.<br/><br/>Subscribe below or keep reading.`,
      titleSeo: `Swizec Teller`,
      descriptionSeo: `Swizec turns coders into high value JavaScript experts with books, articles, talks, and workshops`,
    },
    reaction: {
      title: "Did you enjoy this article?",
      id: "aab01040-bb89-40d9-8a2e-92ede0f8d82b",
    },
    siteUrl: "https://swizec.com",
  },
  flags: {},
  trailingSlash: "always",
  plugins: [
    "@swizec/gatsby-theme-course-platform",
    {
      resolve: "gatsby-plugin-typography",
      options: {
        pathToConfigModule: "src/typography.js",
        omitGoogleFont: true,
      },
    },
    {
      resolve: "gatsby-typeform-source",
      options: {
        token: process.env.TYPEFORM_TOKEN,
        formId: "jLgVKKLf",
      },
    },
    "gatsby-plugin-gatsby-cloud",
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        name: "swizec.com",
        short_name: "swizec.com",
        description:
          "Swizec turns coders into high value JavaScript experts with books, articles, talks, and workshops",
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
                allMdx(
                    filter: { fileAbsolutePath: { regex: "/blog/.+/" } }
                    sort: { fields: frontmatter___published, order: DESC }
                    limit: 50
                ) {
                    nodes {
                        frontmatter {
                            title
                            description
                            published
                        }
                        fields {
                            slug
                        }
                    }
                }
            }
              `,
            serialize: ({ query: { site, allMdx } }) => {
              return allMdx.nodes.map((node) => {
                return Object.assign({}, node.frontmatter, {
                  date: node.frontmatter.published,
                  url: site.siteMetadata.siteUrl + "/" + node.fields.slug,
                  guid: site.siteMetadata.siteUrl + node.fields.slug,
                })
              })
            },
          },
        ],
      },
    },
  ],
}
