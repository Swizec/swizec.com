import React, { useState, useRef, useLayoutEffect } from "react"
import { Global } from "@emotion/core"
import { Box, Flex, Button, Link } from "rebass"
import { Sidenav, Pagination } from "@theme-ui/sidenav"
import { useAuth } from "react-use-auth"
import { navigate } from "gatsby"
import { StickyContainer, Sticky } from "react-sticky"

import Head from "./head"
import SkipLink from "./skip-link"
import Header from "./header"
import Footer from "./footer"
import Nav from "./nav"
import NavWorkshop from "./nav-workshop"
import { default as PleaseLoginCopy } from "./please-login"
import { isAuthorized, isWorkshopPage, currentLocation } from "../util"

import Reactions from "./reactions"

const Sidebar = props => {
  return (
    <Flex>
      <Box
        as={Sidenav}
        ref={props.nav}
        open={props.open}
        onClick={e => {
          props.setMenu(false)
        }}
        onBlur={e => {
          props.setMenu(false)
        }}
        onFocus={e => {
          props.setMenu(true)
        }}
        sx={{
          width: [256, 256, 320],
          flex: "none",
          px: 3,
          mt: [64, 0],
          pb: 3,
          "li > ul > li > a": {
            pl: "24px",
          },
        }}
      >
        {isWorkshopPage(props) ? <NavWorkshop /> : <Nav />}
      </Box>
      <Box
        sx={{
          width: "100%",
          minWidth: 0,
          maxWidth: 768,
          minHeight: "calc(100vh - 64px)",
          mx: "auto",
          px: [3, 4],
          pb: 5,
        }}
      >
        {props.children}
        <Reactions page={props.uri} />
        <Nav
          pathname={props.location.pathname}
          components={{
            wrapper: Pagination,
          }}
        />
      </Box>
    </Flex>
  )
}

const Content = props =>
  !props.fullwidth || props.menu ? (
    <Sidebar
      {...props}
      nav={props.nav}
      open={props.menu}
      setMenu={props.setMenu}
    >
      <Head {...props} />
      <main id="content">{props.children}</main>
    </Sidebar>
  ) : (
    <>
      <Head {...props} />
      <main id="content">{props.children}</main>
    </>
  )

const PleaseLogin = props => {
  const { login } = useAuth()
  return (
    <>
      <Head {...props} />
      <main
        id="content"
        style={{
          textAlign: "center",
          margin: "auto auto",
        }}
      >
        Please{" "}
        <Link href="" onClick={login}>
          login
        </Link>{" "}
        to access this page
        <PleaseLoginCopy />
      </main>
    </>
  )
}

const PleasePurchase = props => {
  return (
    <>
      <Head {...props} />
      <main id="content">
        Please{" "}
        <Button onClick={() => navigate("/")}>
          purchase Serverless React Dev
        </Button>{" "}
        to access this page
      </main>
    </>
  )
}

const UNAUTH_PAGES = [
  "/",
  "/auth0_callback",
  "/thankyou",
  "/thankyou/", //it's necessary this duplicate because of old node version from ZEIT
]

export default props => {
  const allowUnauth =
    isWorkshopPage(props) || UNAUTH_PAGES.includes(currentLocation(props))
  const fullwidth = allowUnauth && !isWorkshopPage(props)
  const [menu, setMenu] = useState(isWorkshopPage(props))
  const nav = useRef(null)
  const { isAuthenticated, user } = useAuth()

  return (
    <Box
      sx={{
        variant: "styles.root",
      }}
    >
      <StickyContainer>
        <SkipLink />
        <Global
          styles={{
            body: { margin: 0 },
          }}
        />
        <Sticky>
          {({ style, ...rest }) => (
            <div style={{ marginBottom: "20px" }}>
              <Header
                fullwidth={fullwidth}
                menu={menu}
                setMenu={setMenu}
                nav={nav}
                style={style}
                showBanner={!isAuthenticated() && !isWorkshopPage(props)}
              />
            </div>
          )}
        </Sticky>
        {allowUnauth || (isAuthenticated() && isAuthorized(user)) ? (
          <Content
            {...props}
            fullwidth={fullwidth}
            menu={menu}
            setMenu={setMenu}
            nav={nav}
          />
        ) : isAuthenticated() ? (
          <PleasePurchase />
        ) : (
          <PleaseLogin />
        )}

        <Footer />
      </StickyContainer>
    </Box>
  )
}
