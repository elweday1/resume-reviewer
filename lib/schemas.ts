import { z } from "zod"

export const ANALYSIS_SYSTEM_PROMPT = `
You are an expert career strategist and senior recruiter with extensive experience navigating the modern hiring landscape.
You understand that a resume's primary purpose is to function as a strategic marketing document engineered to secure an interview.
Your expertise covers evaluating resumes for both Applicant Tracking System (ATS) compatibility and human-reviewer impact.

Your task is to provide a critical and comprehensive evaluation of a user-provided resume against a specific job description.
Your analysis must be rigorous, actionable, and grounded in established principles of resume excellence.

Structure your evaluation using the following four pillars.
For each pillar, provide a detailed assessment, identifying specific strengths and weaknesses with direct examples from the resume.`

const Pillar = z.union([
  z.literal("Strategic Alignment & Targeting").describe(`
This pillar assesses how well the resume is tailored to the specific opportunity.

Job Description Match: Evaluate the degree of tailoring. Analyze the integration of explicit keywords and skills from the job description. Does the resume seem to hit the optimal 65-80% keyword match, or does it feel generic or stuffed with keywords?

Problem-Solving Narrative: Assess whether the resume's narrative frames the candidate's experience as a direct solution to the employer's implicit needs and business challenges outlined in the job description.

Summary Statement Impact: Is the professional summary a sharp, employer-focused pitch customized for this role, or a vague, generic objective?
Relevance Curation: Has the candidate curated their experience to highlight the most relevant information and removed or minimized older, irrelevant roles to maintain focus?`
  ),
  z.literal("Technical Compliance & Readability").describe(`
This pillar evaluates the resume's ability to pass automated systems and be quickly understood by a human.

ATS Compliance: Critically check for formatting elements known to cause parsing errors. 
Penalize the use of tables, columns, graphics, images, or text placed in the document's header or footer. 
Confirm the use of a simple, single-column layout and standard, readable fonts.

Human Readability & Skimmability: Evaluate the resume for its "7-second scan" potential.
Can a reader grasp the candidate's core qualifications and most recent role immediately?
Assess the use of white space, consistent formatting, and clear visual hierarchy.
Is the most critical information positioned "above the fold"?`
  ),
  z.literal("Content Impact & Persuasion").describe(`
This pillar scrutinizes the substance of the resume's content, distinguishing between describing duties and proving value.

Accomplishment vs. Responsibility Ratio: Analyze the bullet points.
They must focus on measurable achievements, not passive descriptions of duties.

Quantification Level: Are accomplishments supported by concrete metrics? The resume must use numbers,
percentages, and dollar figures to provide evidence of scope and impact.

Action Verb Strength: Evaluate the language. It should be active and dynamic,
led by strong action verbs. Penalize weak, passive phrases like "responsible for," "duties included," or "assisted with."

Demonstration of Soft Skills: Soft skills (e.g., leadership, communication) must be demonstrated through accomplishment-oriented stories, 
not simply listed in a skills section.`),

  z.literal("Completeness & Professionalism").describe(`
This pillar is a quality control check for errors and adherence to modern professional standards.
Proofreading: Scrutinize the document for any typographical, spelling, or grammatical errors.
Such mistakes indicate a lack of attention to detail.

Contact Information: Verify that contact information is complete, professional, and correctly placed within the main body of the document, not the header.

Consistency: Check for consistent verb tense (past tense for past roles, present for current) and consistent formatting for dates, locations, and titles.

Modern Conventions: Ensure outdated elements have been removed, such as the phrase "References available upon request," personal photos (for US/UK markets), or other irrelevant personal data.
`),

])

export const SeverityLevels = ["Good", "Critical", "High", "Medium", "Low"] as const

export const Pillars = Pillar.options.map((x) => x.value)

export const QualityPillarSchema = z.object({
  pillar: Pillar.describe("Name of the quality pillar being evaluated"),
  description: z.string().describe("Brief description of what this pillar evaluates"),
  score: z.number().min(0).max(100).describe("Numerical score from 0-100 for this pillar"),
  findings: z.string().describe("Detailed findings and observations for this pillar"),
})

export const IssueSchema = z.object({
  element: z
    .string()
    .describe("The specific resume element being critiqued (e.g., 'Contact Information', 'Job Title')"),
  originalText: z.string().describe("The exact text from the resume being analyzed"),
  critique: z.string().describe("Detailed critique of why this element is problematic"),
  suggestedRevision: z.string().describe("Specific suggestion for how to improve this element"),
  reasoning: z.string().describe("Explanation of why the suggested revision is better"),
  severity: z.enum(SeverityLevels).describe("Severity level of the issue"),
  section: z.string().describe("The specific resume where this element is (e.g., 'Header', 'Education')"),
  pillar: Pillar
    .describe(
      "Which quality pillar this audit item belongs to",
    ),
})

export const SectionAnalysisSchema = z.object({
  sectionName: z.string().describe("Name of the resume section (e.g., 'Professional Experience', 'Education')"),
  sectionScore: z.number().min(0).max(100).describe("Score for this specific section from 0-100"),
  comments: z.string().describe("Overall comments and observations about this section"),
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
    .describe("Overall resume score from 0-100 based on combined pillar and section evaluations"),
  candidateProfile: CandidateProfileSchema.describe("Analysis of the candidate's profile and positioning"),
  recruiterGutCheck: RecruiterGutCheckSchema.describe("Recruiter's immediate gut reaction and red flags"),
  qualityPillarsAnalysis: z.array(QualityPillarSchema).describe("Analysis across key quality pillars"),
  sectionAnalysis: z
    .array(SectionAnalysisSchema)
    .describe("Detailed section-by-section breakdown with line-by-line audits"),
  lineByLineAudit: z
    .array(IssueSchema)
    .describe("Detailed line-by-line critique of elements in the entirety of the resume"),

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
export type Issue = z.infer<typeof IssueSchema>
export type CandidateProfile = z.infer<typeof CandidateProfileSchema>
export type RecruiterGutCheck = z.infer<typeof RecruiterGutCheckSchema>
export type UploadedResume = z.infer<typeof UploadedResumeSchema>
export type SeverityLevel = typeof SeverityLevels[number]
