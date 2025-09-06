import { z } from "zod"

export const SeverityLevels = ["Critical", "High", "Medium", "Low"] as const

export const Pillar = z.enum([

  "Visual Typography & Formatting",
  "Information Architecture",
  "Achievement-Oriented Writing",
  "Language & Prose",
  "Content Relevance & Tailoring",
  "Career Narrative & Cohesion",
]).describe(`
Visual Typography & Formatting - font choice, consistency, margins, white space, PDF rendering
Information Architecture - logical flow, scannability, section ordering
Achievement - Oriented Writing - accomplishments vs duties, impact framing
Language & Prose - typos, grammar, tense consistency, verb choice
Content Relevance & Tailoring - alignment with target role, keywords
Career Narrative & Cohesion - professional growth story, trajectory coherence
`)

export const QualityPillarSchema = z.object({
  pillar: Pillar.describe("Name of the quality pillar being evaluated"),
  description: z.string().describe("Brief description of what this pillar evaluates"),
  score: z.number().min(0).max(100).describe("Numerical score from 0-100 for this pillar"),
  findings: z.string().describe("Detailed findings and observations for this pillar"),
})

export const LineByLineAuditSchema = z.object({
  element: z
    .string()
    .describe("The specific resume element being critiqued (e.g., 'Contact Information', 'Job Title')"),
  originalText: z.string().describe("The exact text from the resume being analyzed"),
  critique: z.string().describe("Detailed critique of why this element is problematic"),
  suggestedRevision: z.string().describe("Specific suggestion for how to improve this element"),
  reasoning: z.string().describe("Explanation of why the suggested revision is better"),
  severity: z.enum(SeverityLevels).describe("Severity level of the issue"),
  pillar: Pillar
    .describe(
      "Which quality pillar this audit item belongs to (e.g., 'Visual Typography & Formatting', 'Information Architecture', 'Achievement-Oriented Writing', 'Language & Prose', 'Content Relevance & Tailoring', 'Career Narrative & Cohesion')",
    ),
})

export const SectionAnalysisSchema = z.object({
  sectionName: z.string().describe("Name of the resume section (e.g., 'Professional Experience', 'Education')"),
  sectionScore: z.number().min(0).max(100).describe("Score for this specific section from 0-100"),
  comments: z.string().describe("Overall comments and observations about this section"),
  lineByLineAudit: z
    .array(LineByLineAuditSchema)
    .describe("Detailed line-by-line critique of elements in this section"),
})

export const CandidateProfileSchema = z.object({
  inferredExperienceLevel: z
    .string()
    .describe("Inferred experience level (e.g., 'Entry-level', 'Mid-level', 'Senior')"),
  inferredRole: z.string().describe("The role or position the candidate appears to be targeting"),
  resumeLengthAnalysis: z
    .string()
    .describe("Analysis of whether the resume length is appropriate for the candidate's experience level"),
})

export const RecruiterGutCheckSchema = z.object({
  firstImpression: z.string().describe("The recruiter's immediate first impression when viewing the resume"),
  redFlags: z
    .array(z.string())
    .describe("List of specific red flags or concerning elements that stand out immediately"),
})

export const ResumeAnalysisSchema = z.object({
  score: z
    .number()
    .min(0)
    .max(100)
    .describe("Overall resume score from 0-100 based on combined pillar evaluations"),
  candidateProfile: CandidateProfileSchema.describe("Analysis of the candidate's profile and positioning"),
  recruiterGutCheck: RecruiterGutCheckSchema.describe("Recruiter's immediate gut reaction and red flags"),
  qualityPillarsAnalysis: z.array(QualityPillarSchema).describe("Analysis across key quality pillars"),
  sectionAnalysis: z
    .array(SectionAnalysisSchema)
    .describe("Detailed section-by-section breakdown with line-by-line audits"),
})

export const UploadedResumeSchema = z.object({
  id: z.string(),
  filename: z.string(),
  uploadedAt: z.date(),
  fileUrl: z.string(),
  analysis: ResumeAnalysisSchema.optional(),
})

export type ResumeAnalysis = z.infer<typeof ResumeAnalysisSchema>
export type QualityPillar = z.infer<typeof QualityPillarSchema>
export type SectionAnalysis = z.infer<typeof SectionAnalysisSchema>
export type LineByLineAudit = z.infer<typeof LineByLineAuditSchema>
export type CandidateProfile = z.infer<typeof CandidateProfileSchema>
export type RecruiterGutCheck = z.infer<typeof RecruiterGutCheckSchema>
export type UploadedResume = z.infer<typeof UploadedResumeSchema>
export type SeverityLevel = typeof SeverityLevels[number]
