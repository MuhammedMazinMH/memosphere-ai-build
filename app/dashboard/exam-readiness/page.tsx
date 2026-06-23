import type { Metadata } from "next"
import { ExamReadinessView } from "@/components/dashboard/exam-readiness-view"
import { authService } from "@/lib/services/auth/auth-service.server"
import { examReadinessService } from "@/lib/services"

export const metadata: Metadata = {
  title: "Exam Readiness",
}

// Server component: readiness is computed deterministically from the user's
// real records. router.refresh() (after uploads/quizzes) re-runs this.
export default async function ExamReadinessPage() {
  const user = await authService.getCurrentUser()
  const readiness = await examReadinessService.computeForUser(user.id ?? "")
  return <ExamReadinessView readiness={readiness} />
}
