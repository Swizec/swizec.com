import React from "react"
import { graphql } from "gatsby"
import { Container, Heading } from "@theme-ui/components"
import {
  FormCK,
  Head,
  ArticleListing,
} from "@swizec/gatsby-theme-course-platform"

export const pageQuery = graphql`
  query BlogsInCategory($categoryRegex: String) {
    site {
      siteMetadata {
        articles {
          title
          description
          titleSeo
          descriptionSeo
        }
      }
    }
    allSitePage(
      filter: {
        path: { regex: "/blog/.+/" }
        context: { frontmatter: { categories: { regex: $categoryRegex } } }
      }
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
`

const ArticlePage = ({ data, pageContext: { category } }) => {
  const title = `Swizec's ${category} articles`
  const description = `Learn from Swizec's raw and honest from the heart articles filed under "${category}".`

  return (
    <>
      <Head title={title} description={description} />
      <Container sx={{ mx: "auto" }}>
        <Heading
          sx={{
            mx: "auto",
            width: "100%",
            maxWidth: "34ch",
            textAlign: "center",
            mb: "3rem",
            mt: "6rem",
            fontSize: "2.5em",
          }}
        >
          Swizec's articles in the "{category}" category
        </Heading>
        <p>
          I aim to write mindblowing emails with real insight into the career
          and skills of a modern software engineer.{" "}
          <em>"Raw and honest from the heart!"</em> as one reader described
          them.
        </p>
        <p>
          Below are {data.allSitePage.nodes.length} articles filed under{" "}
          <code>{category}</code>. Enjoy ❤️
        </p>
        <FormCK copyBefore={<></>} />
        {data.allSitePage.nodes.map((props, i) => (
          <ArticleListing {...props} key={i} />
        ))}
        <FormCK copyBefore={<></>} />
      </Container>
    </>
  )
}

export default ArticlePage
