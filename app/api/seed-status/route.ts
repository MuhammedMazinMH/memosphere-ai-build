/**
 * Diagnostic endpoint — temporary.
 * Returns the count of records available in each seed dataset.
 * Delete this file once seeding has been verified.
 */
import {
  subjects,
  knowledgeItems,
  graphConcepts,
  user,
  quizQuestions,
  learningIntelligence,
  examReadiness,
} from '@/db/seed'
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    subjects: subjects.length,
    // knowledgeItems is the seed export for documents
    documents: knowledgeItems.length,
    concepts: graphConcepts.length,
    // user is a single object (one seeded user)
    users: user ? 1 : 0,
    quizQuestions: quizQuestions.length,
    // learningIntelligence backs the Recommendation object — one record
    recommendations: learningIntelligence ? 1 : 0,
    examReadiness: examReadiness.length,
  })
}
