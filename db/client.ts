/**
 * Database client — Amazon DynamoDB seam.
 *
 * This module is the single place where the DynamoDB connection is created and
 * where generic, parameterized access helpers live. Repositories build on
 * these helpers; they never construct DynamoDB commands directly elsewhere.
 *
 * Authentication uses standard AWS IAM credentials from the environment
 * (AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY). The DocumentClient is
 * configured with `removeUndefinedValues: true` for ergonomic writes.
 *
 * Demo mode: when DynamoDB is not configured (see config/env `features.database`),
 * repositories fall back to the in-memory seed via `getMockTables()`, so the
 * entire application keeps working with mock/demo data and no AWS account.
 */
// NOTE: The AWS SDK is intentionally NOT imported statically here. This module
// sits in the static import graph of `"use client"` dashboard components (via
// the service -> repository chain), so any top-level `@aws-sdk/*` import would
// be bundled into the browser, bloating the client and breaking the runtime.
// Server-only AWS code is loaded lazily with dynamic `import()` inside the
// async helpers below, which only ever run on the server (API routes / scripts).
import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { env, features } from '@/config/env'
import {
  partitionKeyOf,
  sortKeyOf,
  tableName,
  type TableName,
} from '@/db/tables'
import * as seed from '@/db/seed'

/** Whether the app is currently backed by a live DynamoDB database. */
export function isDatabaseConnected(): boolean {
  return features.database()
}

let _docClient: DynamoDBDocumentClient | null = null

/**
 * Lazily creates and caches the DynamoDB DocumentClient. The AWS SDK is loaded
 * via dynamic `import()` so it never enters the browser bundle. Only invoked on
 * code paths that require a live database, so demo mode never touches AWS.
 */
export async function getDocClient(): Promise<DynamoDBDocumentClient> {
  if (!isDatabaseConnected()) {
    throw new Error(
      'DynamoDB is not connected. Set AWS_REGION, AWS_ACCESS_KEY_ID and ' +
        'AWS_SECRET_ACCESS_KEY to enable live persistence.',
    )
  }
  if (_docClient) return _docClient

  const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb')
  const { DynamoDBDocumentClient } = await import('@aws-sdk/lib-dynamodb')

  const client = new DynamoDBClient({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID as string,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY as string,
    },
  })

  _docClient = DynamoDBDocumentClient.from(client, {
    marshallOptions: { removeUndefinedValues: true },
  })
  return _docClient
}

/* -------------------------------------------------------------------------- */
/* Startup verification                                                       */
/* -------------------------------------------------------------------------- */

/** Tables required by the settings/notifications features. */
const REQUIRED_TABLES: TableName[] = ['userSettings', 'notifications']

/** Cached per-process verification promise so the check runs once per cold start. */
let _tablesVerified: Promise<void> | null = null

/**
 * Verifies that the settings/notifications tables physically exist, logging a
 * single clear, actionable error if any are missing. Runs at most once per
 * process (cached). No-op in demo mode (no AWS configured). Never throws — it
 * is purely diagnostic so callers can run it without affecting behavior.
 */
export function verifyRequiredTables(): Promise<void> {
  if (!isDatabaseConnected()) return Promise.resolve()
  if (_tablesVerified) return _tablesVerified

  _tablesVerified = (async () => {
    const client = await getDocClient()
    const { DescribeTableCommand } = await import('@aws-sdk/client-dynamodb')
    const missing: string[] = []

    for (const t of REQUIRED_TABLES) {
      const physical = tableName(t)
      try {
        await client.send(new DescribeTableCommand({ TableName: physical }))
      } catch (err) {
        if ((err as { name?: string })?.name === 'ResourceNotFoundException') {
          missing.push(physical)
        } else {
          console.error(
            `[db] Could not verify table "${physical}":`,
            (err as Error)?.message ?? err,
          )
        }
      }
    }

    if (missing.length > 0) {
      console.error(
        `[db] MISSING DynamoDB table(s): ${missing.join(', ')}. ` +
          `Settings/notifications persistence will fail until these exist. ` +
          `Create them by running: node scripts/create-tables.mjs ` +
          `(uses AWS_DYNAMODB_TABLE_PREFIX="${env.AWS_DYNAMODB_TABLE_PREFIX ?? 'memosphere_'}").`,
      )
    }
  })().catch((err) => {
    // Reset the cache on unexpected failure so a later request can retry.
    _tablesVerified = null
    console.error('[db] verifyRequiredTables failed unexpectedly:', err)
  })

  return _tablesVerified
}

/* -------------------------------------------------------------------------- */
/* Generic DynamoDB access helpers (parameterized; injection-safe)            */
/* -------------------------------------------------------------------------- */

