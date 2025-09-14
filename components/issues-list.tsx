"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Issue, SeverityLevel } from '@/lib/schemas'
import { SEVERITY_DATA } from '@/lib/utils'
import { mainContentAtom } from '@/lib/stores/typst'
import { useSetAtom, useAtomValue } from 'jotai'
import { useEffect, useRef, useState } from 'react'
import { LucidePieChart } from 'lucide-react'
import { useFilterStore } from '@/lib/stores/filters'

function highlightText(originalFile: string, text: string) {
    const start = originalFile.indexOf(text)
    if (start === -1) {
        return
    }
    const end = start + text.length
    const originalText = originalFile.slice(start, end)
    const wrapped = `#highlight[${originalText}]`
    return originalFile.slice(0, start) + wrapped + originalFile.slice(end)

}

function replaceText(originalFile: string, target: string, replacement: string) {
    const start = originalFile.indexOf(target)
    if (start === -1) return null
    const end = start + target.length
    return originalFile.slice(0, start) + replacement + originalFile.slice(end)
}

const SeverityBadge = ({ severity }: { severity: SeverityLevel }) => {
    const { label, Icon, variant } = SEVERITY_DATA[severity]
    return (
        <Badge variant={variant as any} className="flex items-center gap-1">
            <Icon className="w-3 h-3" />
            {label}
        </Badge>
    )
}

export function IssuesList({ issues }: { issues: Issue[] }) {
    const setMainContent = useSetAtom(mainContentAtom)
    const mainContent = useAtomValue(mainContentAtom)
    const [highlightedAudit, setHighlightedAudit] = useState<number | null>(null);
    const prevContentRef = useRef<string | null>(null);
    const [fixedAudits, setFixedAudits] = useState<Record<number, boolean>>({})
    const clearAllFilters = useFilterStore((s) => s.clearAll)
    const activePillarFilter = useFilterStore((s) => s.pillar)
    const activeSeverityFilter = useFilterStore((s) => s.severity)
    const activeSectionFilter = useFilterStore((s) => s.section)


    useEffect(() => {
        prevContentRef.current = mainContent;
    }, [])

    function fixIssue(auditIndex: number) {
        const audit = issues[auditIndex];
        if (!prevContentRef.current) {
            return;
        }
        const updated = replaceText(prevContentRef.current, audit.originalText!, audit.suggestedFix!)
        if (updated !== null) {
            setMainContent(updated)
            prevContentRef.current = updated
            setFixedAudits((audits) => ({ ...audits, [auditIndex]: true }))

        }
    }

    useEffect(() => {
        console.log("changed highlight to ", highlightedAudit)

        if (!highlightedAudit && prevContentRef.current) {
            setMainContent(prevContentRef.current)
        }
        if (highlightedAudit && issues[highlightedAudit].originalText) {
            const highlightedText = highlightText(mainContent, issues[highlightedAudit].originalText);
            if (highlightedText) {
                prevContentRef.current = mainContent;
                setMainContent(highlightedText)
            }
        }
    }, [highlightedAudit])
    return (

        <div className="space-y-3  overflow-scroll">
            {issues.length === 0 ? (
                <p className="text-muted-foreground">No issues match the current filters.</p>
            ) : (
                issues.map((audit, idx) => (
                    <Card
                        key={`issue-${idx}-${audit.element.slice(0, 20)}`}
                        className="mb-4"
                        onMouseEnter={() => { setHighlightedAudit(idx) }}
                        onMouseLeave={() => { setHighlightedAudit(null) }}
                    >
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
                                    {audit.originalText &&
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground mb-1" >Original Text:</p>
                                            <div className="bg-red-50 border border-red-200 rounded p-2">
                                                <p className="text-sm font-mono">{audit.originalText}</p>
                                            </div>
                                        </div>
                                    }


                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground mb-1">Critique:</p>
                                        <p className="text-sm text-muted-foreground">{audit.critique}</p>
                                    </div>
                                    {audit.suggestedFix &&
                                        <div className="flex flex-col gap-2">
                                            <p className="text-xs font-medium text-muted-foreground mb-1">Suggested {audit.originalText ? "Fix" : "Revision"}:</p>
                                            <div className="bg-green-50 border border-green-200 rounded p-2 flex items-start justify-between gap-2">
                                                <p className="text-sm font-mono break-words">{audit.suggestedFix}</p>
                                                {audit.originalText && (
                                                    <Button
                                                        disabled={fixedAudits[idx]}
                                                        variant={fixedAudits[idx] ? "secondary" : "destructive"}
                                                        size="sm"
                                                        onClick={() => fixIssue(idx)}
                                                    >
                                                        {fixedAudits[idx] ? "Fixed" : "Apply"}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    }
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground mb-1">Reasoning:</p>
                                        <p className="text-sm text-blue-700">{audit.reasoning}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                ))
            )
            }
        </div >
    )
}
