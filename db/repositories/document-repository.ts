/**
 * Document repository (knowledge items) — Amazon DynamoDB.
 *
 * Document bytes live in Amazon S3 (see lib/services/s3-service.ts); this
 * repository stores/returns only metadata items. Synchronous methods serve the
 * demo data; async `*FromDb` methods read from DynamoDB (table: `documents`)
 * when a live database is configured.
 */
import {
  getMockTables,
  isDatabaseConnected,
  scanAll,
  getItem,
  buildKey,
  queryByIndex,
} from '@/db/client'
import { gsisOf } from '@/db/tables'
import type { Document } from '@/types'

export const documentRepository = {
  findAll(): Document[] {
    return getMockTables().documents
  },

  findById(id: string): Document | undefined {
    return getMockTables().documents.find((d) => d.id === id)
  },

  findBySubject(subjectId: string): Document[] {
    return getMockTables().documents.filter((d) => d.subjectId === subjectId)
  },

  count(): number {
    return getMockTables().documents.length
  },

  /** Live read of all documents from DynamoDB (Scan), with demo fallback. */
  async findAllFromDb(): Promise<Document[]> {
    if (!isDatabaseConnected()) return this.findAll()
    return scanAll<Document>('documents')
  },

  /** Live read of a single document from DynamoDB (GetItem), with demo fallback. */
  async findByIdFromDb(id: string): Promise<Document | undefined> {
    if (!isDatabaseConnected()) return this.findById(id)
    return getItem<Document>('documents', buildKey('documents', id))
  },

  /** Live read of documents for a subject (Scan + filter), with demo fallback. */
  async findBySubjectFromDb(subjectId: string): Promise<Document[]> {
    if (!isDatabaseConnected()) return this.findBySubject(subjectId)
    const all = await scanAll<Document>('documents')
    return all.filter((d) => d.subjectId === subjectId)
  },

  /**
   * Live read of a user's documents via the `byUser` GSI (Query, newest-first),
   * with demo fallback. Efficient per-user lookup — no full-table Scan.
   */
  async findByUserFromDb(userId: string): Promise<Document[]> {
    if (!isDatabaseConnected()) return this.findAll()
    const [byUser] = gsisOf('documents')
    return queryByIndex<Document>(
      'documents',
      byUser.indexName,
      byUser.partitionKey,
      userId,
    )
  },
}
