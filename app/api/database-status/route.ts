/**
 * TEMPORARY DIAGNOSTIC ROUTE — GET /api/database-status
 *
 * Reads live data from DynamoDB using ONLY the repository `*FromDb` methods and
 * reports per-dataset counts. No mock methods are used anywhere. Delete this
 * route once connectivity has been verified.
 */
import { NextResponse } from 'next/server'
import { subjectRepository } from '@/db/repositories/subject-repository'
import { documentRepository } from '@/db/repositories/document-repository'
import { conceptRepository } from '@/db/repositories/concept-repository'
import { analyticsRepository } from '@/db/repositories/analytics-repository'
import { features } from '@/config/env'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DEMO_USER_ID = 'demo-user'

export async function GET() {
  const databaseEnabled = features.database()
  const awsRegion = process.env.AWS_REGION ?? null
  const tablePrefix = process.env.AWS_DYNAMODB_TABLE_PREFIX ?? null

  try {
    const [subjects, documents, concepts, recommendation, examReadiness] =
      await Promise.all([
        subjectRepository.findAllFromDb(),
        documentRepository.findAllFromDb(),
        conceptRepository.findAllConceptsFromDb(),
        analyticsRepository.recommendationsFromDb(DEMO_USER_ID),
        analyticsRepository.allExamReadinessFromDb(),
      ])

    return NextResponse.json({
      databaseEnabled,
      awsRegion,
      tablePrefix,
      subjectsCount: subjects.length,
      documentsCount: documents.length,
      conceptsCount: concepts.length,
      // recommendationsFromDb returns a single Recommendation object (GetItem),
      // so its presence counts as 1 record.
      recommendationsCount: recommendation ? 1 : 0,
      examReadinessCount: examReadiness.length,
      source: 'dynamodb' as const,
    })
  } catch (error) {
    return NextResponse.json(
      {
        databaseEnabled,
        error: 'DynamoDB query failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
