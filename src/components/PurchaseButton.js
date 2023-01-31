import React from "react"
import { Script } from "gatsby"

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

export const SeniorMindsetBuyWidget = () => {
  return (
    <center style={{ marginBottom: "1em" }}>
      <PurchaseButton productId="c2b0c3ce-6d23-4d01-b4f2-bb01f600e72f">
        Get Senior Mindset Book
      </PurchaseButton>
      <p style={{ fontSize: "0.8em" }}>Price goes up every 100 purchases</p>
    </center>
  )
}
