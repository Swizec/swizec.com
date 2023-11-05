import React from "react"
import { Image, Flex, Link } from "theme-ui"
import swizecAvatar from "../../../images/swizec-head-avatar.webp"

const HeaderLogo = () => (
  <>
    <Flex alignItems="center">
      <Image
        src={swizecAvatar}
        width={35}
        height={35}
        alt="Swizec Teller - a geek with a hat"
        title="Swizec Teller - a geek with a hat"
      />
      <Link
        sx={{
          ml: 2,
          variant: "header.nav",
        }}
        href="/"
      >
        swizec.com
      </Link>
    </Flex>
    {/* <Box
      sx={{
        position: "absolute",
        top: 64,
        left: 0,
        zIndex: 2000,
        width: "100%",
        background: "#3182CE",
        px: 2,
        py: 3,
        color: "white",
        fontFamily: "sans-serif",
        fontSize: 2,
      }}
    >
      <Container>
        👋 ready to invest in your career? Get{" "}
        <a
          href="https://seniormindset.com"
          style={{ color: "white", fontWeight: "bold" }}
        >
          the Senior Engineer Mindset book
        </a>{" "}
        20% off this week only
      </Container>
    </Box> */}
  </>
)

export default HeaderLogo
