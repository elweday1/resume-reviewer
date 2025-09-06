import { create } from 'zustand'

type UiState = {
  recruiterExpanded: boolean
  expandedSections: Record<string, boolean>
  toggleRecruiter: () => void
  toggleSection: (sectionName: string) => void
}

export const useUiStore = create<UiState>((set, get) => ({
  recruiterExpanded: false,
  expandedSections: {},
  toggleRecruiter: () => set((s) => ({ recruiterExpanded: !s.recruiterExpanded })),
  toggleSection: (sectionName: string) =>
    set((s) => ({ expandedSections: { ...s.expandedSections, [sectionName]: !s.expandedSections[sectionName] } })),
}))
