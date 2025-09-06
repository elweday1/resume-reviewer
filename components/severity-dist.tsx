
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucidePieChart } from 'lucide-react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import type { ResumeAnalysis } from '@/lib/schemas'
import { useMemo } from 'react'

export function SeverityDistributionChart({ analysis, onSeverityClick }: { analysis: ResumeAnalysis; onSeverityClick?: (s: string) => void }) {
  if (!analysis?.sectionAnalysis || analysis.sectionAnalysis.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LucidePieChart className="w-5 h-5" />
            Issue Severity Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">No issue data available</div>
        </CardContent>
      </Card>
    )
  }

  const severityCounts = useMemo(() => analysis.sectionAnalysis.reduce(
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
  ), [analysis.sectionAnalysis])

  const data = useMemo(() => Object.entries(severityCounts)
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
    })), [severityCounts])

  const totalIssues = data.reduce((sum, item) => sum + item.value, 0)

  if (totalIssues === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LucidePieChart className="w-5 h-5" />
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
          <LucidePieChart className="w-5 h-5" />
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
                label={({ name, value, percent }) => `${name}: ${value} (${(percent ?? 0 * 100).toFixed(0)}%)`}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    onClick={() => onSeverityClick?.(entry.name)}
                    style={{ cursor: "pointer" }}
                  />
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
