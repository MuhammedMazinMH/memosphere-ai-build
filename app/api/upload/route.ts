/**
 * Upload API — multipart FormData → S3 + DynamoDB.
 *
 * Accepts file + subjectId via multipart FormData, uploads file to S3,
 * persists document metadata to DynamoDB (scoped to authenticated user),
 * and returns the created document record.
 */
import { auth } from '@clerk/nextjs/server'
import { s3Service } from '@/lib/services/s3-service'
import { documentService, subjectService } from '@/lib/services'
import { extractionService } from '@/lib/services/extraction/extraction-service'
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

  // Validate subjectId (optional; fall back to default subject)
  const subjectId = subjectIdStr || 'default'
  let subject = subjectId
  try {
    const subjects = subjectService.getSubjects()
    const found = subjects.find((s) => s.id === subjectId)
    if (found) subject = found.name
  } catch {
    // Fall back to using the subject ID as the name
  }

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

    // Phase 1: extract raw text from the in-memory bytes (no AI yet).
    // Extraction is best-effort — a failure must NOT fail the upload. The
    // document is always preserved; only its extractionStatus reflects the
    // outcome. We reuse the bytes already read for the S3 upload above.
    let extraction: { status: string; charCount: number } = {
      status: 'completed',
      charCount: 0,
    }
    if (extractionService.isExtractable(fileName)) {
      await documentService.markExtractionProcessing(document.id)
      try {
        const result = await extractionService.extract(bytes, fileName)
        await documentService.saveExtraction(document.id, result.text)
        document.extractedText = result.text
        document.extractionStatus = 'completed'
        document.extractedAt = Date.now()
        extraction = { status: 'completed', charCount: result.charCount }
      } catch (extractError) {
        console.error('[v0] text extraction failed:', extractError)
        await documentService.markExtractionFailed(document.id)
        document.extractionStatus = 'failed'
        document.extractedAt = Date.now()
        extraction = { status: 'failed', charCount: 0 }
      }
    } else {
      // Nothing to extract for this format (e.g. images): leave text empty
      // but mark the step completed so the UI doesn't show "pending" forever.
      try {
        await documentService.saveExtraction(document.id, '')
      } catch (saveError) {
        console.error('[v0] mark non-extractable completed failed:', saveError)
      }
      document.extractedText = ''
      document.extractionStatus = 'completed'
      document.extractedAt = Date.now()
    }

    return ok({ document, extraction }, { status: 201 })
  } catch (error) {
    console.error('[v0] upload error:', error)
    return serverError(
      error instanceof Error ? error.message : 'Upload failed',
    )
  }
}

