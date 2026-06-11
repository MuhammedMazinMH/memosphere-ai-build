import type { Metadata } from "next"
import { QuizGeneratorView } from "@/components/dashboard/quiz-generator-view"

export const metadata: Metadata = {
  title: "Quiz Generator",
}

export default function QuizPage() {
  return <QuizGeneratorView />
}
