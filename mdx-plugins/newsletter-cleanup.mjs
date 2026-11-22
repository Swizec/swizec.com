// Shared MDAST cleanup for blog articles and RSS. Only prose is rewritten;
// code, HTML, MDX expressions, frontmatter, and link destinations stay intact.
const NON_BODY = new Set(['yaml', 'toml', 'mdxjsEsm', 'definition']);
const LITERAL = new Set(['code', 'inlineCode', 'html', 'mdxFlowExpression', 'mdxTextExpression']);
const PROSE_CONTAINERS = new Set(['paragraph', 'emphasis', 'strong', 'delete', 'link', 'linkReference']);
const POSTSCRIPT = /^\s*PS:\s+you\s+can\s+read\s+and\s+share\b/i;

function isLiteral(node) {
  return LITERAL.has(node.type) || (
    (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') &&
    ['pre', 'code', 'kbd', 'samp'].includes(node.name)
  );
}

function proseText(node) {
  // A code example must interrupt the match, even when it contains the PS.
  if (isLiteral(node)) return '\0';
  if (node.type === 'text') return node.value;
  if (node.type === 'break') return ' ';
  return node.children?.map(proseText).join('') ?? '\0';
}

export function cleanNewsletter(root) {
  let firstBody = true;
  const opening = { check: false, trim: false };

  function clean(node) {
    if (NON_BODY.has(node.type)) return node;
    if (isLiteral(node)) {
      opening.check = opening.trim = false;
      return node;
    }

    if (node.type === 'paragraph' && POSTSCRIPT.test(proseText(node))) return null;

    if (node.type === 'text') {
      let value = node.value;
      if (opening.check) {
        const greeting = /^\s*\[name\|[^\]\r\n]*\]/.exec(value);
        opening.check = false;
        if (greeting) {
          value = value.slice(greeting[0].length);
          opening.trim = true;
        }
      }

      value = value.replace(/\[(name|sparkjoy)\|([^\]\r\n]*)\]/g, (_, kind, fallback) =>
        kind === 'name' ? fallback : ''
      );

      if (opening.trim) {
        value = value.replace(/^\s*,?\s*/, '');
        if (value) {
          // Carry this over to the next text node when the first word is
          // emphasized or linked, or the greeting has its own paragraph.
          value = value.replace(/^([^\p{L}\p{N}]*)(\p{L})/u, (_, prefix, letter) => prefix + letter.toUpperCase());
          opening.trim = false;
        }
      }

      if (value === node.value) return node;
      return value ? { ...node, value } : null;
    }

    if (!node.children) {
      opening.check = opening.trim = false;
      return node;
    }

    let changed = false;
    let htmlCodeDepth = 0;
    const children = [];
    for (const child of node.children) {
      if (node.type === 'root' && firstBody && !NON_BODY.has(child.type)) {
        firstBody = false;
        opening.check = child.type === 'paragraph';
      }
      // Remark represents inline HTML code as separate opening tag, text,
      // and closing tag nodes; MDX gives us a single JSX parent instead.
      if (child.type === 'html') {
        for (const tag of child.value.matchAll(/<(\/?)(?:pre|code|kbd|samp)\b[^>]*>/gi)) {
          if (!tag[0].endsWith('/>')) htmlCodeDepth = Math.max(0, htmlCodeDepth + (tag[1] ? -1 : 1));
        }
      }
      if (htmlCodeDepth) opening.check = opening.trim = false;
      const cleaned = htmlCodeDepth ? child : clean(child);
      if (cleaned !== child) changed = true;
      if (cleaned) children.push(cleaned);
    }

    if (!changed) return node;
    // Standalone newsletter widgets should not leave empty paragraphs or
    // formatting wrappers behind. Preserve images, code, and other content.
    if (PROSE_CONTAINERS.has(node.type) && children.every((child) => child.type === 'text' && !child.value.trim())) {
      return null;
    }
    return { ...node, children };
  }

  return clean(root);
}

export function remarkNewsletterCleanup() {
  return cleanNewsletter;
}
