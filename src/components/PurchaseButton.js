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

export const PurchaseButton = ({ productId, children }) => (
  <>
    <Script src="https://gumroad.com/js/gumroad.js" />
    <Script src="https://cdn.paritydeals.com/banner.js" />
    <a
      class="gumroad-button"
      href={`https://swizec.gumroad.com/l/${productId}`}
      data-gumroad-single-product="true"
      onClick={() => trackClick(productId)}
    >
      {children}
    </a>
  </>
)
