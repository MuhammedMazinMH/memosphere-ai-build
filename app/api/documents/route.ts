/**
 * Documents API.
 *
 * Production note:
 * - File bytes go to S3 (see /api/upload). This route manages document
 *   metadata records in Aurora via documentService.
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
  // TODO(aurora): persist document metadata via documentService.create(...)
  return ok({ created: result.data, mock: true }, { status: 201 })
}
