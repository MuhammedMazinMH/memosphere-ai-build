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
import { SubjectCard } from "@/components/dashboard/subject-card"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { subjectService } from "@/lib/services"
import { authService } from "@/lib/services/auth/auth-service.server"

const subjects = subjectService.getSubjects()

export const metadata: Metadata = {
  title: "Dashboard",
}

// Identity is read from the live Clerk session via auth()/currentUser(), so the
// page must always render dynamically — never prerender/cache a stale user.
export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const clerkUser = await authService.getClerkUser()
  console.log("CLERK USER", {
    id: clerkUser?.id,
    firstName: clerkUser?.firstName,
    lastName: clerkUser?.lastName,
    email: clerkUser?.emailAddress,
  })

  const user = await authService.getCurrentUser()
  const firstName = user.name.split(" ")[0]

  return (
    <>
      <PageHeader
        title={firstName ? `Welcome back, ${firstName}` : "Welcome back"}
        description={`${user.goal} \u00B7 ${user.streak}-day streak`}
      >
        <Badge variant="secondary" className="gap-1">
          <Flame className="size-3.5 text-chart-4" />
          {user.streak} days
        </Badge>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Documents" value="84" change="+12 this month" icon={FileStack} />
        <StatCard label="Concepts learned" value="673" change="+153 this month" icon={Lightbulb} />
        <StatCard label="Study streak" value="14 days" change="Personal best" icon={Flame} />
        <StatCard label="Avg. mastery" value="66%" change="+8% this month" icon={Target} />
      </div>

      <AICoachWidget />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <KnowledgeGrowthChart />
        <StudyActivityChart />
      </div>

      <LearningIntelligence />

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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {subjects.slice(0, 4).map((s) => (
              <SubjectCard key={s.id} subject={s} />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Activity</h2>
          <ActivityFeed />
        </div>
      </div>
    </>
  )
}
