"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import type { ResumeAnalysis } from "@/lib/schemas"
import { extractTextFromPDF } from "@/lib/pdf-utils"
import { PDFViewer } from "@/components/pdf-viewer"
import { AnalysisDashboard } from "@/components/analysis-dashboard"
import { ErrorBoundary } from "@/components/error-boundary"

interface UploadedFile {
  url: string
  filename: string
  size: number
  type: string
  blobUrl: string
}

export default function AnalysisPage() {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)
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
        console.log("[v0] Starting analysis process...")

        // Extract text from PDF
        const resumeText = await extractTextFromPDF(file.blobUrl)

        // Send to analysis API
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resumeText,
            fileUrl: file.blobUrl,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Analysis failed")
        }

        setAnalysis(data.analysis)
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

  const handleSectionClick = (pageNumber: number, coordinates: { x: number; y: number }) => {
    console.log(`[v0] PDF section clicked - Page: ${pageNumber}, Coordinates:`, coordinates)
    // TODO: Implement section highlighting and reference functionality
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
            <div>
              <h1 className="text-2xl font-bold text-foreground">Resume Analysis</h1>
              <p className="text-muted-foreground">{uploadedFile.filename}</p>
            </div>
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
                  <PDFViewer
                    fileUrl={uploadedFile.blobUrl}
                    onSectionClick={handleSectionClick}
                    className="sticky top-8"
                  />
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
