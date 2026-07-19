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

    const style = placeholder
        ? { backgroundImage: `url(${placeholder})`, backgroundSize: 'cover' }
        : undefined;

    const img = resizable ? (
        <img
            src={optimizedUrl(src, 960)}
            srcSet={optimizedSrcSet(src, IMAGE_WIDTHS)}
            sizes={IMAGE_SIZES_ATTR}
            alt={alt}
            title={title}
            width={width}
            height={height}
            style={style}
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
