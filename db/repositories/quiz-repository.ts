/**
 * Quiz repository — Amazon DynamoDB.
 *
 * Quiz questions are AI-generated (see lib/services/ai). Attempts are stored
 * per user in the `quizAttempts` table (partition key: userId). Synchronous
 * methods serve demo data; async methods persist/read live data.
 */
import {
  getMockTables,
  isDatabaseConnected,
  putItem,
  queryByPartition,
} from '@/db/client'
import type { QuizQuestion } from '@/types'

/** A persisted quiz attempt record. */
export interface QuizAttempt {
  id: string
  userId: string
  subjectId: string
  score: number
  total: number
  createdAt: string
}

export const quizRepository = {
  findQuestions(): QuizQuestion[] {
    return getMockTables().quizQuestions
  },

  /** Records a quiz attempt in DynamoDB (no-op in demo mode). */
  async recordAttempt(attempt: QuizAttempt): Promise<QuizAttempt> {
    if (!isDatabaseConnected()) return attempt
    return putItem('quizAttempts', { ...attempt })
  },

  /** Live read of a user's quiz attempts (Query by userId), demo: empty. */
  async findAttempts(userId: string): Promise<QuizAttempt[]> {
    if (!isDatabaseConnected()) return []
    return queryByPartition<QuizAttempt>('quizAttempts', userId)
  },
}
