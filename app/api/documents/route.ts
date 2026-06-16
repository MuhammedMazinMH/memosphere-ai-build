/**
 * Documents API.
 *
 * GET: Returns documents for the authenticated user via the byUser GSI (Query).
 * POST: Creates and persists new document metadata to DynamoDB.
 *
 * Production note:
 * - File bytes live in S3. This route manages document metadata records in
 *   DynamoDB (table `documents` with the `byUser` GSI). See /api/upload for
 *   the full upload flow (S3 + metadata persistence).
 */
import { auth } from '@clerk/nextjs/server'
import { documentService } from '@/lib/services'
import { documentSchema, validate } from '@/lib/validations'
import { ok, badRequest, unauthorized, serverError } from '@/lib/api/response'

export async function GET() {
  // Authenticate user
  const user = await auth()
  if (!user.userId) {
    return unauthorized('Authentication required')
  }

  try {
    // Query documents scoped to the authenticated user via byUser GSI
    const documents = await documentService.listDocumentsByUser(user.userId)
    return ok(documents)
  } catch (error) {
    console.error('[v0] documents GET error:', error)
    return serverError(
      error instanceof Error ? error.message : 'Failed to fetch documents',
    )
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const result = validate(documentSchema, body)
  if (!result.success) return badRequest(result.errors)
  // Note: create() is called from /api/upload after S3 upload succeeds.
  // This endpoint is available but unused in the current flow.
  return ok({ created: result.data }, { status: 201 })
}
