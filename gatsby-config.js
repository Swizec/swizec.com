const remarkPlugins = [require("remark-slug")]
const fs = require("fs")
const YoutubeTransformer = require("./src/YoutubeEmbedderTransformer.js")

require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
})

module.exports = {
  siteMetadata: {
    convertkit: {
      defaultFormId: "826419",
    },
  },
  plugins: [
    "gatsby-plugin-slug",
    "gatsby-plugin-zeit-now",
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "images",
        path: `${__dirname}/src/images`,
      },
    },

    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "posts",
        path: `${__dirname}/src/pages/blog`,
      },
    },
    "gatsby-transformer-sharp",
    "gatsby-plugin-sharp",
    "gatsby-remark-images",
    {
      resolve: "gatsby-plugin-mdx",
      options: {
        extensions: [".mdx", ".md"],
        remarkPlugins,
        gatsbyRemarkPlugins: [
          "gatsby-remark-copy-linked-files",
          {
            resolve: "gatsby-remark-giphy",
            options: {
              giphyApiKey: "tvyI1ARG6FOkW9PUzmgubJ3iY5P5rJmO",
              useVideo: true,
              embedWidth: "80%",
            },
          },
          {
            resolve: "gatsby-remark-images",
            options: {
              markdownCaptions: true,
              maxWidth: 890,
              linkImagestoOriginal: false,
              showCaptions: ["title", "alt"],
              withWebp: true,
              wrapperStyle: "text-align: center; font-style: italic",
              tracedSVG: {
                color: `lightgray`,
                optTolerance: 0.4,
                turdSize: 100,
                turnPolicy: "TURNPOLICY_MAJORITY",
              },
            },
          },

          {
            resolve: `${__dirname}/src/gatsby-remark-social-card`,
          },
          {
            resolve: "gatsby-remark-embedder",
            options: {
              customTransformers: [YoutubeTransformer],
            },
          },
        ],
        plugins: [{ resolve: "gatsby-remark-images" }],
      },
    },
    // add a gatsby-source-filesystem entry for every article's images
    // have to filter out empty folders for Zeit
    ...fs
      .readdirSync(`${__dirname}/src/pages/blog`)
      .map((path) => `${__dirname}/src/pages/blog/${path}`)
      .filter((path) => fs.lstatSync(path).isDirectory())
      .map((path) => `${path}/img`)
      .filter((path) => fs.existsSync(path) && fs.readdirSync(path).length > 0)
      .map((path) => ({
        resolve: "gatsby-source-filesystem",
        options: {
          path,
        },
      })),
    "gatsby-plugin-catch-links",
    "gatsby-plugin-theme-ui",
    "gatsby-plugin-react-helmet",
    // "gatsby-plugin-twitter",
    // "gatsby-plugin-instagram-embed",
    {
      resolve: "gatsby-plugin-google-analytics",
      options: {
        trackingId: "UA-1464315-1",
        anonymize: true,
        respectDNT: true,
      },
    },
    {
      resolve: "gatsby-plugin-facebook-pixel",
      options: {
        pixelId: "714190382013726",
      },
    },
    "gatsby-plugin-simple-analytics",
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        name: "swizec.com",
        short_name: "swizec.com",
        description: "",
        start_url: "/",
        background_color: "#fff",
        theme_color: "#FF002B",
        display: "standalone",
        icon: "./static/favicon.png",
      },
    },

    // "gatsby-plugin-offline",
  ],
}
