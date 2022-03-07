import React from "react"
import { Helmet } from "react-helmet"

export const PurchaseButton = ({ productId, children }) => (
  <>
    <Helmet>
      <script src="https://gumroad.com/js/gumroad.js"></script>
    </Helmet>
    <a
      class="gumroad-button"
      href={`https://swizec.gumroad.com/l/${productId}?wanted=true`}
      data-gumroad-single-product="true"
    >
      {children}
    </a>
  </>
)
