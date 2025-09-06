"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Target,
  FileText,
  Eye,
  Lightbulb,
  BarChart3,
  LucidePieChart as RechartsPieChart,
} from "lucide-react"
import type { ResumeAnalysis, QualityPillar, SectionAnalysis, LineByLineAudit } from "@/lib/schemas"
import { cn } from "@/lib/utils"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { ErrorBoundary } from "@/components/error-boundary"

interface AnalysisDashboardProps {
  analysis: ResumeAnalysis
}

function QualityPillarsRadarChart({ pillars }: { pillars: QualityPillar[] }) {
  if (!pillars || pillars.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Quality Pillars Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            No quality pillars data available
          </div>
        </CardContent>
      </Card>
    )
  }

  const data = pillars.map((pillar) => ({
    pillar: pillar.pillar.replace(" & ", "\n& "),
    score: pillar.score,
    fullName: pillar.pillar,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Quality Pillars Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ErrorBoundary name="Radar Chart">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data}>
                <PolarGrid />
                <PolarAngleAxis dataKey="pillar" tick={{ fontSize: 10, textAnchor: "middle" }} className="text-xs" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} tickCount={6} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                <Tooltip
                  formatter={(value: number, name: string, props: any) => [`${value}/100`, props.payload.fullName]}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </ErrorBoundary>
      </CardContent>
    </Card>
  )
}

function SectionScoresChart({ sections }: { sections: SectionAnalysis[] }) {
  if (!sections || sections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Section Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">No section data available</div>
        </CardContent>
      </Card>
    )
  }

  const data = sections.map((section) => ({
    name: section.sectionName.length > 15 ? section.sectionName.substring(0, 15) + "..." : section.sectionName,
    score: section.sectionScore,
    fullName: section.sectionName,
  }))

  const getBarColor = (score: number) => {
    if (score >= 80) return "hsl(142, 76%, 36%)" // green
    if (score >= 60) return "hsl(45, 93%, 47%)" // yellow
    return "hsl(0, 84%, 60%)" // red
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Section Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ErrorBoundary name="Bar Chart">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  formatter={(value: number, name: string, props: any) => [`${value}/100`, props.payload.fullName]}
                />
                <Bar dataKey="score" fill={(entry: any) => getBarColor(entry.score)} radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ErrorBoundary>
      </CardContent>
    </Card>
  )
}

function SeverityDistributionChart({ analysis }: { analysis: ResumeAnalysis }) {
  if (!analysis?.sectionAnalysis || analysis.sectionAnalysis.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RechartsPieChart className="w-5 h-5" />
            Issue Severity Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">No issue data available</div>
        </CardContent>
      </Card>
    )
  }

  const severityCounts = analysis.sectionAnalysis.reduce(
    (acc, section) => {
      if (section.lineByLineAudit && Array.isArray(section.lineByLineAudit)) {
        section.lineByLineAudit.forEach((audit) => {
          if (audit && audit.severity) {
            acc[audit.severity] = (acc[audit.severity] || 0) + 1
          }
        })
      }
      return acc
    },
    {} as Record<string, number>,
  )

  const data = Object.entries(severityCounts)
    .filter(([, count]) => count > 0)
    .map(([severity, count]) => ({
      name: severity,
      value: count,
      color:
        severity === "Critical"
          ? "#dc2626"
          : severity === "High"
            ? "#ea580c"
            : severity === "Medium"
              ? "#ca8a04"
              : "#16a34a",
    }))

  const totalIssues = data.reduce((sum, item) => sum + item.value, 0)

  if (totalIssues === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RechartsPieChart className="w-5 h-5" />
            Issue Severity Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No issues found - excellent work!
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RechartsPieChart className="w-5 h-5" />
          Issue Severity Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Total Issues Found: <span className="font-semibold">{totalIssues}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function ScoreCard({ score, title, description }: { score: number; title: string; description?: string }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Good"
    if (score >= 40) return "Fair"
    return "Poor"
  }

  return (
    <div className="text-center space-y-2">
      <div className={cn("text-3xl font-bold", getScoreColor(score))}>{score}/100</div>
      <div className="space-y-1">
        <p className="font-medium text-sm">{title}</p>
        <Badge variant={score >= 80 ? "default" : score >= 60 ? "secondary" : "destructive"}>
          {getScoreLabel(score)}
        </Badge>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </div>
  )
}

