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
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  QueryCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb'
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
 * Lazily creates and caches the DynamoDB DocumentClient. Only invoked on code
 * paths that require a live database, so demo mode never touches AWS.
 */
export function getDocClient(): DynamoDBDocumentClient {
  if (!isDatabaseConnected()) {
    throw new Error(
      'DynamoDB is not connected. Set AWS_REGION, AWS_ACCESS_KEY_ID and ' +
        'AWS_SECRET_ACCESS_KEY to enable live persistence.',
    )
  }
  if (_docClient) return _docClient

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
/* Generic DynamoDB access helpers (parameterized; injection-safe)            */
/* -------------------------------------------------------------------------- */

/** Scans an entire table and returns all items. */
export async function scanAll<T>(table: TableName): Promise<T[]> {
  const client = getDocClient()
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
  const client = getDocClient()
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
  const client = getDocClient()
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

/** Puts (creates or replaces) a single item. */
export async function putItem<T extends Record<string, unknown>>(
  table: TableName,
  item: T,
): Promise<T> {
  const client = getDocClient()
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
  const client = getDocClient()
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
