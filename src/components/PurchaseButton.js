import React from "react"
import { Script } from "gatsby"
import { Box, Paragraph, Grid, Heading } from "theme-ui"

export function trackClick(productId) {
  if (window.plausible) {
    window.plausible("Purchase Button Clicked", {
      props: {
        productId,
      },
    })
  }
}

// copied from Lemon Squeezy form
const buttonStyle = {
  alignItems: "center",
  appearance: "button",
  "-webkit-appearance": "button",
  backgroundColor: "rgb(112, 71, 235)",
  backgroundImage: "none",
  border: "rgb(229, 231, 235) solid 0px",
  borderRadius: "8px",
  borderImageOutset: 0,
  borderImageRepeat: "stretch",
  borderImageSource: "none",
  borderImageWidth: 1,
  boxSizing: "border-box",
  color: "rgb(255, 255, 255)",
  cursor: "pointer",
  display: "inline-flex",
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
  fontSize: "20px",
  fontStretch: "100%",
  fontVariantCaps: "normal",
  fontVariantEastAsian: "normal",
  fontVariantLigatures: "normal",
  fontVariantNumeric: "normal",
  fontWeight: 500,
  letterSpacing: "normal",
  lineHeight: "35px",
  margin: 0,
  maxWidth: "100%",
  minWidth: "300px",
  padding: "10px 16px",
  tabSize: 4,
  textAlign: "center",
  textDecoration: "none",
  textIndent: "0px",
  textRendering: "auto",
  textShadow: "none",
  textSizeAdjust: "100%",
  wordSpacing: "0px",
  writingMode: "horizontal-tb",
  "-webkit-font-smoothing": "antialiased",
  "-webkit-border-image": "none",
}

const buttonTextStyle = {
  marginLeft: "auto",
  marginRight: "auto",
  display: "flex",
  alignItems: "center",
}

export const PurchaseButton = ({ productId, children }) => {
  const [isHover, setHover] = React.useState(false)

  const style = isHover
    ? { ...buttonStyle, backgroundColor: "rgba(112, 71, 235, 0.8)" }
    : { ...buttonStyle, backgroundColor: "rgb(112, 71, 235)" }

  return (
    <>
      <Script src="https://app.lemonsqueezy.com/js/lemon.js" />
      <Script src="https://cdn.paritydeals.com/banner.js" />
      <a
        href={`https://swizec.lemonsqueezy.com/checkout/buy/${productId}?embed=1&media=0`}
        className="lemonsqueezy-button"
        onClick={() => trackClick(productId)}
        onMouseOver={() => setHover(true)}
        onMouseOut={() => setHover(false)}
        style={style}
      >
        <span style={buttonTextStyle}>{children}</span>
      </a>
    </>
  )
}

const Package = ({ title, price, items, sx }) => {
  return (
    <Box
      sx={{
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
        textAlign: "center",
        ...sx,
      }}
    >
      <Heading as="h4" sx={{ textAlign: "center" }}>
        {title}
      </Heading>
      <Heading as="h5" sx={{ textAlign: "center", my: 2, mb: 3 }}>
        ${price}
      </Heading>
      <Box
        as="ul"
        sx={{
          fontSize: 2,
          lineHeight: "110%",
          listStyleType: "none",
        }}
      >
        {items?.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </Box>
    </Box>
  )
}

const TheButton = () => (
  <Box sx={{ mb: "1em", textAlign: "center" }}>
    <PurchaseButton productId="c2b0c3ce-6d23-4d01-b4f2-bb01f600e72f">
      Get Senior Mindset Book
    </PurchaseButton>
  </Box>
)

export const SeniorMindsetBuyWidget = ({ showPricing }) => {
  if (showPricing) {
    return (
      <Box
        sx={{
          ml: ["-26px", "-80px"],
          mr: ["-26px", "-100px"],
          border: "2px solid rgb(112, 71, 235)",
          borderRadius: 10,
          p: 4,
          pb: 1,
          mb: 4,
        }}
      >
        <Grid columns={[2, 3]} gap={4}>
          <Package
            title="Just The Book"
            price={49}
            items={[
              "DRM-free pdf/epub",
              "14 week email series",
              <>
                39 curated book
                <br />
                recommendations
              </>,
              <>
                30 day
                <br />
                money-back guarantee
              </>,
            ]}
          />
          <Package
            title="Book + Audio"
            price={79}
            items={[
              "DRM-free pdf/epub",
              "14 week email series",
              <>
                39 curated book
                <br />
                recommendations
              </>,
              "3h 32min audiobook",
              <>
                12h+ interviews
                <br />
                private podcast
              </>,
              <>
                30 day
                <br />
                money-back guarantee
              </>,
            ]}
          />
          <Package
            title="Book + Audio + Coaching"
            price={449}
            sx={{ gridColumn: ["span 2", "inherit"] }}
            items={[
              "DRM-free pdf/epub",
              "14 week email series",
              <>
                39 curated book
                <br />
                recommendations
              </>,
              "3h 32min audiobook",
              <>
                12h+ interviews
                <br />
                private podcast
              </>,
              <>
                1-on-1 ask anything
                <br />
                coaching session
              </>,
            ]}
          />
        </Grid>
        <TheButton />
      </Box>
    )
  } else {
    return <TheButton />
  }
}
