"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Search, FileText, Layers, BookOpen, Sparkles, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { FileTypeIcon } from "@/components/dashboard/file-type-icon"
import { PageHeader } from "@/components/dashboard/page-header"
import { documentService, subjectService, knowledgeGraphService } from "@/lib/services"

const knowledgeItems = documentService.getDocuments()
const subjects = subjectService.getSubjects()
const graphConcepts = knowledgeGraphService.getConcepts()

type ResultKind = "all" | "document" | "concept" | "subject"

type SearchResult = {
  id: string
  kind: "document" | "concept" | "subject"
  title: string
  context: string
  href: string
  badge: string
}

const suggestions = [
  "gradient descent",
  "spark rdd",
  "a* search",
  "hypothesis testing",
  "normalization",
]

export function UniversalSearchView() {
  const [query, setQuery] = useState("")
  const [kind, setKind] = useState<ResultKind>("all")

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []

    const docs: SearchResult[] = knowledgeItems
      .filter((d) => d.title.toLowerCase().includes(q) || d.excerpt.toLowerCase().includes(q) || d.subject.toLowerCase().includes(q))
      .map((d) => ({
        id: d.id,
        kind: "document",
        title: d.title,
        context: d.excerpt,
        href: `/dashboard/library/${d.id}`,
        badge: d.subject,
      }))

    const concepts: SearchResult[] = graphConcepts
      .filter((c) => c.group !== "document" && c.label.toLowerCase().includes(q))
      .map((c) => ({
        id: c.id,
        kind: "concept",
        title: c.label,
        context: `Concept linked across your knowledge graph (${c.group}).`,
        href: `/dashboard/graph`,
        badge: "Concept",
      }))

    const subs: SearchResult[] = subjects
      .filter((s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q))
      .map((s) => ({
        id: s.id,
        kind: "subject",
        title: s.name,
        context: s.description,
        href: `/dashboard/subjects/${s.id}`,
        badge: `${s.documents} docs`,
      }))

    const all = [...docs, ...concepts, ...subs]
    return kind === "all" ? all : all.filter((r) => r.kind === kind)
  }, [query, kind])

  const counts = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return { document: 0, concept: 0, subject: 0 }
    return {
      document: knowledgeItems.filter((d) => d.title.toLowerCase().includes(q) || d.excerpt.toLowerCase().includes(q)).length,
      concept: graphConcepts.filter((c) => c.group !== "document" && c.label.toLowerCase().includes(q)).length,
      subject: subjects.filter((s) => s.name.toLowerCase().includes(q)).length,
    }
  }, [query])

  const kindIcon = {
    document: FileText,
    concept: Layers,
    subject: BookOpen,
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Universal Search"
        description="Search across every document, concept, and subject in your knowledge base."
      />
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents, concepts, and subjects..."
              className="h-14 pl-12 pr-12 text-base"
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                aria-label="Clear search"
              >
                <X />
              </Button>
            )}
          </div>

          {!query && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Try:</span>
              {suggestions.map((s) => (
                <Button key={s} variant="outline" size="sm" onClick={() => setQuery(s)}>
                  <Sparkles data-icon="inline-start" />
                  {s}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {query && (
        <div className="flex flex-col gap-4">
          <ToggleGroup
            value={[kind]}
            onValueChange={(v) => v[0] && setKind(v[0] as ResultKind)}
            className="w-fit"
          >
            <ToggleGroupItem value="all">All ({results.length === 0 ? 0 : counts.document + counts.concept + counts.subject})</ToggleGroupItem>
            <ToggleGroupItem value="document">Documents ({counts.document})</ToggleGroupItem>
            <ToggleGroupItem value="concept">Concepts ({counts.concept})</ToggleGroupItem>
            <ToggleGroupItem value="subject">Subjects ({counts.subject})</ToggleGroupItem>
          </ToggleGroup>

          {results.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Search />
                </EmptyMedia>
                <EmptyTitle>No results found</EmptyTitle>
                <EmptyDescription>
                  {'Nothing matched "'}
                  {query}
                  {'". Try a different keyword or check your spelling.'}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="flex flex-col gap-3">
              {results.map((r) => {
                const Icon = kindIcon[r.kind]
                return (
                  <Card key={`${r.kind}-${r.id}`} className="transition-colors hover:border-primary/40">
                    <CardContent className="flex items-start gap-4 py-4">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        {r.kind === "document" ? (
                          <FileTypeIcon type={knowledgeItems.find((d) => d.id === r.id)?.type ?? "note"} />
                        ) : (
                          <Icon className="size-5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Link href={r.href} className="truncate font-medium hover:underline">
                            {r.title}
                          </Link>
                          <Badge variant="secondary" className="shrink-0">
                            {r.badge}
                          </Badge>
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.context}</p>
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
