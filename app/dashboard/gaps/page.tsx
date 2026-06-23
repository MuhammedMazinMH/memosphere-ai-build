import type { Metadata } from "next"
import { LearningGapsView } from "@/components/dashboard/learning-gaps-view"
import { authService } from "@/lib/services/auth/auth-service.server"
import { learningGapService } from "@/lib/services"

export const metadata: Metadata = {
  title: "Learning Gaps",
}

// Server component: gaps are computed deterministically from the user's real
// concepts. router.refresh() (triggered after uploads/quizzes) re-runs this.
export default async function GapsPage() {
  const user = await authService.getCurrentUser()
  const gaps = await learningGapService.computeForUser(user.id ?? "")
  return <LearningGapsView gaps={gaps} />
}
