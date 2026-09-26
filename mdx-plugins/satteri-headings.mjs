// Heading ids + self-links, replacing rehype-slug and rehype-autolink-headings
// (behavior: 'wrap'): every heading gets a GitHub-style slug id (unless it
// already has one) and its content is wrapped in <a href="#id">.
//
// Some headings are markdown links themselves (## [Book](https://...)) —
// wrapping those in an anchor nests <a> inside <a>: invalid HTML that breaks
// React hydration. Those only get the id.
//
// Satteri HAST plugin (factory: the slugger's de-dupe counter resets per
// document, like rehype-slug's `slugs.reset()`).
import GithubSlugger from 'github-slugger';
import { defineHastPlugin } from 'satteri';

const HEADINGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

function containsLink(node) {
  if (node.type === 'element' && node.tagName === 'a') return true;
  if ((node.type === 'mdxJsxTextElement' || node.type === 'mdxJsxFlowElement') && node.name === 'a') {
    return true;
  }
  return (node.children ?? []).some(containsLink);
}

export function satteriHeadings() {
  return () => {
    const slugger = new GithubSlugger();

    return defineHastPlugin({
      name: 'swizec-headings',
      element: {
        filter: HEADINGS,
        visit(node, ctx) {
          const existingId = node.properties?.id;
          const id = existingId ?? slugger.slug(ctx.textContent(node));

          if (containsLink(node)) {
            if (!existingId) ctx.setProperty(node, 'id', id);
            return;
          }

          // Reusing node.children keeps their identity, so edits other
          // plugins make inside the heading still land.
          return {
            type: 'element',
            tagName: node.tagName,
            properties: { ...node.properties, id },
            children: [
              {
                type: 'element',
                tagName: 'a',
                properties: { href: `#${id}` },
                children: [...node.children],
              },
            ],
          };
        },
      },
    });
  };
}
