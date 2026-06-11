import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { ArrowLeft, FileText, Network, Sparkles, ListChecks, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { FileTypeIcon, fileTypeLabel } from "@/components/dashboard/file-type-icon"
import { subjects, knowledgeItems } from "@/lib/mock-data"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const subject = subjects.find((s) => s.id === id)
  return { title: subject ? subject.name : "Subject" }
}

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const subject = subjects.find((s) => s.id === id)
  if (!subject) notFound()

  const Icon = subject.icon
  const docs = knowledgeItems.filter((k) => k.subjectId === subject.id)

  const stats = [
    { label: "Documents", value: subject.documents, icon: FileText },
    { label: "Concepts", value: subject.concepts, icon: Network },
    { label: "Summaries", value: subject.summaries, icon: Sparkles },
    { label: "Quizzes", value: subject.quizzes, icon: ListChecks },
  ]

  return (
    <div className="flex flex-col gap-6">
      <Button
        variant="ghost"
        size="sm"
        className="w-fit -ml-2 text-muted-foreground"
        render={
          <Link href="/dashboard/subjects">
            <ArrowLeft data-icon="inline-start" />
            All subjects
          </Link>
        }
      />

      <div className="flex flex-col gap-5 rounded-2xl border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span
            className="flex size-14 shrink-0 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: `color-mix(in oklch, ${subject.color} 15%, transparent)`,
              color: subject.color,
            }}
          >
            <Icon className="size-7" />
          </span>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight text-balance">{subject.name}</h1>
            <p className="max-w-xl text-sm text-muted-foreground text-pretty">{subject.description}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-semibold tabular-nums">{subject.mastery}%</span>
            <Badge variant="secondary">Mastery</Badge>
          </div>
          <Progress value={subject.mastery} className="w-40" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
          const StatIcon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-3 py-4">
                <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <StatIcon className="size-5" />
                </span>
                <div className="flex flex-col">
                  <span className="text-xl font-semibold tabular-nums">{stat.value}</span>
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle>Documents</CardTitle>
              <CardDescription>Source materials in this subject</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Plus data-icon="inline-start" />
              Add
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {docs.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No documents yet.</p>
            ) : (
              docs.map((doc, i) => (
                <div key={doc.id}>
                  {i > 0 && <Separator />}
                  <Link
                    href={`/dashboard/library/${doc.id}`}
                    className="flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-muted/60"
                  >
                    <FileTypeIcon type={doc.type} />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium">{doc.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {fileTypeLabel(doc.type)} · {doc.concepts} concepts
                      </span>
                    </div>
                    <Badge variant={doc.summarized ? "secondary" : "outline"}>
                      {doc.summarized ? "summarized" : "pending"}
                    </Badge>
                  </Link>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top concepts</CardTitle>
            <CardDescription>Most connected ideas</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {subject.topConcepts.map((concept) => (
              <div key={concept.name} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{concept.name}</span>
                  <span className="text-muted-foreground tabular-nums">{concept.strength}%</span>
                </div>
                <Progress value={concept.strength} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
