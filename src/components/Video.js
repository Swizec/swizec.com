import React, { useState } from "react"
import { Box, Button } from "rebass"

export const Video = ({ id }) => (
  <Box width={1} sx={{ margin: "0 auto" }}>
    <Box
      sx={{
        width: "100%",
        height: 0,
        paddingBottom: 900 / 16 + "%",
        position: "relative",
        overflow: "hidden",
        "& > iframe": {
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          bottom: 0,
          left: 0,
          border: 0,
        },
      }}
    >
      <iframe
        title={`video ${id}`}
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${id}`}
        frameborder="0"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    </Box>
  </Box>
)

export const Vimeo = ({ id }) => {
  const [showBig, setShowBig] = useState(false)

  function toggleSize() {
    setShowBig(showBig => !showBig)
  }

  return (
    <Box
      width={!showBig ? 1 : null}
      bg="background"
      sx={
        showBig
          ? {
              position: "fixed",
              top: "0px",
              right: "0px",
              bottom: "0px",
              left: "0px",
              zIndex: 1000,
            }
          : { position: "relative" }
      }
    >
      <Box
        sx={{
          width: "100%",
          height: 0,
          paddingBottom: 900 / 16 + "%",
          position: "relative",
          overflow: "hidden",
          "& > iframe": {
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            bottom: 0,
            left: 0,
            border: 0,
          },
        }}
      >
        <iframe
          src={`https://player.vimeo.com/video/${id}`}
          width="100%"
          height="100%"
          frameborder="0"
          allow="autoplay; fullscreen"
          allowfullscreen
        ></iframe>
      </Box>
      <Box mt={1} textAlign="right">
        <Button variant="small-outline" onClick={toggleSize}>
          {showBig ? "normal size" : "full-browser video"}
        </Button>
      </Box>
    </Box>
  )
}
