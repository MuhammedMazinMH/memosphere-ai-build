/**
 * GET /api/run-seed
 *
 * Temporary diagnostic route — runs the DynamoDB seed process once and returns
 * a report of every table written and how many items were inserted.
 *
 * IMPORTANT: Delete this file once seeding is confirmed successful.
 *
 * Safety guards:
 *  - Returns 503 immediately if AWS credentials are not present.
 *  - Uses BatchWrite with 25-item pages (DynamoDB limit).
 *  - Idempotent: PutRequest overwrites by primary key, safe to re-run.
 */

import { NextResponse } from 'next/server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, BatchWriteCommand } from '@aws-sdk/lib-dynamodb'
import { tableName, type TableName } from '@/db/tables'
import * as seed from '@/db/seed'

const DEMO_USER_ID = 'demo-user'

type InsertedCounts = Record<string, number>

export async function GET() {
  const region    = process.env.AWS_REGION
  const keyId     = process.env.AWS_ACCESS_KEY_ID
  const secret    = process.env.AWS_SECRET_ACCESS_KEY

  if (!region || !keyId || !secret) {
    return NextResponse.json(
      {
        success: false,
        error: 'DynamoDB credentials are not configured. Set AWS_REGION, AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.',
        credentialsPresent: { region: !!region, key: !!keyId, secret: !!secret },
      },
      { status: 503 },
    )
  }

  const client = new DynamoDBClient({
    region,
    credentials: { accessKeyId: keyId, secretAccessKey: secret },
  })
  const doc = DynamoDBDocumentClient.from(client, {
    marshallOptions: { removeUndefinedValues: true },
  })

  /** Writes items in batches of 25 and returns the count written. */
  async function writeAll(table: TableName, items: Record<string, unknown>[]): Promise<number> {
    if (items.length === 0) return 0
    for (let i = 0; i < items.length; i += 25) {
      const batch = items.slice(i, i + 25)
      await doc.send(
        new BatchWriteCommand({
          RequestItems: {
            [tableName(table)]: batch.map((Item) => ({ PutRequest: { Item } })),
          },
        }),
      )
    }
    return items.length
  }

  try {
    const inserted: InsertedCounts = {}

    // memosphere_users (pk: id)
    inserted[tableName('users')] = await writeAll('users', [
      { id: DEMO_USER_ID, ...seed.user },
    ])

    // memosphere_subjects (pk: id)
    inserted[tableName('subjects')] = await writeAll(
      'subjects',
      seed.subjects as Record<string, unknown>[],
    )

    // memosphere_documents (pk: id)
    inserted[tableName('documents')] = await writeAll(
      'documents',
      seed.knowledgeItems as Record<string, unknown>[],
    )

    // memosphere_concepts (pk: id)
    inserted[tableName('concepts')] = await writeAll(
      'concepts',
      seed.graphConcepts as Record<string, unknown>[],
    )

    // memosphere_knowledge_graph_nodes (pk: id) — same data as concepts
    inserted[tableName('knowledgeGraphNodes')] = await writeAll(
      'knowledgeGraphNodes',
      seed.graphConcepts as Record<string, unknown>[],
    )

    // memosphere_knowledge_graph_edges (pk: source, sk: target)
    inserted[tableName('knowledgeGraphEdges')] = await writeAll(
      'knowledgeGraphEdges',
      seed.graphEdges as Record<string, unknown>[],
    )

    // memosphere_study_sessions (pk: userId, sk: date)
    inserted[tableName('studySessions')] = await writeAll(
      'studySessions',
      (seed.studyActivity as { day: string; minutes: number }[]).map((s) => ({
        userId: DEMO_USER_ID,
        date: s.day,
        minutes: s.minutes,
      })),
    )

    // memosphere_exam_readiness (pk: userId, sk: subjectId)
    inserted[tableName('examReadiness')] = await writeAll(
      'examReadiness',
      (seed.examReadiness as { subject: string }[]).map((e) => ({
        userId: DEMO_USER_ID,
        subjectId: e.subject,
        ...e,
      })),
    )

    // memosphere_recommendations (pk: userId) — single aggregate for demo user
    inserted[tableName('recommendations')] = await writeAll('recommendations', [
      { userId: DEMO_USER_ID, ...seed.aiCoach },
    ])

    // memosphere_summaries — no seed data; table provisioned empty
    inserted[tableName('summaries')] = await writeAll('summaries', [])

    // memosphere_quiz_attempts — no seed data; table provisioned empty
    inserted[tableName('quizAttempts')] = await writeAll('quizAttempts', [])

    return NextResponse.json({ success: true, inserted })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const name    = error instanceof Error ? error.name    : 'UnknownError'
    return NextResponse.json(
      { success: false, error: message, errorType: name },
      { status: 500 },
    )
  }
}
