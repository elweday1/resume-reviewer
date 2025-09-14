"use client"

import React, { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import { ErrorBoundary } from "@/components/error-boundary"
import { useHighlightStore } from "@/lib/stores/highlight"
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css'

function findLargestWindowFromIndexed(indexedItems: [number, string][], threshold: number) {
  if (indexedItems.length === 0) {
    return { length: 0, startIndex: -1 };
  }

  let maxStart = indexedItems[0][0];
  let maxLength = 1;

  let currentStart = indexedItems[0][0];

  for (let i = 1; i < indexedItems.length; i++) {
    const prevIndex = indexedItems[i - 1][0];
    const currentIndex = indexedItems[i][0];

    // Check if the gap between original indices is too large
    if (currentIndex - prevIndex > threshold) {
      // If so, the new window starts at the current item
      currentStart = currentIndex;
    }

    // Calculate the length of the current window based on original indices
    const currentLength = currentIndex - currentStart + 1;
    if (currentLength > maxLength) {
      maxLength = currentLength;
      maxStart = currentStart;
    }
  }

  return {
    length: maxLength,
    startIndex: maxStart,
  };
}



const PDFDocument = React.lazy(() =>
  import("react-pdf").then((module) => {
    // Set up PDF.js worker
    module.pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${module.pdfjs.version}/build/pdf.worker.js`
    return { default: module.Document }
  }),
)

const PDFPage = React.lazy(() => import("react-pdf").then((module) => ({ default: module.Page })))

type PDFViewerProps = {
  file: string | Blob
  className?: string
}


export function PDFViewer({ file, className }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)
  const [rotation, setRotation] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  const [pageContent, setPageContent] = useState<{ items: { str: string }[] }>({ items: [] });
  const highlighted = useHighlightStore((s) => s.highlightedText)

  const textRenderer = useCallback(
    (textItem: { str: string, itemIndex: number },) => {
      const matches = pageContent.items.map((item, subtextIndex) => {
        const subtext = item.str;
        if (subtext && subtext !== " " && highlighted.includes(subtext))
          return [subtextIndex, subtext] as const;
      }).filter(
        (item): item is [number, string] => !!item
      )
      const { length, startIndex } = findLargestWindowFromIndexed(matches, 20)
      let newText = textItem.str;
      matches.forEach(([matchIdx, matchStr]) => {
        if ((startIndex <= matchIdx) && (matchIdx <= startIndex + length) && (matchIdx === textItem.itemIndex)) {
          newText = newText.replace(matchStr, (value) => `<mark>${value}</mark>`)
        }
      })
      return newText
    },
    [highlighted, pageContent]
  );

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    console.log("[v0] PDF loaded successfully with", numPages, "pages")
    setNumPages(numPages)
    setIsLoading(false)
    setError(null)
  }, [])

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error("[v0] PDF load error:", error)
    setError("Failed to load PDF document")
    setIsLoading(false)
  }, [])

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1))
  }

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages))
  }

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3.0))
  }

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5))
  }

  const rotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const handlePageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    console.log("[v0] PDF clicked at coordinates:", { x, y, page: pageNumber })
  }

  const downloadPDF = () => {
    const link = document.createElement("a")
    link.href = file
    link.download = "resume.pdf"
    link.click()
  }

  if (!isMounted) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle>PDF Viewer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">PDF Viewer</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={downloadPDF}>
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={rotate}>
              <RotateCw className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={zoomOut} disabled={scale <= 0.5}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground min-w-[60px] text-center">{Math.round(scale * 100)}%</span>
            <Button variant="outline" size="sm" onClick={zoomIn} disabled={scale >= 3.0}>
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="flex items-center justify-center h-96 text-red-600">
            <p>{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <ErrorBoundary name="PDF Document">
              <div className="border rounded-lg overflow-hidden bg-gray-50">
                <div
                  className="flex justify-center p-4 overflow-auto max-h-[600px] cursor-crosshair"
                  onClick={handlePageClick}
                >
                  <React.Suspense
                    fallback={
                      <div className="flex items-center justify-center h-96">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    }
                  >
                    <ErrorBoundary name="PDF Renderer">
                      <PDFDocument
                        file={file}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={onDocumentLoadError}
                        loading={
                          <div className="flex items-center justify-center h-96">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        }
                      >
                        <PDFPage
                          customTextRenderer={textRenderer}
                          pageNumber={pageNumber}
                          scale={scale}
                          rotate={rotation}
                          onLoadSuccess={(page) => {
                            page.getTextContent({
                              includeMarkedContent: true,
                              disableNormalization: true
                            }).then((content) => {
                              setPageContent(content)
                            })
                          }}
                          renderTextLayer={true}
                          renderAnnotationLayer={true}
                          className="shadow-lg"
                        />
                      </PDFDocument>
                    </ErrorBoundary>
                  </React.Suspense>
                </div>
              </div>
            </ErrorBoundary>

            {/* Navigation Controls */}
            {numPages > 0 && (
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={goToPrevPage}
                  disabled={pageNumber <= 1}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Page {pageNumber} of {numPages}
                  </span>
                </div>

                <Button
                  variant="outline"
                  onClick={goToNextPage}
                  disabled={pageNumber >= numPages}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
