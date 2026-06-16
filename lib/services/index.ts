/**
 * Service layer barrel.
 *
 * Single import surface for the application's services. UI components and route
 * handlers should import from here (or the individual service modules) and must
 * not import db/* or db/seed directly.
 *
 * NOTE: `authService` is intentionally NOT exported here. It is server-only
 * (it imports `@clerk/nextjs/server`) and this barrel is consumed by Client
 * Components. Import it directly from
 * `@/lib/services/auth/auth-service.server` in Server Components and Route
 * Handlers only.
 */
export { subjectService } from '@/lib/services/subjects/subject-service'
export { documentService } from '@/lib/services/documents/document-service'
export { summaryService } from '@/lib/services/summaries/summary-service'
export { quizService } from '@/lib/services/quizzes/quiz-service'
export { knowledgeGraphService } from '@/lib/services/knowledge-graph/knowledge-graph-service'
export { recommendationService } from '@/lib/services/recommendations/recommendation-service'
export { learningGapService } from '@/lib/services/learning-gaps/learning-gap-service'
export { examReadinessService } from '@/lib/services/exam-readiness/exam-readiness-service'
export { analyticsService } from '@/lib/services/analytics/analytics-service'
export { s3Service } from '@/lib/services/s3-service'
export { getAIProvider } from '@/lib/services/ai'
export { extractionService } from '@/lib/services/extraction/extraction-service'
export { processingService } from '@/lib/services/processing/processing-service'
