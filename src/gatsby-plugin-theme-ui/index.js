import merge from "deepmerge"
import { toTheme } from "@theme-ui/typography"
import typography from "typography-theme-grand-view"
// import "typeface-montserrat"
// import "typeface-arvo"
import { courseTheme } from "@swizec/gatsby-theme-course-platform"

const customTheme = {
  ...courseTheme,
  layout: {
    container: {
      width: ["97%", "97%", "78%"],
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

// const theme = merge(preset, toTheme(typography), customTheme)
// const theme = toTheme(typography)

export default courseTheme
