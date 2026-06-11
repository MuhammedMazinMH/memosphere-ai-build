"use client"

import { useState } from "react"
import { Plus, BookMarked } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { SubjectCard } from "@/components/dashboard/subject-card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { subjects as initialSubjects, type Subject } from "@/lib/mock-data"
import { toast } from "sonner"

const colorCycle = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

export function SubjectsView() {
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  function createSubject(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error("Please enter a subject name")
      return
    }

    const newSubject: Subject = {
      id: `subject-${Date.now()}`,
      name: trimmed,
      description: description.trim() || "No description yet.",
      color: colorCycle[subjects.length % colorCycle.length],
      icon: BookMarked,
      documents: 0,
      concepts: 0,
      mastery: 0,
      lastStudied: "Just now",
      summaries: 0,
      quizzes: 0,
      topConcepts: [],
    }

    setSubjects((prev) => [newSubject, ...prev])
    setName("")
    setDescription("")
    setOpen(false)
    toast.success(`"${trimmed}" added to your subjects`)
  }

  return (
    <>
      <PageHeader title="Subjects" description="Organize your knowledge into focused study areas.">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button>
                <Plus data-icon="inline-start" />
                New Subject
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <form onSubmit={createSubject}>
              <DialogHeader>
                <DialogTitle>Create a new subject</DialogTitle>
                <DialogDescription>
                  Group related documents, summaries, and quizzes into a focused study area.
                </DialogDescription>
              </DialogHeader>
              <FieldGroup className="py-4">
                <Field>
                  <FieldLabel htmlFor="subject-name">Name</FieldLabel>
                  <Input
                    id="subject-name"
                    name="subject-name"
                    autoComplete="off"
                    placeholder="e.g. Operating Systems"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="subject-description">Description</FieldLabel>
                  <Textarea
                    id="subject-description"
                    name="subject-description"
                    placeholder="What does this subject cover?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </Field>
              </FieldGroup>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create subject</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => (
          <SubjectCard key={subject.id} subject={subject} />
        ))}
      </div>
    </>
  )
}
