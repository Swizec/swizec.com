import { mdxElement, injectComponentImports } from './helpers.mjs';
import { giphyEmbed } from './giphy.mjs';
import { youtubeEmbed } from './youtube.mjs';
import { codeSandboxEmbed } from './codesandbox.mjs';
import { twitterEmbed } from './twitter.mjs';
import { blueskyEmbed } from './bluesky.mjs';

function embedForUrl(url, context) {
  if (!url) return null;
  if (url.startsWith('giphy:')) return giphyEmbed(url, context);

  return (
    youtubeEmbed(url, context) ??
    codeSandboxEmbed(url, context) ??
    twitterEmbed(url, context) ??
    blueskyEmbed(url, context)
  );
}

function getStandaloneUrl(node) {
  if (!node || node.type !== 'paragraph' || !Array.isArray(node.children)) return null;
  if (node.children.length !== 1) return null;

  const [child] = node.children;
  if (child.type === 'text') return child.value.trim();
  if (child.type === 'link') return child.url.trim();
  if (child.type === 'image') return child.url.trim();

  return null;
}

function transformNode(node, context) {
  if (!node || typeof node !== 'object') return node;

  if (node.type === 'image') {
    return embedForUrl(node.url, context) ?? node;
  }

  const standaloneUrl = getStandaloneUrl(node);
  if (standaloneUrl) {
    return embedForUrl(standaloneUrl, context) ?? node;
  }

  if (Array.isArray(node.children)) {
    node.children = node.children.map((child) => transformNode(child, context));
  }

  return node;
}

function hasFrontmatter(tree) {
  return tree.children.some((node) => node.type === 'yaml' || node.type === 'toml');
}

export function remarkSwizecEmbeds(options = {}) {
  return (tree, file) => {
    file.data.swizecHasFrontmatter = hasFrontmatter(tree);

    const context = {
      components: new Set(),
      hasTweet: false,
      hasBsky: false,
    };

    transformNode(tree, context);

    if (context.hasTweet) {
      tree.children.push(mdxElement('TwitterWidgetsScript'));
    }

    if (context.hasBsky) {
      tree.children.push(mdxElement('BlueskyEmbedScript'));
    }

    injectComponentImports(tree, file, context.components, options);
  };
}
