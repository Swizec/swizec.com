"use client"

import { Link } from "@timber-js/app/client"
import type { AnchorHTMLAttributes, MouseEvent } from "react"
import { trackEvent } from "../lib/track"

// Thin wrapper around timber's <Link>. <Link> already renders external URLs
// (http:, mailto:, tel:, …) as a plain <a> and internal ones with RSC client
// navigation, so there's no routing logic to do here. This exists purely as
// the single place to globalize link props across the site — e.g. flip on
// `prefetch` (hover-based, opt-in) in one spot rather than per call site.
// `plausibleEvent` fires a Plausible custom event on click.
export function SmartLink({
  href,
  plausibleEvent,
  onClick,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { plausibleEvent?: string }) {
  return (
    <Link
      href={href ?? "#"}
      prefetch
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        if (plausibleEvent) trackEvent(plausibleEvent)
        onClick?.(event)
      }}
      {...props}
    />
  )
}
