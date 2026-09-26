import { mdxElement } from './helpers.mjs';

export function giphyEmbed(url, context, opts) {
  const query = url.replace(/^giphy:/, '').trim();
  if (!query) return null;

  context.components.add('GiphyEmbed');

  return mdxElement('GiphyEmbed', {
    query: query.replaceAll('_', ' '),
  }, [], opts);
}
