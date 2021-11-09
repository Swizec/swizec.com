import Typography from "typography"
import theme from "typography-theme-irving"
import "typeface-exo"
import "typeface-yrsa"

theme.overrideThemeStyles = ({ rhythm }, options) => ({
  "h2,h3,h4": {
    marginBottom: rhythm(1 / 2),
    marginTop: rhythm(2),
  },
})

const typography = new Typography({
  ...theme,
  baseFontSize: "23px",
  scaleRatio: 2.4,
})

export default typography
