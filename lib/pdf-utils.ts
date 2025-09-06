// The analysis API now uses Gemini's native PDF processing capabilities
// This file is kept for potential future PDF utilities but text extraction is no longer needed

export async function extractTextFromPDF(pdfUrl: string): Promise<string> {
  // This function is no longer needed since we're using Gemini's native PDF processing
  // Keeping it for backward compatibility but it should not be used
  console.warn("[v0] extractTextFromPDF is deprecated - using Gemini native PDF processing instead")
  return ""
}
