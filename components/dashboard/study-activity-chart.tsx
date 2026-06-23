"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { StudyActivityPoint } from "@/types"

const chartConfig = {
  minutes: { label: "Minutes", color: "var(--chart-1)" },
} satisfies ChartConfig

export function StudyActivityChart({
  data = [],
}: {
  data?: StudyActivityPoint[]
}) {
  const hasActivity = data.some((d) => (d.minutes || 0) > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Study activity</CardTitle>
        <CardDescription>Minutes studied this week</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasActivity ? (
          <div className="flex h-[260px] w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-center">
            <p className="text-sm font-medium">No learning activity yet</p>
            <p className="text-sm text-muted-foreground">
              Study sessions you log will show up here.
            </p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[260px] w-full">
            <BarChart data={data} margin={{ left: 8, right: 8, top: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="minutes"
                fill="var(--color-minutes)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
