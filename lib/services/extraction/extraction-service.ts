/**
 * Text-extraction service (server-only).
 *
 * Phase 1 of document intelligence: extract RAW TEXT from uploaded files and
 * nothing more. No AI, no summaries, no concepts, no quizzes.
 *
 * Currently optimized for PDF-based knowledge extraction.
 *
 * Architecture hooks exist for additional formats but they are not validated
 * for production use. Additional formats such as PPTX, MD, TXT, images, and
 * multimedia sources are planned for future releases.
 *
 * This module is reachable only from server code (the /api/upload route). The
 * heavy parsers are loaded via dynamic import() so they never reach the client
 * bundle.
 */

import type { DocumentStats } from '@/types'

export type ExtractableFormat = 'pdf' | 'pptx' | 'md' | 'txt'

export interface ExtractionResult {
  text: string
  format: ExtractableFormat
  /** Deterministic statistics computed from the extracted text. */
  stats: DocumentStats
}

/** Words-per-minute baseline used for the reading-time estimate. */
const WORDS_PER_MINUTE = 200

/**
 * Computes deterministic statistics from extracted text. No AI — pure counting.
 * `pageCount` is supplied by formats that expose it (PDF); null otherwise.
 */
export function computeStats(
  text: string,
  pageCount: number | null,
): DocumentStats {
  const trimmed = text.trim()
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0
  const readingTimeMinutes = Math.ceil(wordCount / WORDS_PER_MINUTE) || 0
  return {
    charCount: text.length,
    wordCount,
    readingTimeMinutes,
    pageCount,
  }
}

/** File extensions we can extract text from in Phase 1. */
const SUPPORTED_EXTENSIONS: ExtractableFormat[] = ['pdf', 'pptx', 'md', 'txt']

function getExtension(fileName: string): string {
  const parts = fileName.split('.')
  return parts.length > 1 ? parts.pop()!.toLowerCase() : ''
}

/**
 * Normalizes extracted text: trims trailing spaces per line, collapses runs of
 * 3+ blank lines to 2, and trims the overall result. Preserves meaningful line
 * breaks so the Content tab can render readable structure.
 */
function normalize(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/g, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Extracts text from a PDF using unpdf (pdf.js under the hood). Returns the
 * merged text plus the total page count exposed by pdf.js.
 */
async function extractPdf(
  bytes: Uint8Array,
): Promise<{ text: string; pageCount: number | null }> {
  const { extractText } = await import('unpdf')
  const { text, totalPages } = await extractText(bytes, { mergePages: true })
  const merged =
    typeof text === 'string' ? text : (text as string[]).join('\n\n')
  return {
    text: merged,
    pageCount: typeof totalPages === 'number' ? totalPages : null,
  }
}

/**
 * Extracts text from a PPTX. PPTX is a ZIP of XML parts; slide text lives in
 * `ppt/slides/slideN.xml` inside `<a:t>` runs. Slides are processed in numeric
 * order and joined with blank lines.
 */
async function extractPptx(bytes: Uint8Array): Promise<string> {
  const JSZip = (await import('jszip')).default
  const zip = await JSZip.loadAsync(bytes)

  const slidePaths = Object.keys(zip.files)
    .filter((p) => /^ppt\/slides\/slide\d+\.xml$/.test(p))
    .sort((a, b) => {
      const na = Number(a.match(/slide(\d+)\.xml$/)?.[1] ?? 0)
      const nb = Number(b.match(/slide(\d+)\.xml$/)?.[1] ?? 0)
      return na - nb
    })

  const slides: string[] = []
  for (const path of slidePaths) {
    const xml = await zip.files[path].async('string')
    // Pull the text out of every <a:t>…</a:t> run.
    const runs = [...xml.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)].map((m) =>
      decodeXmlEntities(m[1]),
    )
    const slideText = runs.join('\n').trim()
    if (slideText) slides.push(slideText)
  }

  return slides.join('\n\n')
}

/** Minimal XML entity decoding for extracted run text. */
function decodeXmlEntities(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
}

/** Decodes plain-text formats (MD / TXT) as UTF-8. */
function extractPlainText(bytes: Uint8Array): string {
  return new TextDecoder('utf-8').decode(bytes)
}

/** Whether a given filename is an extraction-supported format. */
export function isExtractable(fileName: string): boolean {
  return SUPPORTED_EXTENSIONS.includes(getExtension(fileName) as ExtractableFormat)
}

export const extractionService = {
  isExtractable,

  /**
   * Extracts raw text from file bytes based on the filename extension.
   * Throws for unsupported/legacy formats (e.g. .ppt) and on parse errors;
   * callers are expected to catch and mark extraction as failed.
   */
  async extract(
    input: ArrayBuffer | Uint8Array,
    fileName: string,
  ): Promise<ExtractionResult> {
    const bytes =
      input instanceof Uint8Array ? input : new Uint8Array(input)
    const ext = getExtension(fileName)

    let raw: string
    let format: ExtractableFormat
    let pageCount: number | null = null

    switch (ext) {
      case 'pdf': {
        format = 'pdf'
        const pdf = await extractPdf(bytes)
        raw = pdf.text
        pageCount = pdf.pageCount
        break
      }
      case 'pptx':
        format = 'pptx'
        raw = await extractPptx(bytes)
        break
      case 'md':
        format = 'md'
        raw = extractPlainText(bytes)
        break
      case 'txt':
        format = 'txt'
        raw = extractPlainText(bytes)
        break
      case 'ppt':
        throw new Error(
          'Legacy .ppt files are not supported for text extraction. Please upload a .pptx.',
        )
      default:
        throw new Error(`Unsupported file type for extraction: .${ext || 'unknown'}`)
    }

    const text = normalize(raw)
    return { text, format, stats: computeStats(text, pageCount) }
  },
}
