import merge from "deepmerge"
import { courseTheme } from "@swizec/gatsby-theme-course-platform"
import "typeface-exo"
import "typeface-yrsa"

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
