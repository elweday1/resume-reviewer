"use client"

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function ScoreCard({ score, title, description }: { score: number; title: string; description?: string }) {
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600'
        if (score >= 60) return 'text-yellow-600'
        return 'text-red-600'
    }

    const getScoreLabel = (score: number) => {
        if (score >= 80) return 'Excellent'
        if (score >= 60) return 'Good'
        if (score >= 40) return 'Fair'
        return 'Poor'
    }

    return (
        <div className="text-center space-y-2">
            <div className={cn('text-3xl font-bold', getScoreColor(score))}>{score}/100</div>
            <div className="space-y-1">
                <p className="font-medium text-sm">{title}</p>
                <Badge variant={score >= 80 ? 'default' : score >= 60 ? 'secondary' : 'destructive'}>
                    {getScoreLabel(score)}
                </Badge>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </div>
        </div>
    )
}
