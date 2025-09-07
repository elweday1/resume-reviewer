"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, AlertCircle, Share2, UserSquare } from "lucide-react"
import type { ResumeAnalysis } from "@/lib/schemas"
import { PDFViewer } from "@/components/pdf-viewer"
import { AnalysisDashboard } from "@/components/analysis-dashboard"
import { ErrorBoundary } from "@/components/error-boundary"

const MOCK_ANALYSIS: ResumeAnalysis = {
  score: 85,
  lineByLineAudit: [
    {
      element: "Led a team of 5 engineers to develop a new feature.",
      reasoning: "This is a strong accomplishment that demonstrates leadership.",
      pillar: "Completeness & Professionalism",
      originalText: "Worked on various projects.",
      severity: "Medium",
      section: "Work Experience",
      critique: "Be more specific about your role and achievements.",
      suggestedRevision: "Led a team of 5 engineers to develop a new feature that increased user engagement by 20%.",
    },
    {
      element: "Graduated with honors.",
      section: "Education",
      reasoning: "This is a positive highlight that should be retained.",
      pillar: "Content Impact & Persuasion",
      originalText: "Bachelor of Science in Computer Science, XYZ University, 2018",
      severity: "Low",
      critique: "Add relevant coursework or honors if applicable.",
      suggestedRevision: "Include any relevant courses or academic achievements.",
    },
  ],
  qualityPillarsAnalysis: [
    {
      pillar: "Strategic Alignment & Targeting",
      score: 90,
      description: "Measures the relevance and clarity of the resume content.",
      findings: "Your resume content is clear and relevant to the job description.",
    },
    {
      pillar: "Technical Compliance & Readability",
      score: 80,
      description: "Assesses the visual layout and organization of the resume.",
      findings: "Consider using bullet points for better readability in some sections.",
    },
    {
      pillar: "Technical Compliance & Readability",
      score: 75,
      description: "Evaluates the use of industry-specific keywords.",
      findings: "Incorporate more keywords from the job description to pass ATS scans.",
    },
  ],
  sectionAnalysis: [
    {
      sectionName: "Work Experience",
      sectionScore: 80,
      comments: "Good detail, but could use more quantifiable results."
    },
    {
      sectionName: "Education",
      sectionScore: 90,
      comments: "Well-presented, minor additions could enhance."
    },
  ],
  candidateProfile: {
    inferredExperienceLevel: "Mid-Level",
    inferredRole: "Software Engineer",
    resumeLengthAnalysis: "Optimal length for your experience level.",
  },
  recruiterGutCheck: {
    firstImpression: "The resume is well-structured but could benefit from more specific achievements.",
    redFlags: [
      "Lack of quantifiable results in work experience.",
      "Generic statements that don't highlight unique skills.",
    ],
  },
}

interface UploadedFile {
  url: string
  filename: string
  size: number
  type: string
  blobUrl: string
}

async function getAnalysis({ file, mocked }: { file: UploadedFile, mocked: boolean }): Promise<{ analysis: ResumeAnalysis, shareToken: string | null }> {
  if (mocked) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ analysis: MOCK_ANALYSIS, shareToken: "mock-share-token" })
      }, 100)
    })
  }

  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileUrl: file.blobUrl,
      filename: file.filename,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Analysis failed")
  }

  return data
}

export default function AnalysisPage() {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [shareToken, setShareToken] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const analyzeResume = async () => {
      // Get uploaded file info from sessionStorage
      const storedFile = sessionStorage.getItem("uploadedResume")
      if (!storedFile) {
        router.push("/upload")
        return
      }

      const file: UploadedFile = JSON.parse(storedFile)
      setUploadedFile(file)

      try {
        console.log("[v0] Starting PDF analysis with Gemini...")
        const isMocked = false
        const data = await getAnalysis({ file, mocked: isMocked })
        setAnalysis(data.analysis)
        setShareToken(data.shareToken)

        if (data.shareToken) {
          // window.history.replaceState({}, "", `/share/${data.shareToken}`)
        }

        console.log("[v0] Analysis completed:", data.analysis.score)
      } catch (err) {
        console.error("[v0] Analysis error:", err)
        setError(err instanceof Error ? err.message : "Analysis failed")
      } finally {
        setIsAnalyzing(false)
      }
    }

    analyzeResume()
  }, [router])

  const handleShare = async () => {
    if (!shareToken) return

    const shareUrl = `${window.location.origin}/share/${shareToken}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Resume Analysis Results",
          text: "Check out my resume analysis results",
          url: shareUrl,
        })
      } catch (err) {
        // User cancelled sharing, fallback to clipboard
        await navigator.clipboard.writeText(shareUrl)
      }
    } else {
      await navigator.clipboard.writeText(shareUrl)
      // Add toast notification for clipboard copy
    }
  }

  const handleSectionClick = (pageNumber: number, coordinates: { x: number; y: number }) => {
    console.log(`[v0] PDF section clicked - Page: ${pageNumber}, Coordinates:`, coordinates)
    // Implement section highlighting and reference functionality
  }

  if (!uploadedFile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" onClick={() => router.push("/upload")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Upload
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">Resume Analysis</h1>
              <p className="text-muted-foreground">{uploadedFile?.filename}</p>
            </div>
            {analysis && shareToken && (
              <Button onClick={handleShare} variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Share Results
              </Button>
            )}
          </div>

          {error && (
            <Card className="mb-6 border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  <div>
                    <h3 className="font-semibold">Analysis Failed</h3>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {isAnalyzing ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Analyzing Your Resume</h2>
                <p className="text-muted-foreground">
                  Our AI recruiter is reviewing your resume for formatting, content quality, and overall
                  effectiveness...
                </p>
              </CardContent>
            </Card>
          ) : analysis ? (
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
              <div className="xl:col-span-2">
                <ErrorBoundary name="PDF Viewer">
                  <PDFViewer fileUrl={uploadedFile!.blobUrl} className="sticky top-8" />
                </ErrorBoundary>
              </div>

              <div className="xl:col-span-3">
                <ErrorBoundary name="Analysis Dashboard">
                  <AnalysisDashboard analysis={analysis} />
                </ErrorBoundary>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
