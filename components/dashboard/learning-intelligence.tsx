import { BrainCircuit } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function LearningIntelligence() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <BrainCircuit className="size-5 text-primary" />
        <h2 className="text-lg font-semibold">Learning intelligence</h2>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-1 p-10 text-center">
          <BrainCircuit className="size-6 text-muted-foreground" />
          <p className="text-sm font-medium">No insights available yet</p>
          <p className="text-sm text-muted-foreground text-pretty">
            Learning intelligence will appear once you start studying and tracking concepts.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
