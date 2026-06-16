/**
 * Document processing workflow (server-only).
 *
 * Orchestrates the post-upload lifecycle for a document:
 *
 *   uploaded → processing → completed | failed
 *
 * Phase 1 scope: text extraction + deterministic statistics only. NO AI
 * (summaries, quizzes, embeddings, vector search, knowledge graph) — those are
 * future features that will build on the structured text this workflow stores.
 *
 * Design goals:
 *  - Reusable: a single `process()` entry point any caller (the upload route
 *    today; a re-process action or background job tomorrow) can invoke.
 *  - Resilient: extraction failures NEVER throw to the caller. The document is
 *    always preserved; only its status reflects the outcome. This guarantees a
 *    failed extraction can never break Library, Dashboard, Subjects, or the
 *    Document Viewer.
 */
import { documentService } from '@/lib/services/documents/document-service'
import { extractionService } from '@/lib/services/extraction/extraction-service'
import type { DocumentStats, ProcessingStatus } from '@/types'

export interface ProcessingResult {
  /** Terminal processing status for this run. */
  status: ProcessingStatus
  /** True when the format supported text extraction. */
  extractable: boolean
  /** Computed statistics when extraction completed; null otherwise. */
  stats: DocumentStats | null
  /** Human-readable error reason when status === 'failed'. */
  error?: string
}

/** Empty stats used for non-extractable formats (e.g. images). */
const EMPTY_STATS: DocumentStats = {
  charCount: 0,
  wordCount: 0,
  readingTimeMinutes: 0,
  pageCount: null,
}

export const processingService = {
  /**
   * Runs the full processing workflow for an already-created document using its
   * in-memory bytes. Persists status transitions and extracted output via the
   * document service. Always resolves — never rejects.
   *
   * @param documentId  The DynamoDB document id to update.
   * @param bytes       The uploaded file bytes (reused from the upload step).
   * @param fileName    Original filename, used to pick the extractor.
   */
  async process(
    documentId: string,
    bytes: ArrayBuffer | Uint8Array,
    fileName: string,
  ): Promise<ProcessingResult> {
    // Formats we cannot extract (e.g. images): mark completed with empty stats
    // so the UI never shows a perpetual "processing" state.
    if (!extractionService.isExtractable(fileName)) {
      try {
        await documentService.saveExtraction(documentId, '', EMPTY_STATS)
      } catch (error) {
        console.error('[v0] processing: mark non-extractable completed failed:', error)
      }
      return { status: 'completed', extractable: false, stats: EMPTY_STATS }
    }

    // uploaded → processing
    await documentService.markExtractionProcessing(documentId)

    try {
      // processing → completed
      const result = await extractionService.extract(bytes, fileName)
      await documentService.saveExtraction(documentId, result.text, result.stats)
      return { status: 'completed', extractable: true, stats: result.stats }
    } catch (error) {
      // processing → failed (document preserved)
      console.error('[v0] processing: extraction failed:', error)
      await documentService.markExtractionFailed(documentId)
      return {
        status: 'failed',
        extractable: true,
        stats: null,
        error: error instanceof Error ? error.message : 'Extraction failed',
      }
    }
  },
}
