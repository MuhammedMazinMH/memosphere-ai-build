/**
 * Quiz service.
 *
 * Provides quiz questions (read) and AI-generated quizzes (via the active AI
 * provider). The dashboard quiz generator reads questions synchronously today.
 */
import { quizRepository } from '@/db/repositories/quiz-repository'
import { getAIProvider } from '@/lib/services/ai'
import type { QuizQuestion } from '@/types'
import type { QuizRequest } from '@/lib/services/ai/ai-provider'

export const quizService = {
  getQuestions(): QuizQuestion[] {
    return quizRepository.findQuestions()
  },
  async generate(req: QuizRequest): Promise<QuizQuestion[]> {
    return getAIProvider().generateQuiz(req)
  },
}
