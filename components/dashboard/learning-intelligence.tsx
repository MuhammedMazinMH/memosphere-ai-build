import { BrainCircuit, Lightbulb } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { LearningIntelligence as LearningIntelligenceData } from "@/types"

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-xl font-semibold tracking-tight">{value}</span>
    </div>
  )
}

export function LearningIntelligence({
  data,
}: {
  data?: LearningIntelligenceData
}) {
  const hasInsights =
    !!data && (data.weeklyInsights.length > 0 || data.coverage > 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <BrainCircuit className="size-5 text-primary" />
        <h2 className="text-lg font-semibold">Learning intelligence</h2>
      </div>

      {!hasInsights ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-1 p-10 text-center">
            <BrainCircuit className="size-6 text-muted-foreground" />
            <p className="text-sm font-medium">No insights available yet</p>
            <p className="text-sm text-muted-foreground text-pretty">
              Learning intelligence will appear once you start studying and
              tracking concepts.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Metric label="Coverage" value={`${data!.coverage}%`} />
            <Metric label="Consistency" value={`${data!.consistency}%`} />
            <Metric label="AI confidence" value={`${data!.aiConfidence}%`} />
            <Metric
              label="Weakest concept"
              value={data!.weakest.concept || "—"}
            />
          </div>
          {data!.weeklyInsights.length > 0 ? (
            <Card>
              <CardContent className="flex flex-col gap-3 p-5">
                {data!.weeklyInsights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" />
                    <p className="text-sm text-pretty">{insight}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  )
}
