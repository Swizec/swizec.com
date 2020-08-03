import React, { useState, useEffect } from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import { Box } from 'rebass';
import { useForm } from "react-hook-form";
import { Input } from '@rebass/forms';
import fetch from 'node-fetch';
import styled from "@emotion/styled";
import DefaultBeforeCopy from './DefaultBeforeCopy';
import DefaultLeftCopy from './DefaultLeftCopy';
import ThankYou from './ThankYou';

const FormCK = ({ copyBefore, submitText, formId, children}) => {

    const { register, errors, handleSubmit, formState, reset } = useForm();
    const [submitError, setSubmitError] = useState();
    const [formSuccess, setFormSuccess] = useState(false);

    const data = useStaticQuery(getDefaultFormId);
    if (!formId) {
        formId  = data.site.siteMetadata.convertkit.defaultFormId
    }

    const onSubmit = async (data) => {
        //If address is filled then it's spam
        if (!data.address && formState.isValid) {
            const url = `https://api.convertkit.com/v3/forms/${formId}/subscribe`;
            var headers = {
                "Content-Type": 'application/json; charset="utf-8"',
            }
            var bodyData = {
                api_key: process.env.GATSBY_CONVERTKIT_APIKEY,
                email: data.email,
                first_name: data.name
            }

            try {
                const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(bodyData)});
                const json = await response.json();
                if (!response.ok || !json?.subscription?.id) {
                    setSubmitError("Sorry there was an error, try again later or <a target='_blank' href='https://twitter.com/swizec'>contact me</a>!")
                } else {
                    setFormSuccess(true);
                }
            } catch (error) {
                console.log("Error", error);
            }
        }
    }

    return (
        <FormCkWrapper>
            {copyBefore}
            <div className="copy-content">
                {formSuccess? (
                    <Box
                        px={4}
                        style={{
                            textAlign: 'center'
                        }}>
                        <ThankYou />
                    </Box>
                ) : (
                    <>
                    <div className="copy-left">
                        {children}
                    </div>
                    <Box
                        as="form"
                        onSubmit={handleSubmit(onSubmit)}>
                        <Input
                            id="name"
                            type="text" 
                            name="name"
                            ref={register({ required: true })}
                            placeholder="Your first name"
                        />
                        {errors.name && <span><span role="img" aria-label="danger">⚠️</span> Name is required</span>}
                        <Input
                            id="email"
                            type="email" 
                            name="email"
                            ref={register({ 
                                required: "⚠️ E-mail is required",
                                pattern: {
                                    value: "^[a-zA-Z0-9.!#$%&’*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$",
                                    message: "⚠️ Invalid email address"
                                }
                            })}
                            placeholder="Your email address"
                        />
                        {errors.email && <span>{errors.email.message}</span>}

                        <input 
                            className="required" 
                            autoComplete="nope" 
                            type="text" 
                            id="address" 
                            name="address" 
                            ref={register}
                            placeholder="Your address here" 
                        />
                        <button type="submit" disabled={formState.isSubmitting}>{submitText}</button>
                        {submitError && <p dangerouslySetInnerHTML={{ __html: submitError }}></p> }
                        <p>No spam. Unsubscribe at any time. <span role="img" aria-label="ok">✌️</span></p>
                    </Box>
                    </>
                )}
            </div>
        </FormCkWrapper>
    )
}

FormCK.defaultProps = {
    children: <DefaultLeftCopy />,
    copyBefore: <DefaultBeforeCopy />,
    submitText: "Improve my career ?",
};

const getDefaultFormId = graphql`
    query {
        site {
            siteMetadata {
                convertkit {
                    defaultFormId
                }
            }
        }
    }
`;

const FormCkWrapper = styled.div`

    .copy-content {
        display: grid;
        grid-template-columns: repeat(auto-fit,minmax(200px,1fr));

        box-shadow: 0 2px 15px 0 rgba(210,214,220,0.5);
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
                    margin-top: 1rem;
                    padding: 0.8rem;
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
                    font-size: 1rem;
                    font-weight: 700;
                    margin-top: 1rem;
                    padding: 1rem 2rem;
                }
        }
    }
`

export default FormCK
