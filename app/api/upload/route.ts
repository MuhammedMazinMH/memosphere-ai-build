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

    return ok({ document }, { status: 201 })
  } catch (error) {
    console.error('[v0] upload error:', error)
    return serverError(
      error instanceof Error ? error.message : 'Upload failed',
    )
  }
}

