import React from 'react'
import styled from "@emotion/styled"
import {LearnedSomethingNew} from './';

const FormCK = ({ copyBefore, submitText, formId, children}) => {

    console.log("COPYBEGORE", copyBefore)

    const handleSubmit = () => {

    }

    return (
        <FormCkWrapper>
            {copyBefore}
            <div className="copy-content">
                <div className="copy-left">
                    {children}
                </div>
                <div className="cta-form">
                    <form onSubmit={handleSubmit}>
                        <input
                            id="name"
                            type="text" 
                            name="name"
                            placeholder="Your first name"
                        />
                        <input
                            id="email"
                            type="email" 
                            name="email"
                            placeholder="Your email address"
                        />
                        <button type="submit">{submitText}</button>
                        {/* <button  disabled={state.submitting}>
                            Sign Up
                        </button> */}
                    </form>
                    
                    <p>No spam. Unsubscribe at any time. ✌️</p>
                </div>
            </div>
        </FormCkWrapper>
    )
}


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

        .cta-form {
            display: flex;
            flex-direction: column;

            padding: 2rem;
            text-align: center;

            form {

                input {
                    border-color: #e3e3e3;
                    border-radius: 4px;
                    box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
                    font-size: 1rem;
                    font-weight: 400;
                    line-height: 1.4;
                    margin-bottom: 1rem;
                    padding: 0.8rem;
                }

                button {
                    background-color: #1677be;
                    border-radius: 24px;
                    color: #fff;
                    cursor: pointer;
                    font-size: 1rem;
                    font-weight: 700;
                    padding: 1rem 2rem;
                }
            }

        }
    }
`

export default FormCK
