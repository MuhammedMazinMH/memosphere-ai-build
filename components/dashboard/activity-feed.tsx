import { Clock, FileText, BrainCircuit, FileStack, ListChecks } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { Activity, ActivityType } from "@/types"

const ICONS: Record<ActivityType, typeof Clock> = {
  upload: FileText,
  quiz: ListChecks,
  summary: FileStack,
  subject: BrainCircuit,
}

export function ActivityFeed({ items = [] }: { items?: Activity[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>Your latest learning actions</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border p-8 text-center">
            <Clock className="size-5 text-muted-foreground" />
            <p className="text-sm font-medium">No activity yet</p>
            <p className="text-sm text-muted-foreground text-pretty">
              Your recent actions will appear here.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((item) => {
              const Icon = ICONS[item.type] ?? Clock
              return (
                <li key={item.id} className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </span>
                  <div className="flex min-w-0 flex-col">
                    <p className="truncate text-sm font-medium">
                      <span className="text-muted-foreground">
                        {item.action}
                      </span>{" "}
                      {item.target}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
