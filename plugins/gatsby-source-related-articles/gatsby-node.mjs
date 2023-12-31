import { createClient } from "@vercel/postgres"

export const sourceNodes = async (gatsbyApi) => {
  const { reporter } = gatsbyApi
  const client = createClient({
    connectionString: process.env.POSTGRES_URL_NON_POOLING,
  })
  await client.connect()

  reporter.info("Creating related articles nodes")

  try {
    // We get all articles then fetch related for each and make nodes
    // This approach is N+1 but that's likely faster than a self-join
    const { rows: articles } =
      await client.sql`select url from article_embeddings`

    for (const { url } of articles) {
      const { rows } =
        await client.sql`select url, title, published_date from article_embeddings where url <> ${url} order by embedding <-> (select embedding from article_embeddings where url = ${url} limit 1) asc, published_date desc limit 5`

      const data = {
        url,
        relatedArticles: rows,
      }

      gatsbyApi.actions.createNode({
        id: gatsbyApi.createNodeId(`relatedArticles-${url}`),
        ...data,
        internal: {
          type: `RelatedArticles`,
          contentDigest: gatsbyApi.createContentDigest(data),
        },
      })

      gatsbyApi.cache.set(`relatedArticles-${url}`, rows)
    }

    reporter.success(`Created ${articles.length} related article nodes`)

    // const { rows } =
    //   await client.sql`select url, title, published_date from article_embeddings where url <> '/blog/the-3-budgets/' order by embedding <-> (select embedding from article_embeddings where url='/blog/the-3-budgets/' limit 1) asc, published_date desc limit 5`

    // const data = await client.query(`select count(*) from article_embeddings`)
  } catch (e) {
    console.error(e)
    throw e
  } finally {
    await client.end()
  }
}

export const onCreatePage = async ({ page, cache, actions }) => {
  const url = page.path
  const relatedArticles = await cache.get(`relatedArticles-${url}`)

  if (relatedArticles) {
    actions.deletePage(page)
    actions.createPage({
      ...page,
      context: {
        ...page.context,
        relatedArticles,
      },
    })
  }
}
