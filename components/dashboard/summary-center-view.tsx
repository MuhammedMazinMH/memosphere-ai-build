"use client"

import { useState } from "react"
import { Sparkles, Copy, Check, RefreshCw, AlignLeft, FileText } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { FileTypeIcon } from "@/components/dashboard/file-type-icon"
import type { Document } from "@/types"
import { toast } from "sonner"

type Length = "short" | "medium" | "detailed"

export function SummaryCenterView({ documents }: { documents: Document[] }) {
  const [selectedDoc, setSelectedDoc] = useState(documents[0]?.id ?? "")
  const [length, setLength] = useState<Length>("medium")
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const doc = documents.find((d) => d.id === selectedDoc)
  const hasDocuments = documents.length > 0

  async function generate() {
    if (!doc) return
    setLoading(true)
    setError(null)
    setSummary(null)
    try {
      const res = await fetch("/api/summaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: doc.id, length }),
      })
      const json = await res.json()
      if (!res.ok) {
        const message =
          json?.error ?? json?.errors?.documentId?.[0] ?? "Failed to generate summary."
        throw new Error(message)
      }
      setSummary(json.content ?? "")
      toast.success("Summary generated")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong."
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  async function copy() {
    if (!doc || !summary) return
    const text = [`${doc.title} — AI Summary`, "", summary].join("\n")
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error("Couldn't copy. Please try again.")
    }
  }

  return (
    <>
      <PageHeader
        title="Summary Center"
        description="Turn any document into concise, structured summaries with AI."
      />

      {!hasDocuments ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <FileText className="size-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg">No documents yet</CardTitle>
            <CardDescription className="max-w-sm">
              Upload a document and let it finish processing. Once text has been extracted, you can
              generate an AI summary here.
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Source</CardTitle>
              <CardDescription>Choose a document to summarize</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Select value={selectedDoc} onValueChange={(v) => v && setSelectedDoc(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a document" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {documents.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.title}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              {doc && (
                <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
                  <FileTypeIcon type={doc.type} />
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium">{doc.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {doc.subject} · {doc.size}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">Length</span>
                <ToggleGroup
                  value={[length]}
                  onValueChange={(v) => v[0] && setLength(v[0] as Length)}
                  className="w-full"
                >
                  <ToggleGroupItem value="short" className="flex-1">
                    Brief
                  </ToggleGroupItem>
                  <ToggleGroupItem value="medium" className="flex-1">
                    Standard
                  </ToggleGroupItem>
                  <ToggleGroupItem value="detailed" className="flex-1">
                    Detailed
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <Button onClick={generate} disabled={loading || !doc}>
                {loading ? (
                  <>
                    <Spinner data-icon="inline-start" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles data-icon="inline-start" />
                    Generate Summary
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-center justify-between">
              <div className="flex flex-col gap-1">
                <CardTitle>AI Summary</CardTitle>
                <CardDescription>{doc?.title ?? "Select a document"}</CardDescription>
              </div>
              {summary && !loading && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={copy}>
                    {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={generate}>
                    <RefreshCw data-icon="inline-start" />
                    Regenerate
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {loading ? (
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <p className="text-sm text-destructive">{error}</p>
                  <Button variant="outline" size="sm" onClick={generate}>
                    <RefreshCw data-icon="inline-start" />
                    Try again
                  </Button>
                </div>
              ) : summary ? (
                <section className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <AlignLeft className="size-4" />
                    Summary
                  </div>
                  <div className="flex flex-col gap-3 leading-relaxed text-pretty">
                    {summary
                      .split(/\n{2,}/)
                      .filter((p) => p.trim())
                      .map((para, i) => (
                        <p key={i}>{para.trim()}</p>
                      ))}
                  </div>
                </section>
              ) : (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                    <Sparkles className="size-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Select a document and click Generate Summary to create an AI summary from its
                    contents.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
