import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Subject } from "@/types"

export function SubjectCard({ subject }: { subject: Subject }) {
  const Icon = subject.icon
  return (
    <Link href={`/dashboard/subjects/${subject.id}`} className="group block">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <span
              className="flex size-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: `color-mix(in oklch, ${subject.color} 15%, transparent)`, color: subject.color }}
            >
              <Icon className="size-5" />
            </span>
            <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <div className="mt-3 flex flex-col gap-1">
            <h3 className="font-medium leading-tight">{subject.name}</h3>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {subject.description}
            </p>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{subject.documents} docs</span>
            <span className="text-muted-foreground">{subject.concepts} concepts</span>
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
