import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasGeminiKey: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    keyLength: process.env.GOOGLE_GENERATIVE_AI_API_KEY?.length ?? 0,
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
    aiProvider: process.env.AI_PROVIDER ?? 'not-set',
    nodeEnv: process.env.NODE_ENV,
  })
}
