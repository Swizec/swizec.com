import React, { useState, useRef } from "react"
import { Global } from "@emotion/core"
import { Box, Flex, Text } from "rebass"
import { Sidenav, Pagination } from "@theme-ui/sidenav"

import Head from "./head"
import SkipLink from "./skip-link"
import Header from "./header"
import Footer from "./footer"
import Nav from "./nav"
import BlogFooter from "./blogFooter"
import { ArticleMetaData } from "./ArticleMetaData"
import { currentLocation } from "../util"
import { Title } from "../components/blocks"

import Reactions from "./reactions"

const Sidebar = (props) => {
  return (
    <Flex>
      <Box
        as={Sidenav}
        ref={props.nav}
        open={props.open}
        onClick={(e) => {
          props.setMenu(false)
        }}
        onBlur={(e) => {
          props.setMenu(false)
        }}
        onFocus={(e) => {
          props.setMenu(true)
        }}
        sx={{
          display: "none",
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
        <Nav />
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

const Content = (props) => {
  const isArticle =
    props.pageContext.frontmatter && props.pageContext.frontmatter.title

  return !props.fullwidth || props.menu ? (
    <Sidebar
      {...props}
      nav={props.nav}
      open={props.menu}
      setMenu={props.setMenu}
    >
      <Head {...props} />
      {isArticle && (
        <>
          <Title uri={props.uri}>{props.pageContext.frontmatter.title}</Title>
          <ArticleMetaData frontmatter={props.pageContext.frontmatter} />
        </>
      )}

      <main id="content">
        {props.children}
        {isArticle && (
          <>
            <Reactions page={props.uri} />
            <BlogFooter />
          </>
        )}
      </main>
    </Sidebar>
  ) : (
    <>
      <Head {...props} />
      <main id="content">{props.children}</main>
    </>
  )
}

export default (props) => {
  const fullwidth = currentLocation(props) === "/"
  const [menu, setMenu] = useState(false)
  const nav = useRef(null)

  return (
    <Box
      sx={{
        variant: "styles.root",
      }}
    >
      <SkipLink />
      <Global
        styles={{
          body: { margin: 0 },
        }}
      />
      <Header fullwidth={fullwidth} menu={menu} setMenu={setMenu} nav={nav} />

      <Content
        {...props}
        fullwidth={fullwidth}
        menu={menu}
        setMenu={setMenu}
        nav={nav}
      />

      <Footer />
    </Box>
  )
}
