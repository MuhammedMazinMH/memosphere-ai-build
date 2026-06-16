"use client"

import { useEffect, useRef, useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Loader2,
  FileWarning,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { FileType } from "@/types"

// Serve the pdf.js worker locally from /public (matches bundled pdfjs-dist).
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"

type LoadState = "loading-url" | "ready" | "error"

const MIN_SCALE = 0.5
const MAX_SCALE = 2.5
const SCALE_STEP = 0.25

export function PdfViewer({
  documentId,
  type,
  title,
}: {
  documentId: string
  type: FileType
  title: string
}) {
  const [url, setUrl] = useState<string | null>(null)
  const [state, setState] = useState<LoadState>("loading-url")
  const [errorMsg, setErrorMsg] = useState("")
  const [numPages, setNumPages] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch the presigned viewer URL from the server.
  useEffect(() => {
    let cancelled = false
    async function fetchUrl() {
      setState("loading-url")
      setErrorMsg("")
      try {
        const res = await fetch(`/api/documents/${documentId}/viewer-url`)
        const json = await res.json().catch(() => ({}))
        if (!res.ok || !json?.data?.url) {
          throw new Error(json?.error || "Unable to load document.")
        }
        if (!cancelled) {
          setUrl(json.data.url)
          setState("ready")
        }
      } catch (err) {
        if (!cancelled) {
          setErrorMsg(
            err instanceof Error ? err.message : "Unable to load document.",
          )
          setState("error")
        }
      }
    }
    fetchUrl()
    return () => {
      cancelled = true
    }
  }, [documentId])

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    setPageNumber(1)
  }

  function onDocumentLoadError() {
    setErrorMsg("Unable to load document.")
    setState("error")
  }

  function goPrev() {
    setPageNumber((p) => Math.max(1, p - 1))
  }
  function goNext() {
    setPageNumber((p) => Math.min(numPages, p + 1))
  }
  function zoomIn() {
    setScale((s) => Math.min(MAX_SCALE, s + SCALE_STEP))
  }
  function zoomOut() {
    setScale((s) => Math.max(MIN_SCALE, s - SCALE_STEP))
  }

  // Friendly error state.
  if (state === "error") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <FileWarning className="size-6" />
          </span>
          <div className="flex flex-col gap-1">
            <p className="font-medium">Unable to load document</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              {errorMsg ||
                "The file may have been deleted or is temporarily unavailable."}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Loading the presigned URL.
  if (state === "loading-url" || !url) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-10 text-center text-muted-foreground">
          <Loader2 className="size-6 animate-spin text-primary" />
          <p className="text-sm">Preparing document…</p>
        </CardContent>
      </Card>
    )
  }

  // Non-PDF files: render images inline, otherwise offer a download.
  if (type === "image") {
    return (
      <Card>
        <CardContent className="flex justify-center p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url || "/placeholder.svg"}
            alt={title}
            className="max-h-[70vh] w-auto rounded-lg object-contain"
          />
        </CardContent>
      </Card>
    )
  }

  if (type !== "pdf") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Download className="size-6" />
          </span>
          <div className="flex flex-col gap-1">
            <p className="font-medium">Preview not available</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              This file type can&apos;t be previewed in the browser. Download it
              to view the original.
            </p>
          </div>
          <Button render={<a href={url} target="_blank" rel="noopener noreferrer" download={title}>Download file</a>} />
        </CardContent>
      </Card>
    )
  }

  // PDF viewer with navigation, zoom, and scroll.
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/40 px-4 py-2">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={goPrev}
            disabled={pageNumber <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-24 text-center text-sm tabular-nums text-muted-foreground">
            Page {pageNumber} of {numPages || "…"}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={goNext}
            disabled={numPages > 0 && pageNumber >= numPages}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={zoomOut}
            disabled={scale <= MIN_SCALE}
            aria-label="Zoom out"
          >
            <ZoomOut className="size-4" />
          </Button>
          <span className="min-w-12 text-center text-sm tabular-nums text-muted-foreground">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={zoomIn}
            disabled={scale >= MAX_SCALE}
            aria-label="Zoom in"
          >
            <ZoomIn className="size-4" />
          </Button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="max-h-[75vh] overflow-auto bg-muted/20 p-4"
      >
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
              <Loader2 className="size-6 animate-spin text-primary" />
              <p className="text-sm">Loading PDF…</p>
            </div>
          }
          error={
            <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
              <FileWarning className="size-6 text-destructive" />
              <p className="text-sm">Unable to load document.</p>
            </div>
          }
          className="flex justify-center"
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer
            renderAnnotationLayer
            className="shadow-sm"
          />
        </Document>
      </div>
    </Card>
  )
}
