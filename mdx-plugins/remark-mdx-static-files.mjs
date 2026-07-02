// Transforms relative image src and file href values into Vite asset imports.
// Images become ES default imports; other files (PDFs, etc.) use the ?url suffix
// so Vite copies them as static assets and returns the hashed URL.
//
// Must run AFTER remark-swizec-embeds so giphy:/youtube/etc. are already gone.

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.avif', '.ico', '.bmp']);

const ASSET_EXTS = new Set([
  '.pdf', '.zip', '.tar', '.gz',
  '.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt',
  '.mp3', '.mp4', '.mov', '.avi', '.webm', '.ogg',
  '.txt', '.csv', '.json', '.xml',
]);

function getExt(url) {
  const clean = url.split('?')[0].split('#')[0];
  const name = clean.slice(clean.lastIndexOf('/') + 1);
  const dot = name.lastIndexOf('.');
  return dot >= 0 ? name.slice(dot).toLowerCase() : '';
}

function isRelative(url) {
  if (!url) return false;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) return false;
  if (url.startsWith('/') || url.startsWith('#')) return false;
  if (url.startsWith('data:') || url.startsWith('mailto:') || url.startsWith('tel:')) return false;
  return true;
}

function defaultImport(name, source) {
  return {
    type: 'mdxjsEsm',
    value: `import ${name} from '${source}'`,
    data: {
      estree: {
        type: 'Program',
        sourceType: 'module',
        body: [{
          type: 'ImportDeclaration',
          specifiers: [{ type: 'ImportDefaultSpecifier', local: { type: 'Identifier', name } }],
          source: { type: 'Literal', value: source, raw: JSON.stringify(source) },
        }],
      },
    },
  };
}

function jsxExpr(name) {
  return {
    type: 'mdxJsxAttributeValueExpression',
    value: name,
    data: {
      estree: {
        type: 'Program',
        sourceType: 'module',
        body: [{ type: 'ExpressionStatement', expression: { type: 'Identifier', name } }],
      },
    },
  };
}

function attr(name, value) {
  return { type: 'mdxJsxAttribute', name, value };
}

export function remarkMdxStaticFiles() {
  return (tree) => {
    const urlToName = new Map();
    const newImports = [];
    let counter = 0;

    function ensureImport(url) {
      if (urlToName.has(url)) return urlToName.get(url);
      const name = `_static${counter++}`;
      const importUrl = IMAGE_EXTS.has(getExt(url)) ? url : `${url}?url`;
      newImports.push(defaultImport(name, importUrl));
      urlToName.set(url, name);
      return name;
    }

    function walk(node) {
      if (!node || typeof node !== 'object') return node;

      if (node.type === 'image' && isRelative(node.url) && IMAGE_EXTS.has(getExt(node.url))) {
        const name = ensureImport(node.url);
        return {
          type: 'mdxJsxTextElement',
          name: 'img',
          attributes: [
            attr('src', jsxExpr(name)),
            ...(node.alt ? [attr('alt', node.alt)] : []),
            ...(node.title ? [attr('title', node.title)] : []),
          ],
          children: [],
        };
      }

      if (node.type === 'link' && isRelative(node.url) && ASSET_EXTS.has(getExt(node.url))) {
        const name = ensureImport(node.url);
        return {
          type: 'mdxJsxTextElement',
          name: 'a',
          attributes: [attr('href', jsxExpr(name))],
          children: (node.children ?? []).map(walk),
        };
      }

      if (Array.isArray(node.children)) {
        node.children = node.children.map(walk);
      }

      return node;
    }

    walk(tree);

    if (newImports.length > 0) {
      tree.children.unshift(...newImports);
    }
  };
}
