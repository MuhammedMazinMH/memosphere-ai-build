"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Sparkles,
  ArrowRight,
  ArrowDown,
  TriangleAlert,
  Target,
  Compass,
  CircleCheck,
  CircleDot,
  Lock,
  Clock,
  TrendingUp,
} from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { Recommendation, StudyPathStatus } from "@/types"

const stepIcon: Record<StudyPathStatus, typeof CircleDot> = {
  done: CircleCheck,
  current: CircleDot,
  next: ArrowRight,
  locked: Lock,
}

export function AICoachView() {
  const [aiCoach, setAiCoach] = useState<Recommendation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch("/api/recommendations")
        const json = await res.json()
        if (cancelled) return
        if (!res.ok) {
          setError(json.error ?? "Failed to load recommendations.")
        } else {
          setAiCoach(json.data ?? null)
        }
      } catch {
        if (!cancelled) setError("Network error.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <>
        <PageHeader title="AI Learning Coach" description="Personalized recommendations generated from your knowledge graph and study history." />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className={i === 0 ? "lg:col-span-2" : ""}>
              <CardContent className="flex flex-col gap-3 p-6">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-4 w-48" />
              </CardContent>
            </Card>
          ))}
        </div>
      </>
    )
  }

  if (error || !aiCoach) {
    return (
      <>
        <PageHeader title="AI Learning Coach" description="Personalized recommendations generated from your knowledge graph and study history." />
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm font-medium text-destructive">{error ?? "No recommendations available."}</p>
            <p className="text-xs text-muted-foreground">Upload and process documents to generate personalized coaching.</p>
          </CardContent>
        </Card>
      </>
    )
  }

  const { nextTopic, weakAreas, knowledgeGaps, studyPath, examReadiness } = aiCoach

  return (
    <>
      <PageHeader
        title="AI Learning Coach"
        description="Personalized recommendations generated from your knowledge graph and study history."
      >
        <Badge variant="secondary" className="gap-1.5">
          <Sparkles className="size-3.5 text-primary" />
          Updated live
        </Badge>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Next best topic */}
        <Card className="border-primary/30 bg-primary/5 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Compass className="size-4 text-primary" />
              Next best topic to study
            </CardTitle>
            <CardDescription>Based on what you&apos;ve already mastered.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-3 rounded-lg border border-border bg-card p-3">
                <CircleCheck className="size-5 shrink-0 text-chart-2" />
                <div>
                  <p className="text-xs text-muted-foreground">You understand</p>
                  <p className="font-medium">{nextTopic.mastered}</p>
                </div>
              </div>
              <ArrowRight className="mx-auto size-5 shrink-0 text-muted-foreground sm:rotate-0" aria-hidden />
              <div className="flex flex-1 items-center gap-3 rounded-lg border border-primary/40 bg-primary/10 p-3">
                <Sparkles className="size-5 shrink-0 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Recommended next</p>
                  <p className="font-semibold text-primary">{nextTopic.recommended}</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-pretty">{nextTopic.reason}</p>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Badge variant="secondary">{nextTopic.subject}</Badge>
              <span className="text-xs text-muted-foreground">
                Recommendation confidence{" "}
                <span className="font-semibold text-foreground">{nextTopic.confidence}%</span>
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Exam readiness */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="size-4 text-primary" />
              Predicted exam readiness
            </CardTitle>
            <CardDescription>{examReadiness.examName}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Current</p>
                <p className="text-3xl font-semibold tracking-tight">{examReadiness.current}%</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Potential</p>
                <p className="text-3xl font-semibold tracking-tight text-chart-2">{examReadiness.potential}%</p>
              </div>
            </div>
            <div className="relative">
              <Progress value={examReadiness.current} />
              <span
                className="absolute -top-1 h-4 w-0.5 bg-chart-2"
                style={{ left: `${examReadiness.potential}%` }}
                aria-hidden
              />
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-sm">
              <Clock className="size-4 shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground">
                Est. <span className="font-semibold text-foreground">{examReadiness.hoursNeeded} hours</span> of focused
                study to reach your potential.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Weak areas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TriangleAlert className="size-4 text-destructive" />
              Weak areas requiring attention
            </CardTitle>
            <CardDescription>Low-confidence concepts to revisit first.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {weakAreas.map((w) => (
              <div key={w.name} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{w.name}</span>
                  <span className="text-muted-foreground">{w.confidence}%</span>
                </div>
                <Progress value={w.confidence} />
                <span className="text-xs text-muted-foreground">{w.subject}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Knowledge gaps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-4 text-primary" />
              Knowledge gaps
            </CardTitle>
            <CardDescription>Concepts missing from your graph.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {knowledgeGaps.map((g) => (
              <div key={g.subject} className="flex flex-col gap-2">
                <span className="text-sm font-medium">{g.subject}</span>
                <div className="flex flex-wrap gap-2">
                  {g.missing.map((m) => (
                    <Badge key={m} variant="outline" className="border-dashed text-muted-foreground">
                      {m}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Study path */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="size-4 text-primary" />
              Recommended study path
            </CardTitle>
            <CardDescription>Your optimal sequence.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5">
            {studyPath.map((s, i) => {
              const Icon = stepIcon[s.status]
              return (
                <div key={s.label} className="flex flex-col gap-1.5">
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-lg border px-3 py-2",
                      s.status === "current"
                        ? "border-primary/40 bg-primary/10"
                        : s.status === "done"
                          ? "border-border bg-muted/40"
                          : "border-border",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4 shrink-0",
                        s.status === "done"
                          ? "text-chart-2"
                          : s.status === "current"
                            ? "text-primary"
                            : "text-muted-foreground",
                      )}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium leading-tight">{s.label}</p>
                      <p className="text-xs text-muted-foreground">{s.subject}</p>
                    </div>
                    {s.status === "current" && <Badge className="text-[10px]">In progress</Badge>}
                  </div>
                  {i < studyPath.length - 1 && (
                    <ArrowDown className="mx-auto size-3.5 text-muted-foreground" aria-hidden />
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-between gap-4 p-5 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="size-5" />
            </span>
            <div>
              <p className="font-medium">Ready to close your gaps?</p>
              <p className="text-sm text-muted-foreground">
                Generate a targeted quiz on {nextTopic.recommended} to lock it in.
              </p>
            </div>
          </div>
          <Button render={<Link href="/dashboard/quiz">Generate practice quiz<ArrowRight data-icon="inline-end" /></Link>} />
        </CardContent>
      </Card>
    </>
  )
}
