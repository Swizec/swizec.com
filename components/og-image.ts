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
};
