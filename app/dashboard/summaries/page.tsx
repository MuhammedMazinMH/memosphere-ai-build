import type { Metadata } from "next"
import { SummaryCenterView } from "@/components/dashboard/summary-center-view"
import { authService } from "@/lib/services/auth/auth-service.server"
import { documentService } from "@/lib/services"

export const metadata: Metadata = {
  title: "Summary Center",
}

export default async function SummaryCenterPage() {
  // Load the authenticated user's real uploaded documents from DynamoDB so the
  // Summary Center can generate AI summaries from actual extracted text.
  const user = await authService.getCurrentUser()
  const documents = user.id ? await documentService.listDocumentsByUser(user.id) : []

  return <SummaryCenterView documents={documents} />
}
