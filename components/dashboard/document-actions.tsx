"use client"

import { Download, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import type { KnowledgeItem } from "@/types"

export function DocumentActions({ item }: { item: KnowledgeItem }) {
  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : ""
    const shareData = {
      title: item.title,
      text: `Check out "${item.title}" on MemoSphere`,
      url,
    }

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch {
        // user dismissed the native share sheet — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      toast.success("Link copied to clipboard")
    } catch {
      toast.error("Couldn't share this document. Please try again.")
    }
  }

  function download() {
    const content = [
      item.title,
      "",
      `Subject: ${item.subject}`,
      `Type: ${item.type.toUpperCase()}`,
      `Size: ${item.size}`,
      `Uploaded: ${item.uploadedAt}`,
      "",
      "Summary",
      item.excerpt,
    ].join("\n")

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${item.title.replace(/\.[^.]+$/, "")}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success("Download started")
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={share}>
        <Share2 data-icon="inline-start" />
        Share
      </Button>
      <Button variant="outline" onClick={download}>
        <Download data-icon="inline-start" />
        Download
      </Button>
    </div>
  )
}
