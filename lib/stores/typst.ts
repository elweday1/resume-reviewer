import { atom } from 'jotai'
import { $typst } from '@myriaddreamin/typst.ts';
import "@myriaddreamin/typst-ts-web-compiler"

export const mainContentAtom = atom(
    "",
    async (_, set, newValue: string) => {
        const newBlob = await generatePDFBlob(newValue);
        if (!newBlob) {
            console.warn("Failed to render the new blob (:")
            return;
        }
        set(blobAtom, newBlob);
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


export const blobAtom = atom<Blob | null>(null);

export async function generatePDFBlob(mainContent: string): Promise<Blob | undefined> {
    try {
        const uint8 = await $typst.pdf({ mainContent })
        if (!uint8) {
            return;
        }
        const buffer = uint8.buffer instanceof ArrayBuffer ? uint8.buffer : uint8.slice().buffer
        return new Blob([buffer], { type: 'application/pdf' })
    } catch (e) {
        return;
    }
}