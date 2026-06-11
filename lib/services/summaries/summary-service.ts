/**
 * Summary service.
 *
 * Generates document summaries through the active AI provider (Gemini by
 * default). UI code that lists summarized documents reads from the document
 * service; this service is the seam for on-demand generation.
 */
import { getAIProvider } from '@/lib/services/ai'
import type { Summary } from '@/types'
import type { SummaryRequest } from '@/lib/services/ai/ai-provider'

export const summaryService = {
  async generate(req: SummaryRequest): Promise<Summary> {
    return getAIProvider().generateSummary(req)
  },
}
