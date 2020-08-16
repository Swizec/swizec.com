import React from "react"
import { Box, Link, Flex } from "rebass"

export default (props) => (
  <Box as="footer" py={5} color="background" bg="text" flexDirection="row">
    <Box
      sx={{
        maxWidth: "wide",
        mx: "auto",
        px: 3,
      }}
    >
      <Flex flexDirection="row" justifyContent="space-between">
        <Box>
          Created by
          <Link
            href="https://swizec.com"
            variant="nav"
            style={{ textDecoration: "underline" }}
          >
            Swizec
          </Link>
          with ❤️
          <Link href="/" variant="nav">
            swizec.com
          </Link>
        </Box>

        <Box>
          <Link href="/blog" variant="nav">
            Blog
          </Link>
          <Link href="/books" variant="nav">
            Books
          </Link>
          <Link href="/courses" variant="nav">
            Courses
          </Link>
          <Link href="/workshops" variant="nav">
            Workshops
          </Link>
          <Link href="/about" variant="nav">
            About
          </Link>
        </Box>
      </Flex>
    </Box>
  </Box>
)
