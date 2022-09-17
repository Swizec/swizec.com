import React from "react"
import { Box, Button, Heading } from "theme-ui"
import { StaticImage } from "gatsby-plugin-image"
import { Link } from "gatsby"

function trackClick() {
  if (window.plausible) {
    window.plausible("Senior Mindset Banner Clicked")
  }
}

const RightBanner = (props) => {
  if (
    props.path.startsWith("/senior-mindset/") ||
    props.path.startsWith("/render-social-card/")
  ) {
    return null
  }

  return (
    <Box
      as="section"
      sx={{
        position: "sticky",
        mt: props.path === "/" ? 200 : 0,
        top: 64,
        float: "right",
        mr: -40,
        width: 300,
        display: ["none", "none", "block"],
      }}
    >
      <Heading as="h3">Senior Mindset Book</Heading>
      <p>Get promoted, earn a bigger salary, work for top companies</p>
      <Box sx={{ textAlign: "center" }}>
        <Link to="/senior-mindset/" onClick={trackClick}>
          <StaticImage
            src="../../../images/SeniorMindset-cover-3d.png"
            alt="Senior Engineer Mindset cover"
            placeholder="tracedSVG"
          />
        </Link>
        <Button
          as="a"
          sx={{ cursor: "pointer" }}
          href="/senior-mindset/"
          onClick={trackClick}
        >
          Learn more
        </Button>
      </Box>
    </Box>
  )
}

export default RightBanner
