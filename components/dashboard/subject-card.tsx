import Link from "next/link"
import { ArrowUpRight, BookOpen } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { DerivedSubject } from "@/types"
import { formatRelativeTime } from "@/lib/utils"

export function SubjectCard({ subject }: { subject: DerivedSubject }) {
  return (
    <Link href={`/dashboard/subjects/${subject.id}`} className="group block">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <BookOpen className="size-5" />
            </span>
            <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <div className="mt-3 flex flex-col gap-1">
            <h3 className="font-medium leading-tight">{subject.name}</h3>
            <p className="text-sm text-muted-foreground">
              {subject.lastUpdated !== null
                ? `Updated ${formatRelativeTime(subject.lastUpdated)}`
                : "No activity yet"}
            </p>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {subject.documentCount} {subject.documentCount === 1 ? "document" : "documents"}
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Mastery</span>
              <span className="font-medium">{subject.mastery}%</span>
            </div>
            <Progress value={subject.mastery} />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
