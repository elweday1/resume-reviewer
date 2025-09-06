"use client"

import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import type { LineByLineAudit } from '@/lib/schemas'

export function SeverityBadge({ severity }: { severity: LineByLineAudit['severity'] }) {
    const variants = {
        Critical: 'destructive',
        High: 'destructive',
        Medium: 'secondary',
        Low: 'outline',
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
