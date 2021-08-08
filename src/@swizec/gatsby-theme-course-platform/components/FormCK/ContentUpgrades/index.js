import React from "react"
import ServerlessHandbookBeforeCopy from "./ServerlessHandbookBeforeCopy"
import ServerlessHandbookLeftCopy from "./ServerlessHandbookLeftCopy"

import SeniorMindsetBeforeCopy from "./SeniorMindsetBeforeCopy"
import SeniorMindsetLeftCopy from "./SeniorMindsetLeftCopy.mdx"

import JavascriptBeforeCopy from "./JavascriptBeforeCopy"
import JavascriptLeftCopy from "./JavascriptLeftCopy.mdx"

import { FormCK } from "@swizec/gatsby-theme-course-platform"

export const ServerlessHandbook = ({ footer }) => {
  return (
    <FormCK
      copyBefore={footer ? <ServerlessHandbookBeforeCopy /> : <></>}
      formName="serverlessHandbook"
      submitText="Send it to me! 💌"
    >
      <ServerlessHandbookLeftCopy />
    </FormCK>
  )
}

export const SeniorMindset = ({ footer }) => {
  return (
    <FormCK
      copyBefore={footer ? <SeniorMindsetBeforeCopy /> : <></>}
      formName="seniorMindset"
      submitText="Get curated essays 💌"
    >
      <SeniorMindsetLeftCopy />
    </FormCK>
  )
}

export const Javascript = ({ footer }) => {
  return (
    <FormCK
      copyBefore={footer ? <JavascriptBeforeCopy /> : <></>}
      formName="javascript"
      submitText="Get curated essays 💌"
    >
      <JavascriptLeftCopy />
    </FormCK>
  )
}
