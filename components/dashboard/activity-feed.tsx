import { Clock } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function ActivityFeed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>Your latest learning actions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border p-8 text-center">
          <Clock className="size-5 text-muted-foreground" />
          <p className="text-sm font-medium">No activity yet</p>
          <p className="text-sm text-muted-foreground text-pretty">
            Your recent actions will appear here.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
