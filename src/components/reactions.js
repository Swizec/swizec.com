import React, { useState, useEffect } from "react"
import styled from "@emotion/styled"
import { Box, Heading } from "rebass"

const JoyButton = styled.div`
  a {
    font-size: 26px;
    padding-right: 20px;
    text-decoration: none;
  }
`

const Reactions = ({ page }) => {
  const [pathname, setPathname] = useState(page)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPathname(window.location.pathname)
    }
  })

  return (
    <Box>
      <JoyButton>
        <Heading as="h2">Did you enjoy this article?</Heading>
        <div>
          <a
            href={`https://spark-joy.netlify.com/aab01040-bb89-40d9-8a2e-92ede0f8d82b/thumbsdown?instanceOfJoy=${pathname}`}
          >
            <span role="img" aria-label="thumbs-down">
              👎
            </span>
          </a>
          <a
            href={`https://spark-joy.netlify.com/aab01040-bb89-40d9-8a2e-92ede0f8d82b/thumbsup?instanceOfJoy=${pathname}`}
          >
            <span role="img" aria-label="thumbs-up">
              👍
            </span>
          </a>
        </div>
      </JoyButton>
    </Box>
  )
}

export default Reactions
