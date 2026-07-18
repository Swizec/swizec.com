// OpenGraph card, styled to match the Astryx Y2K blog: Poppins, a bold sticker
// badge, and a hard offset shadow — over a cinematic stage photo that bleeds
// into a dark panel. Two photos, each with its own palette tuned to the shot;
// the choice is stable per page (hashed from a seed) so a given URL always
// renders the same card. Photos are inlined as data URIs at build time.
//
// Rendered by takumi-js. The photo + fade live in one element's stacked
// background (gradient layer over the image layer) because an overlay div
// doesn't composite over a sibling image the way it does in a browser.
import photoReactSummit from '../app/assets/og-photo-react-summit.jpeg?inline';
import photoC3 from '../app/assets/og-photo-c3-speaking.jpg?inline';

type Variant = {
    photo: string;
    // which side the photo sits on; copy goes on the opposite side, chosen so
    // the subject's gaze leads into the text
    photoSide: 'left' | 'right';
    // background-position for the photo crop
    objectPosition: string;
    // panel base as "r, g, b" so gradients can vary alpha
    panelRGB: string;
    // gradient that fades the photo's inner edge into the panel; direction and
    // stops tuned per shot (c3 keeps a soft bleed of the stage text,
    // react-summit hides the bright podium so the copy stays crisp)
    scrim: string;
    accent: string;
    // badge text ink and badge border/hard-shadow color
    accentInk: string;
    accentEdge: string;
    title: string;
    meta: string;
};

const VARIANTS: Variant[] = [
    {
        // C3 software festival — vivid green stage light on black. He faces
        // right, so the photo sits left and the copy runs to its right.
        // Palette tuned to the shot's green.
        photo: photoC3,
        photoSide: 'left',
        objectPosition: '46% 22%',
        panelRGB: '8, 15, 10',
        scrim: 'linear-gradient(to right, rgba(8,15,10,0) 32%, rgba(8,15,10,0.5) 54%, rgba(8,15,10,0.9) 74%, rgb(8,15,10) 88%)',
        accent: '#A6E86A',
        accentInk: '#122009',
        accentEdge: '#122009',
        title: '#ECF8E6',
        meta: '#A4C79C',
    },
    {
        // React Summit — warm plum/blue house lights. He faces down-left, so
        // the photo sits right and the copy runs to its left. Text and badge
        // use the stock Astryx Y2K tokens: dark-mode text-primary/-secondary,
        // and the yellow chrome badge (background-yellow on color-border with
        // on-light ink) like the site's buttons.
        photo: photoReactSummit,
        photoSide: 'right',
        objectPosition: '52% 12%',
        panelRGB: '23, 12, 20',
        scrim: 'linear-gradient(to left, rgba(23,12,20,0) 30%, rgba(23,12,20,0.62) 55%, rgba(23,12,20,0.95) 74%, rgb(23,12,20) 88%)',
        accent: '#FFE08A',
        accentInk: '#2d241b',
        accentEdge: '#2F292E',
        title: '#EDEFFC',
        meta: '#a6acd6',
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
    const textSide = v.photoSide === 'left' ? 'right' : 'left';
    const titleSize = title.length > 68 ? 54 : title.length > 44 ? 64 : 74;
    // bottom vignette + scrim + photo, all in one stacked background
    const vignette = `linear-gradient(to top, rgba(${P},0.55) 0%, rgba(${P},0) 32%)`;

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
            {/* Photo panel: gradient scrim + vignette layered over the photo */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    [v.photoSide]: 0,
                    width: 640,
                    height: 630,
                    display: 'flex',
                    backgroundImage: `${v.scrim}, ${vignette}, url(${v.photo})`,
                    backgroundSize: 'cover, cover, cover',
                    backgroundRepeat: 'no-repeat, no-repeat, no-repeat',
                    backgroundPosition: `center, center, ${v.objectPosition}`,
                }}
            />
            {/* Content — on the side opposite the photo */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    [textSide]: 0,
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
                            textWrap: 'pretty',
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
                                textWrap: 'pretty',
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
                            // don't let the flex row squeeze the badge into wrapping
                            // or stretch it to the tagline's two-line height
                            flexShrink: 0,
                            alignSelf: 'center',
                            alignItems: 'center',
                            backgroundColor: v.accent,
                            color: v.accentInk,
                            border: `2px solid ${v.accentEdge}`,
                            boxShadow: `4px 4px 0 ${v.accentEdge}`,
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
