import type { Metadata } from "next"
import { PageHeader } from "@/components/dashboard/page-header"
import { SubjectCard } from "@/components/dashboard/subject-card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { subjects } from "@/lib/mock-data"

export const metadata: Metadata = {
  title: "Subjects",
}

export default function SubjectsPage() {
  return (
    <>
      <PageHeader
        title="Subjects"
        description="Organize your knowledge into focused study areas."
      >
        <Button>
          <Plus data-icon="inline-start" />
          New Subject
        </Button>
      </PageHeader>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => (
          <SubjectCard key={subject.id} subject={subject} />
        ))}
      </div>
    </>
  )
}
