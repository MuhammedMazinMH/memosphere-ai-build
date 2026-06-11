import type { Metadata } from "next"
import { ExamReadinessView } from "@/components/dashboard/exam-readiness-view"

export const metadata: Metadata = {
  title: "Exam Readiness",
}

export default function ExamReadinessPage() {
  return <ExamReadinessView />
}
