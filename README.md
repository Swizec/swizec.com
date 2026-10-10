# swizec.com

The site and blog for swizec.com, built with [TimberJS](https://timberjs.com) (Vite + React Server Components) and lots of homegrown shenanigans. Deploys to Vercel.

## Everyday commands

```bash
pnpm dev        # dev server on :3000
pnpm build      # production build into .vercel/output
pnpm article    # after writing a post: fix images, index for related-articles,
                # refresh the image manifest, commit pages/ and push
pnpm images     # regenerate lib/image-manifest.json after adding/changing images
```

## Layout

- `pages/` — all content as MDX (blog posts, standalone pages, collections)
- `app/` — timber routes; `app/[...slug]/page.tsx` serves everything in `pages/`
- `components/`, `lib/` — site chrome and shared logic
- `mdx-plugins/` — remark plugins: URL embeds, responsive images, inline code highlighting
- `scripts/` — build steps (asset copying, image manifest) and ops runbooks
- `bin/` — bun scripts used by `pnpm article`
- `static/` — legacy assets served at their original URLs (`/wp-content/`, `/pdfs/`)

## Article feedback links

Email buttons can link to an article and submit the reader's vote:

- Thumbs up: `https://swizec.com/blog/<slug>/?vote=thumbsup#feedback`
- Thumbs down: `https://swizec.com/blog/<slug>/?vote=thumbsdown#feedback`
- Feedback widget without voting: `https://swizec.com/blog/<slug>/#feedback`

With JavaScript enabled, a vote link submits through the same action as the
article buttons, scrolls to the widget, and opens and focuses the follow-up form
when the vote succeeds. The `vote` parameter is removed before submission so
refreshing the page doesn't repeat it; other query parameters (such as UTM tags)
are preserved. Invalid vote values are ignored. If saving fails, the reader can
retry with the usual vote buttons.
