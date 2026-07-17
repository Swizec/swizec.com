import type { MDXComponents } from 'mdx/types';
import { SmartLink } from './components/link';

// Root MDX provider (Next.js-style convention timber picks up). Routes every
// markdown link in MDX content — article bodies, standalone pages, and shared
// MDX imports — through SmartLink, so internal links get client navigation
// while external ones stay plain <a>.
export function useMDXComponents(components: MDXComponents): MDXComponents {
    return {
        ...components,
        a: SmartLink as MDXComponents['a'],
    };
}
