import type { Metadata } from "next"
import { SubjectsView } from "@/components/dashboard/subjects-view"
import { authService } from "@/lib/services/auth/auth-service.server"
import { documentService } from "@/lib/services"

export const metadata: Metadata = {
  title: "Subjects",
}

export default async function SubjectsPage() {
  // Subjects are derived at request time from the authenticated user's real
  // uploaded documents — no mock/seeded subjects.
  const user = await authService.getCurrentUser()
  const subjects = user.id ? await documentService.getDerivedSubjectsByUser(user.id) : []

  return <SubjectsView subjects={subjects} />
}
