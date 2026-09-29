// Syntax highlighting with shiki, replacing @shikijs/rehype. Same output:
// fenced blocks become shiki's <pre class="shiki shiki-themes github-light
// github-dark" ...><code>…, with light/dark colors as CSS variables (styles.css
// picks the scheme). Inline code tagged `{:lang}` (by hand or by
// satteri-inline-code-lang) is highlighted the same way, with the outer <pre>
// renamed to <span> — exactly what rehype-shiki's 'tailing-curly-colon' mode
// produced. Fences with no language (and unknown languages) are highlighted
// as plain text so they still get the pre.shiki treatment — styles.css only
// styles pre.shiki, so unhighlighted blocks would otherwise render as bare
// <pre>.
//
// Satteri HAST plugin (stateless; the highlighter is a process-wide
// singleton, loaded with every bundled language like rehype-shiki did).
import { defineHastPlugin } from 'satteri';
import { bundledLanguages, getSingletonHighlighter } from 'shiki';
import { isSpecialLang } from 'shiki/core';

const THEMES = { light: 'github-light', dark: 'github-dark' };
const FALLBACK_LANG = 'text';
const RE_TAILING_CURLY_COLON = /(.+)\{:([\w-]+)\}$/;

function getHighlighter() {
  return getSingletonHighlighter({
    themes: Object.values(THEMES),
    langs: Object.keys(bundledLanguages),
  });
}

function resolveLang(highlighter, lang) {
  if (!lang) return FALLBACK_LANG;
  if (highlighter.getLoadedLanguages().includes(lang) || isSpecialLang(lang)) return lang;
  return FALLBACK_LANG;
}

// Shiki emits HTML-cased hast properties (`class`, `tabindex`). Satteri
// hands plugin-built nodes to the JSX compiler as-is, so React would see
// `class` instead of `className` and warn. Rename in place — shiki's output
// is a fresh tree, so mutating it is fine.
function toReactProperties(node) {
  if (node.type !== 'element') return node;
  const { class: klass, tabindex, ...rest } = node.properties ?? {};
  node.properties = {
    ...rest,
    ...(klass !== undefined ? { className: klass } : {}),
    ...(tabindex !== undefined ? { tabIndex: Number(tabindex) } : {}),
  };
  for (const child of node.children ?? []) toReactProperties(child);
  return node;
}

// Returns shiki's <pre> element for the code.
function highlight(highlighter, code, lang, metaString = '') {
  if (code.endsWith('\n')) code = code.slice(0, -1);
  const fragment = highlighter.codeToHast(code, {
    lang,
    themes: THEMES,
    meta: { __raw: metaString },
  });
  return toReactProperties(fragment.children[0]);
}

function languageOf(codeElement) {
  if (codeElement.data?.lang) return codeElement.data.lang;
  const classes = codeElement.properties?.className;
  const languageClass = Array.isArray(classes)
    ? classes.find((c) => typeof c === 'string' && c.startsWith('language-'))
    : undefined;
  return typeof languageClass === 'string' ? languageClass.slice('language-'.length) : undefined;
}

export const satteriShiki = defineHastPlugin({
  name: 'swizec-shiki',
  element: [
    {
      filter: ['pre'],
      async visit(node, ctx) {
        const head = node.children[0];
        if (!head || head.type !== 'element' || head.tagName !== 'code') return;

        const highlighter = await getHighlighter();
        const lang = resolveLang(highlighter, languageOf(head));
        const meta = head.data?.meta ?? head.properties?.metastring?.toString() ?? '';
        return highlight(highlighter, ctx.textContent(head), lang, meta);
      },
    },
    {
      filter: ['code'],
      async visit(node, ctx) {
        // Block code is handled through its <pre> above.
        const parent = ctx.parent(node);
        if (parent?.type === 'element' && parent.tagName === 'pre') return;

        const raw = ctx.textContent(node);
        const match = raw.match(RE_TAILING_CURLY_COLON);
        if (!match) return;

        const highlighter = await getHighlighter();
        const lang = resolveLang(highlighter, match[2]);
        const pre = highlight(highlighter, match[1] ?? raw, lang);
        if (pre.type === 'element' && pre.tagName === 'pre') pre.tagName = 'span';
        return pre;
      },
    },
  ],
});
