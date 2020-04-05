const remarkPlugins = [require("remark-slug")]

module.exports = {
  plugins: [
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "images",
        path: `${__dirname}/src/images`,
      },
    },
    "gatsby-transformer-sharp",
    "gatsby-plugin-sharp",
    {
      resolve: "gatsby-plugin-mdx",
      options: {
        extensions: [".mdx", ".md"],
        remarkPlugins,
        plugins: ["gatsby-remark-images"],
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
            resolve: "@raae/gatsby-remark-oembed",
            options: {
              usePrefix: false,
              providers: {
                include: [
                  "YouTube",
                  "CodeSandbox",
                  "Codepen",
                  "Twitter",
                  "Instagram",
                ],
              },
            },
          },
        ],
      },
    },
    "gatsby-plugin-catch-links",
    "gatsby-plugin-theme-ui",
    "gatsby-plugin-react-helmet",
    "gatsby-plugin-twitter",
    {
      resolve: "gatsby-plugin-google-analytics",
      options: {
        trackingId: "UA-1464315-33",
        anonymize: true,
        respectDNT: true,
      },
    },
    {
      resolve: "gatsby-plugin-facebook-pixel",
      options: {
        pixelId: "2634718133254322",
      },
    },
    "gatsby-plugin-simple-analytics",
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        name: "ServerlessReact.Dev",
        short_name: "ServerlessReact.Dev",
        description:
          "Learn how to build fast modern webapps from idea to launch with ServerlessReact.Dev",
        start_url: "/",
        background_color: "#fff",
        theme_color: "#FF002B",
        display: "standalone",
        icon: "./static/icon.png",
      },
    },

    // "gatsby-plugin-offline",
  ],
}
