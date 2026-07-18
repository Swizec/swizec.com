'use client';

import { Link } from '@timber-js/app/client';
import type { AnchorHTMLAttributes } from 'react';

// Thin wrapper around timber's <Link>. <Link> already renders external URLs
// (http:, mailto:, tel:, …) as a plain <a> and internal ones with RSC client
// navigation, so there's no routing logic to do here. This exists purely as
// the single place to globalize link props across the site — e.g. flip on
// `prefetch` (hover-based, opt-in) in one spot rather than per call site.
export function SmartLink({ href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
    return <Link href={href ?? '#'} {...props} />;
}
