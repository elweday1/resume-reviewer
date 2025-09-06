"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { LineByLineAudit } from '@/lib/schemas'
import { useFilterStore } from '@/lib/stores/filters'
import { SeverityBadge } from './severity-badge'

export function IssuesList({ issues }: { issues: (LineByLineAudit & { sectionName?: string })[] }) {
    const pillar = useFilterStore((s: any) => s.pillar)
    const severity = useFilterStore((s: any) => s.severity)
    const section = useFilterStore((s: any) => s.section)

    const filtered = issues.filter((issue) => {
        if (pillar && issue.pillar !== pillar) return false
        if (severity && issue.severity !== severity) return false
        if (section && issue.sectionName !== section) return false
        return true
    })

    return (
        <div className="space-y-3 max-h-96 overflow-auto">
            {filtered.length === 0 ? (
                <p className="text-muted-foreground">No issues match the current filters.</p>
            ) : (
                filtered.map((issue, idx) => (
                    <Card key={idx} className="mb-2">
                        <CardContent className="p-3">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-sm">{issue.element}</span>
                                        <SeverityBadge severity={issue.severity} />
                                        <Badge className="ml-2">{issue.pillar}</Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-1">{issue.originalText}</p>
                                    <p className="text-sm">{issue.critique}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    )
}
