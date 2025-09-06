"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadResponse {
  url: string
  filename: string
  size: number
  type: string
  blobUrl: string
}

export default function UploadPage() {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const router = useRouter()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const pdfFile = files.find((file) => file.type === "application/pdf")

    if (pdfFile) {
      setSelectedFile(pdfFile)
      setUploadError(null) // Clear any previous errors when selecting new file
    } else {
      setUploadError("Please select a PDF file only") // Show error for non-PDF files
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setSelectedFile(file)
      setUploadError(null) // Clear any previous errors when selecting new file
    } else if (file) {
      setUploadError("Please select a PDF file only") // Show error for non-PDF files
    }
  }

  const triggerFileSelect = () => {
    const fileInput = document.getElementById("file-upload") as HTMLInputElement
    if (fileInput) {
      fileInput.click()
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data: UploadResponse | { error: string } = await response.json()

      if (!response.ok) {
        throw new Error("error" in data ? data.error : "Upload failed")
      }

      if ("url" in data) {
        setUploadSuccess(true)
        sessionStorage.setItem("uploadedResume", JSON.stringify(data))

        setTimeout(() => {
          router.push("/analysis")
        }, 1500)
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">Upload Your Resume</h1>
            <p className="text-muted-foreground">
              Upload your PDF resume to receive detailed analysis and feedback from our AI recruiter.
            </p>
          </div>

          <Card className="mb-6">
            <CardContent className="p-8">
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-12 text-center transition-colors",
                  isDragOver ? "border-primary bg-primary/5" : "border-border",
                  selectedFile ? "border-accent bg-accent/5" : "",
                  uploadSuccess ? "border-green-500 bg-green-50" : "",
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {uploadSuccess ? (
                  <div className="space-y-4">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                    <div>
                      <p className="font-medium text-foreground">Upload Successful!</p>
                      <p className="text-sm text-muted-foreground">Redirecting to analysis...</p>
                    </div>
                  </div>
                ) : selectedFile ? (
                  <div className="space-y-4">
                    <FileText className="w-16 h-16 text-accent mx-auto" />
                    <div>
                      <p className="font-medium text-foreground">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <Button onClick={() => setSelectedFile(null)} variant="outline" disabled={isUploading}>
                      Choose Different File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-16 h-16 text-muted-foreground mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-foreground mb-2">Drop your PDF resume here</p>
                      <p className="text-muted-foreground mb-4">or click to browse files</p>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                      />
                      <Button
                        variant="outline"
                        className="cursor-pointer bg-transparent"
                        onClick={triggerFileSelect}
                        type="button"
                      >
                        Browse Files
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {uploadError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{uploadError}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {selectedFile && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  Before You Continue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Your resume will be analyzed for formatting, content, and language quality</li>
                  <li>• The analysis typically takes 30-60 seconds to complete</li>
                  <li>• You'll receive a detailed score and actionable feedback</li>
                  <li>• Your file is processed securely and not stored permanently</li>
                </ul>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-center">
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading || uploadSuccess}
              size="lg"
              className="px-8"
            >
              {isUploading ? "Uploading..." : uploadSuccess ? "Success!" : "Start Analysis"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
