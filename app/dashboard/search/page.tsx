import type { Metadata } from "next"
import { auth } from "@clerk/nextjs/server"
import { documentService } from "@/lib/services"
import { UniversalSearchView } from "@/components/dashboard/universal-search-view"

export const metadata: Metadata = {
  title: "Search",
  description: "Search across every document in your knowledge base.",
}

export default async function SearchPage() {
  const { userId } = await auth()

  // Both calls are guarded: an unauthenticated userId resolves to an empty
  // array so the view renders its "no documents" empty state cleanly.
  const [documents, subjects] = await Promise.all([
    userId ? documentService.listDocumentsByUser(userId) : Promise.resolve([]),
    userId ? documentService.getDerivedSubjectsByUser(userId) : Promise.resolve([]),
  ])

  return <UniversalSearchView documents={documents} subjects={subjects} />
}
