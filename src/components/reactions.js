import React, { useState, useEffect } from "react"
import styled from "@emotion/styled"

const Container = styled.div`
  display: flex;
  margin: auto auto;
  padding-bottom: 10px;
`

const JoyButton = styled.div`
  flex-grow: 1;

  a {
    font-size: 26px;
    padding-right: 20px;
    text-decoration: none;
  }
`

const ShareButtons = styled.div`
  margin: auto auto;
`

const SocialButton = styled.a`
  padding: 5px;
`

const Reactions = ({ page }) => {
  const [pathname, setPathname] = useState(page)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPathname(window.location.pathname)
    }
  })

  return (
    <Container>
      <JoyButton>
        <div className="Widget__WidgetLayout-sc-1ityn2x-2 cJHITu">
          <h2 className="styles__Heading-sc-1lygi1f-1 Widget__Question-sc-1ityn2x-3 haLIoK">
            Did you enjoy this chapter?
          </h2>
          <div className="styles__Flex-sc-1lygi1f-2 biiuQx">
            <a
              href={`https://spark-joy.netlify.com/e9819383-7166-4d69-a091-557bd7f73f22/thumbsdown?instanceOfJoy=${pathname}`}
              className="Widget__RoundButton-sc-1ityn2x-1 caphDb"
            >
              <span role="img" aria-label="thumbs-down">
                👎
              </span>
            </a>
            <a
              href={`https://spark-joy.netlify.com/e9819383-7166-4d69-a091-557bd7f73f22/thumbsup?instanceOfJoy=${pathname}`}
              className="Widget__RoundButton-sc-1ityn2x-1 caphDb"
            >
              <span role="img" aria-label="thumbs-up">
                👍
              </span>
            </a>
          </div>
        </div>
      </JoyButton>
    </Container>
  )
}

export default Reactions
