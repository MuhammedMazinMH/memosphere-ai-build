"use client"

import { useMemo } from "react"
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
} from "recharts"
import { GraduationCap, TrendingUp, Target } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import { examReadiness } from "@/lib/mock-data"

const config = {
  coverage: { label: "Coverage", color: "var(--chart-1)" },
  accuracy: { label: "Accuracy", color: "var(--chart-2)" },
} satisfies ChartConfig

function overall(s: (typeof examReadiness)[number]) {
  return Math.round((s.coverage + s.accuracy + s.consistency + s.confidence) / 4)
}

function readinessBadge(score: number) {
  if (score >= 80) return { label: "Exam ready", cls: "border-chart-4/30 bg-chart-4/10 text-chart-4" }
  if (score >= 60) return { label: "Almost there", cls: "border-chart-5/30 bg-chart-5/10 text-chart-5" }
  return { label: "Needs work", cls: "border-destructive/30 bg-destructive/10 text-destructive" }
}

export function ExamReadinessView() {
  const radarData = useMemo(
    () =>
      examReadiness.map((s) => ({
        subject: s.subject,
        coverage: s.coverage,
        accuracy: s.accuracy,
      })),
    [],
  )

  const aggregate = useMemo(
    () => Math.round(examReadiness.reduce((acc, s) => acc + overall(s), 0) / examReadiness.length),
    [],
  )

  const sorted = useMemo(() => [...examReadiness].sort((a, b) => overall(b) - overall(a)), [])

  return (
    <>
      <PageHeader
        title="Exam Readiness"
        description="A weighted view of how prepared you are across every subject."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="size-4 text-primary" />
              Overall readiness
            </CardTitle>
            <CardDescription>Across all active subjects</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 py-4">
            <div className="relative flex size-40 items-center justify-center">
              <svg className="size-40 -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--muted)" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(aggregate / 100) * 264} 264`}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-semibold tabular-nums">{aggregate}%</span>
                <span className="text-xs text-muted-foreground">ready</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="size-4 text-chart-4" />
              Up 6% from last week
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="size-4 text-primary" />
              Coverage vs. accuracy
            </CardTitle>
            <CardDescription>How well you know vs. how well you answer.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={config} className="mx-auto aspect-square max-h-[280px]">
              <RadarChart data={radarData}>
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <Radar
                  dataKey="coverage"
                  fill="var(--color-coverage)"
                  fillOpacity={0.3}
                  stroke="var(--color-coverage)"
                  strokeWidth={2}
                />
                <Radar
                  dataKey="accuracy"
                  fill="var(--color-accuracy)"
                  fillOpacity={0.15}
                  stroke="var(--color-accuracy)"
                  strokeWidth={2}
                />
              </RadarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subject breakdown</CardTitle>
          <CardDescription>Detailed readiness signals per subject.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {sorted.map((s) => {
            const score = overall(s)
            const badge = readinessBadge(score)
            return (
              <div key={s.subject} className="flex flex-col gap-3 rounded-lg border p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{s.subject}</span>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={cn(badge.cls)}>
                      {badge.label}
                    </Badge>
                    <span className="text-sm font-semibold tabular-nums">{score}%</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
                  {(
                    [
                      ["Coverage", s.coverage],
                      ["Accuracy", s.accuracy],
                      ["Consistency", s.consistency],
                      ["Confidence", s.confidence],
                    ] as const
                  ).map(([label, value]) => (
                    <div key={label} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{label}</span>
                        <span className="tabular-nums">{value}%</span>
                      </div>
                      <Progress value={value} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </>
  )
}
