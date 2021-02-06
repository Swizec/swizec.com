import React from "react"
import { Flex, Box, Link, Button, Image, useColorMode } from "rebass"
import swizecAvatar from "../images/swizec-head-avatar.webp"

const modes = ["themed", "lite", "dark", "gray", "hack", "pink"]

const Dot = (props) => (
  <svg
    viewBox="0 0 32 32"
    width="24"
    height="24"
    fill="currentcolor"
    style={{
      display: "block",
    }}
  >
    <circle
      cx="16"
      cy="16"
      r="14"
      fill="none"
      stroke="currentcolor"
      strokeWidth="4"
    />
    <path
      d={`
        M 16 0
        A 16 16 0 0 0 16 32
        z
      `}
    />
  </svg>
)

export default ({ nav, menu, setMenu, style, showBanner }) => {
  const [mode, setMode] = useColorMode(modes[0])

  const cycleMode = (e) => {
    const i = (modes.indexOf(mode) + 1) % modes.length
    setMode(modes[i])
  }

  return (
    <Flex
      as="header"
      px={3}
      py={2}
      height={64}
      alignItems="center"
      bg="background"
      style={style}
    >
      <Image
        src={swizecAvatar}
        width={35}
        alt="Swizec Teller - a geek with a hat"
        title="Swizec Teller - a geek with a hat"
      />

      <Link variant="nav" variant="nav" href="/">
        swizec.com
      </Link>

      <Box mx="auto" />

      <Button
        title="Change color mode"
        variant="transparent"
        sx={{
          width: 32,
          height: 32,
          p: 1,
          borderRadius: 99999,
          cursor: "pointer",
        }}
        onClick={cycleMode}
      >
        <Dot />
      </Button>
    </Flex>
  )
}
