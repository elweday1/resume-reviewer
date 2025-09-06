import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Target, BarChart3, Eye } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Resume <span className="text-primary">Demolition</span> & Reconstruction
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto text-pretty">
            Get ruthless, world-class feedback on your resume from our AI-powered executive recruiter. Discover what
            separates the top 1% from the rest.
          </p>
          <Link href="/upload">
            <Button size="lg" className="text-lg px-8 py-6">
              Analyze My Resume
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <FileText className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle>PDF Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Upload your resume and get detailed feedback on every section, line by line.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Target className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle>Precision Scoring</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Receive a survival score (0-100) based on real recruiter standards and expectations.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BarChart3 className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle>Quality Pillars</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Detailed analysis across 6 key areas: formatting, content, language, and more.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Eye className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle>Visual Review</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Side-by-side PDF viewer with highlighted sections for targeted improvements.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-2xl">Ready for Brutal Honesty?</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Join thousands of professionals who've transformed their resumes with our AI-powered analysis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/upload">
                <Button variant="secondary" size="lg">
                  Get Started Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
