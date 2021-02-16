import React from 'react'
import { Image, Flex, Link } from "theme-ui"
import swizecAvatar from "../../../images/swizec-head-avatar.webp"

const HeaderLogo = () => (
    <Flex alignItems="center">
        <Image
            src={swizecAvatar}
            width={35}
            alt="Swizec Teller - a geek with a hat"
            title="Swizec Teller - a geek with a hat"
        />
        <Link 
            sx={{
                ml: 2,
                variant: "header.nav"
            }}
            href="/">
            swizec.com
        </Link>
    </Flex>
)

export default HeaderLogo
