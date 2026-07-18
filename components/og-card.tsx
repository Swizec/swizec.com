// OpenGraph card, styled to match the Astryx Y2K blog: Poppins, a bold sticker
// badge, and a hard offset shadow — over a cinematic stage photo that bleeds
// into a dark panel. Two photos, each with its own palette tuned to the shot;
// the choice is stable per page (hashed from a seed) so a given URL always
// renders the same card. Photos are inlined as data URIs at build time.
import photoReactSummit from '../app/assets/og-photo-react-summit.jpeg?inline';
import photoC3 from '../app/assets/og-photo-c3-speaking.jpg?inline';

type Variant = {
    photo: string;
    // object-position for the right-hand photo crop
    objectPosition: string;
    // panel/scrim base as "r, g, b" so gradients can vary alpha
    panelRGB: string;
    // horizontal scrim that fades the photo's left edge into the panel; tuned
    // per shot (c3 keeps a soft bleed of the stage text, react-summit hides the
    // bright podium so the copy stays crisp)
    scrim: string;
    accent: string;
    accentInk: string;
    title: string;
    meta: string;
};

const VARIANTS: Variant[] = [
    {
        // C3 software festival — vivid green stage light on black
        photo: photoC3,
        objectPosition: '46% 22%',
        panelRGB: '8, 15, 10',
        scrim: 'linear-gradient(to left, rgba(8,15,10,0) 30%, rgba(8,15,10,0.5) 46%, rgba(8,15,10,0.92) 60%, rgb(8,15,10) 68%)',
        accent: '#A6E86A',
        accentInk: '#122009',
        title: '#ECF8E6',
        meta: '#A4C79C',
    },
    {
        // React Summit — warm plum/blue house lights
        photo: photoReactSummit,
        objectPosition: '52% 12%',
        panelRGB: '23, 12, 20',
        scrim: 'linear-gradient(to left, rgba(23,12,20,0) 19%, rgba(23,12,20,0.7) 37%, rgba(23,12,20,0.98) 52%, rgb(23,12,20) 60%)',
        accent: '#FFDE86',
        accentInk: '#2B1305',
        title: '#FBEEF2',
        meta: '#CBA6B6',
    },
];

// Stable per-seed pick: same URL → same photo, but spread across pages.
function pickVariant(seed: string): Variant {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (Math.imul(h, 31) + seed.charCodeAt(i)) | 0;
    return VARIANTS[Math.abs(h) % VARIANTS.length];
}

export function OgCard({
    title,
    description,
    seed = '',
}: {
    title: string;
    description?: string;
    seed?: string;
}) {
    const v = pickVariant(seed || title);
    const P = v.panelRGB;
    const titleSize = title.length > 68 ? 54 : title.length > 44 ? 64 : 74;

    return (
        <div
            style={{
                position: 'relative',
                display: 'flex',
                width: '100%',
                height: '100%',
                backgroundColor: `rgb(${P})`,
                fontFamily: 'Poppins',
            }}
        >
            {/* Full-height photo on the right */}
            <img
                src={v.photo}
                width={640}
                height={630}
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 640,
                    height: 630,
                    objectFit: 'cover',
                    objectPosition: v.objectPosition,
                }}
            />
            {/* Blend the photo's left edge into the panel + darken under the text */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    background: v.scrim,
                }}
            />
            {/* Bottom vignette for depth */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    background: `linear-gradient(to top, rgba(${P},0.7) 0%, rgba(${P},0) 30%)`,
                }}
            />
            {/* Content */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: 720,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '58px 54px',
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div
                        style={{
                            display: 'flex',
                            fontSize: 22,
                            fontWeight: 700,
                            letterSpacing: 4,
                            color: v.accent,
                            textTransform: 'uppercase',
                        }}
                    >
                        swizec.com
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            marginTop: 10,
                            fontSize: titleSize,
                            fontWeight: 900,
                            lineHeight: 1.06,
                            letterSpacing: -1,
                            color: v.title,
                            lineClamp: 3,
                        }}
                    >
                        {title}
                    </div>
                    {/* Y2K accent underline sticker */}
                    <div
                        style={{
                            display: 'flex',
                            marginTop: 22,
                            width: 92,
                            height: 10,
                            backgroundColor: v.accent,
                        }}
                    />
                    {description ? (
                        <div
                            style={{
                                display: 'flex',
                                marginTop: 22,
                                fontSize: 27,
                                lineHeight: 1.34,
                                fontWeight: 400,
                                color: v.meta,
                                lineClamp: 2,
                            }}
                        >
                            {description}
                        </div>
                    ) : null}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div
                        style={{
                            display: 'flex',
                            backgroundColor: v.accent,
                            color: v.accentInk,
                            border: `2px solid ${v.accentInk}`,
                            boxShadow: `4px 4px 0 ${v.accentInk}`,
                            padding: '7px 16px',
                            fontSize: 22,
                            fontWeight: 700,
                        }}
                    >
                        Swizec Teller
                    </div>
                    <div style={{ display: 'flex', fontSize: 20, fontWeight: 400, color: v.meta }}>
                        Software Engineering Lessons from Production
                    </div>
                </div>
            </div>
        </div>
    );
}
