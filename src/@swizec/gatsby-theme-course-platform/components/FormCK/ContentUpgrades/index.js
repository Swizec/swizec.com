import React from "react"
import ServerlessHandbookBeforeCopy from "./ServerlessHandbookBeforeCopy"
import ServerlessHandbookLeftCopy from "./ServerlessHandbookLeftCopy"

import SeniorMindsetBeforeCopy from "./SeniorMindsetBeforeCopy"
import SeniorMindsetLeftCopy from "./SeniorMindsetLeftCopy"

import JavascriptBeforeCopy from "./JavascriptBeforeCopy"
import JavascriptLeftCopy from "./JavascriptLeftCopy"

import FullstackWebBeforeCopy from "./FullstackWebBeforeCopy"
import FullstackWebLeftCopy from "./FullstackWebLeftCopy"

import ComputerScienceBeforeCopy from "./ComputerScienceBeforeCopy"
import ComputerScienceLeftCopy from "./ComputerScienceLeftCopy"

import ReactCUBeforeCopy from "./ReactCUBeforeCopy"
import ReactCULeftCopy from "./ReactCULeftCopy"

import BackendWebBeforeCopy from "./BackendWebBeforeCopy"
import BackendWebLeftCopy from "./BackendWebLeftCopy"

import IndieHackingBeforeCopy from "./IndieHackingBeforeCopy"
import IndieHackingLeftCopy from "./IndieHackingLeftCopy"

import ServerlessBeforeCopy from "./ServerlessBeforeCopy"
import ServerlessLeftCopy from "./ServerlessLeftCopy"

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
      <ReactCULeftCopy />
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

export const Serverless = ({ footer }) => {
  return (
    <FormCK
      copyBefore={footer ? <ServerlessBeforeCopy /> : <></>}
      formName="Serverless"
      submitText="Get curated essays 💌"
    >
      <ServerlessLeftCopy />
    </FormCK>
  )
}
