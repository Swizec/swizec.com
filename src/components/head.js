import React from "react"
import { Helmet } from "react-helmet"
import slugify from "slugify"
import defaultHero from "../images/swizec.png"

function getSocialCard({ title, hero }) {
  if (hero && !hero.includes("defaultHero")) {
    const ext = hero.split(".").pop()

    // URL guaranteed by src/gatsby-remark-social-card
    return `/social-cards/${slugify(title, {remove: /[*+~.()'"!?:@,]/g})}.${ext}`
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
    (frontmatter && frontmatter.description) || props.description || "Swizec helps you become a better frontend engineer with books, articles, talks, and workshops";

  const socialImage = getSocialCard(frontmatter);
  const image = `https://swizec.com${socialImage || defaultHero}`;
  // const url = `${props.path}`
  const url = `https://swizec.com${
    props.pageName !== undefined ? `/${props.pageName}` : ""
  }`

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
      <meta property="og:description" content={description} />{" "}
      <meta property="og:type" content="article" />{" "}
      <meta property="og:url" content={url} />{" "}
      <meta property="og:image" content={image} />
    </Helmet>
  )
}
