"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Eye,
} from "lucide-react"
import type { ResumeAnalysis, QualityPillar, SectionAnalysis, Issue } from "@/lib/schemas"
import { useMemo } from "react"
import { useFilterStore } from '@/lib/stores/filters'
import { IssuesList } from './issues-list'
import { ScoreCard } from './score-card'
import { OverviewCard } from './overview-card'
import { QualityPillarsChart } from './quality-pillars-card'
import { SectionPerformanceChart } from './section-performance-card'
import { SeverityDistributionChart } from "./severity-dist"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"


interface AnalysisDashboardProps {
  analysis: ResumeAnalysis
}

function QualityPillarCard({ pillar }: { pillar: QualityPillar }) {
  return (
    <Card>
      <div className="flex items-center gap-2 justify-between p-4 cursor-pointer">
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
      <CardContent className="pt-0">
        <Progress value={pillar.score} className="h-2 mb-3" />
        <p className="text-xs text-muted-foreground mb-3">{pillar.description}</p>
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-sm">{pillar.findings}</p>
        </div>
      </CardContent>
    </Card>
  )
}


function SectionAnalysisCard({ section, onSectionClick }: { section: SectionAnalysis; onSectionClick?: (s: string) => void }) {
  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between p-4 cursor-pointer gap-2">
        <FileText className="w-5 h-5" />
        <button onClick={(e) => { e.stopPropagation(); onSectionClick?.(section.sectionName) }} className="text-left">
          {section.sectionName}
        </button>
      </div>
      <ScoreCard score={section.sectionScore} title="Section Score" />

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
          {/* <div className="mt-2 text-xs text-muted-foreground">Issues found: {section.lineByLineAudit.length}</div> */}
        </div>
      </CardContent>
    </Card >
  )
}

export function AnalysisDashboard({ analysis }: AnalysisDashboardProps) {
  const setActiveSeverityFilter = useFilterStore((s) => s.setSeverity)
  const activePillarFilter = useFilterStore((s) => s.pillar)
  const activeSeverityFilter = useFilterStore((s) => s.severity)
  const activeSectionFilter = useFilterStore((s) => s.section)

  const filteredIssues: Issue[] = useMemo(() => {
    return analysis?.lineByLineAudit?.filter((issue) => {
      if (activePillarFilter && issue.pillar !== activePillarFilter) return false
      if (activeSeverityFilter && issue.severity !== activeSeverityFilter) return false
      if (activeSectionFilter && issue.section !== activeSectionFilter) return false
      return true
    })
  }, [analysis, activePillarFilter, activeSeverityFilter, activeSectionFilter])

  const sectionAnalysis = useMemo(() => {
    const auditsGroupedBySelection = Object.groupBy(analysis.lineByLineAudit, ({ section }) => section)
    return analysis.sectionAnalysis.map((sec) => {
      return { ...sec, lineByLineAudit: auditsGroupedBySelection[sec.sectionName] ?? [] }
    })
  }, [analysis.sectionAnalysis, analysis.lineByLineAudit])


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
    <Tabs defaultValue="overview">
      <TabsList className="w-full h-12 p-2">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="stats">Statistics</TabsTrigger>
        <TabsTrigger value="issues">Issues</TabsTrigger>
        <TabsTrigger value="section-analysis">Sections</TabsTrigger>
        <TabsTrigger value="pillars-analysis">Pillars</TabsTrigger>

      </TabsList>
      <TabsContent value="overview">
        <OverviewCard analysis={analysis} />
      </TabsContent>
      <TabsContent value="stats">
        <QualityPillarsChart pillars={analysis.qualityPillarsAnalysis || []} />
        <SeverityDistributionChart analysis={analysis} onSeverityClick={(s) => setActiveSeverityFilter(s)} />
        <SectionPerformanceChart sections={sectionAnalysis || []} />
      </TabsContent>
      <TabsContent value="issues">
        <IssuesList issues={filteredIssues} />
      </TabsContent>
      <TabsContent value="section-analysis">
        {
          analysis.sectionAnalysis.map((section) => (
            <SectionAnalysisCard section={section} key={section.sectionName} />
          ))
        }
      </TabsContent>
      <TabsContent value="pillars-analysis">
        {
          analysis.qualityPillarsAnalysis.map((pillar) => (
            <QualityPillarCard pillar={pillar} key={pillar.description} />
          ))
        }
      </TabsContent>


    </Tabs>
  )
}
