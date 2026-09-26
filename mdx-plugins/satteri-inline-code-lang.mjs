// Auto-detects the language of inline code (`const x = 1`) with highlight.js
// and tags it with shiki's tailing-curly-colon convention (`...{:js}`), so
// satteri-shiki highlights it. Explicit tags are left alone.
//
// Satteri MDAST plugin (stateless definition).
import { defineMdastPlugin } from 'satteri';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import ruby from 'highlight.js/lib/languages/ruby';
import haskell from 'highlight.js/lib/languages/haskell';
import rust from 'highlight.js/lib/languages/rust';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('ruby', ruby);
hljs.registerLanguage('haskell', haskell);
hljs.registerLanguage('rust', rust);

const LANGUAGES = ['javascript', 'typescript', 'python', 'ruby', 'haskell', 'rust'];

// Shiki uses 'js'/'ts' aliases; map hljs names to Shiki lang ids
const LANG_MAP = { javascript: 'js', typescript: 'ts' };

function detectLang(code) {
  const result = hljs.highlightAuto(code, LANGUAGES);
  if (!result.language) return null;
  return LANG_MAP[result.language] ?? result.language;
}

export const satteriInlineCodeLang = defineMdastPlugin({
  name: 'swizec-inline-code-lang',
  inlineCode(node, ctx) {
    if (/\{:\w+\}$/.test(node.value)) return;

    const lang = detectLang(node.value);
    if (lang) {
      ctx.setProperty(node, 'value', `${node.value}{:${lang}}`);
    }
  },
});
