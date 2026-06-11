import type { LucideIcon } from "lucide-react"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function StatCard({
  label,
  value,
  change,
  trend = "up",
  icon: Icon,
}: {
  label: string
  value: string
  change?: string
  trend?: "up" | "down"
  icon: LucideIcon
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="text-2xl font-semibold tracking-tight">{value}</span>
          {change ? (
            <span
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                trend === "up" ? "text-chart-2" : "text-destructive",
              )}
            >
              {trend === "up" ? (
                <ArrowUpRight className="size-3.5" />
              ) : (
                <ArrowDownRight className="size-3.5" />
              )}
              {change}
            </span>
          ) : null}
        </div>
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  )
}
