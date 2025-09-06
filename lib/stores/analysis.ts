import { create } from 'zustand'

import type { ResumeAnalysis } from '../schemas'

type AnalysisState = {
    analysis: ResumeAnalysis | null
    setAnalysis: (a: ResumeAnalysis | null) => void
}

export const useAnalysisStore = create<AnalysisState>((set: (s: Partial<AnalysisState>) => void) => ({
    analysis: null,
    setAnalysis: (a) => set({ analysis: a }),
}))
