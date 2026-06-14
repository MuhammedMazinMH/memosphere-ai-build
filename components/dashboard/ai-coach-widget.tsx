import Link from "next/link"
import { Sparkles, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function AICoachWidget() {
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
      <CardContent>
        <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-card p-8 text-center">
          <Sparkles className="size-5 text-primary" />
          <p className="text-sm font-medium">No recommendations available yet</p>
          <p className="text-sm text-muted-foreground text-pretty">
            Upload documents and study to get personalized AI coaching.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
