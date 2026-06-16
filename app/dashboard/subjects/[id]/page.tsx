import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { ArrowLeft, FileText, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { FileTypeIcon, fileTypeLabel } from "@/components/dashboard/file-type-icon"
import { authService } from "@/lib/services/auth/auth-service.server"
import { documentService } from "@/lib/services"
import { formatRelativeTime } from "@/lib/utils"
import type { Document } from "@/types"

/** Normalizes a document's subject the same way the grouping logic does. */
function subjectNameOf(doc: Document): string {
  return (doc.subject ?? "").trim() || "Uncategorized"
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const user = await authService.getCurrentUser()
  const subjects = user.id ? await documentService.getDerivedSubjectsByUser(user.id) : []
  const subject = subjects.find((s) => s.id === id)
  return { title: subject ? subject.name : "Subject" }
}

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // Resolve the subject from the authenticated user's REAL documents. Subjects
  // are derived at request time by grouping documents — no mock/seeded data.
  const user = await authService.getCurrentUser()
  const subjects = user.id ? await documentService.getDerivedSubjectsByUser(user.id) : []
  const subject = subjects.find((s) => s.id === id)

  // The subject only exists if at least one of the user's documents maps to it.
  if (!subject) notFound()

  // Pull the documents that belong to this subject, matching the exact
  // (case-insensitive name) grouping used to build the subject, so the detail
  // count always agrees with the card count.
  const documents = user.id ? await documentService.listDocumentsByUser(user.id) : []
  const docs = documents
    .filter((d) => subjectNameOf(d).toLowerCase() === subject.name.toLowerCase())
    .sort((a, b) => (b.uploadedAt ?? 0) - (a.uploadedAt ?? 0))

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
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <FolderOpen className="size-7" />
          </span>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight text-balance">{subject.name}</h1>
            <p className="text-sm text-muted-foreground">
              {subject.lastUpdated !== null
                ? `Updated ${formatRelativeTime(subject.lastUpdated)}`
                : "No activity yet"}
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="w-fit gap-1.5">
          <FileText className="size-3.5" />
          {docs.length} {docs.length === 1 ? "document" : "documents"}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>Source materials in this subject</CardDescription>
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
                      {fileTypeLabel(doc.type)}
                      {typeof doc.uploadedAt === "number" ? ` · ${formatRelativeTime(doc.uploadedAt)}` : ""}
                    </span>
                  </div>
                </Link>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
