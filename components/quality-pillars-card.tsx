"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'
import { QualityPillar } from '@/lib/schemas'
import { Button } from '@/components/ui/button'
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { useFilterStore } from '@/lib/stores/filters'

export function QualityPillarsCard({ pillars }: { pillars: QualityPillar[] }) {
    const setPillar = useFilterStore((s: any) => s.setPillar)

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
                    <div className="h-80 flex items-center justify-center text-muted-foreground">No quality pillars data available</div>
                </CardContent>
            </Card>
        )
    }

    const data = pillars.map((pillar) => ({ pillar: pillar.pillar.replace(' & ', '\n& '), score: pillar.score, fullName: pillar.pillar }))

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Quality Pillars Overview
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={data}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="pillar" tick={{ fontSize: 10, textAnchor: 'middle' }} className="text-xs" />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} tickCount={6} />
                            <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} strokeWidth={2} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                    {pillars.map((p, i) => (
                        <Button key={i} variant="ghost" size="sm" onClick={() => setPillar(p.pillar)}>
                            <div className="text-sm text-left">
                                <div className="font-medium">{p.pillar}</div>
                                <div className="text-xs text-muted-foreground">{p.score}/100</div>
                            </div>
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
