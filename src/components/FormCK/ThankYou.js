import React from 'react'
import styled from "@emotion/styled";

import TwitterButton from './TwitterButton'


const ThankYou = () => {
    return (
        <ThankYouWrapper>
            <h2>This is the start of a beautiful friendship ❤️</h2>
            <div className="copy-thanks">Thanks for signing up to my email list 💌 You're the best! 🤘My robots are sending you a welcome email. Here are some extra bonuses, if you want 👇</div>
            <ul className="copy-bonuses">
                <li>
                    <img src="https://goviral.growthtools.com/images/bullets/1.png" alt="1" /> Free copy of Why Programmers Work at Night 🦉
                </li>
                <li>
                    <img src="https://goviral.growthtools.com/images/bullets/2.png" alt="2" /> 29 videos on React Basics 🎥
                </li>
            </ul>
            <TwitterButton />
        </ThankYouWrapper>
    )
}

const ThankYouWrapper = styled.div`

    h2 {
        color: rgba(0, 153, 229, 1);
        font-size: 2em;
    }

    .copy-thanks {
        color: #808080;
        font-size: 1.2em;
    }

    .copy-bonuses {
        list-style: none;
        margin: 1rem auto;
        padding-left: 0;

        li {
            display: flex;
            align-items: center;
            font-size: 1.3em;
            font-weight: 500;
            text-align: left;
            margin-bottom: 1rem;

            img {
                height: 1.5em;
                margin-right: 1rem;
            }
        }
    }

    @media (min-width: 960px) {
        h2 {
            font-size: 3em;
        }

        .copy-thanks {
            font-size: 1em;
        }

        .copy-bonuses {
            width:80%;
        }
    }
`;

export default ThankYou
