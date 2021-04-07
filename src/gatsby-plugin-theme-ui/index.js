import preset from "@rebass/preset"
import merge from "lodash.merge"
import { toTheme } from "@theme-ui/typography"
import typography from "typography-theme-funston"
import "typeface-patua-one"
import "typeface-cabin-condensed"
import { courseTheme } from "@swizec/gatsby-theme-course-platform"

const customTheme = {
  ...courseTheme,
  layout: {
    container: {
      //   width: ["97%", "97%", "78%"],
      maxWidth: "container",
    },
  },
  header: {
    nav: {
      color: "text",
      textDecoration: "none",
      fontWeight: "700",
    },
  },
}

const theme = merge(preset, toTheme(typography), customTheme)

export default theme
