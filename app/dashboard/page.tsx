import Link from "next/link"
import type { Metadata } from "next"
import { FileStack, Lightbulb, Flame, Target, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { KnowledgeGrowthChart } from "@/components/dashboard/knowledge-growth-chart"
import { StudyActivityChart } from "@/components/dashboard/study-activity-chart"
import { AICoachWidget } from "@/components/dashboard/ai-coach-widget"
import { LearningIntelligence } from "@/components/dashboard/learning-intelligence"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { authService } from "@/lib/services/auth/auth-service.server"
import { settingsRepository } from "@/db/repositories/settings-repository"
import { analyticsService } from "@/lib/services"

export const metadata: Metadata = {
  title: "Dashboard",
}

// Identity is read from the live Clerk session via auth()/currentUser(), so the
// page must always render dynamically — never prerender/cache a stale user.
export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const user = await authService.getCurrentUser()
  const firstName = user.name.split(" ")[0]

  // Study goal is user-owned content persisted in DynamoDB, scoped by user id.
  const settings = user.id ? await settingsRepository.get(user.id) : null
  const goal = settings?.studyGoal ?? ""

  // Every dashboard metric is computed deterministically from the user's real
  // DynamoDB records (documents, study sessions, quiz attempts) by the metric
  // calculators. New accounts / empty databases resolve to honest zero values
  // and empty states — never mock or placeholder data.
  const metrics = user.id
    ? await analyticsService.getDashboardMetrics(user.id)
    : await analyticsService.getDashboardMetrics("")

  const documentCount = metrics.documents
  const conceptsLearned = metrics.conceptsLearned
  const studyStreak = metrics.studyStreak
  const avgMastery = metrics.avgMastery

  return (
    <>
      <PageHeader
        title={firstName ? `Welcome back, ${firstName}` : "Welcome back"}
        description={goal ? `${goal} \u00B7 ${studyStreak}-day streak` : `${studyStreak}-day streak`}
      >
        <Badge variant="secondary" className="gap-1">
          <Flame className="size-3.5 text-chart-4" />
          {studyStreak} days
        </Badge>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Documents" value={String(documentCount)} icon={FileStack} />
        <StatCard label="Concepts learned" value={String(conceptsLearned)} icon={Lightbulb} />
        <StatCard label="Study streak" value={`${studyStreak} days`} icon={Flame} />
        <StatCard label="Avg. mastery" value={`${avgMastery}%`} icon={Target} />
      </div>

      <AICoachWidget />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <KnowledgeGrowthChart data={metrics.knowledgeGrowth} />
        <StudyActivityChart data={metrics.studyActivity} />
      </div>

      <LearningIntelligence data={metrics.learningIntelligence} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your subjects</h2>
            <Button
              variant="ghost"
              size="sm"
              render={
                <Link href="/dashboard/subjects">
                  View all
                  <ArrowRight data-icon="inline-end" />
                </Link>
              }
            />
          </div>
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card/50 p-10 text-center">
            <FileStack className="size-6 text-muted-foreground" />
            <p className="text-sm font-medium">No subjects yet</p>
            <p className="text-sm text-muted-foreground text-pretty">
              Create a subject to start organizing your documents and concepts.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Activity</h2>
          <ActivityFeed items={metrics.recentActivity} />
        </div>
      </div>
    </>
  )
}
