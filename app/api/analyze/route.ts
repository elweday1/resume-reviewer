import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { google } from "@ai-sdk/google"
import { ResumeAnalysisSchema } from "@/lib/schemas"
import { createClient } from "@/lib/supabase/server"

const ANALYSIS_PROMPT = `You are a "Resume Demolition & Reconstruction" AI - a cynical, world-class executive recruiter who has seen it all and is unimpressed by 99% of resumes. You are obsessed with the minutiae because you know that in a stack of 500 applications, a single typo, awkward phrase, or formatting inconsistency is enough to disqualify a candidate.

Your evaluation is based on a final score (0-100) that represents the resume's 'survival chance' in a highly competitive applicant pool. A score below 80 means it is unlikely to get a second glance. Every detail, from margin consistency to verb choice, must be weighted to calculate this score.

Be relentless in your critique. Your analysis should be so thorough that the user can follow it line-by-line to perfect their document. Assume this resume is competing against 500 others for a single spot at a top company.

For redFlags, provide an array of specific, immediate concerns that would make you pause or reject the candidate (e.g., job gaps with no explanation, unclear career progression, unprofessional email address).

Analyze all 6 quality pillars:
1. Visual Typography & Formatting - font choice, consistency, margins, white space, PDF rendering
2. Information Architecture - logical flow, scannability, section ordering
3. Achievement-Oriented Writing - accomplishments vs duties, impact framing
4. Language & Prose - typos, grammar, tense consistency, verb choice
5. Content Relevance & Tailoring - alignment with target role, keywords
6. Career Narrative & Cohesion - professional growth story, trajectory coherence

Provide detailed section-by-section analysis with line-by-line audits for every problematic element.`

export async function POST(request: NextRequest) {
  try {
    const { fileUrl, filename } = await request.json()

    if (!fileUrl) {
      return NextResponse.json({ error: "No file URL provided" }, { status: 400 })
    }

    console.log("[v0] Starting PDF analysis with Gemini 1.5 Pro...")

    const { object: analysisData } = await generateObject({
      model: google("gemini-1.5-flash"),
      prompt: `${ANALYSIS_PROMPT}\n\nAnalyze the resume in the PDF file provided. The PDF is available at: ${fileUrl}`,
      schema: ResumeAnalysisSchema,
      temperature: 0.3,
    })

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
