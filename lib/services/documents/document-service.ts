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

  /** Live read of a user's documents via the byUser GSI, with demo fallback. */
  async listDocumentsByUser(userId: string): Promise<Document[]> {
    try {
      return await documentRepository.findByUserFromDb(userId)
    } catch (error) {
      console.error('[v0] documentService.listDocumentsByUser DynamoDB error:', error)
      return documentRepository.findAll()
    }
  },

  /** Uploads a file to S3 and returns its stored metadata (direct S3 call; deprecated path). */
  async upload(input: UploadInput & { userId: string }, bytes?: ArrayBuffer): Promise<UploadedDocument> {
    return s3Service.uploadFile(input, bytes)
  },

  /**
   * Creates and persists a document metadata record to DynamoDB.
   * Expects the file to already be uploaded to S3 (s3Key provided).
   */
  async create(input: {
    userId: string
    title: string
    type: string
    subjectId: string
    subject: string
    sizeBytes: number
    s3Key: string
  }): Promise<Document> {
    const now = Date.now()
    // Generate a simple unique ID (document ID)
    const id = `doc_${now}_${Math.random().toString(36).substr(2, 9)}`
    const document: Document = {
      id,
      userId: input.userId,
      title: input.title,
      type: input.type as any,
      subjectId: input.subjectId,
      subject: input.subject,
      size: this.formatBytes(input.sizeBytes),
      uploadedAt: now,
      summarized: false,
      concepts: 0,
      excerpt: '',
      s3Key: input.s3Key,
      sizeBytes: input.sizeBytes,
      fileUrl: undefined,
      status: 'uploaded',
    }
    return documentRepository.create({
      ...document,
      userId: input.userId,
    } as Document)
  },

  /** Helper to format bytes for display. */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  },
}
