import type { MDXComponents } from 'mdx/types';
import { SmartLink } from './components/link';

// Root MDX provider (Next.js-style convention timber picks up). Routes every
// markdown link in MDX content — article bodies, standalone pages, and shared
// MDX imports — through SmartLink (timber's <Link>), so internal links get RSC
// client navigation while external ones pass through as plain <a>.
export function useMDXComponents(components: MDXComponents): MDXComponents {
    return {
        ...components,
        a: SmartLink as MDXComponents['a'],
    };
}
