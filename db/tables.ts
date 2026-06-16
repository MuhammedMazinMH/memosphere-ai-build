/**
 * Amazon DynamoDB table mappings.
 *
 * Defines the logical tables backing the application and their key schema.
 * Physical table names are prefixed with `AWS_DYNAMODB_TABLE_PREFIX` so a
 * single AWS account can host multiple environments (e.g. `memosphere_dev_`).
 *
 * Single-table-per-entity design is used for clarity. Each table uses a
 * String partition key (`pk`); tables that hold child collections also define
 * a sort key (`sk`) so related items can be queried together.
 */
import { env } from '@/config/env'

/** Logical table identifiers. */
export type TableName =
  | 'users'
  | 'userSettings'
  | 'notifications'
  | 'subjects'
  | 'documents'
  | 'concepts'
  | 'knowledgeGraphNodes'
  | 'knowledgeGraphEdges'
  | 'quizAttempts'
  | 'studySessions'
  | 'recommendations'
  | 'examReadiness'
  | 'summaries'

/** Global Secondary Index key schema. */
export interface GsiSchema {
  /** Index name (must match the index created in DynamoDB). */
  indexName: string
  /** Partition key attribute name for the index. */
  partitionKey: string
  /** Optional sort key attribute name for the index. */
  sortKey?: string
}

/** Key schema for a DynamoDB table. */
export interface TableSchema {
  /** Physical (unprefixed) base name. */
  base: string
  /** Partition key attribute name. */
  partitionKey: string
  /** Optional sort key attribute name. */
  sortKey?: string
  /** Optional Global Secondary Indexes. */
  gsis?: GsiSchema[]
}

/** Canonical schema for every table in the application. */
export const TABLES: Record<TableName, TableSchema> = {
  users: { base: 'users', partitionKey: 'id' },
  // One settings item per user (study goal, bio, notification preferences).
  userSettings: { base: 'user_settings', partitionKey: 'userId' },
  // Per-user notifications, sorted by their unique id.
  notifications: {
    base: 'notifications',
    partitionKey: 'userId',
    sortKey: 'id',
  },
  subjects: { base: 'subjects', partitionKey: 'id' },
  // Documents are keyed by `id`. The `byUser` GSI enables efficient per-user
  // queries (partition `userId`, sorted newest-first by numeric `uploadedAt`).
  documents: {
    base: 'documents',
    partitionKey: 'id',
    gsis: [{ indexName: 'byUser', partitionKey: 'userId', sortKey: 'uploadedAt' }],
  },
  concepts: { base: 'concepts', partitionKey: 'id' },
  knowledgeGraphNodes: { base: 'knowledge_graph_nodes', partitionKey: 'id' },
  knowledgeGraphEdges: {
    base: 'knowledge_graph_edges',
    partitionKey: 'source',
    sortKey: 'target',
  },
  quizAttempts: {
    base: 'quiz_attempts',
    partitionKey: 'userId',
    sortKey: 'id',
  },
  studySessions: {
    base: 'study_sessions',
    partitionKey: 'userId',
    sortKey: 'date',
  },
  recommendations: { base: 'recommendations', partitionKey: 'userId' },
  examReadiness: {
    base: 'exam_readiness',
    partitionKey: 'userId',
    sortKey: 'subjectId',
  },
  summaries: { base: 'summaries', partitionKey: 'id' },
}

/** Returns the prefixed physical table name for the given logical table. */
export function tableName(name: TableName): string {
  const prefix = env.AWS_DYNAMODB_TABLE_PREFIX ?? 'memosphere_'
  return `${prefix}${TABLES[name].base}`
}

/** Returns the partition key attribute for the given logical table. */
export function partitionKeyOf(name: TableName): string {
  return TABLES[name].partitionKey
}

/** Returns the sort key attribute for the given logical table (if any). */
export function sortKeyOf(name: TableName): string | undefined {
  return TABLES[name].sortKey
}

/** Returns the Global Secondary Indexes for the given logical table (if any). */
export function gsisOf(name: TableName): GsiSchema[] {
  return TABLES[name].gsis ?? []
}