function QualityPillarCard({ pillar }: { pillar: QualityPillar }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{pillar.pillar}</CardTitle>
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
        </div>
        <Progress value={pillar.score} className="h-2" />
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground mb-3">{pillar.description}</p>
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-sm">{pillar.findings}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function SeverityBadge({ severity }: { severity: LineByLineAudit["severity"] }) {
  const variants = {
    Critical: "destructive",
    High: "destructive",
    Medium: "secondary",
    Low: "outline",
  } as const

  const icons = {
    Critical: XCircle,
    High: AlertTriangle,
    Medium: AlertCircle,
    Low: CheckCircle,
  }

  const Icon = icons[severity]

  return (
    <Badge variant={variants[severity]} className="flex items-center gap-1">
      <Icon className="w-3 h-3" />
      {severity}
    </Badge>
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

function SectionAnalysisCard({ section }: { section: SectionAnalysis }) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {section.sectionName}
          </CardTitle>
          <ScoreCard score={section.sectionScore} title="Section Score" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm">{section.comments}</p>
        </div>

        {section.lineByLineAudit.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Line-by-Line Audit ({section.lineByLineAudit.length} items)
            </h4>
            <div className="space-y-3">
              {section.lineByLineAudit.map((audit, index) => (
                <LineByLineAuditCard key={index} audit={audit} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function AnalysisDashboard({ analysis }: AnalysisDashboardProps) {
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
      <ErrorBoundary name="Overall Score">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Resume Survival Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <ScoreCard
                score={analysis.score || 0}
                title="Overall Score"
                description={
                  (analysis.score || 0) >= 80
                    ? "Strong chance of getting noticed"
                    : (analysis.score || 0) >= 60
                      ? "Needs improvement to stand out"
                      : "Major issues need immediate attention"
                }
              />
              <Progress value={analysis.score || 0} className="h-3" />
            </div>
          </CardContent>
        </Card>
      </ErrorBoundary>

      <ErrorBoundary name="Charts Grid">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QualityPillarsRadarChart pillars={analysis.qualityPillarsAnalysis || []} />
          <SectionScoresChart sections={analysis.sectionAnalysis || []} />
        </div>
      </ErrorBoundary>

      <SeverityDistributionChart analysis={analysis} />

      {analysis.candidateProfile && (
        <ErrorBoundary name="Candidate Profile">
          <Card>
            <CardHeader>
              <CardTitle>Candidate Profile</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground mb-1">Experience Level</p>
                <p className="font-semibold">{analysis.candidateProfile.inferredExperienceLevel || "Unknown"}</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground mb-1">Target Role</p>
                <p className="font-semibold">{analysis.candidateProfile.inferredRole || "Unknown"}</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground mb-1">Length Analysis</p>
                <p className="font-semibold text-xs">{analysis.candidateProfile.resumeLengthAnalysis || "N/A"}</p>
              </div>
            </CardContent>
          </Card>
        </ErrorBoundary>
      )}

      {analysis.recruiterGutCheck && (
        <ErrorBoundary name="Recruiter Gut Check">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Recruiter's First Impression
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Initial Reaction</h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm">{analysis.recruiterGutCheck.firstImpression || "No impression available"}</p>
                </div>
              </div>

              {analysis.recruiterGutCheck.redFlags && analysis.recruiterGutCheck.redFlags.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-4 h-4" />
                    Red Flags
                  </h4>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                    {Array.isArray(analysis.recruiterGutCheck.redFlags) ? (
                      analysis.recruiterGutCheck.redFlags.map((flag, index) => (
                        <p key={index} className="text-sm text-red-700">
                          • {flag}
                        </p>
                      ))
                    ) : (
                      <p className="text-sm text-red-700">{analysis.recruiterGutCheck.redFlags}</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </ErrorBoundary>
      )}

      <ErrorBoundary name="Detailed Analysis Tabs">
        <Tabs defaultValue="quality-pillars" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quality-pillars" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Quality Analysis
            </TabsTrigger>
            <TabsTrigger value="section-analysis" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Section Breakdown
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quality-pillars" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(analysis.qualityPillarsAnalysis || []).map((pillar, index) => (
                <QualityPillarCard key={index} pillar={pillar} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="section-analysis" className="space-y-4">
            {(analysis.sectionAnalysis || []).map((section, index) => (
              <SectionAnalysisCard key={index} section={section} />
            ))}
          </TabsContent>
        </Tabs>
      </ErrorBoundary>
    </div>
  )
}
