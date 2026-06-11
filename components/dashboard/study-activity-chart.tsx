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
import { analyticsService } from "@/lib/services"

const studyActivity = analyticsService.getStudyActivity()

const config = {
  minutes: { label: "Minutes", color: "var(--chart-1)" },
} satisfies ChartConfig

export function StudyActivityChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Study activity</CardTitle>
        <CardDescription>Minutes studied this week</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-auto h-[260px] w-full">
          <BarChart data={studyActivity} margin={{ top: 8 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="minutes" fill="var(--color-minutes)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
