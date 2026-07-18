// Single source of truth for responsive content images. Shared by the
// ContentImage component (srcset), the dev /_vercel/image middleware, and the
// build script that writes Vercel's images config — the `w` param is rejected
// unless it matches the deployed `sizes` list, so these must stay in sync.
//
// The content well is --measure (68ch ≈ 612px) plus 2×56px bleed ≈ 724px;
// 1600 covers that at 2x DPR.
export const IMAGE_WIDTHS = [640, 960, 1280, 1600];

export const IMAGE_QUALITY = 75;

// How wide the image renders: full-viewport on small screens, capped at the
// bleed width of the content well on larger ones.
export const IMAGE_SIZES_ATTR = '(max-width: 780px) 100vw, 724px';
