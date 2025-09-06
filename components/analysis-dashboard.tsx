"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Eye,
  LucidePieChart as RechartsPieChart,
} from "lucide-react"
import type { ResumeAnalysis, QualityPillar, SectionAnalysis, LineByLineAudit } from "@/lib/schemas"
import { useMemo, useState } from "react"
import { useFilterStore } from '@/lib/stores/filters'
import { SeverityBadge } from './severity-badge'
import { IssuesList } from './issues-list'
import { ScoreCard } from './score-card'
import { OverviewCard } from './overview-card'
import { QualityPillarsCard } from './quality-pillars-card'
import { SectionPerformanceCard } from './section-performance-card'
import { ErrorBoundary } from "@/components/error-boundary"
import { SeverityDistributionChart } from "./severity-dist"

interface AnalysisDashboardProps {
  analysis: ResumeAnalysis
}

// ScoreCard moved to components/score-card.tsx

function QualityPillarCard({ pillar }: { pillar: QualityPillar }) {
  return (
    <Card>
      <details>
        <summary className="flex items-center justify-between p-4 cursor-pointer">
          <div className="flex items-center gap-2">
            <div className="font-medium">{pillar.pillar}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{pillar.score}/100</span>
            {pillar.score >= 80 ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : pillar.score >= 60 ? (
              <AlertCircle className="w-4 h-4 text-yellow-600" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600" />
            )}
          </div>
        </summary>
        <CardContent className="pt-0">
          <Progress value={pillar.score} className="h-2 mb-3" />
          <p className="text-xs text-muted-foreground mb-3">{pillar.description}</p>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-sm">{pillar.findings}</p>
          </div>
        </CardContent>
      </details>
    </Card>
  )
}

function LineByLineAuditCard({ audit }: { audit: LineByLineAudit }) {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-sm">{audit.element}</span>
                <SeverityBadge severity={audit.severity} />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Original Text:</p>
              <div className="bg-red-50 border border-red-200 rounded p-2">
                <p className="text-sm font-mono">{audit.originalText}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Critique:</p>
              <p className="text-sm text-muted-foreground">{audit.critique}</p>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Suggested Revision:</p>
              <div className="bg-green-50 border border-green-200 rounded p-2">
                <p className="text-sm font-mono">{audit.suggestedRevision}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Reasoning:</p>
              <p className="text-sm text-blue-700">{audit.reasoning}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SectionAnalysisCard({ section, onSectionClick }: { section: SectionAnalysis; onSectionClick?: (s: string) => void }) {
  return (
    <Card className="mb-6">
      <details>
        <summary className="flex items-center justify-between p-4 cursor-pointer">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <button onClick={(e) => { e.stopPropagation(); onSectionClick?.(section.sectionName) }} className="text-left">
              {section.sectionName}
            </button>
          </div>
          <ScoreCard score={section.sectionScore} title="Section Score" />
        </summary>

        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm">{section.comments}</p>
          </div>

          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Summary
            </h4>
            <p className="text-sm text-muted-foreground">{section.comments}</p>
            <div className="mt-2 text-xs text-muted-foreground">Issues found: {section.lineByLineAudit.length}</div>
          </div>
        </CardContent>
      </details>
    </Card>
  )
}

export function AnalysisDashboard({ analysis }: AnalysisDashboardProps) {
  const activePillarFilter = useFilterStore((s: any) => s.pillar)
  const activeSeverityFilter = useFilterStore((s: any) => s.severity)
  const activeSectionFilter = useFilterStore((s: any) => s.section)
  const setActivePillarFilter = useFilterStore((s: any) => s.setPillar)
  const setActiveSeverityFilter = useFilterStore((s: any) => s.setSeverity)
  const setActiveSectionFilter = useFilterStore((s: any) => s.setSection)
  const clearAllFilters = useFilterStore((s: any) => s.clearAll)
  const [showRecruiter, setShowRecruiter] = useState<boolean>(false)

  const allIssues: (LineByLineAudit & { sectionName?: string })[] = useMemo(() => {
    const issues: (LineByLineAudit & { sectionName?: string })[] = []
      ; (analysis?.sectionAnalysis || []).forEach((s) => {
        ; (s.lineByLineAudit || []).forEach((a) => {
          issues.push({ ...a, sectionName: s.sectionName })
        })
      })
    return issues
  }, [analysis])

  const filteredIssues = useMemo(() => {
    return allIssues.filter((issue) => {
      if (activePillarFilter && issue.pillar !== activePillarFilter) return false
      if (activeSeverityFilter && issue.severity !== activeSeverityFilter) return false
      if (activeSectionFilter && issue.sectionName !== activeSectionFilter) return false
      return true
    })
  }, [allIssues, activePillarFilter, activeSeverityFilter, activeSectionFilter])

  const clearFilters = () => clearAllFilters()
  const clearPillar = () => setActivePillarFilter(null)
  const clearSeverity = () => setActiveSeverityFilter(null)
  const clearSection = () => setActiveSectionFilter(null)

  if (!analysis) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Analysis Data</h2>
            <p className="text-muted-foreground">Unable to display analysis results.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <OverviewCard analysis={analysis} />

      {/* Global applied filters display */}
      <div className="flex items-center gap-2">
        {activePillarFilter && (
          <Badge className="flex items-center gap-2">
            {activePillarFilter}
            <button onClick={clearPillar} className="ml-2 text-xs">×</button>
          </Badge>
        )}
        {activeSeverityFilter && (
          <Badge className="flex items-center gap-2">
            {activeSeverityFilter}
            <button onClick={clearSeverity} className="ml-2 text-xs">×</button>
          </Badge>
        )}
        {activeSectionFilter && (
          <Badge className="flex items-center gap-2">
            {activeSectionFilter}
            <button onClick={clearSection} className="ml-2 text-xs">×</button>
          </Badge>
        )}
        {(activePillarFilter || activeSeverityFilter || activeSectionFilter) && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>Clear all</Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QualityPillarsCard pillars={analysis.qualityPillarsAnalysis || []} />
        <SectionPerformanceCard sections={analysis.sectionAnalysis || []} />
      </div>

      <ErrorBoundary name="Severity Distribution">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SeverityDistributionChart analysis={analysis} onSeverityClick={(s) => setActiveSeverityFilter(s)} />

          {/* Issues List + Filters */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2"><RechartsPieChart className="w-5 h-5" /> Issues</span>
                <div className="flex items-center gap-2">
                  {(activePillarFilter || activeSeverityFilter || activeSectionFilter) && (
                    <Button variant="ghost" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3">
                {activePillarFilter && <Badge>{activePillarFilter}</Badge>}
                {activeSeverityFilter && <Badge className="ml-2">{activeSeverityFilter}</Badge>}
                {activeSectionFilter && <Badge className="ml-2">{activeSectionFilter}</Badge>}
              </div>
              <IssuesList issues={allIssues} />
            </CardContent>
          </Card>
        </div>
      </ErrorBoundary>
    </div>
  )
}
