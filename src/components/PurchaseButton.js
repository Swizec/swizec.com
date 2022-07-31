import React from "react"
import { Helmet } from "react-helmet"

export function trackClick(productId) {
  if (window.plausible) {
    window.plausible("Purchase Button Clicked", {
      props: {
        productId,
      },
    })
  }
}

export const PurchaseButton = ({ productId, children }) => (
  <>
    <Helmet>
      <script src="https://gumroad.com/js/gumroad.js" defer></script>
    </Helmet>
    <a
      class="gumroad-button"
      href={`https://swizec.gumroad.com/l/${productId}?wanted=true`}
      data-gumroad-single-product="true"
      onClick={() => trackClick(productId)}
    >
      {children}
    </a>
  </>
)
