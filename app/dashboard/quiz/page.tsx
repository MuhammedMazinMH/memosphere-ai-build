import type { Metadata } from "next"
import { authService } from "@/lib/services/auth/auth-service.server"
import { documentService } from "@/lib/services/documents/document-service"
import { QuizGeneratorView } from "@/components/dashboard/quiz-generator-view"

export const metadata: Metadata = {
  title: "Quiz Generator",
}

export default async function QuizPage() {
  const user = await authService.getCurrentUser()
  const subjects = user.id
    ? await documentService.getDerivedSubjectsByUser(user.id)
    : []

  return <QuizGeneratorView subjects={subjects} />
}
