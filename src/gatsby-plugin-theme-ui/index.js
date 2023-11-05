import merge from "deepmerge"
import { courseTheme } from "@swizec/gatsby-theme-course-platform"
import "typeface-exo"
import "typeface-yrsa"
import codeTheme from "@theme-ui/prism/presets/duotone-light.json"

const customTheme = {
  container: {
    maxWidth: "60ch",
  },
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
      "main#content": {
        maxWidth: "60ch",
        margin: "0 auto",
      },
    },
    pre: {
      ...codeTheme,
    },
    code: {
      ...codeTheme,
      fontSize: "0.9em",
      px: 0,
    },
  },
}

export default merge(courseTheme, customTheme)
