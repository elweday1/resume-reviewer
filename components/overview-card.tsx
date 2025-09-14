"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Target } from 'lucide-react'
import { ScoreCard } from './score-card'
import { Progress } from '@/components/ui/progress'
import { ResumeAnalysis } from '@/lib/schemas'

export function OverviewCard({ analysis }: { analysis: ResumeAnalysis }) {
    return (
        <Card className='col-span-2'>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Analysis Overview
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center flex flex-col gap-6">
                    <div>
                        <ScoreCard
                            score={analysis.score || 0}
                            title="Overall Score"
                            description={
                                (analysis.score || 0) >= 80
                                    ? 'Strong chance of getting noticed'
                                    : (analysis.score || 0) >= 60
                                        ? 'Needs improvement to stand out'
                                        : 'Major issues need immediate attention'
                            }
                        />
                        <Progress value={analysis.score || 0} className="h-3 mt-3" />
                    </div>

                    <div className="space-y-2 text-left w-full">
                        <h4 className="text-sm font-medium">Candidate Profile</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Experience Level</p>
                                <p className="font-semibold">{analysis.candidateProfile?.inferredExperienceLevel || 'Unknown'}</p>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Target Role</p>
                                <p className="font-semibold">{analysis.candidateProfile?.inferredRole || 'Unknown'}</p>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Length Analysis</p>
                                <p className="font-semibold text-xs">{analysis.candidateProfile?.resumeLengthAnalysis || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {analysis.recruiterGutCheck && (
                        <div className="w-full text-left mt-2 space-y-3">
                            <h4 className="text-sm font-medium">Recruiter's First Impression</h4>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-sm">{analysis.recruiterGutCheck.firstImpression || 'No impression available'}</p>
                            </div>

                            {analysis.recruiterGutCheck.redFlags && analysis.recruiterGutCheck.redFlags.length > 0 && (
                                <div>
                                    <h5 className="text-sm font-medium text-red-600">Red Flags</h5>
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                                        {Array.isArray(analysis.recruiterGutCheck.redFlags) ? (
                                            analysis.recruiterGutCheck.redFlags.map((flag: string, index: number) => (
                                                <p key={index} className="text-sm text-red-700">• {flag}</p>
                                            ))
                                        ) : (
                                            <p className="text-sm text-red-700">{analysis.recruiterGutCheck.redFlags}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
