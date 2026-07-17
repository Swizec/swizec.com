'use client';

import { Link } from '@timber-js/app/client';
import type { AnchorHTMLAttributes } from 'react';

// Anything with a scheme (http:, mailto:, tel:), protocol-relative (//), or a
// bare hash fragment stays a plain <a>. Everything else is an in-app route and
// goes through timber's <Link> for RSC client-side navigation.
function isExternal(href?: string): boolean {
    if (!href) return true;
    return /^([a-z][a-z0-9+.-]*:|\/\/|#|mailto:|tel:)/i.test(href);
}

// Drop-in <a> replacement that upgrades internal links to client navigation.
// Works in both server and client trees (it's a client component, so server
// components render it as a boundary; client components import it directly).
export function SmartLink({ href, children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
    if (isExternal(href)) {
        return (
            <a href={href} {...props}>
                {children}
            </a>
        );
    }
    return (
        <Link href={href ?? '#'} {...props}>
            {children}
        </Link>
    );
}
