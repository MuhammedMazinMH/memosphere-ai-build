import {
  Flame,
  TriangleAlert,
  Rocket,
  CalendarCheck,
  LayoutGrid,
  BrainCircuit,
  Sparkles,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { recommendationService } from "@/lib/services"

const li = recommendationService.getLearningIntelligence()

function HighlightCard({
  icon: Icon,
  label,
  value,
  sub,
  accent = "var(--primary)",
}: {
  icon: typeof Flame
  label: string
  value: string
  sub: string
  accent?: string
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 p-4">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Icon className="size-3.5" style={{ color: accent }} />
          {label}
        </span>
        <span className="truncate text-lg font-semibold tracking-tight">{value}</span>
        <span className="text-xs text-muted-foreground">{sub}</span>
      </CardContent>
    </Card>
  )
}

function ScoreCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Flame
  label: string
  value: number
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-4">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Icon className="size-3.5 text-primary" />
          {label}
        </span>
        <span className="text-2xl font-semibold tracking-tight">{value}%</span>
        <Progress value={value} />
      </CardContent>
    </Card>
  )
}

export function LearningIntelligence() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <BrainCircuit className="size-5 text-primary" />
        <h2 className="text-lg font-semibold">Learning intelligence</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <HighlightCard
          icon={Flame}
          label="Most studied concept"
          value={li.mostStudied.concept}
          sub={`${li.mostStudied.sessions} sessions · ${li.mostStudied.subject}`}
        />
        <HighlightCard
          icon={TriangleAlert}
          label="Weakest concept"
          value={li.weakest.concept}
          sub={`${li.weakest.mastery}% mastery · ${li.weakest.subject}`}
          accent="var(--destructive)"
        />
        <HighlightCard
          icon={Rocket}
          label="Fastest improving"
          value={li.fastestImproving.subject}
          sub={`+${li.fastestImproving.delta}% this week`}
          accent="var(--chart-2)"
        />
        <ScoreCard icon={CalendarCheck} label="Study consistency" value={li.consistency} />
        <ScoreCard icon={LayoutGrid} label="Knowledge coverage" value={li.coverage} />
        <ScoreCard icon={BrainCircuit} label="AI confidence" value={li.aiConfidence} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4 text-primary" />
            Weekly learning insights
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2.5">
          {li.weeklyInsights.map((insight) => (
            <div key={insight} className="flex items-start gap-2.5 text-sm">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
              <span className="text-pretty">{insight}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
