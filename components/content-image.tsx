import {
    IMAGE_WIDTHS,
    IMAGE_SIZES_ATTR,
    optimizedUrl,
    optimizedSrcSet,
} from '../lib/image-sizes.mjs';

// Formats Vercel's optimizer can resize. GIFs (animation) and SVGs (vector,
// disallowed by default for security) pass through untouched.
const RESIZABLE = /\.(png|jpe?g|webp|avif)$/i;

// Responsive image for MDX content. The remark pipeline routes every local
// image embed here: devices pick a size via srcset, and the image links to
// its full-size original — unless the markdown already wrapped it in a link,
// in which case that link wins (linked={false}).
//
// width/height (read at compile time) let the browser reserve the aspect-ratio
// box before loading — no layout shift. The placeholder is a ~20px LQIP data
// URI stretched behind the image while it loads.
export function ContentImage({
    src,
    alt = '',
    title,
    linked = true,
    width,
    height,
    placeholder,
}: {
    src: string;
    alt?: string;
    title?: string;
    linked?: boolean;
    width?: string;
    height?: string;
    placeholder?: string;
}) {
    const cleanPath = src.split(/[?#]/)[0];
    const resizable = src.startsWith('/') && RESIZABLE.test(cleanPath);

    // Cap the element's width at the height-cap-scaled aspect ratio so the box
    // always hugs the image: tall images render narrower than the text column,
    // and the LQIP background sits exactly under the pixels instead of showing
    // in letterbox bars after load.
    const ratio = width && height ? Number(width) / Number(height) : undefined;
    const style = {
        ...(placeholder ? { backgroundImage: `url(${placeholder})`, backgroundSize: 'cover' } : {}),
        ...(ratio
            ? {
                  maxWidth: `min(100%, calc(var(--content-image-max-height, 62vh) * ${ratio.toFixed(4)}))`,
              }
            : {}),
    };
    const imgStyle = Object.keys(style).length > 0 ? style : undefined;

    const img = resizable ? (
        <img
            src={optimizedUrl(src, 960)}
            srcSet={optimizedSrcSet(src, IMAGE_WIDTHS)}
            sizes={IMAGE_SIZES_ATTR}
            alt={alt}
            title={title}
            width={width}
            height={height}
            style={imgStyle}
            loading="lazy"
            decoding="async"
        />
    ) : (
        <img
            src={src}
            alt={alt}
            title={title}
            width={width}
            height={height}
            style={imgStyle}
            loading="lazy"
            decoding="async"
        />
    );

    if (!linked) return img;
    return (
        <a href={src} className="content-image-link">
            {img}
        </a>
    );
}
