/**
 * Documents API.
 *
 * Production note:
 * - File bytes go to S3 (see /api/upload). This route manages document
 *   metadata records in DynamoDB (table `documents`, with the `byUser` GSI)
 *   via documentService. The write path is implemented in a later phase.
 */
import { documentService } from '@/lib/services'
import { documentSchema, validate } from '@/lib/validations'
import { ok, badRequest } from '@/lib/api/response'

export async function GET() {
  return ok(await documentService.listDocuments())
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const result = validate(documentSchema, body)
  if (!result.success) return badRequest(result.errors)
  // TODO(dynamodb): persist document metadata via documentService.create(...)
  return ok({ created: result.data, mock: true }, { status: 201 })
}
