/**
 * Document service.
 *
 * Application-facing API for knowledge items (documents). Coordinates the
 * document repository and the S3 storage seam for uploads.
 */
import { documentRepository } from '@/db/repositories/document-repository'
import { s3Service, type UploadInput } from '@/lib/services/s3-service'
import type { Document, UploadedDocument } from '@/types'

export const documentService = {
  getDocuments(): Document[] {
    return documentRepository.findAll()
  },
  getDocument(id: string): Document | undefined {
    return documentRepository.findById(id)
  },
  getDocumentsBySubject(subjectId: string): Document[] {
    return documentRepository.findBySubject(subjectId)
  },
  getDocumentCount(): number {
    return documentRepository.count()
  },
  /** Uploads a file to S3 and returns its stored metadata. */
  async upload(input: UploadInput, bytes?: ArrayBuffer): Promise<UploadedDocument> {
    return s3Service.uploadFile(input, bytes)
  },
}
