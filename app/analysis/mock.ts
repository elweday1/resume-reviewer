import { ResumeAnalysis } from "@/lib/schemas"

const RESUME_TYPST_SOURCE = `
// Resume generated for mock analysis
#set document(author: "Alex Morgan", title: "Alex Morgan - Resume")
#set page(paper: "us-letter", margin: (x: 0.75in, y: 0.75in))
#set text(font: "Inter", size: 11pt)

#let section(title) = {
  v(1.0em, weak: true)
  text(1.1em, weight: "bold", title)
  v(0.6em, weak: true)
}

#align(center)[
  #text(1.6em, weight: "bold")[Alex Morgan]
  \\
  #link("mailto:alex.morgan@example.com") • (555) 987-6543 • #link("https://linkedin.com/in/alexmorgan")
]

#section("Professional Summary")

Product-focused Software Engineer with 6 years of experience building scalable web services and data pipelines. Skilled in TypeScript, Node.js, and distributed systems. Consistently drives product improvements through data-informed decisions and mentoring.

#section("Experience")

*Senior Software Engineer*, Orion Labs #h(1fr) *2020–Present*
- Led a cross-functional team of 5 engineers to deliver a real-time analytics feature that increased engagement by 18%.
- Designed and implemented an event-driven pipeline using Kafka and serverless functions, reducing processing time by 40%.
- Established SLOs and improved observability, cutting incident MTTR by 50%.

#v(0.8em)

*Software Engineer*, Nova Systems #h(1fr) *2017–2020*
- Built REST and GraphQL APIs used by 20k+ monthly active users.
- Implemented end-to-end testing and CI/CD which reduced production regressions by 30%.

#section("Education")

*B.S. Computer Science*, State University #h(1fr) *2013–2017*

#section("Skills")

#grid(columns: (1fr, 3fr), row-gutter: 4pt,
  [*Languages:*], [TypeScript, JavaScript, Python],
  [*Tools:*], [Node.js, Docker, Kafka, AWS, Terraform],
  [*Focus:*], [System design, observability, testing, CI/CD]
)
`
export const MOCK_ANALYSIS: ResumeAnalysis = {
    resumeTypstSource: RESUME_TYPST_SOURCE,
    score: 88,
    lineByLineAudit: [
        {
            element: "Insufficient Data in the skills section",
            reasoning: "Add more Skills",
            pillar: "Content Impact & Persuasion",
            suggestedFix: "System design, observability, testing, CI/CD, Hello World",
            originalText: "System design, observability, testing, CI/CD",
            severity: "Low",
            section: "Skills",
            critique: "Great result — ensure the metric is attributed to your contribution and add the time horizon if available.",
        },
        {
            element: "Led a cross-functional team of 5 engineers to deliver a real-time analytics feature that increased engagement by 18%.",
            reasoning: "Strong leadership + measurable impact. Keep and quantify.",
            pillar: "Content Impact & Persuasion",
            originalText: "Led a cross-functional team of 5 engineers to deliver a real-time analytics feature that increased engagement by 18%.",
            suggestedFix: "Add the measurable outcome: '...that increased engagement by 18%.'",
            severity: "Low",
            section: "Work Experience",
            critique: "Great result — ensure the metric is attributed to your contribution and add the time horizon if available.",
        },
        {
            element: "Designed and implemented an event-driven pipeline using Kafka and serverless functions, reducing processing time by 40%.",
            reasoning: "Technical achievement with clear performance gains — keep and provide brief architecture details.",
            pillar: "Technical Compliance & Readability",
            originalText: "Designed and implemented an event-driven pipeline.",
            suggestedFix: "Specify technologies used: 'Kafka, AWS Lambda, and S3' and keep the 40% reduction metric.",
            severity: "Low",
            section: "Work Experience",
            critique: "Good — consider naming the scale (events/sec) or dataset size to add context.",
        },
        {
            element: "B.S. Computer Science, State University 2013–2017",
            reasoning: "Education is fine; include honors or GPA only if it's strong and relevant.",
            pillar: "Completeness & Professionalism",
            originalText: "B.S. Computer Science, State University",
            suggestedFix: "If applicable, add 'Graduated Cum Laude' or 'GPA: 3.7/4.0'.",
            severity: "Low",
            section: "Education",
            critique: "Optional detail — only add if it strengthens your candidacy for early-career roles.",
        },
        {
            element: "Skills: TypeScript, JavaScript, Python, Node.js, Docker, Kafka, AWS, Terraform",
            reasoning: "Skills list is relevant and aligned with target roles; consider grouping by proficiency.",
            pillar: "Strategic Alignment & Targeting",
            originalText: "TypeScript, JavaScript, Python, Node.js, Docker, Kafka, AWS, Terraform",
            suggestedFix: "Group into 'Expert: TypeScript, Node.js; Familiar: Kafka, Terraform' to set expectations.",
            severity: "Low",
            section: "Skills",
            critique: "Helps recruiters quickly scan for core competencies.",
        },
    ],
    qualityPillarsAnalysis: [
        {
            pillar: "Strategic Alignment & Targeting",
            score: 91,
            description: "Measures how well content matches likely job targets and clarity of messaging.",
            findings: "Strong alignment to backend/infra roles; consider tailoring keywords for specific listings.",
        },
        {
            pillar: "Technical Compliance & Readability",
            score: 86,
            description: "Assesses layout, use of bullets, and clarity of technical descriptions.",
            findings: "Readable layout and clear bullets; add brief architecture/context for major projects.",
        },
        {
            pillar: "Content Impact & Persuasion",
            score: 84,
            description: "Evaluates how persuasive each bullet is and whether results are quantified.",
            findings: "Many bullets include metrics — focus on attribution and scale to strengthen impact.",
        },
    ],
    sectionAnalysis: [
        {
            sectionName: "Work Experience",
            sectionScore: 85,
            comments: "Strong accomplishments and metrics; add brief technical context for large projects and the timeframe for improvements."
        },
        {
            sectionName: "Education",
            sectionScore: 92,
            comments: "Solid — optionally add honors or relevant coursework for early-career roles."
        },
        {
            sectionName: "Skills & Tools",
            sectionScore: 88,
            comments: "Well-targeted; group by proficiency and remove rarely-used items to avoid dilution."
        },
    ],
    candidateProfile: {
        inferredExperienceLevel: "Mid-Level / Senior IC",
        inferredRole: "Backend / Distributed Systems Engineer",
        resumeLengthAnalysis: "Ideal length (1-2 pages) for this experience; could trim older, less relevant bullets.",
    },
    recruiterGutCheck: {
        firstImpression: "Strong candidate for backend roles; resume reads like someone with practical production experience and ownership.",
        redFlags: [
            "Some bullets lack context on scale (users, data size, time).",
            "Skills list could be better organized to indicate depth of experience.",
        ],
    },
}
