import { useStaticQuery, graphql } from "gatsby"

export const useFormsQuery = () => {
  // change this query when you add forms
  const { site } = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          convertkit {
            defaultFormId
            serverlessHandbookFormId
            seniorMindsetFormId
            javascriptFormId
            fullstackWebFormId
            ComputerScienceFormID
          }
        }
      }
    }
  `)

  return site.siteMetadata.convertkit
}
