import React from "react"
import { Text } from "theme-ui"
import { format } from "date-fns"

export const ArticleMetaData = ({ frontmatter }) => {
  if (frontmatter.published) {
    return (
      <Text mt={[1, 1, 2]}>
        Published on {format(new Date(frontmatter.published), "MMMM do, yyyy")}{" "}
        in {frontmatter.categories}
      </Text>
    )
  } else {
    return null
  }
}
