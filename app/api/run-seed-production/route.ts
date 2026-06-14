/**
 * GET /api/run-seed-production
 *
 * Production-safe DynamoDB seeding route. Mirrors scripts/seed-dynamodb.ts but
 * runs inside the deployed Vercel environment, reading AWS credentials from the
 * deployed environment variables at request time.
 *
 * Behaviour:
 *  - Reads AWS_REGION / AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY from the
 *    runtime environment (deployed Vercel env). Does NOT depend on the v0
 *    development sandbox, where these are intentionally absent.
 *  - Writes every seed dataset into its DynamoDB table using BatchWrite (25/page).
 *  - Per-table try/catch: a failure on one table is captured and reporting
 *    continues for the rest, so you get a complete picture in one request.
 *  - Idempotent: PutRequest overwrites by primary key, safe to re-run.
 *
 * IMPORTANT: Delete this file once seeding is confirmed successful.
 */

import { NextResponse } from 'next/server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, BatchWriteCommand } from '@aws-sdk/lib-dynamodb'
import { tableName, type TableName } from '@/db/tables'
import * as seed from '@/db/seed'

// Always run on the server at request time so deployed env vars are read live.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DEMO_USER_ID = 'demo-user'

type TableResult = {
  table: string
  inserted: number
  attempted: number
  error: string | null
  errorType: string | null
}

export async function GET(request: Request) {
  // Optional `?only=subjects[,documents,...]` to seed a subset of tables. When
  // omitted, every table is seeded. Used to re-run a single table in isolation
  // without touching the others.
  const onlyParam = new URL(request.url).searchParams.get('only')
  const onlyTables = onlyParam
    ? new Set(onlyParam.split(',').map((t) => t.trim()).filter(Boolean))
    : null

  const region = process.env.AWS_REGION
  const keyId = process.env.AWS_ACCESS_KEY_ID
  const secret = process.env.AWS_SECRET_ACCESS_KEY

  if (!region || !keyId || !secret) {
    return NextResponse.json(
      {
        success: false,
        error:
          'DynamoDB credentials are not available in this runtime environment. ' +
          'This route is intended to be called on the deployed Vercel deployment.',
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

  /**
   * Writes items to a single table in batches of 25, capturing any error
   * instead of throwing, so the overall report always completes.
   */
  async function writeTable(
    table: TableName,
    items: Record<string, unknown>[],
  ): Promise<TableResult> {
    const name = tableName(table)
    const result: TableResult = {
      table: name,
      inserted: 0,
      attempted: items.length,
      error: null,
      errorType: null,
    }
    if (items.length === 0) return result
    try {
      for (let i = 0; i < items.length; i += 25) {
        const batch = items.slice(i, i + 25)
        await doc.send(
          new BatchWriteCommand({
            RequestItems: {
              [name]: batch.map((Item) => ({ PutRequest: { Item } })),
            },
          }),
        )
        result.inserted += batch.length
      }
    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error)
      result.errorType = error instanceof Error ? error.name : 'UnknownError'
    }
    return result
  }

  // Build the full set of write operations with correct key mappings, mirroring
  // scripts/seed-dynamodb.ts exactly.
  const operations: Array<[TableName, Record<string, unknown>[]]> = [
    // users (pk: id)
    ['users', [{ id: DEMO_USER_ID, ...seed.user }]],
    // subjects (pk: id)
    // NOTE: each seed subject carries an `icon` field that is a Lucide React
    // component (a forwardRef object whose `$$typeof` is a Symbol). DynamoDB's
    // marshaller cannot serialize a Symbol and throws
    // "Cannot convert a Symbol value to a string". We replace the component
    // with its string name (`iconName`) so the record is serializable. The UI
    // continues to read icons from the in-memory mock data, unaffected.
    [
      'subjects',
      (seed.subjects as Record<string, unknown>[]).map((s) => {
        const { icon, ...rest } = s as { icon?: { displayName?: string; name?: string } }
        const iconName = icon?.displayName ?? icon?.name ?? 'BookMarked'
        return { ...rest, iconName }
      }),
    ],
    // documents (pk: id)
    ['documents', seed.knowledgeItems as Record<string, unknown>[]],
    // concepts (pk: id)
    ['concepts', seed.graphConcepts as Record<string, unknown>[]],
    // knowledge graph nodes (pk: id) — same data as concepts
    ['knowledgeGraphNodes', seed.graphConcepts as Record<string, unknown>[]],
    // knowledge graph edges (pk: source, sk: target)
    ['knowledgeGraphEdges', seed.graphEdges as Record<string, unknown>[]],
    // study sessions (pk: userId, sk: date)
    [
      'studySessions',
      (seed.studyActivity as { day: string; minutes: number }[]).map((s) => ({
        userId: DEMO_USER_ID,
        date: s.day,
        minutes: s.minutes,
      })),
    ],
    // exam readiness (pk: userId, sk: subjectId)
    [
      'examReadiness',
      (seed.examReadiness as { subject: string }[]).map((e) => ({
        userId: DEMO_USER_ID,
        subjectId: e.subject,
        ...e,
      })),
    ],
    // recommendations (pk: userId) — single aggregate for the demo user
    ['recommendations', [{ userId: DEMO_USER_ID, ...seed.aiCoach }]],
    // summaries (pk: id) — none in the demo dataset
    ['summaries', []],
    // quiz attempts (pk: userId, sk: id) — none in the demo dataset
    ['quizAttempts', []],
  ]

  const results: TableResult[] = []
  for (const [table, items] of operations) {
    // Skip tables not requested when an `only` filter is supplied.
    if (onlyTables && !onlyTables.has(table)) continue
    results.push(await writeTable(table, items))
  }

  const inserted: Record<string, number> = {}
  const errors: Record<string, { error: string; errorType: string }> = {}
  let totalInserted = 0
  for (const r of results) {
    inserted[r.table] = r.inserted
    totalInserted += r.inserted
    if (r.error) errors[r.table] = { error: r.error, errorType: r.errorType ?? 'UnknownError' }
  }

  const hasErrors = Object.keys(errors).length > 0

  return NextResponse.json(
    {
      success: !hasErrors,
      totalInserted,
      inserted,
      errors: hasErrors ? errors : null,
    },
    { status: hasErrors ? 207 : 200 },
  )
}
