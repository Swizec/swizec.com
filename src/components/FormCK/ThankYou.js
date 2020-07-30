import React, { useState } from 'react'
import styled from "@emotion/styled";

import TwitterButton from './TwitterButton'


const ThankYou = () => {

    const [showResources, setShowResources] = useState(false)

    return (
        <ThankYouWrapper>
            {showResources ? (
                <>
                    <div className="copy-resources">
                            <span role="img" aria-label="love">❤️</span> <br />
                            Click below to get your stuff
                    </div>
                    <ul className="copy-bonuses">
                        <li>
                            <img src="https://goviral.growthtools.com/images/bullets/1.png" alt="1" /> 
                            <div>
                                Free copy of Why Programmers Work at Night <span role="img" aria-label="owl">🦉</span> <br />
                                <a target="_blank" rel="noreferrer" href="https://leanpub.com/nightowls/c/blog-freebie">
                                    Get the book
                                </a>
                            </div>
                        </li>
                        <li>
                            <img src="https://goviral.growthtools.com/images/bullets/2.png" alt="2" />
                            <div>
                                29 videos on React Basics <span role="img" aria-label="film">🎥</span> 
                                <a target="_blank" rel="noreferrer" href="https://www.youtube.com/playlist?list=PLF8WgaD4xmjWuh7FTYTealxehOuNor_2S">
                                    Watch now
                                </a>
                            </div>
                        </li>
                    </ul>
                </>
            ) : (
                <>
                    <h2>This is the start of a beautiful friendship <span role="img" aria-label="love">❤️</span> </h2>
                    <div className="copy-thanks">Thanks for signing up to my email list <span role="img" aria-label="letter">💌</span>  You're the best! <span role="img" aria-label="Horns">🤘</span> My robots are sending you a welcome email. Here are some extra bonuses, if you want <span role="img" aria-label="finger-down">👇</span></div>
                    <ul className="copy-bonuses">
                        <li>
                            <img src="https://goviral.growthtools.com/images/bullets/1.png" alt="1" /> Free copy of Why Programmers Work at Night <span role="img" aria-label="owl">🦉</span>
                        </li>
                        <li>
                            <img src="https://goviral.growthtools.com/images/bullets/2.png" alt="2" /> 29 videos on React Basics <span role="img" aria-label="film"></span>
                        </li>
                    </ul>
                    <TwitterButton onButtonClick={() => setShowResources(true)} />
                </>
            )}
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
        margin: 2rem auto;
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
            
            div {
                display: flex;
                flex-direction: column;

                a {
                    background-color: #0099e5;
                    border-radius: 5px;
                    color: #ffffff;
                    cursor: pointer;
                    padding: 0.5rem 1rem;
                    text-decoration: none;
                    width: fit-content;
                }
            }
        }
    }

    .copy-resources {
        font-size: 2rem;
        padding: 2rem;
    }

    @media (min-width: 960px) {
        h2 {
            font-size: 3em;
        }

        .copy-thanks {
            font-size: 1em;
        }

        .copy-bonuses {
            width:82%;
        }
    }
`;

export default ThankYou
