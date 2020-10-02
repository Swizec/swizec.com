import React, { useState } from "react"
import { useStaticQuery, graphql } from "gatsby"
import { Box, Flex, Button } from "rebass"
import { useForm } from "react-hook-form"
import { Input, Label } from "@rebass/forms"
import fetch from "node-fetch"
import styled from "@emotion/styled"
import DefaultBeforeCopy from "./DefaultBeforeCopy"
import DefaultLeftCopy from "./DefaultLeftCopy"
import ThankYou from "./ThankYou"
import BouncingLoader from "../BouncingLoader"

const FormCK = ({ copyBefore, submitText, formName, children }) => {
  const { register, errors, handleSubmit, formState } = useForm({
    mode: "onBlur",
  })
  const [submitError, setSubmitError] = useState()
  const [formSuccess, setFormSuccess] = useState(false)

  const ckForms = useStaticQuery(getCKForms)
  const formId =
    ckForms.site.siteMetadata.convertkit[`${formName || "default"}FormId`]

  const uniqueId = `${new Date().getTime()}`

  const onSubmit = async (data) => {
    //If address is filled then it's spam
    if (!data.address && formState.isValid) {
      const url = `https://api.convertkit.com/v3/forms/${formId}/subscribe`
      var headers = {
        "Content-Type": 'application/json; charset="utf-8"',
      }
      var bodyData = {
        api_key: process.env.GATSBY_CONVERTKIT_APIKEY,
        email: data.email,
        first_name: data.name,
      }

      try {
        const response = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(bodyData),
        })
        const json = await response.json()
        if (!response.ok || !json?.subscription?.id) {
          setSubmitError(
            "Sorry there was an error, try again later or <a target='_blank' href='https://twitter.com/swizec'>contact me</a>!"
          )
        } else {
          setFormSuccess(true)
        }
      } catch (error) {
        console.log("Error", error)
      }
    }
  }

  return (
    <Box
      sx={{
        mt: [2, 3, 3],
        ml: [0, "-32px", "-32px"],
        mr: [0, "-32px", "-32px"],
        mb: [2, 3, 3],
      }}
    >
      <FormCkWrapper>
        {copyBefore}
        <div className="copy-content">
          {formSuccess ? (
            <Box
              px={4}
              style={{
                textAlign: "center",
              }}
            >
              <ThankYou />
            </Box>
          ) : (
            <>
              <Box
                sx={{
                  bg: "copyBackground",
                  textAlign: "center",
                  padding: "2rem",
                }}
              >
                {children}
              </Box>
              <Flex
                as="form"
                onSubmit={handleSubmit(onSubmit)}
                sx={{ justifyContent: "center" }}
              >
                <Label htmlFor={`${uniqueId}-name`}>Your Name</Label>
                <Input
                  id={`${uniqueId}-name`}
                  type="text"
                  name="name"
                  ref={register({ required: true })}
                  placeholder="Your name"
                />
                {errors.name && (
                  <span>
                    <span role="img" aria-label="danger">
                      ⚠️
                    </span>{" "}
                    Name is required
                  </span>
                )}
                <Label htmlFor={`${uniqueId}-email`}>Your Email</Label>
                <Input
                  id={`${uniqueId}-email`}
                  type="email"
                  name="email"
                  ref={register({
                    required: "⚠️ E-mail is required",
                    pattern: {
                      value:
                        "^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$",
                      message: "⚠️ Invalid email address",
                    },
                  })}
                  placeholder="Your email address"
                />
                {errors.email && <span>{errors.email.message}</span>}

                <Label htmlFor={`${uniqueId}-address`} className="required">
                  Your Address
                </Label>
                <input
                  className="required"
                  autoComplete="nope"
                  type="text"
                  id={`${uniqueId}-address`}
                  name="address"
                  ref={register}
                  placeholder="Your address here"
                />
                <Button type="submit" disabled={formState.isSubmitting}>
                  {formState.isSubmitting ? <BouncingLoader /> : submitText}
                </Button>
                {submitError && (
                  <p dangerouslySetInnerHTML={{ __html: submitError }}></p>
                )}
                <p style={{ fontSize: "0.8em" }}>
                  Join over 10,000 engineers just like you already improving
                  their JS careers with my letters, workshops, courses, and
                  talks.{" "}
                  <span role="img" aria-label="ok">
                    ✌️
                  </span>
                </p>
              </Flex>
            </>
          )}
        </div>
      </FormCkWrapper>
    </Box>
  )
}

FormCK.defaultProps = {
  children: <DefaultLeftCopy />,
  copyBefore: <DefaultBeforeCopy />,
  submitText: "Subscribe & Become an expert 💌",
}

const getCKForms = graphql`
  query {
    site {
      siteMetadata {
        convertkit {
          defaultFormId
          serverlessHandbookFormId
          seniorMindsetFormId
        }
      }
    }
  }
`

const FormCkWrapper = styled.div`
  .copy-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));

    box-shadow: 0 2px 15px 0 rgba(210, 214, 220, 0.5);
    overflow: hidden;

    .copy-left {
      background-color: #f9fafb;
      padding: 2rem;
      text-align: center;
    }

    form {
      display: flex;
      flex-direction: column;

      padding: 2rem;
      text-align: center;

      input {
        border-color: #e3e3e3;
        border-radius: 4px;
        box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
        font-size: 1rem;
        font-weight: 400;
        line-height: 1.4;
        padding: 0.8rem;
      }

      label {
        margin-top: 1rem;
        margin-bottom: 0.1rem;
      }

      span {
        color: red;
        text-align: left;
      }

      .required {
        opacity: 0;
        position: absolute;
        top: 0;
        left: 0;
        height: 0;
        width: 0;
        z-index: -1;
      }

      button {
        background-color: #1677be;
        border-radius: 24px;
        color: #fff;
        cursor: pointer;
        height: 64px;
        font-size: 1rem;
        font-weight: 700;
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        outline: none !important;
      }
    }
  }
`

export default FormCK
