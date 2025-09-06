"use client"

import { Button } from "@/components/ui/button"
import { Share2, Copy } from "lucide-react"
import { useState } from "react"

export function ShareControls() {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          url: window.location.href,
          title: "Resume Analysis",
        })
      } catch (error) {
        // Fallback to clipboard
        handleCopyLink()
      }
    } else {
      handleCopyLink()
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("[v0] Failed to copy link:", error)
    }
  }

  return (
    <Button variant="outline" onClick={handleShare}>
      {copied ? <Copy className="w-4 h-4 mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
      {copied ? "Copied!" : "Share"}
    </Button>
  )
}
