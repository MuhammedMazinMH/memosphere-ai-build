import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { ArrowLeft, Clock, HardDrive } from "lucide-react"
import { DocumentActions } from "@/components/dashboard/document-actions"
import { DocumentDetail } from "@/components/dashboard/document-detail"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileTypeIcon, fileTypeLabel } from "@/components/dashboard/file-type-icon"
import { documentService } from "@/lib/services"
import { formatRelativeTime } from "@/lib/utils"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const item = await documentService.getDocumentById(id)
  return { title: item ? item.title : "Document" }
}

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const item = await documentService.getDocumentById(id)
  if (!item) notFound()

  return (
    <>
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit -ml-2 text-muted-foreground"
          render={
            <Link href="/dashboard/library">
              <ArrowLeft data-icon="inline-start" />
              Back to library
            </Link>
          }
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <FileTypeIcon
              type={item.type}
              className="flex size-12 shrink-0 items-center justify-center rounded-xl"
            />
            <div className="flex flex-col gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-balance">
                {item.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <HardDrive className="size-3.5" />
                  {item.size}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5" />
                  {formatRelativeTime(item.uploadedAt)}
                </span>
                <Badge variant="outline">{fileTypeLabel(item.type)}</Badge>
                <Badge variant="secondary">{item.subject}</Badge>
              </div>
            </div>
          </div>
          <DocumentActions item={item} />
        </div>
      </div>

      <DocumentDetail item={item} />
    </>
  )
}
