/**
 * Upload API — multipart FormData → S3 + DynamoDB.
 *
 * Accepts file + subjectId via multipart FormData, uploads file to S3,
 * persists document metadata to DynamoDB (scoped to authenticated user),
 * and returns the created document record.
 */
import { auth } from '@clerk/nextjs/server'
import { s3Service } from '@/lib/services/s3-service'
import { documentService } from '@/lib/services'
import { processingService } from '@/lib/services/processing/processing-service'
import { notificationRepository } from '@/db/repositories/notification-repository'
import { ok, badRequest, unauthorized, serverError } from '@/lib/api/response'

export async function POST(request: Request) {
  // Verify user is authenticated
  const user = await auth()
  if (!user.userId) {
    return unauthorized('Authentication required')
  }

  // Parse FormData
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return badRequest({ error: 'Invalid FormData' })
  }

  const file = formData.get('file') as File | null
  const subjectIdStr = formData.get('subjectId') as string | null

  // Validate file
  if (!file || file.size === 0) {
    return badRequest({ error: 'No file provided' })
  }

  // Resolve subject from user-entered text. The upload dialog sends the raw
  // subject name the user typed. Store it directly; if blank, group the
  // document under "Uncategorized". Both subject and subjectId hold the same
  // normalized string so derived-subject grouping stays consistent.
  const subject = subjectIdStr?.trim() || 'Uncategorized'
  const subjectId = subject

  try {
    // Upload file to S3
    const bytes = await file.arrayBuffer()
    
    // Get the filename with extension
    const fileName = file.name
    
    // Upload to S3 using userId-scoped key
    const key = `u/${user.userId}/${Date.now()}-${fileName}`
    
    // Only actually upload if storage is configured
    if (s3Service.isReady()) {
      const { PutObjectCommand } = await import('@aws-sdk/client-s3')
      const { S3Client } = await import('@aws-sdk/client-s3')
      
      const client = new S3Client({
        region: process.env.AWS_S3_REGION || process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: (process.env.AWS_S3_ACCESS_KEY_ID ||
            process.env.AWS_ACCESS_KEY_ID) as string,
          secretAccessKey: (process.env.AWS_S3_SECRET_ACCESS_KEY ||
            process.env.AWS_SECRET_ACCESS_KEY) as string,
        },
      })
      
      const bucket = process.env.AWS_S3_BUCKET_NAME || 'memosphere-uploads'
      
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: new Uint8Array(bytes),
          ContentType: file.type,
        }),
      )
    }

    // Create document metadata in DynamoDB
    const document = await documentService.create({
      userId: user.userId,
      title: fileName.split('/').pop() || file.name,
      type: fileName.split('.').pop() || 'file',
      subjectId,
      subject,
      sizeBytes: file.size,
      s3Key: key,
    })

    // Phase 1: run the document processing workflow on the in-memory bytes
    // (no AI yet). The workflow handles the uploaded → processing →
    // completed | failed lifecycle, extracts text, computes statistics, and
    // persists everything to DynamoDB. It is best-effort and NEVER throws — a
    // failed extraction must not fail the upload or break downstream views.
    const processing = await processingService.process(document.id, bytes, fileName)

    // Reflect the workflow outcome on the returned record so the client has a
    // consistent view without an extra round-trip.
    document.processingStatus = processing.status
    document.extractionStatus =
      processing.status === 'failed' ? 'failed' : 'completed'
    document.extractedAt = Date.now()
    if (processing.stats) {
      document.stats = processing.stats
    }

    // Emit a persisted notification for the completed upload. Best-effort —
    // a notification failure must never fail the upload itself.
    try {
      await notificationRepository.create({
        userId: user.userId,
        title: 'Document uploaded',
        message: `"${document.title}" was added to your knowledge base.`,
        type: 'document_uploaded',
      })
    } catch {
      // Non-critical.
    }

    return ok({ document, processing }, { status: 201 })
  } catch (error) {
    console.error('[v0] upload error:', error)
    return serverError(
      error instanceof Error ? error.message : 'Upload failed',
    )
  }
}

