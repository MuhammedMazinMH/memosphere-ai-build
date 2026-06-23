"use client"

import { useMemo, useState } from "react"
import { CheckCircle2, CircleDashed, AlertCircle, Filter } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { GapTopic } from "@/types"

type StatusKey = GapTopic["status"]

const statusMeta: Record<
  StatusKey,
  { label: string; icon: typeof CheckCircle2; color: string; badge: string }
> = {
  mastered: {
    label: "Mastered",
    icon: CheckCircle2,
    color: "text-chart-4",
    badge: "border-chart-4/30 bg-chart-4/10 text-chart-4",
  },
  partial: {
    label: "In progress",
    icon: CircleDashed,
    color: "text-chart-5",
    badge: "border-chart-5/30 bg-chart-5/10 text-chart-5",
  },
  missing: {
    label: "Needs attention",
    icon: AlertCircle,
    color: "text-destructive",
    badge: "border-destructive/30 bg-destructive/10 text-destructive",
  },
}

const filters: { key: "all" | StatusKey; label: string }[] = [
  { key: "all", label: "All topics" },
  { key: "missing", label: "Needs attention" },
  { key: "partial", label: "In progress" },
  { key: "mastered", label: "Mastered" },
]

export function LearningGapsView({ gaps = [] }: { gaps?: GapTopic[] }) {
  const [filter, setFilter] = useState<"all" | StatusKey>("all")

  const counts = useMemo(() => {
    return {
      mastered: gaps.filter((g) => g.status === "mastered").length,
      partial: gaps.filter((g) => g.status === "partial").length,
      missing: gaps.filter((g) => g.status === "missing").length,
    }
  }, [gaps])

  const filtered = useMemo(
    () => (filter === "all" ? gaps : gaps.filter((g) => g.status === filter)),
    [filter, gaps],
  )

  return (
    <>
      <PageHeader
        title="Learning Gaps"
        description="Pinpoint weak topics so you can focus your study time where it matters."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(["mastered", "partial", "missing"] as StatusKey[]).map((key) => {
          const meta = statusMeta[key]
          return (
            <Card key={key}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
                <div className="flex flex-col gap-1">
                  <CardDescription>{meta.label}</CardDescription>
                  <CardTitle className="text-3xl">{counts[key]}</CardTitle>
                </div>
                <meta.icon className={cn("size-8", meta.color)} />
              </CardHeader>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle>Topic breakdown</CardTitle>
            <CardDescription>Mastery level across every tracked concept.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="size-4 text-muted-foreground" />
            {filters.map((f) => (
              <Button
                key={f.key}
                size="sm"
                variant={filter === f.key ? "default" : "outline"}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {gaps.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-12 text-center">
              <AlertCircle className="size-8 text-muted-foreground" />
              <p className="font-medium">No tracked topics yet</p>
              <p className="max-w-sm text-sm text-muted-foreground text-pretty">
                Upload documents and generate your knowledge graph to start
                tracking mastery and surfacing learning gaps.
              </p>
            </div>
          ) : (
            filtered.map((topic) => {
            const meta = statusMeta[topic.status]
            return (
              <div
                key={topic.name}
                className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <meta.icon className={cn("size-5 shrink-0", meta.color)} />
                  <div className="flex flex-col">
                    <span className="font-medium">{topic.name}</span>
                    <span className="text-xs text-muted-foreground">{topic.subject}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 sm:w-1/2">
                  <Progress value={topic.progress} className="flex-1" />
                  <span className="w-10 text-right text-sm tabular-nums text-muted-foreground">
                    {topic.progress}%
                  </span>
                  <Badge variant="outline" className={cn("shrink-0 capitalize", meta.badge)}>
                    {meta.label}
                  </Badge>
                </div>
              </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </>
  )
}
