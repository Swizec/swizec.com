import React from "react"
import { Helmet } from "react-helmet"
import slugify from "slugify"

function getSocialCard({ title, hero }) {
  if (hero) {
    const ext = hero.split(".").pop()

    // URL guaranteed by src/gatsby-remark-social-card
    return `/social-cards/${slugify(title, {remove: /[*+~.()'"!:@]/g})}.${ext}`
  } else {
    return ""
  }
}

export default (props) => {
  const { frontmatter } = props.pageContext

  const title = [
    (frontmatter && frontmatter.title) || props.title,
    "Swizec.com",
  ]
    .filter(Boolean)
    .join(" | ")
  const description =
    (frontmatter && frontmatter.description) || props.description

  const image = props.image || getSocialCard(frontmatter)
  const url = `${props.path}`

  return (
    <Helmet
      htmlAttributes={{
        lang: "en-us",
      }}
    >
      <title> {title} </title>
      <link rel="icon" href="/icon.png" />
      <meta name="description" content={description} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@swizec" />
      <meta name="twitter:title" content={title} />{" "}
      <meta name="twitter:description" content={description} />{" "}
      <meta name="twitter:image" content={image} />
      <meta property="og:title" content={title} />{" "}
      <meta property="og:url" content={url} />{" "}
      <meta property="og:image" content={image} />
    </Helmet>
  )
}
