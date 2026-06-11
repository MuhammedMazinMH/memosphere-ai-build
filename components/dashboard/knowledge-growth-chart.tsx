"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
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

const knowledgeGrowth = analyticsService.getKnowledgeGrowth()

const config = {
  concepts: { label: "Concepts", color: "var(--chart-1)" },
  documents: { label: "Documents", color: "var(--chart-2)" },
} satisfies ChartConfig

export function KnowledgeGrowthChart() {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Knowledge growth</CardTitle>
        <CardDescription>
          Concepts and documents accumulated over the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-auto h-[260px] w-full">
          <AreaChart data={knowledgeGrowth} margin={{ left: 0, right: 12, top: 8 }}>
            <defs>
              <linearGradient id="fillConcepts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-concepts)" stopOpacity={0.6} />
                <stop offset="95%" stopColor="var(--color-concepts)" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="fillDocuments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-documents)" stopOpacity={0.5} />
                <stop offset="95%" stopColor="var(--color-documents)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} width={32} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Area
              dataKey="concepts"
              type="monotone"
              fill="url(#fillConcepts)"
              stroke="var(--color-concepts)"
              strokeWidth={2}
            />
            <Area
              dataKey="documents"
              type="monotone"
              fill="url(#fillDocuments)"
              stroke="var(--color-documents)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
