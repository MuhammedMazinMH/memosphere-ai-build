import type { Metadata } from "next"
import { SummaryCenterView } from "@/components/dashboard/summary-center-view"

export const metadata: Metadata = {
  title: "Summary Center",
}

export default function SummaryCenterPage() {
  return <SummaryCenterView />
}
