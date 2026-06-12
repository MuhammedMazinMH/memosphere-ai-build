/**
 * Amazon S3 storage service (AWS SDK v3).
 *
 * Single seam for document storage. Only metadata references (StoredFile /
 * UploadedDocument) flow through the application layer; raw bytes live in S3.
 *
 * Configuration (see config/env.ts):
 * - AWS_S3_BUCKET_NAME ........ required bucket
 * - AWS_S3_REGION ............. region (falls back to AWS_REGION)
 * - AWS_S3_ACCESS_KEY_ID ...... key (falls back to AWS_ACCESS_KEY_ID)
 * - AWS_S3_SECRET_ACCESS_KEY .. secret (falls back to AWS_SECRET_ACCESS_KEY)
 *
 * Graceful degradation: when S3 is not configured, uploads return deterministic
 * placeholder metadata so the upload flow keeps working on demo data. When
 * configured, real PutObject/DeleteObject/presigned-GET calls are issued.
 */
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { UPLOAD_LIMITS } from '@/config/app'
import { env, features } from '@/config/env'
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
  // Production: prefix with the user id once auth is connected, e.g.
  // `${userId}/${Date.now()}-${fileName}`
  return `uploads/${Date.now()}-${fileName}`
}

const bucket = (): string => env.AWS_S3_BUCKET_NAME ?? 'memosphere-uploads'
const region = (): string => env.AWS_S3_REGION ?? env.AWS_REGION ?? 'us-east-1'

function publicUrl(key: string): string {
  return `https://${bucket()}.s3.${region()}.amazonaws.com/${key}`
}

let _client: S3Client | null = null
function getClient(): S3Client {
  if (_client) return _client
  _client = new S3Client({
    region: region(),
    credentials: {
      accessKeyId: (env.AWS_S3_ACCESS_KEY_ID ??
        env.AWS_ACCESS_KEY_ID) as string,
      secretAccessKey: (env.AWS_S3_SECRET_ACCESS_KEY ??
        env.AWS_SECRET_ACCESS_KEY) as string,
    },
  })
  return _client
}

export const s3Service = {
  /** Uploads a PDF / PPT / image and returns its stored metadata. */
  async uploadFile(
    input: UploadInput,
    bytes?: ArrayBuffer,
  ): Promise<UploadedDocument> {
    assertUploadAllowed(input)
    const key = buildKey(input.fileName)

    if (features.storage() && bytes) {
      await getClient().send(
        new PutObjectCommand({
          Bucket: bucket(),
          Key: key,
          Body: new Uint8Array(bytes),
          ContentType: input.contentType,
        }),
      )
    }

    const file: StoredFile = {
      key,
      bucket: bucket(),
      url: publicUrl(key),
      contentType: input.contentType,
      size: input.size,
      uploadedAt: new Date().toISOString(),
    }
    return { documentId: `doc_${Date.now()}`, file, subjectId: input.subjectId }
  },

  /** Deletes a stored object by key. */
  async deleteFile(key: string): Promise<void> {
    if (!features.storage()) return
    await getClient().send(
      new DeleteObjectCommand({ Bucket: bucket(), Key: key }),
    )
  },

  /** Returns a presigned URL for a stored object (public URL in demo mode). */
  async getFileUrl(key: string): Promise<string> {
    if (!features.storage()) return publicUrl(key)
    return getSignedUrl(
      getClient(),
      new GetObjectCommand({ Bucket: bucket(), Key: key }),
      { expiresIn: 3600 },
    )
  },

  /** Returns whether S3 is configured and ready to receive uploads. */
  isReady(): boolean {
    return features.storage()
  },
}
