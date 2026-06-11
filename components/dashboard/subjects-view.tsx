"use client"

import { useState } from "react"
import { PageHeader } from "@/components/dashboard/page-header"
import { SubjectCard } from "@/components/dashboard/subject-card"
import { subjects as initialSubjects, type Subject } from "@/lib/mock-data"

export function SubjectsView() {
  const [subjects] = useState<Subject[]>(initialSubjects)

  return (
    <>
      <PageHeader title="Subjects" description="Organize your knowledge into focused study areas." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => (
          <SubjectCard key={subject.id} subject={subject} />
        ))}
      </div>
    </>
  )
}
