import React from "react"
import { graphql, useStaticQuery } from "gatsby"
import { ArticleListing } from "@swizec/gatsby-theme-course-platform"

export const LatestBlogs = () => {
  const { allMdx } = useStaticQuery(
    graphql`
      query {
        allMdx(
          filter: { internal: { contentFilePath: { regex: "/blog/.+/" } } }
          sort: { frontmatter: { published: DESC } }
          limit: 5
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
