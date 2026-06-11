import { Upload, ListChecks, Sparkles, FolderPlus } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { analyticsService } from "@/lib/services"
import type { Activity } from "@/types"

const recentActivity = analyticsService.getRecentActivity()

const iconMap = {
  upload: Upload,
  quiz: ListChecks,
  summary: Sparkles,
  subject: FolderPlus,
}

export function ActivityFeed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>Your latest learning actions</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-4">
          {recentActivity.map((item: Activity) => {
            const Icon = iconMap[item.type]
            return (
              <li key={item.id} className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Icon className="size-4" />
                </span>
                <div className="flex flex-1 flex-col">
                  <p className="text-sm leading-snug">
                    {item.action}{" "}
                    <span className="font-medium text-foreground">{item.target}</span>
                  </p>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
