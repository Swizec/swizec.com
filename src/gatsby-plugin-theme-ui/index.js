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
  fonts: {
    heading: "Exo, sans-serif",
    body: "Yrsa, georgia, sans-serif",
    monospace: "monospace",
  },
  styles: {
    h3: {
      fontSize: "1.1em",
    },
    h4: {
      fontSize: "1.1em",
    },
    root: {
      // override for typography screwing up forms
      "& form": {
        fontFamily: "heading",
        fontSize: "18px",
        p: 3,
        "& input": {
          fontSize: "18px",
          p: 3,
        },
        "& button": {
          fontSize: "1em",
          marginBottom: "0.3rem",
        },
      },
      "& div.copy-content > div": {
        p: 3,
      },
    },
  },
}

export default merge(courseTheme, customTheme)
// export default merge(toTheme(typography), merge(courseTheme, customTheme))
