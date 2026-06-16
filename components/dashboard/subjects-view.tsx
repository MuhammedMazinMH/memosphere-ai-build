import { Library } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { SubjectCard } from "@/components/dashboard/subject-card"
import type { DerivedSubject } from "@/types"

export function SubjectsView({ subjects }: { subjects: DerivedSubject[] }) {
  return (
    <>
      <PageHeader title="Subjects" description="Organize your knowledge into focused study areas." />
      {subjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed py-20 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Library className="size-6" />
          </span>
          <div className="flex flex-col gap-1">
            <p className="font-medium">No subjects yet.</p>
            <p className="max-w-sm text-sm text-muted-foreground text-pretty">
              Upload documents to begin organizing your knowledge.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>
      )}
    </>
  )
}
