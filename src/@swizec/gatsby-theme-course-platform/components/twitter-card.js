import React, { useState, useEffect } from "react"
import { Heading, Flex, Image, Box, Paragraph } from "theme-ui"
import swizec from "../images/swizec-social.png"

export default (props) => {
  const [title, setTitle] = useState(props.title)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      setTitle(params.get("title"))
    }
  }, [])

  return (
    <Flex
      sx={{
        alignItems: "center",
        justifyContent: "space-between",
        width: 1024,
        height: 512,
        p: 0,
        bg: "#211C28",
        color: "white",
        borderRadius: 10,
      }}
      id="social-card"
    >
      <Box sx={{ width: 1024 - 511, pl: 4, textAlign: "left" }}>
        <Heading sx={{ fontSize: 6 }}>{title}</Heading>
        <Paragraph>Swizec Teller</Paragraph>
      </Box>
      <Image src={swizec} sx={{ width: 511, height: 512, bg: "white" }} />
    </Flex>
  )
}
