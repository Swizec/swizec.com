import { mdxElement, parseUrl } from './helpers.mjs';

const BSKY_HOSTS = new Set(['bsky.app', 'www.bsky.app']);

function getBskyPostUrl(url) {
  const parsed = parseUrl(url);
  if (!parsed || !BSKY_HOSTS.has(parsed.hostname)) return null;

  // Expected path: /profile/<handle>/post/<postId>
  const parts = parsed.pathname.split('/').filter(Boolean);
  const postIndex = parts.findIndex((part) => part === 'post');
  if (postIndex < 1 || !parts[postIndex + 1]) return null;

  return `https://bsky.app/profile/${parts[postIndex - 1]}/post/${parts[postIndex + 1]}`;
}

export function blueskyEmbed(url, context) {
  const postUrl = getBskyPostUrl(url);
  if (!postUrl) return null;

  context.components.add('BlueskyEmbed');
  context.components.add('BlueskyEmbedScript');
  context.hasBsky = true;

  return mdxElement('BlueskyEmbed', { url: postUrl });
}
