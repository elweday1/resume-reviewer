"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'
import { useFilterStore } from '@/lib/stores/filters'
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts'
import { useMemo } from 'react'
import { SEVERITY_DATA } from '@/lib/utils'
import { SeverityLevels, SectionAnalysis, Issue } from '@/lib/schemas'

export function SectionPerformanceChart({ sections }: { sections: Array<SectionAnalysis & { lineByLineAudit: Issue[] }> }) {
    const setSeverity = useFilterStore((s) => s.setSeverity)
    const setSection = useFilterStore((s) => s.setSection)
    const data = useMemo(() => sections.map((s) => {
        return {
            name: s.sectionName,
            issues: s.lineByLineAudit.length,
            score: s.sectionScore,
            Critical: s.lineByLineAudit.filter((a) => a.severity === 'Critical').length,
            High: s.lineByLineAudit.filter((a) => a.severity === 'High').length,
            Medium: s.lineByLineAudit.filter((a) => a.severity === 'Medium').length,
            Low: s.lineByLineAudit.filter((a) => a.severity === 'Low').length,
        }
    }), [sections])
    return (
        <Card className='col-span-2'>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Section Performance
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={data}
                            margin={{ top: 10, right: 20, left: 20, bottom: 20 }}
                        >
                            <CartesianGrid strokeDasharray="7 5" />
                            <XAxis type="number" dataKey="issues" />
                            <YAxis type="category" dataKey="name" width={160} />
                            <Tooltip />
                            {SeverityLevels.map((severity) => (
                                <Bar dataKey={severity} stackId="a" fill={SEVERITY_DATA[severity].color} onClick={(e) => {
                                    setSeverity(severity)
                                    setSection(e.payload.name)
                                }} />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-3 text-sm text-muted-foreground">Click a stacked bar segment to filter by severity.</div>
            </CardContent>
        </Card>
    )
}
