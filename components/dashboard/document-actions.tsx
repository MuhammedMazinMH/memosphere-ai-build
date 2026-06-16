"use client"

import { useState } from "react"
import { Download, Share2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import type { KnowledgeItem } from "@/types"

export function DocumentActions({ item }: { item: KnowledgeItem }) {
  const [downloading, setDownloading] = useState(false)

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

  async function download() {
    setDownloading(true)
    try {
      // Resolve a fresh presigned URL for the real stored file.
      const res = await fetch(`/api/documents/${item.id}/viewer-url`)
      const json = await res.json().catch(() => ({}))
      const url: string | undefined = json?.data?.url
      if (!res.ok || !url) {
        throw new Error(json?.error || "Couldn't prepare the file for download.")
      }

      const link = document.createElement("a")
      link.href = url
      link.download = item.title
      link.target = "_blank"
      link.rel = "noopener noreferrer"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success("Download started")
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Couldn't download this file.",
      )
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={share}>
        <Share2 data-icon="inline-start" />
        Share
      </Button>
      <Button variant="outline" onClick={download} disabled={downloading}>
        {downloading ? (
          <Loader2 data-icon="inline-start" className="animate-spin" />
        ) : (
          <Download data-icon="inline-start" />
        )}
        Download
      </Button>
    </div>
  )
}
