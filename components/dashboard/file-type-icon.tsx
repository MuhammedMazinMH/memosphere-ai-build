import { FileText, StickyNote, ImageIcon, Presentation, Video } from "lucide-react"
import type { FileType } from "@/lib/mock-data"

const map = {
  pdf: { icon: FileText, color: "var(--chart-1)", label: "PDF" },
  note: { icon: StickyNote, color: "var(--chart-4)", label: "Note" },
  image: { icon: ImageIcon, color: "var(--chart-3)", label: "Image" },
  presentation: { icon: Presentation, color: "var(--chart-5)", label: "Slides" },
  video: { icon: Video, color: "var(--chart-2)", label: "Video" },
} as const

export function FileTypeIcon({ type, className }: { type: FileType; className?: string }) {
  const { icon: Icon, color } = map[type]
  return (
    <span
      className={className}
      style={{
        backgroundColor: `color-mix(in oklch, ${color} 15%, transparent)`,
        color,
      }}
    >
      <Icon className="size-5" />
    </span>
  )
}

export function fileTypeLabel(type: FileType) {
  return map[type].label
}
