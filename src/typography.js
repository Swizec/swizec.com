import Typography from "typography"
import theme from "typography-theme-irving"
import CodePlugin from "typography-plugin-code"

theme.overrideThemeStyles = ({ rhythm }, options) => ({
  "h2,h3,h4": {
    marginBottom: rhythm(1 / 2),
    marginTop: rhythm(2),
  },
})
theme.plugins = [new CodePlugin()]
theme.baseFontSize = "23px"

const typography = new Typography(theme)

export default typography
