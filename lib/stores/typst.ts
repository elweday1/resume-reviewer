import { atom } from 'jotai'
import { $typst } from '@myriaddreamin/typst.ts';
import "@myriaddreamin/typst-ts-web-compiler"

export const mainContentAtom = atom(
    "",
    (_, set, newValue: string) => {
        set(mainContentAtom, newValue);
    });


$typst.setCompilerInitOptions({
    getModule: () =>
        'https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm',
});
$typst.setRendererInitOptions({
    getModule: () =>
        'https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm',
});


export async function generatePDFBlob(mainContent: string): Promise<Blob | null> {
    const uint8 = await $typst.pdf({ mainContent })
    if (!uint8) {
        return null;
    }
    const buffer = uint8.buffer instanceof ArrayBuffer ? uint8.buffer : uint8.slice().buffer
    return new Blob([buffer], { type: 'application/pdf' })
}