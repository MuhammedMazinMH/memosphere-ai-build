"use client"

import dynamic from "next/dynamic"
import { Sparkles, ListChecks, Lightbulb, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Document } from "@/types"
import { formatRelativeTime } from "@/lib/utils"
import { fileTypeLabel } from "@/components/dashboard/file-type-icon"

// The PDF viewer must run only in the browser (canvas + pdf.js worker).
const PdfViewer = dynamic(
  () => import("@/components/dashboard/pdf-viewer").then((m) => m.PdfViewer),
  {
    ssr: false,
    loading: () => (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-10 text-center text-muted-foreground">
          <Loader2 className="size-6 animate-spin text-primary" />
          <p className="text-sm">Preparing document…</p>
        </CardContent>
      </Card>
    ),
  },
)

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

export function DocumentDetail({ item }: { item: Document }) {
  return (
    <Tabs defaultValue="content" className="gap-6">
      <TabsList>
        <TabsTrigger value="content">Content</TabsTrigger>
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

      {/* Content tab — the real document viewer (primary). */}
      <TabsContent value="content">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PdfViewer documentId={item.id} type={item.type} title={item.title} />
          </div>
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
          message="AI summary has not been generated yet."
          actionLabel="Generate Summary"
        />
      </TabsContent>

      {/* Concepts tab — no AI yet. */}
      <TabsContent value="concepts">
        <NotGeneratedYet
          icon={<Lightbulb className="size-6" />}
          message="Concept extraction has not been generated yet."
          actionLabel="Extract Concepts"
        />
      </TabsContent>

      {/* Quiz tab — no AI yet. */}
      <TabsContent value="quiz">
        <NotGeneratedYet
          icon={<ListChecks className="size-6" />}
          message="Quiz generation has not been generated yet."
          actionLabel="Generate Quiz"
        />
      </TabsContent>
    </Tabs>
  )
}
