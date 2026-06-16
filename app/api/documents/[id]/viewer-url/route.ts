/**
 * Document viewer-URL API.
 *
 * GET /api/documents/[id]/viewer-url
 *
 * Returns a short-lived (1 hour) presigned S3 GET URL for the document's
 * stored object. Server-side only — AWS credentials never leave the server.
 * The document is fetched from DynamoDB and verified to belong to the
 * authenticated user before any URL is generated.
 */
import { auth } from '@clerk/nextjs/server'
import { documentService } from '@/lib/services'
import { s3Service } from '@/lib/services/s3-service'
import { ok, unauthorized, serverError } from '@/lib/api/response'
import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Authenticate
  const user = await auth()
  if (!user.userId) {
    return unauthorized('Authentication required')
  }

  const { id } = await params

  try {
    // Fetch document metadata from DynamoDB
    const document = await documentService.getDocumentById(id)

    if (!document) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 },
      )
    }

    // Ownership check — only the owner may view the file
    if (document.userId !== user.userId) {
      return unauthorized('You do not have access to this document')
    }

    // The stored object key is required to build a viewer URL
    if (!document.s3Key) {
      return NextResponse.json(
        { success: false, error: 'Document has no stored file' },
        { status: 404 },
      )
    }

    // Generate a presigned GET URL (1 hour expiry, handled in s3Service)
    const url = await s3Service.getFileUrl(document.s3Key)

    return ok({ url })
  } catch (error) {
    console.error('[v0] viewer-url error:', error)
    return serverError(
      error instanceof Error
        ? error.message
        : 'Failed to generate document URL',
    )
  }
}
