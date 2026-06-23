"use client"

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
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
import type { KnowledgeGrowthPoint } from "@/types"

const chartConfig = {
  concepts: { label: "Concepts", color: "var(--chart-1)" },
  documents: { label: "Documents", color: "var(--chart-2)" },
} satisfies ChartConfig

export function KnowledgeGrowthChart({
  data = [],
}: {
  data?: KnowledgeGrowthPoint[]
}) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Knowledge growth</CardTitle>
        <CardDescription>
          Concepts and documents accumulated over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[260px] w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-center">
            <p className="text-sm font-medium">No data available</p>
            <p className="text-sm text-muted-foreground">
              Your knowledge growth will appear here as you study.
            </p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[260px] w-full">
            <AreaChart data={data} margin={{ left: 8, right: 8, top: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                dataKey="documents"
                type="monotone"
                fill="var(--color-documents)"
                fillOpacity={0.2}
                stroke="var(--color-documents)"
                stackId="a"
              />
              <Area
                dataKey="concepts"
                type="monotone"
                fill="var(--color-concepts)"
                fillOpacity={0.2}
                stroke="var(--color-concepts)"
                stackId="b"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
