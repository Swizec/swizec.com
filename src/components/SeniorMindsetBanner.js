import React from "react"
import { Box, Button, Heading, Paragraph, Flex } from "theme-ui"
import { StaticImage } from "gatsby-plugin-image"
import { Link } from "gatsby"
import { ContentUpgrades } from "@swizec/gatsby-theme-course-platform"

function trackClick() {
  if (window.plausible) {
    window.plausible("Senior Mindset Banner Clicked")
  }
}

export const RightBanner = (props) => {
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
        mt: 400,
        top: 64,
        float: "right",
        // mr: -40,
        width: 250,
        display: ["none", "none", "block"],
      }}
    >
      <Heading as="h4">Senior Mindset Book</Heading>
      <Paragraph sx={{ fontSize: 3 }}>
        Get promoted, earn a bigger salary, work for top companies
      </Paragraph>
      <Box sx={{ textAlign: "center" }}>
        <Link to="/senior-mindset/" onClick={trackClick}>
          <StaticImage
            src="../images/SeniorMindset-cover-3d.png"
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
      <ContentUpgrades.SeniorMindsetBanner />
    </Box>
  )
}

export const FooterBanner = () => {
  return (
    <Flex
      as="section"
      sx={{
        display: ["flex", "flex", "none"],
        flexDirection: "row",
        alignItems: "center",
        py: 5,
        mx: "-16px",
      }}
    >
      <Box sx={{ textAlign: "center", width: 300 }}>
        <Link to="/senior-mindset/" onClick={trackClick}>
          <StaticImage
            src="../images/SeniorMindset-cover-3d.png"
            alt="Senior Engineer Mindset cover"
            placeholder="tracedSVG"
          />
        </Link>
      </Box>
      <Box>
        <Heading as="h3">Senior Mindset Book</Heading>
        <Paragraph sx={{ fontSize: 3, pb: 2 }}>
          Get promoted, earn a bigger salary, work for top companies
        </Paragraph>
        <Button
          as="a"
          sx={{ cursor: "pointer" }}
          href="/senior-mindset/"
          onClick={trackClick}
        >
          Learn more
        </Button>
      </Box>
    </Flex>
  )
}
