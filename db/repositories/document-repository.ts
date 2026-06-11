/**
 * Document repository (knowledge items).
 *
 * Production note:
 * - Document bytes live in AWS S3; this repository stores/returns only
 *   metadata rows. See lib/services/s3-service.ts for the storage seam.
 * - Reads should be user-scoped once Aurora + Clerk are connected.
 */
import { getMockTables } from '@/db/client'
import type { Document } from '@/types'

export const documentRepository = {
  findAll(): Document[] {
    // TODO(aurora): SELECT * FROM documents WHERE user_id = $1 ORDER BY uploaded_at DESC
    return getMockTables().documents
  },

  findById(id: string): Document | undefined {
    // TODO(aurora): SELECT * FROM documents WHERE id = $1 AND user_id = $2
    return getMockTables().documents.find((d) => d.id === id)
  },

  findBySubject(subjectId: string): Document[] {
    // TODO(aurora): SELECT * FROM documents WHERE subject_id = $1 AND user_id = $2
    return getMockTables().documents.filter((d) => d.subjectId === subjectId)
  },

  count(): number {
    return getMockTables().documents.length
  },
}
