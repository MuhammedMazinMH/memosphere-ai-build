'use client'

import { useEffect, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, AlertTriangle, Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Document as DocumentType } from '@/types'
import ReactMarkdown from 'react-markdown'

// Configure the pdf.js worker on the client only. The CDN URL is pinned to the
// exact pdfjs-dist version bundled with react-pdf, so it always matches in
// production. Guarded by `typeof window` to prevent SSR crashes.
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
}

interface DocumentViewerProps {
  item: DocumentType
}

/**
 * Determine file type from the document title (file extension).
 */
function getFileCategory(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  if (ext === 'pdf') return 'pdf'
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image'
  if (ext === 'md') return 'markdown'
  if (ext === 'txt') return 'text'
  if (['pptx', 'ppt'].includes(ext)) return 'powerpoint'
  return 'unsupported'
}

export function DocumentViewer({ item }: DocumentViewerProps) {
  const [viewerUrl, setViewerUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // PDF state
  const [numPages, setNumPages] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(100)

  // Image state
  const [imageError, setImageError] = useState(false)

  // Markdown/text state
  const [textContent, setTextContent] = useState<string>('')

  useEffect(() => {
    async function fetchViewerUrl() {
      try {
        const res = await fetch(`/api/documents/${item.id}/viewer-url`)
        const json = await res.json()
        if (!res.ok || !json?.data?.url) {
          throw new Error(json?.error || 'Unable to generate document URL')
        }
        setViewerUrl(json.data.url)
        setError(null)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load document URL',
        )
      } finally {
        setLoading(false)
      }
    }

    const fileCategory = getFileCategory(item.title)

    if (['pdf', 'image', 'powerpoint'].includes(fileCategory)) {
      fetchViewerUrl()
    } else if (['markdown', 'text'].includes(fileCategory)) {
      // For text/markdown, use extracted text (if available)
      if (item.extractedText) {
        setTextContent(item.extractedText)
        setLoading(false)
      } else if (item.extractionStatus === 'completed') {
        setTextContent('')
        setLoading(false)
      } else {
        setLoading(true)
      }
    } else {
      setLoading(false)
    }
  }, [item])

  const fileCategory = getFileCategory(item.title)

  // === PDF Viewer ===
  if (fileCategory === 'pdf') {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center gap-2 py-20">
          <Loader2 className="size-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading PDF…</p>
        </div>
      )
    }

    if (error || !viewerUrl) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <AlertTriangle className="size-6 text-destructive" />
          <p className="max-w-sm text-sm text-muted-foreground">{error || 'Unable to preview this document.'}</p>
          {viewerUrl && (
            <Button variant="outline" size="sm" onClick={() => window.open(viewerUrl, '_blank')}>
              <Download className="mr-2 size-4" />
              Download
            </Button>
          )}
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-4">
        {/* PDF Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-muted p-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-sm font-medium">
              {currentPage} {numPages && `of ${numPages}`}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(numPages || currentPage + 1, currentPage + 1))}
              disabled={!numPages || currentPage >= numPages}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.max(50, zoom - 25))}
              disabled={zoom <= 50}
            >
              <ZoomOut className="size-4" />
            </Button>
            <span className="w-12 text-center text-sm font-medium">{zoom}%</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.min(250, zoom + 25))}
              disabled={zoom >= 250}
            >
              <ZoomIn className="size-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => viewerUrl && window.open(viewerUrl, '_blank')}
          >
            <Download className="size-4" />
          </Button>
        </div>

        {/* PDF Canvas */}
        <div className="max-h-[70vh] overflow-auto rounded-md bg-muted/40 p-4">
          <Document file={viewerUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
            <Page
              pageNumber={currentPage}
              scale={zoom / 100}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        </div>
      </div>
    )
  }

  // === Image Viewer ===
  if (fileCategory === 'image') {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center gap-2 py-20">
          <Loader2 className="size-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading image…</p>
        </div>
      )
    }

    if (error || !viewerUrl) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <AlertTriangle className="size-6 text-destructive" />
          <p className="max-w-sm text-sm text-muted-foreground">Unable to preview this image.</p>
          {viewerUrl && (
            <Button variant="outline" size="sm" onClick={() => window.open(viewerUrl, '_blank')}>
              <Download className="mr-2 size-4" />
              Download
            </Button>
          )}
        </div>
      )
    }

    return (
      <div className="flex justify-center rounded-md bg-muted/40 p-4">
        {!imageError ? (
          <img
            src={viewerUrl}
            alt={item.title}
            className="max-h-[70vh] w-auto object-contain"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <AlertTriangle className="size-6 text-destructive" />
            <p className="text-sm text-muted-foreground">Unable to display this image.</p>
          </div>
        )}
      </div>
    )
  }

  // === Markdown Viewer ===
  if (fileCategory === 'markdown') {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center gap-2 py-20">
          <Loader2 className="size-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading markdown…</p>
        </div>
      )
    }

    if (!textContent.trim()) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <AlertTriangle className="size-6" />
          <p className="text-sm text-muted-foreground">No content found in this markdown file.</p>
        </div>
      )
    }

    return (
      <div className="prose prose-sm dark:prose-invert max-h-[70vh] w-full overflow-auto rounded-md bg-muted/40 p-4">
        <ReactMarkdown>{textContent}</ReactMarkdown>
      </div>
    )
  }

  // === Text Viewer ===
  if (fileCategory === 'text') {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center gap-2 py-20">
          <Loader2 className="size-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading text…</p>
        </div>
      )
    }

    if (!textContent.trim()) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <AlertTriangle className="size-6" />
          <p className="text-sm text-muted-foreground">No content found in this text file.</p>
        </div>
      )
    }

    return (
      <div className="max-h-[70vh] overflow-auto rounded-md bg-muted/40 p-4">
        <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-foreground">
          {textContent}
        </pre>
      </div>
    )
  }

  // === PowerPoint Placeholder ===
  if (fileCategory === 'powerpoint') {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center gap-2 py-20">
          <Loader2 className="size-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading presentation…</p>
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <p className="text-sm text-muted-foreground">Preview support coming soon. Download to view.</p>
        {viewerUrl && (
          <Button variant="outline" onClick={() => window.open(viewerUrl, '_blank')}>
            <Download className="mr-2 size-4" />
            Download
          </Button>
        )}
      </div>
    )
  }

  // === Fallback for unsupported types ===
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <AlertTriangle className="size-6 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Unable to preview this file type.</p>
      {viewerUrl && (
        <Button variant="outline" onClick={() => window.open(viewerUrl, '_blank')}>
          <Download className="mr-2 size-4" />
          Download
        </Button>
      )}
    </div>
  )
}
