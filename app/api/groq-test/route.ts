/**
 * TEMPORARY DIAGNOSTICS ROUTE.
 *
 * Verifies that the active AI provider (selected by AI_PROVIDER, e.g. Groq via
 * the OpenAI-compatible provider) is reachable through the existing AI service
 * abstraction. It does not touch Summary/Quiz/Upload/Search/Dashboard or any UI,
 * and never exposes API keys or secrets.
 *
 * Safe to delete once Groq connectivity is confirmed.
 */
import { NextResponse } from 'next/server'
import { getAIProvider } from '@/lib/services/ai'

export async function GET() {
  // Resolve the provider selected by AI_PROVIDER (defaults to gemini).
  const provider = getAIProvider()

  try {
    // Smallest call exposed by the AIProvider interface: a tiny summary whose
    // content is the connectivity prompt. When the provider is live this makes
    // a real model call and returns the model output in `.content`.
    const result = await provider.generateSummary({
      documentId: 'groq-test',
      content: 'Reply with ONLY the word CONNECTED',
    })

    return NextResponse.json({
      success: true,
      provider: provider.name,
      response: result.content,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        provider: provider.name,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
