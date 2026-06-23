/**
 * Document repository (knowledge items) — Amazon DynamoDB.
 *
 * Document bytes live in Amazon S3 (see lib/services/s3-service.ts); this
 * repository stores/returns only metadata items. There is NO mock/seed data:
 * synchronous methods return empty/zero values; async `*FromDb` methods read
 * from DynamoDB (table: `documents`) and fall back to empty on absence/error.
 */
import {
  isDatabaseConnected,
  scanAll,
  getItem,
  buildKey,
  queryByIndex,
  putItem,
} from '@/db/client'
import { gsisOf } from '@/db/tables'
import type { Document } from '@/types'

export const documentRepository = {
  findAll(): Document[] {
    return []
  },

  findById(_id: string): Document | undefined {
    return undefined
  },

  findBySubject(_subjectId: string): Document[] {
    return []
  },

  count(): number {
    return 0
  },

  /** Live read of all documents from DynamoDB (Scan); empty otherwise. */
  async findAllFromDb(): Promise<Document[]> {
    if (!isDatabaseConnected()) return []
    return scanAll<Document>('documents')
  },

  /** Live read of a single document from DynamoDB (GetItem); undefined otherwise. */
  async findByIdFromDb(id: string): Promise<Document | undefined> {
    if (!isDatabaseConnected()) return undefined
    return getItem<Document>('documents', buildKey('documents', id))
  },

  /** Live read of documents for a subject (Scan + filter); empty otherwise. */
  async findBySubjectFromDb(subjectId: string): Promise<Document[]> {
    if (!isDatabaseConnected()) return []
    const all = await scanAll<Document>('documents')
    return all.filter((d) => d.subjectId === subjectId)
  },

  /**
   * Live read of a user's documents via the `byUser` GSI (Query, newest-first).
   * Efficient per-user lookup — no full-table Scan. Empty when no DB.
   */
  async findByUserFromDb(userId: string): Promise<Document[]> {
    if (!isDatabaseConnected()) return []
    const [byUser] = gsisOf('documents')
    return queryByIndex<Document>(
      'documents',
      byUser.indexName,
      byUser.partitionKey,
      userId,
    )
  },

  /** Creates and persists a document to DynamoDB, returns the created item. */
  async create(document: Document): Promise<Document> {
    if (!isDatabaseConnected()) throw new Error('Database not connected')
    await putItem('documents', document as unknown as Record<string, unknown>)
    return document
  },

  /**
   * Merges a partial update into an existing document and persists it.
   * Reads the current item, applies the patch, and re-puts (full-item write).
   * Returns the updated document, or undefined if it no longer exists.
   */
  async update(
    id: string,
    patch: Partial<Document>,
  ): Promise<Document | undefined> {
    if (!isDatabaseConnected()) throw new Error('Database not connected')
    const existing = await getItem<Document>(
      'documents',
      buildKey('documents', id),
    )
    if (!existing) return undefined
    const updated: Document = { ...existing, ...patch, id: existing.id }
    await putItem('documents', updated as unknown as Record<string, unknown>)
    return updated
  },
}
