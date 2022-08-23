import React from "react"
import { graphql, useStaticQuery } from "gatsby"
import {
  ArticleListing,
  Head,
  FormCK,
} from "@swizec/gatsby-theme-course-platform"
import { Container, Heading } from "theme-ui"

const pageQuery = graphql`
  query {
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
    allMdx(
      filter: { fileAbsolutePath: { regex: "/blog/.+/" } }
      sort: { fields: frontmatter___published, order: DESC }
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
`

const ArticlePage = (props) => {
  const data = useStaticQuery(pageQuery)

  const { title, description, titleSeo, descriptionSeo } =
    data.site.siteMetadata.articles

  return (
    <>
      <Head title={titleSeo} description={descriptionSeo} />
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
          {title}
        </Heading>

        <p dangerouslySetInnerHTML={{ __html: description }}></p>

        <FormCK copyBefore={<></>} />

        {data.allMdx.nodes.map((props, i) => (
          <ArticleListing {...props} key={i} />
        ))}
      </Container>
    </>
  )
}

export default ArticlePage
