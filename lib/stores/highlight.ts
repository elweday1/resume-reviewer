import { create } from 'zustand'


type HilightsState = {
    highlightedText: string
    setHilightedText: (a: string) => void
}

export const useHighlightStore = create<HilightsState>((set: (s: Partial<HilightsState>) => void) => ({
    highlightedText: "",
    setHilightedText: (a) => {
        set({ highlightedText: a })
    },
}))
