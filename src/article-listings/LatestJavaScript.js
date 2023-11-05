import React from "react"
import { graphql, useStaticQuery } from "gatsby"
import { ArticleListing } from "@swizec/gatsby-theme-course-platform"

export const LatestJavaScript = () => {
  const { allMdx } = useStaticQuery(
    graphql`
      query {
        allMdx(
          filter: {
            internal: { contentFilePath: { regex: "/blog/.+/" } }
            frontmatter: { categories: { regex: "/JavaScript|TypeScript/gi" } }
          }
          sort: { frontmatter: { published: DESC } }
          limit: 3
        ) {
          nodes {
            fields {
              slug
            }
            frontmatter {
              title
              description
              published
            }
          }
        }
      }
    `
  )

  return allMdx.nodes.map((props, i) => <ArticleListing {...props} key={i} />)
}
