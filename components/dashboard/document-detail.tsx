"use client"

import dynamic from "next/dynamic"
import { FileText, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Document, ExtractionStatus } from "@/types"
import { formatRelativeTime } from "@/lib/utils"
import { fileTypeLabel } from "@/components/dashboard/file-type-icon"

// react-pdf relies on browser-only APIs, so load the viewer client-side only.
const DocumentViewer = dynamic(
  () => import("./document-viewer").then((m) => m.DocumentViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-primary" />
        <p className="text-sm">Loading viewer…</p>
      </div>
    ),
  },
)

function extractionLabel(status: ExtractionStatus | undefined): string {
  switch (status) {
    case "completed":
      return "Completed"
    case "processing":
      return "Processing"
    case "pending":
      return "Pending"
    case "failed":
      return "Failed"
    default:
      return "Unknown"
  }
}

function ExtractionBadge({ status }: { status: ExtractionStatus | undefined }) {
  const variant =
    status === "completed"
      ? "secondary"
      : status === "failed"
        ? "destructive"
        : "outline"
  return <Badge variant={variant}>{extractionLabel(status)}</Badge>
}

export function DocumentDetail({ item }: { item: Document }) {
  // Prefer the persisted, computed stats; fall back to a live char count for
  // legacy records that predate the statistics pipeline.
  const charCount = item.stats?.charCount ?? (item.extractedText ?? "").length
  const wordCount = item.stats?.wordCount
  const readingTime = item.stats?.readingTimeMinutes
  const pageCount = item.stats?.pageCount

  return (
    <Tabs defaultValue="content" className="gap-6">
      <TabsList>
        <TabsTrigger value="content">
          <FileText data-icon="inline-start" />
          Content
        </TabsTrigger>
      </TabsList>

      {/* Content tab — the real extracted document text (primary). */}
      <TabsContent value="content">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardContent className="p-4">
              <DocumentViewer item={item} />
            </CardContent>
          </Card>

          <Card className="h-fit">
            <CardContent className="flex flex-col gap-3 p-6 text-sm">
              <p className="text-base font-medium">Document details</p>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">File type</span>
                <span className="font-medium">{fileTypeLabel(item.type)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">File size</span>
                <span className="font-medium">{item.size}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Upload date</span>
                <span className="font-medium">
                  {formatRelativeTime(item.uploadedAt)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Extraction status</span>
                <ExtractionBadge status={item.extractionStatus} />
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Characters</span>
                <span className="font-medium tabular-nums">
                  {charCount.toLocaleString()}
                </span>
              </div>
              {wordCount !== undefined ? (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Words</span>
                  <span className="font-medium tabular-nums">
                    {wordCount.toLocaleString()}
                  </span>
                </div>
              ) : null}
              {readingTime !== undefined ? (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Reading time</span>
                  <span className="font-medium tabular-nums">
                    {readingTime === 0
                      ? "< 1 min"
                      : `${readingTime} min`}
                  </span>
                </div>
              ) : null}
              {pageCount != null ? (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Pages</span>
                  <span className="font-medium tabular-nums">{pageCount}</span>
                </div>
              ) : null}
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Document ID</span>
                <span className="max-w-40 truncate font-mono text-xs" title={item.id}>
                  {item.id}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
}
