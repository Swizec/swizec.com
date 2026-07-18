import { IMAGE_WIDTHS, IMAGE_QUALITY, IMAGE_SIZES_ATTR } from '../lib/image-sizes.mjs';

// Formats Vercel's optimizer can resize. GIFs (animation) and SVGs (vector,
// disallowed by default for security) pass through untouched.
const RESIZABLE = /\.(png|jpe?g|webp|avif)$/i;

// Vercel Image Optimization URL — resized on first request, edge-cached after.
// In dev a vite middleware serves the same path via sharp.
function optimizedUrl(src: string, width: number): string {
    return `/_vercel/image?url=${encodeURIComponent(src)}&w=${width}&q=${IMAGE_QUALITY}`;
}

// Responsive image for MDX content. The remark pipeline routes every local
// image embed here: devices pick a size via srcset, and the image links to
// its full-size original — unless the markdown already wrapped it in a link,
// in which case that link wins (linked={false}).
export function ContentImage({
    src,
    alt = '',
    title,
    linked = true,
}: {
    src: string;
    alt?: string;
    title?: string;
    linked?: boolean;
}) {
    const cleanPath = src.split(/[?#]/)[0];
    const resizable = src.startsWith('/') && RESIZABLE.test(cleanPath);

    const img = resizable ? (
        <img
            src={optimizedUrl(src, 960)}
            srcSet={IMAGE_WIDTHS.map((w) => `${optimizedUrl(src, w)} ${w}w`).join(', ')}
            sizes={IMAGE_SIZES_ATTR}
            alt={alt}
            title={title}
            loading="lazy"
            decoding="async"
        />
    ) : (
        <img src={src} alt={alt} title={title} loading="lazy" decoding="async" />
    );

    if (!linked) return img;
    return (
        <a href={src} className="content-image-link">
            {img}
        </a>
    );
}
