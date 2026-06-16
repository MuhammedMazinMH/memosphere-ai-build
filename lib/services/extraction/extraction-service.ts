/**
 * Text-extraction service (server-only).
 *
 * Phase 1 of document intelligence: extract RAW TEXT from uploaded files and
 * nothing more. No AI, no summaries, no concepts, no quizzes.
 *
 * Supported formats:
 *  - PDF            → unpdf (pdf.js, serverless-friendly)
 *  - PPTX           → jszip + slide XML (<a:t> runs)
 *  - MD / TXT       → UTF-8 decode
 *  - PPT (legacy)   → unsupported binary format → throws (marked failed)
 *
 * This module is reachable only from server code (the /api/upload route). The
 * heavy parsers are loaded via dynamic import() so they never reach the client
 * bundle.
 */

export type ExtractableFormat = 'pdf' | 'pptx' | 'md' | 'txt'

export interface ExtractionResult {
  text: string
  format: ExtractableFormat
  charCount: number
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

/** Extracts text from a PDF using unpdf (pdf.js under the hood). */
async function extractPdf(bytes: Uint8Array): Promise<string> {
  const { extractText } = await import('unpdf')
  const { text } = await extractText(bytes, { mergePages: true })
  return typeof text === 'string' ? text : (text as string[]).join('\n\n')
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

    switch (ext) {
      case 'pdf':
        format = 'pdf'
        raw = await extractPdf(bytes)
        break
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
    return { text, format, charCount: text.length }
  },
}
