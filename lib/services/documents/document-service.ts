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

  /** Live read of all documents from DynamoDB with mock fallback. */
  async listDocuments(): Promise<Document[]> {
    try {
      return await documentRepository.findAllFromDb()
    } catch (error) {
      console.error('[v0] documentService.listDocuments DynamoDB error:', error)
      return documentRepository.findAll()
    }
  },

  /** Live read of a single document from DynamoDB with mock fallback. */
  async getDocumentById(id: string): Promise<Document | undefined> {
    try {
      return await documentRepository.findByIdFromDb(id)
    } catch (error) {
      console.error('[v0] documentService.getDocumentById DynamoDB error:', error)
      return documentRepository.findById(id)
    }
  },

  /** Live read of documents for a subject from DynamoDB with mock fallback. */
  async listDocumentsBySubject(subjectId: string): Promise<Document[]> {
    try {
      return await documentRepository.findBySubjectFromDb(subjectId)
    } catch (error) {
      console.error('[v0] documentService.listDocumentsBySubject DynamoDB error:', error)
      return documentRepository.findBySubject(subjectId)
    }
  },

  /** Uploads a file to S3 and returns its stored metadata. */
  async upload(input: UploadInput, bytes?: ArrayBuffer): Promise<UploadedDocument> {
    return s3Service.uploadFile(input, bytes)
  },
}
