import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileX } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <FileX className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <CardTitle>Analysis Not Found</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            The resume analysis you're looking for doesn't exist or may have been removed.
          </p>
          <Button asChild className="w-full">
            <Link href="/upload">Analyze Your Resume</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
