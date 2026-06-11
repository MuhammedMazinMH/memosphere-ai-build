import type { Metadata } from "next"
import { UniversalSearchView } from "@/components/dashboard/universal-search-view"

export const metadata: Metadata = {
  title: "Search",
}

export default function SearchPage() {
  return <UniversalSearchView />
}
