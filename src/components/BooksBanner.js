import React from "react"
import { Box, Button, Heading, Paragraph, Flex } from "theme-ui"
import { StaticImage } from "gatsby-plugin-image"
import { Link } from "gatsby"
import { ContentUpgrades } from "@swizec/gatsby-theme-course-platform"

function trackClick(book) {
  if (window.plausible) {
    if (book === "scaling-fast") {
      window.plausible("Scaling Fast Banner Clicked")
    } else if (book === "senior-mindset") {
      window.plausible("Senior Mindset Banner Clicked")
    }
  }
}

export const RightBanner = (props) => {
  if (
    props.path.startsWith("/senior-mindset/") ||
    props.path.startsWith("/render-social-card/") ||
    props.path.startsWith("/sf")
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
      <Heading as="h4">Scaling Fast Book</Heading>
      <Paragraph sx={{ fontSize: 3 }}>
        What happens when your startup hits hypergrowth?
      </Paragraph>
      <Box sx={{ textAlign: "center", mb: 2 }}>
        <Link
          to="https://scalingfastbook.com"
          onClick={() => trackClick("scaling-fast")}
        >
          <StaticImage
            src="../images/ScalingFast3DCover.png"
            alt="Scaling Fast cover"
            placeholder="tracedSVG"
          />
        </Link>
        <Button
          as="a"
          sx={{ cursor: "pointer" }}
          href="https://scalingfastbook.com"
          onClick={() => trackClick("scaling-fast")}
        >
          Learn more
        </Button>
      </Box>

      <Heading as="h4">Senior Mindset Book</Heading>
      <Paragraph sx={{ fontSize: 3 }}>
        Get promoted, earn a bigger salary, work for top companies
      </Paragraph>
      <Box sx={{ textAlign: "center" }}>
        <Link
          to="/senior-mindset/"
          onClick={() => trackClick("senior-mindset")}
        >
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
          onClick={() => trackClick("senior-mindset")}
        >
          Learn more
        </Button>
      </Box>
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
