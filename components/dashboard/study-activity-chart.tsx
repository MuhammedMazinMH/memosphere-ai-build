import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function StudyActivityChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Study activity</CardTitle>
        <CardDescription>Minutes studied this week</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-[260px] w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-center">
          <p className="text-sm font-medium">No learning activity yet</p>
          <p className="text-sm text-muted-foreground">
            Study sessions you log will show up here.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
