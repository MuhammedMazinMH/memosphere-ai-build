/**
 * TEMPORARY AI connectivity test endpoint.
 *
 * Performs the smallest possible live Gemini generation using the SAME
 * provider infrastructure (config/env, config/app, @ai-sdk/google + ai) that
 * SummaryService and QuizService rely on via BaseAIProvider/GeminiProvider.
 *
 * Does not expose API keys. Safe to delete after verification.
 */
import { NextResponse } from 'next/server'
import { AI_MODELS, DEFAULT_AI_PROVIDER } from '@/config/app'
import { env, features } from '@/config/env'

export async function GET() {
  const provider = DEFAULT_AI_PROVIDER

  if (!features.gemini()) {
    return NextResponse.json({
      success: false,
      response: '',
      provider,
      error: 'GOOGLE_GENERATIVE_AI_API_KEY is not configured',
    })
  }

  try {
    const { generateText } = await import('ai')
    const { createGoogleGenerativeAI } = await import('@ai-sdk/google')

    const google = createGoogleGenerativeAI({
      apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
    })
    const model = google(AI_MODELS.gemini)

    const { text } = await generateText({
      model,
      prompt: 'Reply with exactly: GEMINI_OK',
    })

    return NextResponse.json({
      success: true,
      response: text,
      provider,
      error: '',
    })
  } catch (err) {
    return NextResponse.json({
      success: false,
      response: '',
      provider,
      error: err instanceof Error ? err.message : String(err),
    })
  }
}
