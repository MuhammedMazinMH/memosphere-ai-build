"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Search, Sparkles, MoreVertical, LayoutGrid, List } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import { UploadDialog } from "@/components/dashboard/upload-dialog"
import { FileTypeIcon, fileTypeLabel } from "@/components/dashboard/file-type-icon"
import { subjectService } from "@/lib/services"
import type { Document, FileType } from "@/types"
import { Upload, FileSearch } from "lucide-react"
import { cn, formatRelativeTime } from "@/lib/utils"

const subjects = subjectService.getSubjects()

const types: { value: FileType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pdf", label: "PDFs" },
  { value: "note", label: "Notes" },
  { value: "presentation", label: "Slides" },
  { value: "image", label: "Images" },
  { value: "video", label: "Videos" },
]

export function LibraryView() {
  const [query, setQuery] = useState("")
  const [type, setType] = useState<FileType | "all">("all")
  const [subject, setSubject] = useState("all")
  const [layout, setLayout] = useState("grid")
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch documents from API
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/documents")
        if (response.ok) {
          const json = await response.json()
          setDocuments(Array.isArray(json?.data) ? json.data : [])
        }
      } catch (error) {
        console.error('[v0] Failed to fetch documents:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDocuments()
  }, [])

  const filtered = useMemo(() => {
    const items = Array.isArray(documents) ? documents : []
    return items.filter((item) => {
      const matchesQuery =
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(query.toLowerCase())
      const matchesType = type === "all" || item.type === type
      const matchesSubject = subject === "all" || item.subjectId === subject
      return matchesQuery && matchesType && matchesSubject
    })
  }, [query, type, subject, documents])

  return (
    <>
      <PageHeader
        title="Knowledge Library"
        description="Every document, note, and recording in one searchable place."
      >
        <UploadDialog
          trigger={
            <Button>
              <Upload data-icon="inline-start" />
              Upload
            </Button>
          }
          onUploadComplete={() => {
            // Refresh documents after upload
            const fetchDocuments = async () => {
              try {
                const response = await fetch("/api/documents")
                if (response.ok) {
                  const json = await response.json()
                  setDocuments(Array.isArray(json?.data) ? json.data : [])
                }
              } catch (error) {
                console.error('[v0] Failed to refresh documents:', error)
              }
            }
            fetchDocuments()
          }}
        />
      </PageHeader>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search documents and content..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={subject} onValueChange={(v) => setSubject(v ?? "all")}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All subjects</SelectItem>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <ToggleGroup
            value={[layout]}
            onValueChange={(v) => v[0] && setLayout(v[0])}
            className="hidden sm:flex"
          >
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <LayoutGrid />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view">
              <List />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <ToggleGroup
        value={[type]}
        onValueChange={(v) => v[0] && setType(v[0] as FileType | "all")}
        className="flex-wrap justify-start"
      >
        {types.map((t) => (
          <ToggleGroupItem key={t.value} value={t.value} className="px-3">
            {t.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {filtered.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileSearch />
            </EmptyMedia>
            <EmptyTitle>No documents found</EmptyTitle>
            <EmptyDescription>
              Try adjusting your filters or upload a new document.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : layout === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <Link key={item.id} href={`/dashboard/library/${item.id}`} className="group block">
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <FileTypeIcon
                      type={item.type}
                      className="flex size-10 items-center justify-center rounded-xl"
                    />
                    <Button variant="ghost" size="icon-sm" aria-label="More options">
                      <MoreVertical />
                    </Button>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="line-clamp-1 font-medium leading-tight">{item.title}</h3>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{item.excerpt}</p>
                  </div>
                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
                    <Badge variant="outline">{fileTypeLabel(item.type)}</Badge>
                    <Badge variant="secondary">{item.subject}</Badge>
                    {item.summarized ? (
                      <Badge variant="secondary" className="gap-1 text-primary">
                        <Sparkles className="size-3" />
                        Summarized
                      </Badge>
                    ) : null}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{item.size}</span>
                    <span>{formatRelativeTime(item.uploadedAt)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y">
              {filtered.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/dashboard/library/${item.id}`}
                    className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50"
                  >
                    <FileTypeIcon
                      type={item.type}
                      className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                    />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-medium">{item.title}</span>
                      <span className="truncate text-sm text-muted-foreground">
                        {item.excerpt}
                      </span>
                    </div>
                    <div className="hidden items-center gap-2 sm:flex">
                      <Badge variant="secondary">{item.subject}</Badge>
                      {item.summarized ? (
                        <Sparkles className={cn("size-4 text-primary")} />
                      ) : null}
                    </div>
                    <span className="hidden w-24 text-right text-xs text-muted-foreground md:block">
                      {formatRelativeTime(item.uploadedAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </>
  )
}
