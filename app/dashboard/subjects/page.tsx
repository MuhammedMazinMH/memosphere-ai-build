import type { Metadata } from "next"
import { SubjectsView } from "@/components/dashboard/subjects-view"

export const metadata: Metadata = {
  title: "Subjects",
}

export default function SubjectsPage() {
  return <SubjectsView />
}
