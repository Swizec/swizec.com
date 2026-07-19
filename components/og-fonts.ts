// Poppins (the blog heading font) for the OG card, passed to takumi as raw
// bytes so nothing is fetched at render time. @fontsource ships WOFF1; `?inline`
// embeds each file as a data URI at build time, decoded to bytes here. Weights
// match the card: 400 body, 700 kicker/badge, 900 title.
import poppins400 from '@fontsource/poppins/files/poppins-latin-400-normal.woff?inline';
import poppins700 from '@fontsource/poppins/files/poppins-latin-700-normal.woff?inline';
import poppins900 from '@fontsource/poppins/files/poppins-latin-900-normal.woff?inline';

function bytes(dataUri: string): Uint8Array {
    const base64 = dataUri.slice(dataUri.indexOf(',') + 1);
    const binary = atob(base64);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
    return out;
}

export const ogFonts = [
    { name: 'Poppins', weight: 400, style: 'normal' as const, data: bytes(poppins400) },
    { name: 'Poppins', weight: 700, style: 'normal' as const, data: bytes(poppins700) },
    { name: 'Poppins', weight: 900, style: 'normal' as const, data: bytes(poppins900) },
];
