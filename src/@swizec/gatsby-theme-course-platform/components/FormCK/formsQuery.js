import { graphql } from "gatsby"

export const formsQuery = graphql`
  query {
    site {
      siteMetadata {
        convertkit {
          defaultFormId
          serverlessHandbookFormId
          seniorMindsetFormId
        }
      }
    }
  }
`
