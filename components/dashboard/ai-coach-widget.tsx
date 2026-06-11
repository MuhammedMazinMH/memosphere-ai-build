import Link from "next/link"
import { Sparkles, ArrowRight, Compass, Target, TriangleAlert } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { recommendationService } from "@/lib/services"

const aiCoach = recommendationService.getRecommendations()

export function AICoachWidget() {
  const { nextTopic, weakAreas, examReadiness } = aiCoach
  const topWeak = weakAreas[0]

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4 text-primary" />
            AI Learning Coach
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            render={
              <Link href="/dashboard/ai-coach">
                View all
                <ArrowRight data-icon="inline-end" />
              </Link>
            }
          />
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Compass className="size-3.5 text-primary" />
            Study next
          </span>
          <span className="font-semibold leading-tight text-primary">{nextTopic.recommended}</span>
          <span className="text-xs text-muted-foreground">{nextTopic.subject}</span>
        </div>

        <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Target className="size-3.5 text-primary" />
            Exam readiness
          </span>
          <span className="text-lg font-semibold leading-tight">{examReadiness.current}%</span>
          <Progress value={examReadiness.current} />
        </div>

        <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <TriangleAlert className="size-3.5 text-destructive" />
            Needs attention
          </span>
          <span className="font-semibold leading-tight">{topWeak.name}</span>
          <Badge variant="outline" className="w-fit text-destructive" style={{ borderColor: "var(--destructive)" }}>
            {topWeak.confidence}% confidence
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
