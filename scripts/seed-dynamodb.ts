/**
 * DynamoDB seed script.
 *
 * Loads the existing mock/demo dataset (db/seed.ts → lib/mock-data.ts) into the
 * application's DynamoDB tables, so a freshly-provisioned database mirrors the
 * demo experience exactly. Idempotent: re-running overwrites items by key.
 *
 * Usage (credentials come from the environment — see .env.example):
 *   set -a && source /vercel/share/.env.project && set +a \
 *     && npx tsx scripts/seed-dynamodb.ts
 *
 * The script only writes; it never creates tables. Provision the tables listed
 * in db/tables.ts first (names use AWS_DYNAMODB_TABLE_PREFIX).
 */
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  BatchWriteCommand,
} from '@aws-sdk/lib-dynamodb'
import { tableName, type TableName } from '../db/tables'
import * as seed from '../db/seed'

/** Demo user id used to scope per-user items in the seed dataset. */
const DEMO_USER_ID = 'demo-user'

function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing required environment variable: ${name}`)
  return v
}

const client = new DynamoDBClient({
  region: requireEnv('AWS_REGION'),
  credentials: {
    accessKeyId: requireEnv('AWS_ACCESS_KEY_ID'),
    secretAccessKey: requireEnv('AWS_SECRET_ACCESS_KEY'),
  },
})

const doc = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
})

/** Writes items to a table in batches of 25 (DynamoDB BatchWrite limit). */
async function writeAll(table: TableName, items: Record<string, unknown>[]) {
  const name = tableName(table)
  if (items.length === 0) {
    console.log(`[seed] ${name}: 0 items (skipped)`)
    return
  }
  for (let i = 0; i < items.length; i += 25) {
    const batch = items.slice(i, i + 25)
    await doc.send(
      new BatchWriteCommand({
        RequestItems: {
          [name]: batch.map((Item) => ({ PutRequest: { Item } })),
        },
      }),
    )
  }
  console.log(`[seed] ${name}: ${items.length} items`)
}

async function main() {
  // users (pk: id) — the demo user gets a stable id.
  await writeAll('users', [{ id: DEMO_USER_ID, ...seed.user }])

  // subjects (pk: id)
  await writeAll('subjects', seed.subjects as Record<string, unknown>[])

  // documents (pk: id)
  await writeAll('documents', seed.knowledgeItems as Record<string, unknown>[])

  // concepts / knowledge graph nodes (pk: id)
  await writeAll('concepts', seed.graphConcepts as Record<string, unknown>[])
  await writeAll(
    'knowledgeGraphNodes',
    seed.graphConcepts as Record<string, unknown>[],
  )

  // knowledge graph edges (pk: source, sk: target)
  await writeAll(
    'knowledgeGraphEdges',
    seed.graphEdges as Record<string, unknown>[],
  )

  // study sessions (pk: userId, sk: date) — derived from weekly study activity
  await writeAll(
    'studySessions',
    seed.studyActivity.map((s) => ({
      userId: DEMO_USER_ID,
      date: s.day,
      minutes: s.minutes,
    })),
  )

  // exam readiness (pk: userId, sk: subjectId)
  await writeAll(
    'examReadiness',
    seed.examReadiness.map((e) => ({
      userId: DEMO_USER_ID,
      subjectId: e.subject,
      ...e,
    })),
  )

  // recommendations (pk: userId) — single aggregate item for the demo user
  await writeAll('recommendations', [
    { userId: DEMO_USER_ID, ...seed.aiCoach },
  ])

  // summaries (pk: id) — none in the demo dataset; table is provisioned empty.
  await writeAll('summaries', [])

  // quiz attempts (pk: userId, sk: id) — none in the demo dataset.
  await writeAll('quizAttempts', [])

  console.log('[seed] Done.')
}

main().catch((err) => {
  console.error('[seed] Failed:', err)
  process.exit(1)
})
