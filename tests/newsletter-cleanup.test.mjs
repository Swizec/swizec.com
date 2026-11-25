import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import * as runtime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import { evaluate, mdxToJs } from 'satteri';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { remarkNewsletterCleanup } from '../mdx-plugins/newsletter-cleanup.mjs';
import { satteriNewsletterCleanup } from '../mdx-plugins/index.mjs';

const options = {
  features: { gfm: false, frontmatter: true },
  mdastPlugins: [satteriNewsletterCleanup],
};

async function renderMdx(source, mdastPlugins = options.mdastPlugins) {
  const { default: Content } = await evaluate(source, { ...runtime, ...options, mdastPlugins });
  return renderToStaticMarkup(runtime.jsx(Content, {})).trim();
}

const rss = unified()
  .use(remarkParse)
  .use(remarkNewsletterCleanup)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeStringify, { allowDangerousHtml: true });

for (const [pipeline, render] of [
  ['MDX', renderMdx],
  ['RSS', async (source) => String(await rss.process(source)).trim()],
]) {
  test(`${pipeline}: removes an opening greeting, comma, and whitespace and capitalizes the first word`, async () => {
    for (const source of [
      '[name|Friend], when I write.',
      '[name|Friend] when I write.',
      '[name|],   when I write.',
      '\n\n[name|Friend],\nwhen I write.',
      '\\[name|Friend], when I write.',
      '[name|Friend],\n\nwhen I write.',
      '**[name|Friend]**, when I write.',
    ]) {
      assert.equal(await render(source), '<p>When I write.</p>', source);
    }
    assert.equal(await render('[name|Friend], élève is a French word.'), '<p>Élève is a French word.</p>');
    assert.equal(await render('[name|Friend], 2026 was a year.'), '<p>2026 was a year.</p>');
  });

  test(`${pipeline}: preserves formatting on the first word after the greeting`, async () => {
    assert.equal(await render('[name|Friend], **when** I write.'), '<p><strong>When</strong> I write.</p>');
    assert.equal(await render('[name|Friend], [when I write](https://example.com).'), '<p><a href="https://example.com">When I write</a>.</p>');
    assert.equal(await render('[name|Friend], `useEffect` is code.'), '<p><code>useEffect</code> is code.</p>');
  });

  test(`${pipeline}: uses name fallbacks everywhere else without stripping later greetings`, async () => {
    assert.equal(await render('Hello [name|compadre], my [name|friend].'), '<p>Hello compadre, my friend.</p>');
    assert.equal(await render('Hello **[name|compadre]**.'), '<p>Hello <strong>compadre</strong>.</p>');
    assert.equal(await render('Empty[name|] fallback.'), '<p>Empty fallback.</p>');
    assert.equal(await render('Hello.\n\n[name|Friend], when I write.'), '<p>Hello.</p>\n<p>Friend, when I write.</p>');
    assert.equal(await render('# Title\n\n[name|Friend], when I write.'), '<h1>Title</h1>\n<p>Friend, when I write.</p>');
    assert.equal(await render('> [name|Friend], when I write.'), '<blockquote>\n<p>Friend, when I write.</p>\n</blockquote>');
  });

  test(`${pipeline}: removes sparkjoy snippets, including their otherwise empty paragraphs`, async () => {
    assert.equal(await render('Before[sparkjoy|example] after.\n\n[sparkjoy|example]\n\n*[sparkjoy|example]*\n\nEnd.'), '<p>Before after.</p>\n<p>End.</p>');
    assert.equal(await render('[sparkjoy|]'), '');
  });

  test(`${pipeline}: removes sharing PS paragraphs with emphasis, links, or wrapped lines`, async () => {
    for (const ps of [
      '*PS: you can read and share this online*',
      '_PS: you can [read and share this online](https://swizec.com/blog/example/)_',
      'PS: you can read and share this online.',
      '*PS: you can [read and\nshare this online](https://swizec.com)*',
    ]) {
      assert.equal(await render(`Before.\n\n${ps}\n\nAfter.`), '<p>Before.</p>\n<p>After.</p>', ps);
    }
  });

  test(`${pipeline}: preserves other postscripts and prose discussing the sharing PS`, async () => {
    const source = '*PS: remember to test your code.*\n\nThe text says PS: you can read and share this online.\n\n*PS: you can `read and share` this online*';
    assert.equal(await render(source), '<p><em>PS: remember to test your code.</em></p>\n<p>The text says PS: you can read and share this online.</p>\n<p><em>PS: you can <code>read and share</code> this online</em></p>');
  });

  test(`${pipeline}: leaves inline, fenced, and HTML code examples untouched`, async () => {
    const literal = '[name|Friend], [sparkjoy|example] *PS: you can read and share this online*';
    assert.equal(await render('`' + literal + '`'), `<p><code>${literal}</code></p>`);
    assert.equal(await render('```md\n' + literal + '\n```'), `<pre><code class="language-md">${literal}\n</code></pre>`);
    // MDX does not support indented code blocks; the RSS Markdown parser does.
    if (pipeline === 'RSS') assert.equal(await render('    ' + literal), `<pre><code>${literal}\n</code></pre>`);
    const html = `<pre><code>${literal}</code></pre>`;
    assert.equal(await render(html), pipeline === 'MDX' ? await renderMdx(html, []) : html);
    assert.equal(await render('Hello [name|compadre]. Use <code>[name|Friend] [sparkjoy|example]</code> literally.'), '<p>Hello compadre. Use <code>[name|Friend] [sparkjoy|example]</code> literally.</p>');
  });

  test(`${pipeline}: leaves unrelated bracket syntax and incomplete snippets alone`, async () => {
    assert.equal(await render('[other|Friend] and [name|unfinished'), '<p>[other|Friend] and [name|unfinished</p>');
  });
}

test('MDX: ignores frontmatter and imports when finding the article opening', async () => {
  const source = '---\ntitle: "[name|Title]"\n---\n\nimport Notice from "./notice.js"\n\n[name|Friend], when I write.\n\n<Notice label="[name|attribute]" />\n\n{"[sparkjoy|expression]"}';
  const { code, frontmatter } = await mdxToJs(source, options);
  assert.match(frontmatter.value, /\[name\|Title\]/);
  assert.match(code, /When I write\./);
  assert.match(code, /import Notice from/);
  assert.match(code, /\[name\|attribute\]/);
  assert.match(code, /\[sparkjoy\|expression\]/);
});

test('MDX: cleans existing articles while keeping the article explaining the syntax intact', async () => {
  const article = async (slug) => readFile(new URL(`../pages/blog/${slug}/index.mdx`, import.meta.url), 'utf8');
  const greeting = await renderMdx(await article('you-may-be-looking-for-a-useSyncExternalStore'));
  assert.match(greeting, /<p>When you see a /);
  assert.doesNotMatch(greeting, /\[name\||PS: you can/);

  const widget = await renderMdx(await article('quick-tips-for-distributed-event-based-systems'));
  assert.doesNotMatch(widget, /\[(name|sparkjoy)\|/);

  const explanation = await renderMdx(await article('are-you-annoyed-by-the-extra-space-after-your-name-name'));
  assert.match(explanation, /<code>\[name\|something else\]<\/code>/);
});
