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
  LucidePieChart,
} from "lucide-react"
import type { ResumeAnalysis, QualityPillar, SectionAnalysis, LineByLineAudit } from "@/lib/schemas"
import { useMemo } from "react"
import { useFilterStore } from '@/lib/stores/filters'
import { IssuesList } from './issues-list'
import { ScoreCard } from './score-card'
import { OverviewCard } from './overview-card'
import { QualityPillarsCard } from './quality-pillars-card'
import { SectionPerformanceCard } from './section-performance-card'
import { ErrorBoundary } from "@/components/error-boundary"
import { SeverityDistributionChart } from "./severity-dist"

type Issue = LineByLineAudit & { sectionName?: string }

interface AnalysisDashboardProps {
  analysis: ResumeAnalysis
}

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

  const setActivePillarFilter = useFilterStore((s) => s.setPillar)
  const setActiveSeverityFilter = useFilterStore((s) => s.setSeverity)
  const setActiveSectionFilter = useFilterStore((s) => s.setSection)
  const clearAllFilters = useFilterStore((s) => s.clearAll)
  const [activePillarFilter, activeSeverityFilter, activeSectionFilter] = useFilterStore((s) => [
    s.pillar, s.severity, s.section
  ])

  const filteredIssues: Issue[] = useMemo(() => {
    return analysis?.sectionAnalysis?.map(({ lineByLineAudit, sectionName }) =>
      lineByLineAudit?.map((a => ({ ...a, sectionName })))
    ).flat().filter((issue) => {
      if (activePillarFilter && issue.pillar !== activePillarFilter) return false
      if (activeSeverityFilter && issue.severity !== activeSeverityFilter) return false
      if (activeSectionFilter && issue.sectionName !== activeSectionFilter) return false
      return true
    })
  }, [analysis, activePillarFilter, activeSeverityFilter, activeSectionFilter])


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
            <button onClick={() => setActivePillarFilter(null)} className="ml-2 text-xs">×</button>
          </Badge>
        )}
        {activeSeverityFilter && (
          <Badge className="flex items-center gap-2">
            {activeSeverityFilter}
            <button onClick={() => setActiveSeverityFilter(null)} className="ml-2 text-xs">×</button>
          </Badge>
        )}
        {activeSectionFilter && (
          <Badge className="flex items-center gap-2">
            {activeSectionFilter}
            <button onClick={() => setActiveSectionFilter(null)} className="ml-2 text-xs">×</button>
          </Badge>
        )}
        {(activePillarFilter || activeSeverityFilter || activeSectionFilter) && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>Clear all</Button>
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
                <span className="flex items-center gap-2"><LucidePieChart className="w-5 h-5" /> Issues</span>
                <div className="flex items-center gap-2">
                  {(activePillarFilter || activeSeverityFilter || activeSectionFilter) && (
                    <Button variant="ghost" onClick={clearAllFilters}>
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
              <IssuesList issues={filteredIssues} />
            </CardContent>
          </Card>
        </div>
      </ErrorBoundary>
    </div>
  )
}
