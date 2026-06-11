/**
 * Upload API (AWS S3 seam).
 *
 * Production note:
 * - Validates upload metadata with Zod, then asks s3Service for a presigned
 *   PUT URL. The browser uploads bytes directly to S3 with that URL; only the
 *   returned StoredFile metadata is persisted in Aurora.
 */
import { s3Service } from '@/lib/services/s3-service'
import { fileUploadSchema, validate } from '@/lib/validations'
import { ok, badRequest } from '@/lib/api/response'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const result = validate(fileUploadSchema, body)
  if (!result.success) return badRequest(result.errors)

  // TODO(s3): s3Service.uploadFile streams bytes to S3 and returns metadata.
  const uploaded = await s3Service.uploadFile({
    fileName: result.data.fileName,
    contentType: result.data.contentType,
    size: result.data.size,
    subjectId: result.data.subjectId,
  })
  return ok({ uploaded, mock: true })
}
