// Single source of truth for responsive images. Shared by the ContentImage
// component, the book cover components, the dev /_vercel/image middleware, and
// the build script that writes Vercel's images config — the `w` param is
// rejected unless it matches the deployed `sizes` list, so these must stay in
// sync.
//
// 320 serves small chrome images (book covers render ≤220px). The content well
// is --measure (68ch ≈ 612px) plus 2×56px bleed ≈ 724px; 1600 covers that at
// 2x DPR.
export const IMAGE_WIDTHS = [320, 640, 960, 1280, 1600];

// Widths for chrome images that render small (sidebar/promo book covers):
// 320 for 1x screens, 640 for 2x.
export const COVER_WIDTHS = [320, 640];

export const IMAGE_QUALITY = 75;

// How wide content images render: full-viewport on small screens, capped at
// the bleed width of the content well on larger ones.
export const IMAGE_SIZES_ATTR = '(max-width: 780px) 100vw, 724px';

// Vercel Image Optimization URL — resized on first request, edge-cached after.
// In dev a vite middleware serves the same path via sharp.
export function optimizedUrl(src, width) {
  return `/_vercel/image?url=${encodeURIComponent(src)}&w=${width}&q=${IMAGE_QUALITY}`;
}

export function optimizedSrcSet(src, widths) {
  return widths.map((w) => `${optimizedUrl(src, w)} ${w}w`).join(', ');
}
