// Poppins (the site heading font) loaded into @vercel/og so OG cards match
// the Astryx type on the blog. @fontsource ships WOFF1, which Satori supports
// (WOFF2 it does not). `?inline` embeds each file as a data URI at build time,
// so the serverless function needs no asset fetching.
import poppins400 from '@fontsource/poppins/files/poppins-latin-400-normal.woff?inline';
import poppins700 from '@fontsource/poppins/files/poppins-latin-700-normal.woff?inline';
import poppins900 from '@fontsource/poppins/files/poppins-latin-900-normal.woff?inline';

function bytes(dataUri: string): ArrayBuffer {
    const base64 = dataUri.slice(dataUri.indexOf(',') + 1);
    const binary = atob(base64);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
    return out.buffer;
}

export const ogFonts = [
    { name: 'Poppins', data: bytes(poppins400), weight: 400 as const, style: 'normal' as const },
    { name: 'Poppins', data: bytes(poppins700), weight: 700 as const, style: 'normal' as const },
    { name: 'Poppins', data: bytes(poppins900), weight: 900 as const, style: 'normal' as const },
];
