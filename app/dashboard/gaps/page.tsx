import type { Metadata } from "next"
import { LearningGapsView } from "@/components/dashboard/learning-gaps-view"

export const metadata: Metadata = {
  title: "Learning Gaps",
}

export default function GapsPage() {
  return <LearningGapsView />
}
