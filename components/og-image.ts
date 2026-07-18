// @ts-expect-error - Vite resolves the .wasm asset; no type decl for the query
import wasmInline from '@takumi-rs/wasm/takumi_wasm_bg.wasm?inline';
import { ogFonts } from './og-fonts';

function bytes(dataUri: string): Uint8Array {
    const base64 = dataUri.slice(dataUri.indexOf(',') + 1);
    const binary = atob(base64);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
    return out;
}

// Shared options for every OG ImageResponse.
//
// Force takumi's platform-independent WASM backend by handing it the wasm
// bytes directly. The default backend on a Node target loads the native
// @takumi-rs/core addon, whose binary is platform-specific — building on macOS
// ships only the darwin binary, so it fails on Vercel's linux runtime. The
// wasm is inlined as a data URI at build time (bundler-agnostic — no runtime
// file resolution), decoded here, and passed as the render `module`.
export const ogImageOptions = {
    width: 1200,
    height: 630,
    module: bytes(wasmInline),
    fonts: ogFonts,
    // Cards only change on redeploy, and Vercel's edge cache resets per
    // deployment — so let the CDN hold them for a week (s-maxage) and skip
    // the ~1-4s wasm render on repeat scrapes. Browsers get an hour since
    // they don't purge on deploy.
    headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600, s-maxage=604800, stale-while-revalidate=86400',
    },
};
