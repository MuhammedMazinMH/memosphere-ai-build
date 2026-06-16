"use client"

import { useState, useMemo, useCallback } from "react"
import Link from "next/link"
import {
  Search,
  FileText,
  BookOpen,
  X,
  Clock,
  Loader2,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import { FileTypeIcon } from "@/components/dashboard/file-type-icon"
import {
  ProcessingStatusBadge,
  resolveProcessingStatus,
} from "@/components/dashboard/processing-status-badge"
import { PageHeader } from "@/components/dashboard/page-header"
import { formatRelativeTime } from "@/lib/utils"
import type { Document, DerivedSubject } from "@/types"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ResultKind = "all" | "document" | "subject"

interface DocumentResult {
  kind: "document"
  doc: Document
  snippet: string | null
}

interface SubjectResult {
  kind: "subject"
  subject: DerivedSubject
}

type SearchResult = DocumentResult | SubjectResult

// ---------------------------------------------------------------------------
// Snippet helpers
// ---------------------------------------------------------------------------

/** Surrounding characters to include on each side of a match. */
const SNIPPET_CONTEXT = 120

/**
 * Finds the first case-insensitive occurrence of `query` in `text` and
 * returns a ±SNIPPET_CONTEXT character window around it. Returns null if
 * `text` is empty or has no match.
 */
function extractSnippet(text: string, query: string): string | null {
  if (!text || !query) return null
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return null

  const start = Math.max(0, idx - SNIPPET_CONTEXT)
  const end = Math.min(text.length, idx + query.length + SNIPPET_CONTEXT)
  let snippet = text.slice(start, end).trim()
  if (start > 0) snippet = `\u2026${snippet}`
  if (end < text.length) snippet = `${snippet}\u2026`
  return snippet
}

/**
 * Splits `text` on `query` (case-insensitive) and returns an array of
 * alternating plain/highlighted segments ready for rendering.
 */
function splitHighlight(
  text: string,
  query: string,
): Array<{ plain: boolean; value: string }> {
  if (!query) return [{ plain: true, value: text }]
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
  return text.split(regex).map((part) => ({
    plain: part.toLowerCase() !== query.toLowerCase(),
    value: part,
  }))
}

/** Renders a text string with the matched query highlighted. */
function Highlighted({ text, query }: { text: string; query: string }) {
  const parts = splitHighlight(text, query)
  return (
    <>
      {parts.map((p, i) =>
        p.plain ? (
          <span key={i}>{p.value}</span>
        ) : (
          <mark key={i} className="rounded-sm bg-primary/20 px-0.5 text-foreground not-italic">
            {p.value}
          </mark>
        ),
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface UniversalSearchViewProps {
  documents: Document[]
  subjects: DerivedSubject[]
}

export function UniversalSearchView({
  documents,
  subjects,
}: UniversalSearchViewProps) {
  const [rawQuery, setRawQuery] = useState("")
  const [kind, setKind] = useState<ResultKind>("all")

  // Debounce: keep a separate "applied" query that lags 200 ms behind typing
  // so filtering doesn't block keystrokes on large document sets.
  const [query, setQuery] = useState("")
  const handleQueryChange = useCallback(
    (value: string) => {
      setRawQuery(value)
      // Simple timeout-based debounce. Clears on every keystroke.
      const id = setTimeout(() => setQuery(value), 200)
      return () => clearTimeout(id)
    },
    [],
  )

  const q = query.trim().toLowerCase()

  // Partition documents into "still processing" and "searchable".
  const processingDocs = useMemo(
    () =>
      documents.filter((d) => {
        const s = resolveProcessingStatus(d)
        return s === "processing" || s === "uploaded"
      }),
    [documents],
  )

  const searchableDocs = useMemo(
    () =>
      documents.filter((d) => {
        const s = resolveProcessingStatus(d)
        return s !== "processing" && s !== "uploaded"
      }),
    [documents],
  )

  // ---------------------------------------------------------------------------
  // Filter results
  // ---------------------------------------------------------------------------

  const results = useMemo<SearchResult[]>(() => {
    if (!q) return []

    const docResults: DocumentResult[] = searchableDocs
      .filter((d) => {
        const inTitle = d.title.toLowerCase().includes(q)
        const inSubject = (d.subject ?? "").toLowerCase().includes(q)
        const inType = d.type.toLowerCase().includes(q)
        const inText = (d.extractedText ?? "").toLowerCase().includes(q)
        return inTitle || inSubject || inType || inText
      })
      .map((d) => ({
        kind: "document" as const,
        doc: d,
        // Prefer a snippet from extractedText when that's where the match was.
        snippet:
          extractSnippet(d.extractedText ?? "", q) ??
          extractSnippet(d.excerpt ?? "", q),
      }))

    const subjectResults: SubjectResult[] = subjects
      .filter((s) => s.name.toLowerCase().includes(q))
      .map((s) => ({ kind: "subject" as const, subject: s }))

    const all: SearchResult[] = [...docResults, ...subjectResults]
    return kind === "all" ? all : all.filter((r) => r.kind === kind)
  }, [q, kind, searchableDocs, subjects])

  const counts = useMemo(() => {
    if (!q) return { document: 0, subject: 0 }
    return {
      document: searchableDocs.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          (d.subject ?? "").toLowerCase().includes(q) ||
          d.type.toLowerCase().includes(q) ||
          (d.extractedText ?? "").toLowerCase().includes(q),
      ).length,
      subject: subjects.filter((s) => s.name.toLowerCase().includes(q)).length,
    }
  }, [q, searchableDocs, subjects])

  // ---------------------------------------------------------------------------
  // Empty-state decisions
  // ---------------------------------------------------------------------------

  const hasNoDocuments = documents.length === 0
  const allProcessing =
    documents.length > 0 && processingDocs.length === documents.length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Universal Search"
        description="Search across every document and subject in your knowledge base."
      />

      {/* Search input */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={rawQuery}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search documents and subjects..."
              className="h-14 pl-12 pr-12 text-base"
              aria-label="Search query"
            />
            {rawQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setRawQuery("")
                  setQuery("")
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                aria-label="Clear search"
              >
                <X />
              </Button>
            )}
          </div>

          {/* Library status summary shown when not searching */}
          {!rawQuery && (
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {hasNoDocuments ? (
                <span>No documents uploaded yet. Upload documents to begin searching.</span>
              ) : (
                <>
                  <span>{documents.length} document{documents.length !== 1 ? "s" : ""} in your library</span>
                  {processingDocs.length > 0 && (
                    <Badge variant="outline" className="gap-1 text-primary">
                      <Loader2 className="size-3 animate-spin" />
                      {processingDocs.length} processing
                    </Badge>
                  )}
                  {subjects.length > 0 && (
                    <span className="text-muted-foreground/60">&middot;</span>
                  )}
                  {subjects.length > 0 && (
                    <span>{subjects.length} subject{subjects.length !== 1 ? "s" : ""}</span>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results area — only shown when there is a query */}
      {rawQuery && (
        <div className="flex flex-col gap-4">
          {/* Kind filter */}
          <div className="flex items-center justify-between gap-4">
            <ToggleGroup
              value={[kind]}
              onValueChange={(v) => v[0] && setKind(v[0] as ResultKind)}
              className="w-fit"
            >
              <ToggleGroupItem value="all">
                All ({counts.document + counts.subject})
              </ToggleGroupItem>
              <ToggleGroupItem value="document">
                Documents ({counts.document})
              </ToggleGroupItem>
              <ToggleGroupItem value="subject">
                Subjects ({counts.subject})
              </ToggleGroupItem>
            </ToggleGroup>

            {processingDocs.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {processingDocs.length} document{processingDocs.length !== 1 ? "s are" : " is"} still processing and not yet searchable.
              </p>
            )}
          </div>

          {/* No documents at all */}
          {hasNoDocuments ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileText />
                </EmptyMedia>
                <EmptyTitle>No documents yet</EmptyTitle>
                <EmptyDescription>
                  Upload documents to start building your searchable knowledge base.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : allProcessing ? (
            /* All documents are still processing */
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Loader2 className="animate-spin" />
                </EmptyMedia>
                <EmptyTitle>Documents still processing</EmptyTitle>
                <EmptyDescription>
                  Your documents are being processed. Search will become available once extraction is complete.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : results.length === 0 ? (
            /* No matches */
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Search />
                </EmptyMedia>
                <EmptyTitle>No results found</EmptyTitle>
                <EmptyDescription>
                  {`Nothing matched "${query}". Try a different keyword or check your spelling.`}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            /* Result cards */
            <div className="flex flex-col gap-3">
              {results.map((r) => {
                if (r.kind === "document") {
                  const { doc, snippet } = r
                  const status = resolveProcessingStatus(doc)
                  return (
                    <Card
                      key={`document-${doc.id}`}
                      className="transition-colors hover:border-primary/40"
                    >
                      <CardContent className="flex items-start gap-4 py-4">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <FileTypeIcon type={doc.type} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/dashboard/library/${doc.id}`}
                              className="truncate font-medium hover:underline"
                            >
                              <Highlighted text={doc.title} query={query} />
                            </Link>
                            <Badge variant="secondary" className="shrink-0">
                              <Highlighted text={doc.subject} query={query} />
                            </Badge>
                            <Badge variant="outline" className="shrink-0 uppercase text-xs">
                              {doc.type}
                            </Badge>
                            <ProcessingStatusBadge status={status} />
                          </div>
                          {snippet ? (
                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                              <Highlighted text={snippet} query={query} />
                            </p>
                          ) : (
                            status === "failed" && (
                              <p className="mt-1 text-sm text-muted-foreground">
                                Text extraction failed — file still available to view.
                              </p>
                            )
                          )}
                          {doc.uploadedAt ? (
                            <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="size-3 shrink-0" />
                              {formatRelativeTime(doc.uploadedAt)}
                            </p>
                          ) : null}
                        </div>
                      </CardContent>
                    </Card>
                  )
                }

                // Subject result
                const { subject } = r
                return (
                  <Card
                    key={`subject-${subject.id}`}
                    className="transition-colors hover:border-primary/40"
                  >
                    <CardContent className="flex items-start gap-4 py-4">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <BookOpen className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/dashboard/subjects/${subject.id}`}
                            className="truncate font-medium hover:underline"
                          >
                            <Highlighted text={subject.name} query={query} />
                          </Link>
                          <Badge variant="secondary" className="shrink-0">
                            {subject.documentCount} doc{subject.documentCount !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                        {subject.lastUpdated ? (
                          <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="size-3 shrink-0" />
                            Updated {formatRelativeTime(subject.lastUpdated)}
                          </p>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
