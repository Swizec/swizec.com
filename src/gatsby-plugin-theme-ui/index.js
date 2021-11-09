import merge from "deepmerge"
import { courseTheme } from "@swizec/gatsby-theme-course-platform"

const customTheme = {
  header: {
    nav: {
      color: "text",
      textDecoration: "none",
      fontWeight: "700",
    },
  },
}

export default merge(courseTheme, customTheme)
