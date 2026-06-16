import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import {
  ArrowLeft,
  Sparkles,
  ListChecks,
  Network,
  Lightbulb,
  Clock,
  HardDrive,
} from "lucide-react"
import { DocumentActions } from "@/components/dashboard/document-actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { FileTypeIcon, fileTypeLabel } from "@/components/dashboard/file-type-icon"
import { documentService } from "@/lib/services"
import { formatRelativeTime } from "@/lib/utils"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const item = await documentService.getDocumentById(id)
  return { title: item ? item.title : "Document" }
}

const keyConcepts = [
  "Learning rate scheduling",
  "Momentum & Nesterov acceleration",
  "Convergence criteria",
  "Local vs global minima",
  "Batch vs stochastic updates",
  "Adaptive optimizers (Adam, RMSProp)",
]

const summaryPoints = [
  "Gradient descent minimizes a cost function by iteratively moving in the direction of steepest descent.",
  "The learning rate controls step size; too high causes divergence, too low slows convergence.",
  "Stochastic gradient descent updates after each sample, trading stability for speed.",
  "Momentum accelerates convergence by accumulating a velocity vector across updates.",
  "Adaptive optimizers like Adam combine momentum with per-parameter learning rates.",
]

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const item = await documentService.getDocumentById(id)
  if (!item) notFound()

  return (
    <>
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit -ml-2 text-muted-foreground"
          render={
            <Link href="/dashboard/library">
              <ArrowLeft data-icon="inline-start" />
              Back to library
            </Link>
          }
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <FileTypeIcon
              type={item.type}
              className="flex size-12 shrink-0 items-center justify-center rounded-xl"
            />
            <div className="flex flex-col gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-balance">
                {item.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <HardDrive className="size-3.5" />
                  {item.size}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5" />
                  {formatRelativeTime(item.uploadedAt)}
                </span>
                <Badge variant="outline">{fileTypeLabel(item.type)}</Badge>
                <Badge variant="secondary">{item.subject}</Badge>
              </div>
            </div>
          </div>
          <DocumentActions item={item} />
        </div>
      </div>

      <Tabs defaultValue="summary" className="gap-6">
        <TabsList>
          <TabsTrigger value="summary">
            <Sparkles data-icon="inline-start" />
            Summary
          </TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="concepts">
            <Lightbulb data-icon="inline-start" />
            Concepts
          </TabsTrigger>
          <TabsTrigger value="quiz">
            <ListChecks data-icon="inline-start" />
            Quiz
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  AI Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.excerpt} This document provides a comprehensive walkthrough
                  of the topic, breaking down complex ideas into digestible
                  explanations with worked examples.
                </p>
                <Separator />
                <ul className="flex flex-col gap-3">
                  {summaryPoints.map((point, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <div className="flex flex-col gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quick actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <Button variant="outline" className="justify-start" render={<Link href="/dashboard/quiz"><ListChecks data-icon="inline-start" />Generate quiz</Link>} />
                  <Button variant="outline" className="justify-start" render={<Link href="/dashboard/graph"><Network data-icon="inline-start" />View in graph</Link>} />
                  <Button variant="outline" className="justify-start">
                    <Sparkles data-icon="inline-start" />
                    Regenerate summary
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Document stats</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Concepts extracted</span>
                    <span className="font-medium">{item.concepts || 14}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Reading time</span>
                    <span className="font-medium">12 min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Linked documents</span>
                    <span className="font-medium">6</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardContent className="prose-sm max-w-none p-6 text-sm leading-relaxed text-muted-foreground">
              <p className="mb-4">
                {item.excerpt}
              </p>
              <p className="mb-4">
                The full extracted text of this document would appear here, with
                preserved structure, headings, and formatting. MemoSphere parses
                each file and stores a clean, searchable representation of its
                content so you can revisit any passage instantly.
              </p>
              <p>
                Highlighted terms link directly into the knowledge graph, letting
                you jump between related concepts across every subject you study.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="concepts">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Extracted concepts</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {keyConcepts.map((c) => (
                <Badge key={c} variant="secondary" className="px-3 py-1.5 text-sm">
                  {c}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quiz">
          <Card>
            <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ListChecks className="size-6" />
              </span>
              <div className="flex flex-col gap-1">
                <p className="font-medium">Test your knowledge</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Generate an adaptive quiz from this document to reinforce what
                  you&apos;ve learned.
                </p>
              </div>
              <Button render={<Link href="/dashboard/quiz">Generate quiz</Link>} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
