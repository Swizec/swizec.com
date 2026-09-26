// Turns bare URLs into embed components: a paragraph that is nothing but a
// YouTube / tweet / Bluesky / CodeSandbox URL (as text, autolink, or image),
// or an image whose URL is one of those (plus the giphy:<query> shorthand),
// becomes <YouTubeEmbed /> etc. The components are imported at the top of
// the document, and the tweet/Bluesky widget scripts are appended once.
//
// Satteri MDAST plugin (factory: state resets per document). Must run BEFORE
// satteri-static-files so giphy:/youtube image URLs are gone by the time it
// looks for local files.
import { defineMdastPlugin } from 'satteri';
import { mdxElement, componentImportNodes, filePathOf } from './helpers.mjs';
import { giphyEmbed } from './giphy.mjs';
import { youtubeEmbed } from './youtube.mjs';
import { codeSandboxEmbed } from './codesandbox.mjs';
import { twitterEmbed } from './twitter.mjs';
import { blueskyEmbed } from './bluesky.mjs';

function embedForUrl(url, context, opts) {
  if (!url) return null;
  if (url.startsWith('giphy:')) return giphyEmbed(url, context, opts);

  return (
    youtubeEmbed(url, context, opts) ??
    codeSandboxEmbed(url, context, opts) ??
    twitterEmbed(url, context, opts) ??
    blueskyEmbed(url, context, opts)
  );
}

// Only bare autolinks embed — a link whose visible text is the URL itself.
// [some words](https://x.com/...) stays a regular link.
function getAutolinkUrl(link) {
  if (!Array.isArray(link.children) || link.children.length !== 1) return null;

  const [child] = link.children;
  if (child.type !== 'text') return null;

  const url = link.url.trim();
  return child.value.trim() === url ? url : null;
}

function getStandaloneUrl(node) {
  if (!node || node.type !== 'paragraph' || !Array.isArray(node.children)) return null;
  if (node.children.length !== 1) return null;

  const [child] = node.children;
  if (child.type === 'text') return child.value.trim();
  if (child.type === 'link') return getAutolinkUrl(child);
  if (child.type === 'image') return child.url.trim();

  return null;
}

function isStandaloneImage(image, ctx) {
  const parent = ctx.parent(image);
  return parent?.type === 'paragraph' && parent.children.length === 1;
}

export function satteriEmbeds(options = {}) {
  return () => {
    const context = {
      components: new Set(),
      hasTweet: false,
      hasBsky: false,
    };

    return defineMdastPlugin({
      name: 'swizec-embeds',

      // A paragraph that is only a URL becomes a block-level embed.
      paragraph(node) {
        const url = getStandaloneUrl(node);
        if (!url) return;
        return embedForUrl(url, context) ?? undefined;
      },

      // An image with an embed URL anywhere else (inside text, inside a
      // link) becomes an inline embed. Standalone ones are handled by the
      // paragraph visitor above — replacing both would orphan this one.
      image(node, ctx) {
        if (isStandaloneImage(node, ctx)) return;
        return embedForUrl(node.url, context, { inline: true }) ?? undefined;
      },

      after(root, ctx) {
        if (context.hasTweet) ctx.appendChild(root, mdxElement('TwitterWidgetsScript'));
        if (context.hasBsky) ctx.appendChild(root, mdxElement('BlueskyEmbedScript'));

        const imports = componentImportNodes(filePathOf(ctx), context.components, options);
        if (imports.length > 0) ctx.prependChild(root, imports);
      },
    });
  };
}
