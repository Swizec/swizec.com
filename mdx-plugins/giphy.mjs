import { mdxElement } from './helpers.mjs';

export function giphyEmbed(url, context) {
  const query = url.replace(/^giphy:/, '').trim();
  if (!query) return null;

  context.components.add('GiphyEmbed');

  return mdxElement('GiphyEmbed', {
    query: query.replaceAll('_', ' '),
  });
}
