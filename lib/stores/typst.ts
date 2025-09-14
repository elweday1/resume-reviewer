import { create } from 'zustand'
import { atom } from 'jotai'

export const mainContentAtom = atom(
    "",
    (_, set, newValue: string) => {
        set(mainContentAtom, newValue);
        console.log("Main content updated:", newValue);
    });

export const blobAtom = atom(async (get) => {
    const mainContent = get(mainContentAtom);
    if (mainContent) {
        return await generatePDFBlob(mainContent);
    }
    return null;
});

// Dynamically import the browser-friendly all-in-one build at runtime so the
// WebAssembly asset is resolved by the bundler/loader in the browser.
// Cache for the dynamically imported module and a promise while loading.
let cachedTypst: { pdf: (opts: { mainContent: string }) => Promise<Uint8Array | null> } | null = null
let cachedImportPromise: typeof import('@myriaddreamin/typst-all-in-one.ts') | null = null

async function generatePDFBlob(mainContent: string) {
    if (typeof window === 'undefined') {
        throw new Error('generatePDFBlob must be run in a browser environment')
    }

    // If we already have the runtime cached, reuse it.
    if (!cachedTypst) {
        // If another call is already importing, await that promise instead of
        // starting a duplicate import. This avoids concurrent double-imports.
        if (!cachedImportPromise) {
            cachedImportPromise = await import('@myriaddreamin/typst-all-in-one.ts')
        }

        const mod = await cachedImportPromise
        // Ensure subsequent calls use the typed helper only.
        cachedTypst = (mod as any).$typst as { pdf: (opts: { mainContent: string }) => Promise<Uint8Array | null> }
    }

    const data = await cachedTypst.pdf({ mainContent })
    const uint8 = data ?? new Uint8Array(0)
    const buffer = uint8.buffer instanceof ArrayBuffer ? uint8.buffer : uint8.slice().buffer
    return new Blob([buffer], { type: 'application/pdf' })
}


type TypstState = {
    mainContent: string
    setMainContent: (a: string) => void
}

export const useTypstStore = create<TypstState>((set: (s: Partial<TypstState>) => void) => ({
    mainContent: "",
    setMainContent: (a) => {
        set({ mainContent: a })
    },
    getBlob: async () => {
        const state = useTypstStore.getState()
        if (state.mainContent) {
            return await generatePDFBlob(state.mainContent)
        }
    }
}))


