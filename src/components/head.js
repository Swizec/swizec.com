import { useStaticQuery } from "gatsby"
import React from "react"
import { Helmet } from "react-helmet"
import slugify from "slugify"
import defaultHero from "../images/swizec.png"

function getSocialCard({ title, hero }) {
  if (hero && !hero.includes("defaultHero")) {
    const ext = hero.split(".").pop()

    // URL guaranteed by src/gatsby-remark-social-card
    return `/social-cards/${slugify(title, {
      remove: /[*+~.()'"!?/:@,]/g,
    })}.${ext}`
  } else {
    return ""
  }
}

export default (props) => {
  const { frontmatter } = props.pageContext
  const { site } = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          title
          description
          author
          siteUrl
        }
      }
    }
  `)

  const title = [frontmatter?.title || props.title, "Swizec Teller"]
    .filter(Boolean)
    .join(" | ")

  const description =
    frontmatter?.description ||
    props.description ||
    site.siteMetadata.description

  const socialImage = getSocialCard(frontmatter)
  const image = `${site.siteMetadata.siteUrl}${socialImage || defaultHero}`
  const url = `${site.siteMetadata.siteUrl}${props.location.pathname}`

  return (
    <Helmet
      htmlAttributes={{
        lang: "en-us",
      }}
    >
      <title>{title}</title>
      <link rel="icon" href="/icon.png" />
      <meta name="description" content={description} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@swizec" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <link href={url} rel="canonical" />
    </Helmet>
  )
}