/** Scans an entire table and returns all items. */
export async function scanAll<T>(table: TableName): Promise<T[]> {
  const client = await getDocClient()
  const { ScanCommand } = await import('@aws-sdk/lib-dynamodb')
  const items: T[] = []
  let ExclusiveStartKey: Record<string, unknown> | undefined
  do {
    const res = await client.send(
      new ScanCommand({ TableName: tableName(table), ExclusiveStartKey }),
    )
    items.push(...((res.Items ?? []) as T[]))
    ExclusiveStartKey = res.LastEvaluatedKey as
      | Record<string, unknown>
      | undefined
  } while (ExclusiveStartKey)
  return items
}

/** Gets a single item by its primary key. */
export async function getItem<T>(
  table: TableName,
  key: Record<string, unknown>,
): Promise<T | undefined> {
  const client = await getDocClient()
  const { GetCommand } = await import('@aws-sdk/lib-dynamodb')
  const res = await client.send(
    new GetCommand({ TableName: tableName(table), Key: key }),
  )
  return res.Item as T | undefined
}

/** Queries items by partition key value (optionally narrowed to a sort key). */
export async function queryByPartition<T>(
  table: TableName,
  partitionValue: unknown,
): Promise<T[]> {
  const client = await getDocClient()
  const { QueryCommand } = await import('@aws-sdk/lib-dynamodb')
  const pk = partitionKeyOf(table)
  const res = await client.send(
    new QueryCommand({
      TableName: tableName(table),
      KeyConditionExpression: '#pk = :pk',
      ExpressionAttributeNames: { '#pk': pk },
      ExpressionAttributeValues: { ':pk': partitionValue },
    }),
  )
  return (res.Items ?? []) as T[]
}

/**
 * Queries items via a Global Secondary Index by its partition key value.
 * Results are returned newest-first (`ScanIndexForward: false`), which for the
 * documents `byUser` GSI (sort key `uploadedAt`) yields the most recent first.
 * Use this for efficient per-user lookups instead of a full-table Scan.
 */
export async function queryByIndex<T>(
  table: TableName,
  indexName: string,
  indexPartitionKey: string,
  partitionValue: unknown,
): Promise<T[]> {
  const client = await getDocClient()
  const { QueryCommand } = await import('@aws-sdk/lib-dynamodb')
  const res = await client.send(
    new QueryCommand({
      TableName: tableName(table),
      IndexName: indexName,
      KeyConditionExpression: '#pk = :pk',
      ExpressionAttributeNames: { '#pk': indexPartitionKey },
      ExpressionAttributeValues: { ':pk': partitionValue },
      ScanIndexForward: false,
    }),
  )
  return (res.Items ?? []) as T[]
}

/** Puts (creates or replaces) a single item. */
export async function putItem<T extends Record<string, unknown>>(
  table: TableName,
  item: T,
): Promise<T> {
  const client = await getDocClient()
  const { PutCommand } = await import('@aws-sdk/lib-dynamodb')
  await client.send(
    new PutCommand({ TableName: tableName(table), Item: item }),
  )
  return item
}

/** Deletes a single item by its primary key. */
export async function deleteItem(
  table: TableName,
  key: Record<string, unknown>,
): Promise<void> {
  const client = await getDocClient()
  const { DeleteCommand } = await import('@aws-sdk/lib-dynamodb')
  await client.send(
    new DeleteCommand({ TableName: tableName(table), Key: key }),
  )
}

/** Builds a primary-key object from partition (and optional sort) values. */
export function buildKey(
  table: TableName,
  partitionValue: unknown,
  sortValue?: unknown,
): Record<string, unknown> {
  const key: Record<string, unknown> = {
    [partitionKeyOf(table)]: partitionValue,
  }
  const sk = sortKeyOf(table)
  if (sk && sortValue !== undefined) key[sk] = sortValue
  return key
}

/* -------------------------------------------------------------------------- */
/* Demo data source                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Returns the in-memory mock tables. Repositories use this whenever DynamoDB
 * is not connected. The shapes match types/index.ts exactly so swapping to
 * live DynamoDB items requires no changes upstream.
 */
export function getMockTables() {
  return {
    users: [seed.user],
    subjects: seed.subjects,
    documents: seed.knowledgeItems,
    activity: seed.recentActivity,
    concepts: seed.graphConcepts,
    conceptConnections: seed.graphEdges,
    quizQuestions: seed.quizQuestions,
    learningGaps: seed.learningGaps,
    examReadiness: seed.examReadiness,
    recommendations: seed.aiCoach,
    learningIntelligence: seed.learningIntelligence,
    adminStats: seed.adminStats,
    knowledgeGrowth: seed.knowledgeGrowth,
    studyActivity: seed.studyActivity,
    conceptJourney: seed.conceptJourney,
  }
}
