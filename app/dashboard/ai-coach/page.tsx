import type { Metadata } from "next"
import { AICoachView } from "@/components/dashboard/ai-coach-view"

export const metadata: Metadata = {
  title: "AI Learning Coach",
}

export default function AICoachPage() {
  return <AICoachView />
}
