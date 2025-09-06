"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'
import { useFilterStore } from '@/lib/stores/filters'
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts'
import { useMemo } from 'react'
import { SEVERITY_DATA } from '@/lib/utils'
import { SeverityLevels } from '@/lib/schemas'

export function SectionPerformanceCard({ sections }: { sections: any[] }) {
    const setSeverity = useFilterStore((s) => s.setSeverity)
    const data = useMemo(() => sections.map((s) => ({
        name: s.sectionName,
        issues: s.lineByLineAudit.length,
        score: s.sectionScore,
        critical: s.lineByLineAudit.filter((a: any) => a.severity === 'Critical').length,
        high: s.lineByLineAudit.filter((a: any) => a.severity === 'High').length,
        medium: s.lineByLineAudit.filter((a: any) => a.severity === 'Medium').length,
        low: s.lineByLineAudit.filter((a: any) => a.severity === 'Low').length,
    })), [sections])
    return (
        <Card>
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
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="name" width={160} />
                            <Tooltip />
                            {SeverityLevels.map((severity) => (
                                <Bar dataKey={severity} stackId="a" fill={SEVERITY_DATA[severity].color} onClick={() => setSeverity(severity)} />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-3 text-sm text-muted-foreground">Click a stacked bar segment to filter by severity.</div>
            </CardContent>
        </Card>
    )
}
