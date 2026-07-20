import { mdxElement, parseUrl } from './helpers.mjs';

const TWITTER_HOSTS = new Set(['twitter.com', 'www.twitter.com', 'x.com', 'www.x.com']);

function getTweetUrl(url) {
  const parsed = parseUrl(url);
  if (!parsed || !TWITTER_HOSTS.has(parsed.hostname)) return null;

  const parts = parsed.pathname.split('/').filter(Boolean);
  const statusIndex = parts.findIndex((part) => part === 'status' || part === 'statuses');
  const statusId = statusIndex >= 0 ? parts[statusIndex + 1] : null;

  if (!statusId || !/^\d+$/.test(statusId)) return null;

  return `https://twitter.com/${parts[0]}/status/${statusId}`;
}

export function twitterEmbed(url, context) {
  const tweetUrl = getTweetUrl(url);
  if (!tweetUrl) return null;

  context.components.add('TweetEmbed');
  context.components.add('TwitterWidgetsScript');
  context.hasTweet = true;

  return mdxElement('TweetEmbed', { url: tweetUrl });
}
