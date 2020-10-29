import React, { useEffect } from "react"
import { Box } from "rebass"

const Typeform = ({ url }) => {
  useEffect(() => {
    // Taken from typeform
    ;(function () {
      var /*qs,*/
        js,
        q,
        // s,
        d = document,
        gi = d.getElementById,
        ce = d.createElement,
        gt = d.getElementsByTagName,
        id = "typef_orm",
        b = "https://embed.typeform.com/"
      if (!gi.call(d, id)) {
        js = ce.call(d, "script")
        js.id = id
        js.src = b + "embed.js"
        q = gt.call(d, "script")[0]
        q.parentNode.insertBefore(js, q)
      }
    })()
  }, [])

  return (
    <Box
      className="typeform-widget"
      // data-url="https://swizecteller.typeform.com/to/AJgFM5"
      data-url={url}
      data-transparency="50"
      data-hide-headers="true"
      data-hide-footer="true"
      sx={{ height: 500 }}
    ></Box>
  )
}

export const TypeformLink = ({ url }) => (
  <Box textAlign="center">
    <Box
      as="a"
      sx={TypeFormLinkStyle}
      className="typeform-share button"
      href={url}
      data-mode="popup"
      target="_blank"
    >
      Answer 2 quick questions
    </Box>
  </Box>
)

const TypeFormLinkStyle = {
  display: "inline-block",
  textDecoration: "none",
  backgroundColor: "#267ddd",
  color: "white",
  cursor: "pointer",
  fontFamily: "Helvetica, Arial, sans-serif",
  fontSize: "20px",
  lineHeight: "50px",
  textAlign: "center",
  margin: 0,
  height: "50px",
  padding: "0px 33px",
  borderRadius: "25px",
  maxWidth: "100%",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  fontWeight: "bold",
}

export default Typeform
