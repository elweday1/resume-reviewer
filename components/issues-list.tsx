"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { LineByLineAudit } from '@/lib/schemas'
import { SeverityBadge } from './severity-badge'

export function IssuesList({ issues }: { issues: LineByLineAudit[] }) {
    return (
        <div className="space-y-3 max-h-96 overflow-auto">
            {issues.length === 0 ? (
                <p className="text-muted-foreground">No issues match the current filters.</p>
            ) : (
                issues.map((audit, idx) => (
                    <Card className="mb-4">
                        <CardContent className="p-4">
                            <div className="space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-medium text-sm">{audit.element}</span>
                                            <SeverityBadge severity={audit.severity} />
                                            <Badge className="ml-2">{audit.pillar}</Badge>

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

                ))
            )}
        </div>
    )
}
