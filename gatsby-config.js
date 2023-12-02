const { URL } = require("url")

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
  flags: {},
  plugins: [
    "@vercel/gatsby-plugin-vercel-builder",
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
      resolve: "@swizec/gatsby-plugin-plausible",
      options: {
        domain: process.env.PLAUSIBLE_DOMAIN,
        customDomain: process.env.PLAUSIBLE_DOMAIN,
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
            match: "^/blog/|^/interviews/",
            query: `{
  allMdx(
    filter: {internal: { contentFilePath: {regex: "/blog/.+/"}}}
    sort: {frontmatter: {published: DESC}}
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
}`,
            serialize: ({ query: { site, allMdx } }) => {
              return allMdx.nodes.map((node) => {
                const url = new URL(site.siteMetadata.siteUrl)
                url.pathname = node.fields.slug + "/"

                return Object.assign({}, node.frontmatter, {
                  date: node.frontmatter.published,
                  url: url.href,
                  guid: url.href,
                })
              })
            },
          },
        ],
      },
    },
  ],
}
