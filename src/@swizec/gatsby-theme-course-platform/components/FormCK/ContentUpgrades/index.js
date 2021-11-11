import React from "react"
import ServerlessHandbookBeforeCopy from "./ServerlessHandbookBeforeCopy"
import ServerlessHandbookLeftCopy from "./ServerlessHandbookLeftCopy"

import SeniorMindsetBeforeCopy from "./SeniorMindsetBeforeCopy"
import SeniorMindsetLeftCopy from "./SeniorMindsetLeftCopy.mdx"

import JavascriptBeforeCopy from "./JavascriptBeforeCopy"
import JavascriptLeftCopy from "./JavascriptLeftCopy.mdx"

import FullstackWebBeforeCopy from "./FullstackWebBeforeCopy"
import FullstackWebLeftCopy from "./FullstackWebLeftCopy.mdx"

import ComputerScienceBeforeCopy from "./ComputerScienceBeforeCopy"
import ComputerScienceLeftCopy from "./ComputerScienceLeftCopy.mdx"

import ReactCUBeforeCopy from "./ReactCUBeforeCopy"
import ReactCULeftCopy from "./ReactCULeftCopy.mdx"

import BackendWebBeforeCopy from "./BackendWebBeforeCopy"
import BackendWebLeftCopy from "./BackendWebLeftCopy.mdx"

import IndieHackingBeforeCopy from "./IndieHackingBeforeCopy"
import IndieHackingLeftCopy from "./IndieHackingLeftCopy.mdx"

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

export const FullstackWeb = ({ footer }) => {
  return (
    <FormCK
      copyBefore={footer ? <FullstackWebBeforeCopy /> : <></>}
      formName="fullstackWeb"
      submitText="Get curated essays 💌"
    >
      <FullstackWebLeftCopy />
    </FormCK>
  )
}

export const ComputerScience = ({ footer }) => {
  return (
    <FormCK
      copyBefore={footer ? <ComputerScienceBeforeCopy /> : <></>}
      formName="ComputerScience"
      submitText="Get curated essays 💌"
    >
      <ComputerScienceLeftCopy />
    </FormCK>
  )
}

export const ReactCU = ({ footer }) => {
  return (
    <FormCK
      copyBefore={footer ? <ReactCUBeforeCopy /> : <></>}
      formName="ReactCU"
      submitText="Get curated essays 💌"
    >
      <ReactLeftCopy />
    </FormCK>
  )
}

export const BackendWeb = ({ footer }) => {
  return (
    <FormCK
      copyBefore={footer ? <BackendWebBeforeCopy /> : <></>}
      formName="BackendWeb"
      submitText="Get curated essays 💌"
    >
      <BackendWebLeftCopy />
    </FormCK>
  )
}

export const IndieHacking = ({ footer }) => {
  return (
    <FormCK
      copyBefore={footer ? <IndieHackingBeforeCopy /> : <></>}
      formName="IndieHacking"
      submitText="Get curated essays 💌"
    >
      <IndieHackingLeftCopy />
    </FormCK>
  )
}
