import type { Metadata } from "next"
import { LibraryView } from "@/components/dashboard/library-view"

export const metadata: Metadata = {
  title: "Knowledge Library",
}

export default function LibraryPage() {
  return <LibraryView />
}
