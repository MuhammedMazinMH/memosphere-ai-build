/**
 * Mock seed data (single source while the database is not yet connected).
 *
 * Production note:
 * - The raw seed values currently live in `lib/mock-data.ts` (the original,
 *   verified dataset). This module re-exports them under the names the
 *   repository layer expects, so there is a single source of truth and zero
 *   data drift.
 * - Repositories (db/repositories/*) read these via db/client.ts. Once AWS
 *   Aurora PostgreSQL is connected, only the repository function bodies change
 *   to issue SQL; the data shapes (types/index.ts) stay identical.
 * - Do NOT import this file (or lib/mock-data.ts) directly from UI components.
 *   Always go through the services so the data source can be swapped
 *   transparently to Aurora later.
 */
export {
  subjects,
  knowledgeItems,
  recentActivity,
  graphConcepts,
  graphEdges,
  conceptJourney,
  quizQuestions,
  learningGaps,
  examReadiness,
  aiCoach,
  learningIntelligence,
  adminStats,
  knowledgeGrowth,
  studyActivity,
  user,
} from '@/lib/mock-data'
