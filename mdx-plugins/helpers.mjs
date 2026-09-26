import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

export function mdxElement(name, attributes = {}, children = [], { inline = false } = {}) {
  return {
    type: inline ? 'mdxJsxTextElement' : 'mdxJsxFlowElement',
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

// Paths are relative to this file (mdx-plugins/helpers.mjs), so ../components/...
const DEFAULT_COMPONENTS = {
  BlueskyEmbed: '../components/bluesky-embed.tsx',
  BlueskyEmbedScript: '../components/bluesky-embed-script.tsx',
  CodeSandboxEmbed: '../components/codesandbox-embed.tsx',
  ContentImage: '../components/content-image.tsx',
  GiphyEmbed: '../components/giphy-embed.tsx',
  TweetEmbed: '../components/tweet-embed.tsx',
  TwitterWidgetsScript: '../components/twitter-widgets-script.tsx',
  YouTubeEmbed: '../components/youtube-embed.tsx',
};

export function componentPath(componentName, options = {}) {
  const componentFile = options.components?.[componentName] ?? DEFAULT_COMPONENTS[componentName];
  return new URL(componentFile, import.meta.url).pathname;
}

// Satteri MDAST node for a bare ESM statement. Satteri parses the value
// itself, so no estree needs to be attached.
export function esm(value) {
  return { type: 'mdxjsEsm', value };
}

// One `import { A, B } from '../components/...'` node per source file, for
// every component name the plugins used in this document. Returns [] when
// there is nothing to import or the document has no file path to resolve
// against (component paths are relative to the MDX file).
export function componentImportNodes(filePath, componentNames, options) {
  if (!filePath || componentNames.size === 0) return [];

  const importsBySource = new Map();

  for (const componentName of componentNames) {
    const source = importSource(filePath, componentPath(componentName, options));
    const names = importsBySource.get(source) ?? [];
    names.push(componentName);
    importsBySource.set(source, names);
  }

  return [...importsBySource.entries()].map(([source, names]) =>
    esm(`import { ${names.sort().join(', ')} } from ${JSON.stringify(source)};`)
  );
}

// Absolute filesystem path of the document a plugin is running on, from
// Satteri's ctx.fileURL (undefined for in-memory compiles).
export function filePathOf(ctx) {
  return ctx.fileURL ? fileURLToPath(ctx.fileURL) : undefined;
}
