import { create } from 'zustand'

type FilterState = {
    pillar: string | null
    severity: string | null
    section: string | null
    setPillar: (p: string | null) => void
    setSeverity: (s: string | null) => void
    setSection: (s: string | null) => void
    clearAll: () => void
}

export const useFilterStore = create<FilterState>((set: (partial: Partial<FilterState>) => void) => ({
    pillar: null,
    severity: null,
    section: null,
    setPillar: (p: string | null) => set({ pillar: p }),
    setSeverity: (s: string | null) => set({ severity: s }),
    setSection: (s: string | null) => set({ section: s }),
    clearAll: () => set({ pillar: null, severity: null, section: null }),
}))
