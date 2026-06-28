import path from 'node:path';

export function toPosix(filePath) {
  return filePath.split(path.sep).join(path.posix.sep);
}

export function withoutExtension(filePath) {
  return filePath.replace(/\.[cm]?[jt]sx?$/, '');
}

export function importSource(fromFile, targetFile) {
  const fromDir = path.posix.dirname(toPosix(fromFile));
  let relativePath = path.posix.relative(fromDir, toPosix(targetFile));
  if (!relativePath.startsWith('.')) relativePath = `./${relativePath}`;
  return withoutExtension(relativePath);
}

export function mdxAttribute(name, value = null) {
  return { type: 'mdxJsxAttribute', name, value };
}

export function mdxElement(name, attributes = {}, children = []) {
  return {
    type: 'mdxJsxFlowElement',
    name,
    attributes: Object.entries(attributes)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => mdxAttribute(key, value)),
    children,
  };
}

export function text(value) {
  return { type: 'text', value };
}

export function paragraph(children) {
  return { type: 'paragraph', children };
}

export function link(url, children) {
  return { type: 'link', url, children };
}

export function parseUrl(value) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

export function importDeclaration(names, source) {
  const specifiers = names.map((name) => ({
    type: 'ImportSpecifier',
    imported: { type: 'Identifier', name },
    local: { type: 'Identifier', name },
  }));

  return {
    type: 'mdxjsEsm',
    value: `import { ${names.join(', ')} } from '${source}';`,
    data: {
      estree: {
        type: 'Program',
        sourceType: 'module',
        body: [
          {
            type: 'ImportDeclaration',
            specifiers,
            source: { type: 'Literal', value: source, raw: JSON.stringify(source) },
          },
        ],
      },
    },
  };
}

// Paths are relative to this file (mdx-plugins/helpers.mjs), so ../components/...
const DEFAULT_COMPONENTS = {
  BlueskyEmbed: '../components/bluesky-embed.tsx',
  BlueskyEmbedScript: '../components/bluesky-embed-script.tsx',
  CodeSandboxEmbed: '../components/codesandbox-embed.tsx',
  GiphyEmbed: '../components/giphy-embed.tsx',
  TweetEmbed: '../components/tweet-embed.tsx',
  TwitterWidgetsScript: '../components/twitter-widgets-script.tsx',
  YouTubeEmbed: '../components/youtube-embed.tsx',
};

export function componentPath(componentName, options = {}) {
  const componentFile = options.components?.[componentName] ?? DEFAULT_COMPONENTS[componentName];
  return new URL(componentFile, import.meta.url).pathname;
}

export function injectComponentImports(tree, file, componentNames, options) {
  if (!file.path || componentNames.size === 0) return;

  const importsBySource = new Map();

  for (const componentName of componentNames) {
    const source = importSource(file.path, componentPath(componentName, options));
    const names = importsBySource.get(source) ?? [];
    names.push(componentName);
    importsBySource.set(source, names);
  }

  const imports = [...importsBySource.entries()].map(([source, names]) =>
    importDeclaration(names.sort(), source)
  );

  tree.children.unshift(...imports);
}
