import React, { useState, useEffect } from "react"
import { Heading, Flex, Image, Box, Text } from "rebass"
import swizec from "../images/swizec.png"

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
        p: '0px 32px'
      }}
      id="social-card"
    >
      <Box sx={{ width: 1024 - 350 }}>
        <Heading sx={{ fontSize: 6 }}>{title}</Heading>
        <Text>Swizec Teller - A Geek With a Hat</Text>
      </Box>
      <Image src={swizec} sx={{ width: 350, height: 350 }} />
    </Flex>
  )
}
