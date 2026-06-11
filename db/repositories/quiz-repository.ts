/**
 * Quiz repository.
 *
 * Production note:
 * - Quiz questions are AI-generated (see lib/services/ai) and persisted in
 *   Aurora. Attempts are stored per user.
 */
import { getMockTables } from '@/db/client'
import type { QuizQuestion } from '@/types'

export const quizRepository = {
  findQuestions(): QuizQuestion[] {
    // TODO(aurora): SELECT * FROM quiz_questions WHERE quiz_id = $1
    return getMockTables().quizQuestions
  },
}
