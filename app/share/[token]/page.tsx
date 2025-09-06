"use client"

import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PDFViewer } from "@/components/pdf-viewer"
import { AnalysisDashboard } from "@/components/analysis-dashboard"
import { ErrorBoundary } from "@/components/error-boundary"
import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"
import Link from "next/link"

interface SharePageProps {
  params: Promise<{ token: string }>
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params
  const supabase = await createClient()

  // Fetch analysis by share token
  const { data: analysis, error } = await supabase.from("analyses").select("*").eq("share_token", token).single()

  if (error || !analysis) {
    notFound()
  }

  const handleSectionClick = (pageNumber: number, coordinates: { x: number; y: number }) => {
    console.log(`[v0] PDF section clicked - Page: ${pageNumber}, Coordinates:`, coordinates)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Resume Analysis</h1>
              <p className="text-muted-foreground">{analysis.pdf_filename}</p>
              <p className="text-xs text-muted-foreground">
                Analyzed on {new Date(analysis.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigator.share?.({ url: window.location.href, title: "Resume Analysis" })}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button asChild>
                <Link href="/upload">Analyze Your Resume</Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
            <div className="xl:col-span-2">
              <ErrorBoundary name="PDF Viewer">
                <PDFViewer fileUrl={analysis.pdf_url} onSectionClick={handleSectionClick} className="sticky top-8" />
              </ErrorBoundary>
            </div>

            <div className="xl:col-span-3">
              <ErrorBoundary name="Analysis Dashboard">
                <AnalysisDashboard analysis={analysis.analysis_data} />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
