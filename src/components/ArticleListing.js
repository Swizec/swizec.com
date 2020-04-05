import React from "react"
import { Box, Link, Text, Heading } from "rebass"
import { format } from "date-fns"

export const ArticleListing = ({
  path,
  context: {
    frontmatter: { title, description, published },
  },
}) => {
  return (
    <Box>
      <Link href={path}>
        <Heading>{title}</Heading>
      </Link>

      <Text fontSize={2}>{description}</Text>
      <Text>
        <small>
          <em>{format(new Date(published), "MMMM do, yyyy")}</em>
        </small>
      </Text>
    </Box>
  )
}
