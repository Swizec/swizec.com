/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/node-apis/
 */
// You can delete this file if you're not using it

const { createClient } = require("@typeform/api-client")

// fetches responses for a specific typeform
function fetchResponses(uid) {
  const typeformAPI = createClient({
    token: "tfp_EkDTBwLmvDQfV44SCkof4A4PfFyy5Rhz83uL2r1HwS96_3stYXkf87FoZ1Z",
  })

  return Promise.all([
    typeformAPI.forms.get({ uid }),
    typeformAPI.responses.list({
      uid,
      pageSize: 1000,
    }),
  ])
}

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions

  createTypes(`
        type TypeformResponse implements Node {
            id: ID!
            answers: [TypeformAnswer]
            metadata: TypeformMetadata
            submitted_at: String!
            landed_at: String!
            variables: String
        }

        type TypeformMetadata {
            user_agent: String
            platform: String
            referer: String
            network_id: String
            browser: String
        }

        type TypeformField {
            id: ID
            title: String
            type: String
        }

        type TypeformAnswer {
            field: TypeformField
            type: String
            text: String
            choice: TypeformChoice
            number: Int
        }

        type TypeformChoice {
            id: ID,
            label: String
        }
    `)
}

exports.sourceNodes = async ({
  cache,
  actions,
  createContentDigest,
  createNodeId,
}) => {
  const { createNode, createTypes } = actions

  const [{ fields }, { items }] = await fetchResponses("jLgVKKLf")

  const fieldMap = new Map(fields.map((field) => [field.id, field]))

  for (const response of items) {
    const data = {
      answers: response.answers.map((answer) => ({
        ...answer,
        field: fieldMap.get(answer.field.id),
      })),
      metadata: response.metadata,
      submitted_at: response.submitted_at,
      landed_at: response.landed_at,
      variables: JSON.stringify(response.variables),
    }

    createNode({
      id: createNodeId(`typeformResponse-${response.response_id}`),
      parent: null,
      children: [],
      ...data,
      internal: {
        type: "TypeformResponse",
        contentDigest: createContentDigest(data),
      },
    })
  }
}
