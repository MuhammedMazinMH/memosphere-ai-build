import { Loader2, CheckCircle2, AlertTriangle, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Document, ProcessingStatus } from "@/types"

/**
 * Resolves a document's effective processing status. Prefers the explicit
 * `processingStatus`; falls back to the older `extractionStatus` for legacy
 * records, and finally to "uploaded" so the UI always has something to show.
 */
export function resolveProcessingStatus(item: Document): ProcessingStatus {
  if (item.processingStatus) return item.processingStatus
  switch (item.extractionStatus) {
    case "completed":
      return "completed"
    case "failed":
      return "failed"
    case "processing":
    case "pending":
      return "processing"
    default:
      return "uploaded"
  }
}

const CONFIG: Record<
  ProcessingStatus,
  { label: string; icon: typeof Clock; variant: "secondary" | "outline" | "destructive"; className?: string }
> = {
  uploaded: { label: "Uploaded", icon: Clock, variant: "outline" },
  processing: { label: "Processing", icon: Loader2, variant: "outline", className: "text-primary" },
  completed: { label: "Completed", icon: CheckCircle2, variant: "secondary", className: "text-primary" },
  failed: { label: "Failed", icon: AlertTriangle, variant: "destructive" },
}

/** Compact, real-status badge for a document's processing lifecycle. */
export function ProcessingStatusBadge({
  status,
  className,
}: {
  status: ProcessingStatus
  className?: string
}) {
  const { label, icon: Icon, variant, className: statusClass } = CONFIG[status]
  return (
    <Badge variant={variant} className={cn("gap-1", statusClass, className)}>
      <Icon className={cn("size-3", status === "processing" && "animate-spin")} />
      {label}
    </Badge>
  )
}
