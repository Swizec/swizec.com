import React from 'react'
import styled from "@emotion/styled";

const TwitterButton = ({ onButtonClick }) => {
    return (
        <TwitterButtonWrapper >
            <h3>I love @swizec's thoughtful letters. <span role="img" aria-label="letter">💌</span> He's helping me become a better engineer. Check it out <span role="img" aria-label="finger-right">👉</span> https://swizec.com/letters</h3>
            <a onClick={onButtonClick} target="_blank" rel="noreferrer" href="http://twitter.com/intent/tweet?text=I+love+%40swizec%27s+thoughtful+letters.+%F0%9F%92%8C+He%27s+helping+me+become+a+better+engineer.+Check+it+out+%F0%9F%91%89+https%3A%2F%2Fswizec.com%2Fletters">
                <img src={'/twitter.png'} alt="twitter" />
                <span>Tweet</span>
            </a>
        </TwitterButtonWrapper>
    )
}

const TwitterButtonWrapper = styled.div`

    background-color: #f6f8fa;
    border: 1px solid #d2e1db;
    border-radius: 5px;
    margin-bottom: 1rem;

    h3 {
        font-weight: 400;
    }

    a {
        display: inline-flex;
        align-items: center;

        background-color: #2185D0;
        background-image: none;
        border-radius: 5px;
        box-shadow: 0px 0em 0px 0px rgba(34, 36, 38, 0.15) inset;
        color: #FFFFFF;
        cursor: pointer;
        font-size: 1.2rem;
        font-weight: bold;
        margin-bottom: 1rem;
        padding: 0.8rem 1.5rem;
        text-decoration: none;
        text-shadow: none;

        img {
            margin-right: 1rem;
        }
    }

    @media (min-width: 960px) { 

        a {
            font-size: 1.7rem;
        }
    }

`

export default TwitterButton
