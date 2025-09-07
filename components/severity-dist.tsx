
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucidePieChart } from 'lucide-react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import type { ResumeAnalysis, SeverityLevel } from '@/lib/schemas'
import { useMemo } from 'react'
import { SEVERITY_DATA } from '@/lib/utils'

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

  const severityCounts = useMemo(() =>
    Object.entries(Object.groupBy(analysis.lineByLineAudit, ({ severity }) => severity)).map(([name, issues]) => ({
      name,
      value: issues.length,
      color: SEVERITY_DATA[name as SeverityLevel].color,
    })), [analysis.sectionAnalysis])

  const totalIssues = severityCounts.reduce((sum, item) => sum + item.value, 0)

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
                data={severityCounts}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value, percent }) => `${name}: ${value} (${(percent ?? 0 * 100).toFixed(0)}%)`}
              >
                {severityCounts.map((entry, index) => (
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
