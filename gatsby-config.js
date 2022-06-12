require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
})

module.exports = {
  siteMetadata: {
    title: "Swizec Teller",
    description:
      "Swizec shares software engineering lessons from production in his books, articles, talks, and workshops",
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
      description: `I write articles with real insight into the career and skills of a modern software engineer. <strong><em>"Raw and honest from the heart!"</em></strong> as one reader described them. Fueled by <strong>lessons learned over 20 years</strong> of building <strong>production code</strong> for side-projects, small businesses, and hyper growth startups. Both successful and not.<br/><br/>Subscribe below or keep reading 👇`,
      titleSeo: `Swizec Teller`,
      descriptionSeo: `Swizec turns coders into high value JavaScript experts with books, articles, talks, and workshops`,
    },
    reaction: {
      title: "Did you enjoy this article?",
      id: "aab01040-bb89-40d9-8a2e-92ede0f8d82b",
    },
    siteUrl: "https://swizec.com",
  },
  flags: { PRESERVE_WEBPACK_CACHE: true },
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
      resolve: "gatsby-plugin-google-gtag",
      trackingIds: [process.env.GOOGLE_TRACKING_ID, "G-1854GGD6QW"],
      gtagConfig: {
        anonymize_ip: true,
        cookie_expires: 0,
      },
      pluginConfig: {
        head: false,
        respectDNT: true,
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
