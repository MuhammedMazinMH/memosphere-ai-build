"use client"

import { Sparkles, ListChecks, Lightbulb, FileText, AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Document, ExtractionStatus } from "@/types"
import { formatRelativeTime } from "@/lib/utils"
import { fileTypeLabel } from "@/components/dashboard/file-type-icon"

function NotGeneratedYet({
  icon,
  message,
  actionLabel,
}: {
  icon: React.ReactNode
  message: string
  actionLabel: string
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {icon}
        </span>
        <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
        <Button disabled>{actionLabel}</Button>
      </CardContent>
    </Card>
  )
}

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

/** Renders the real extracted document text, handling every status/empty case. */
function ContentBody({ item }: { item: Document }) {
  const status = item.extractionStatus
  const text = item.extractedText ?? ""

  if (status === "failed") {
    return (
      <div className="flex flex-col items-center gap-3 p-10 text-center text-muted-foreground">
        <AlertTriangle className="size-6 text-destructive" />
        <p className="max-w-sm text-sm">
          We couldn&apos;t extract text from this document. The file is still
          stored and available to download.
        </p>
      </div>
    )
  }

  if (status === "processing" || status === "pending") {
    return (
      <div className="flex flex-col items-center gap-3 p-10 text-center text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-primary" />
        <p className="text-sm">Extracting document text…</p>
      </div>
    )
  }

  // completed (or legacy doc with no status) but no text available
  if (!text.trim()) {
    return (
      <div className="flex flex-col items-center gap-3 p-10 text-center text-muted-foreground">
        <FileText className="size-6" />
        <p className="max-w-sm text-sm">
          No readable text was found in this document. It may be an image-based
          file or contain no selectable text.
        </p>
      </div>
    )
  }

  return (
    <div className="max-h-[70vh] overflow-auto rounded-md bg-muted/40 p-4">
      <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-foreground">
        {text}
      </pre>
    </div>
  )
}

export function DocumentDetail({ item }: { item: Document }) {
  const charCount = (item.extractedText ?? "").length

  return (
    <Tabs defaultValue="content" className="gap-6">
      <TabsList>
        <TabsTrigger value="content">
          <FileText data-icon="inline-start" />
          Content
        </TabsTrigger>
        <TabsTrigger value="summary">
          <Sparkles data-icon="inline-start" />
          Summary
        </TabsTrigger>
        <TabsTrigger value="concepts">
          <Lightbulb data-icon="inline-start" />
          Concepts
        </TabsTrigger>
        <TabsTrigger value="quiz">
          <ListChecks data-icon="inline-start" />
          Quiz
        </TabsTrigger>
      </TabsList>

      {/* Content tab — the real extracted document text (primary). */}
      <TabsContent value="content">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardContent className="p-4">
              <ContentBody item={item} />
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
                <span className="text-muted-foreground">Extracted characters</span>
                <span className="font-medium tabular-nums">
                  {charCount.toLocaleString()}
                </span>
              </div>
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

      {/* Summary tab — no AI yet. */}
      <TabsContent value="summary">
        <NotGeneratedYet
          icon={<Sparkles className="size-6" />}
          message="AI summary not generated yet."
          actionLabel="Generate Summary"
        />
      </TabsContent>

      {/* Concepts tab — no AI yet. */}
      <TabsContent value="concepts">
        <NotGeneratedYet
          icon={<Lightbulb className="size-6" />}
          message="Concept extraction not generated yet."
          actionLabel="Extract Concepts"
        />
      </TabsContent>

      {/* Quiz tab — no AI yet. */}
      <TabsContent value="quiz">
        <NotGeneratedYet
          icon={<ListChecks className="size-6" />}
          message="Quiz generation not generated yet."
          actionLabel="Generate Quiz"
        />
      </TabsContent>
    </Tabs>
  )
}
