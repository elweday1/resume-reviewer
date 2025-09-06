import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { google } from "@ai-sdk/google"
import { ResumeAnalysisSchema, type ResumeAnalysis } from "@/lib/schemas"
import { createClient } from "@/lib/supabase/server"

const MODEL_NAME = "gemini-2.0-flash"

const ANALYSIS_PROMPT = `
You are a career advisor. Your task is to review a user's resume.

Please provide a constructive critique by checking for the following:

1. Formatting and Readability
Consistency: Is the formatting (spacing, bolding, italics) consistent throughout the document? 
Clarity: Is the resume easy to read and skim, with a good balance of white space? 
Order: Are headings listed in order of importance, and is the information within each section in reverse chronological order? 

2. Language and Tone
Action Verbs: Does each bullet point begin with a strong action verb? Avoid passive language. 
Specificity: Is the language specific and fact-based rather than general or "flowery"? 
Pronouns: Are personal pronouns (like "I" or "we") avoided? 

3. Content and Impact
Demonstrate Results: Does the resume quantify or qualify accomplishments to show results, rather than just listing duties? 
Tailoring: Does the content reflect the skills and experiences an employer in the target industry would value? 
Common Mistakes: Check for the top five resume mistakes:
- Spelling and grammar errors 
- Missing email and phone number 
- Use of passive language 
- Poor organization 
- Failure to demonstrate results 

4. What to Exclude
Ensure the resume does not include: a picture, age, gender, slang, or a list of references. 
`

async function analyzeFile(pdfBase64: string): Promise<ResumeAnalysis> {
  const { object: analysisData } = await generateObject({
    model: google(MODEL_NAME),
    messages: [
      {
        role: "system" as const,
        content: ANALYSIS_PROMPT
      },
      {
        role: "user" as const,
        content: [
          {
            type: "text",
            text: "Please analyze this resume PDF according to the instructions provided.",
          },
          {
            type: "file",
            data: pdfBase64,
            mediaType: "application/pdf",
          },
        ],
      },
    ],
    schema: ResumeAnalysisSchema,
    temperature: 0.3,
  })

  return analysisData
}

export async function POST(request: NextRequest) {
  try {
    const { fileUrl, filename } = await request.json()

    if (!fileUrl) {
      return NextResponse.json({ error: "No file URL provided" }, { status: 400 })
    }

    console.log(`[v0] Starting PDF analysis with ${MODEL_NAME}...`)

    const pdfResponse = await fetch(fileUrl)
    if (!pdfResponse.ok) {
      throw new Error("Failed to fetch PDF file")
    }

    const pdfBuffer = await pdfResponse.arrayBuffer()
    const pdfBase64 = Buffer.from(pdfBuffer).toString("base64")
    const analysisData = await analyzeFile(pdfBase64)

    console.log("[v0] PDF analysis completed successfully with score:", analysisData.score)

    const supabase = createClient()

    const { data: savedAnalysis, error: dbError } = await supabase
      .from("analyses")
      .insert({
        pdf_url: fileUrl,
        pdf_filename: filename || "resume.pdf",
        analysis_data: analysisData,
      })
      .select("id, share_token")
      .single()

    if (dbError) {
      console.error("[v0] Database error:", dbError)
      // Continue without saving if DB fails
    }

    return NextResponse.json({
      analysis: analysisData,
      fileUrl,
      shareToken: savedAnalysis?.share_token,
      analysisId: savedAnalysis?.id,
    })
  } catch (error) {
    console.error("[v0] PDF analysis error:", error)

    if (error instanceof Error && error.message.includes("JSON")) {
      return NextResponse.json(
        {
          error: "The AI model failed to generate properly structured analysis. Please try again.",
          details: error.message,
          type: "StructuredResponseError",
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "PDF analysis failed",
        type: error instanceof Error ? error.constructor.name : "Unknown",
      },
      { status: 500 },
    )
  }
}
