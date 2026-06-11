/**
 * AWS S3 storage service.
 *
 * Production note:
 * - This service is the single seam for file storage. Only metadata references
 *   (StoredFile / UploadedDocument) flow through the application layer; raw
 *   bytes live in S3.
 * - When connecting S3:
 *     1. Add AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY,
 *        AWS_S3_BUCKET_NAME (see config/env.ts).
 *     2. Install @aws-sdk/client-s3 and @aws-sdk/s3-request-presigner.
 *     3. Replace each placeholder below with real S3 SDK calls.
 * - No S3 connection is made yet. Methods validate inputs and return
 *   deterministic placeholder metadata so upload flows can be wired up safely.
 */
import { UPLOAD_LIMITS } from '@/config/app'
import { env, requireEnv } from '@/config/env'
import type { StoredFile, UploadedDocument } from '@/types'

export interface UploadInput {
  fileName: string
  contentType: string
  size: number
  subjectId: string
}

function assertUploadAllowed(input: UploadInput): void {
  if (input.size > UPLOAD_LIMITS.maxBytes) {
    throw new Error(
      `File exceeds the ${UPLOAD_LIMITS.maxBytes} byte upload limit.`,
    )
  }
  if (!UPLOAD_LIMITS.acceptedTypes.includes(input.contentType)) {
    throw new Error(`Unsupported file type: ${input.contentType}.`)
  }
}

function buildKey(fileName: string): string {
  // Production: prefix with the user id once Clerk is connected, e.g.
  // `${userId}/${Date.now()}-${fileName}`
  return `uploads/${Date.now()}-${fileName}`
}

export const s3Service = {
  /** Uploads a PDF / PPT / image and returns its stored metadata. */
  async uploadFile(input: UploadInput, _bytes?: ArrayBuffer): Promise<UploadedDocument> {
    assertUploadAllowed(input)
    // requireEnv(['AWS_REGION','AWS_ACCESS_KEY_ID','AWS_SECRET_ACCESS_KEY','AWS_S3_BUCKET_NAME'])
    // TODO(s3): new S3Client(...).send(new PutObjectCommand({ Bucket, Key, Body }))
    const key = buildKey(input.fileName)
    const file: StoredFile = {
      key,
      bucket: env.AWS_S3_BUCKET_NAME ?? 'memosphere-uploads',
      url: `https://${env.AWS_S3_BUCKET_NAME ?? 'memosphere-uploads'}.s3.${env.AWS_REGION ?? 'us-east-1'}.amazonaws.com/${key}`,
      contentType: input.contentType,
      size: input.size,
      uploadedAt: new Date().toISOString(),
    }
    return { documentId: `doc_${Date.now()}`, file, subjectId: input.subjectId }
  },

  /** Deletes a stored object by key. */
  async deleteFile(_key: string): Promise<void> {
    // requireEnv(['AWS_REGION','AWS_ACCESS_KEY_ID','AWS_SECRET_ACCESS_KEY','AWS_S3_BUCKET_NAME'])
    // TODO(s3): new S3Client(...).send(new DeleteObjectCommand({ Bucket, Key }))
    return
  },

  /** Returns a (presigned, in production) URL for a stored object. */
  async getFileUrl(key: string): Promise<string> {
    // TODO(s3): getSignedUrl(client, new GetObjectCommand({ Bucket, Key }))
    return `https://${env.AWS_S3_BUCKET_NAME ?? 'memosphere-uploads'}.s3.${env.AWS_REGION ?? 'us-east-1'}.amazonaws.com/${key}`
  },

  /** Returns whether S3 is configured and ready to receive uploads. */
  isReady(): boolean {
    try {
      requireEnv([
        'AWS_REGION',
        'AWS_ACCESS_KEY_ID',
        'AWS_SECRET_ACCESS_KEY',
        'AWS_S3_BUCKET_NAME',
      ])
      return true
    } catch {
      return false
    }
  },
}
