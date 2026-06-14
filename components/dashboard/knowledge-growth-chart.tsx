import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function KnowledgeGrowthChart() {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Knowledge growth</CardTitle>
        <CardDescription>
          Concepts and documents accumulated over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-[260px] w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-center">
          <p className="text-sm font-medium">No data available</p>
          <p className="text-sm text-muted-foreground">
            Your knowledge growth will appear here as you study.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
