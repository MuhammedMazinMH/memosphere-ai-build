"use client"

import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Users, FileText, Layers, Activity } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { analyticsService } from "@/lib/services"
import { PageHeader } from "@/components/dashboard/page-header"

const adminStats = analyticsService.getAdminStats()

const growthConfig = {
  users: { label: "Users", color: "var(--chart-1)" },
} satisfies ChartConfig

const engagementConfig = {
  usage: { label: "Usage %", color: "var(--chart-2)" },
} satisfies ChartConfig

const recentUsers = [
  { name: "Priya Menon", email: "priya@uni.edu", plan: "Pro", docs: 142, status: "active" },
  { name: "Liam Carter", email: "liam@uni.edu", plan: "Free", docs: 38, status: "active" },
  { name: "Sofia Rossi", email: "sofia@uni.edu", plan: "Pro", docs: 219, status: "active" },
  { name: "Kenji Tanaka", email: "kenji@uni.edu", plan: "Free", docs: 12, status: "inactive" },
  { name: "Amara Okafor", email: "amara@uni.edu", plan: "Pro", docs: 87, status: "active" },
]

const stats = [
  { label: "Total users", value: adminStats.totalUsers.toLocaleString(), icon: Users, color: "var(--chart-1)" },
  { label: "Documents", value: adminStats.totalDocuments.toLocaleString(), icon: FileText, color: "var(--chart-2)" },
  { label: "Concepts mapped", value: `${(adminStats.totalConcepts / 1_000_000).toFixed(2)}M`, icon: Layers, color: "var(--chart-3)" },
  { label: "Active today", value: adminStats.activeToday.toLocaleString(), icon: Activity, color: "var(--chart-4)" },
]

export function AdminView() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Admin Analytics"
        description="Platform-wide usage, growth, and engagement metrics."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 py-6">
              <div
                className="flex size-11 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: `color-mix(in oklch, ${s.color} 15%, transparent)`,
                  color: s.color,
                }}
              >
                <s.icon className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold tabular-nums">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>User growth</CardTitle>
            <CardDescription>Total registered users over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={growthConfig} className="aspect-auto h-[280px] w-full">
              <AreaChart data={adminStats.userGrowth} margin={{ top: 8, right: 8 }}>
                <defs>
                  <linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-users)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--color-users)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} width={44} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Area
                  dataKey="users"
                  type="monotone"
                  stroke="var(--color-users)"
                  strokeWidth={2}
                  fill="url(#fillUsers)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Feature engagement</CardTitle>
            <CardDescription>Adoption by feature</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={engagementConfig} className="aspect-auto h-[280px] w-full">
              <BarChart data={adminStats.engagement} layout="vertical" margin={{ left: 12 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis type="number" hide domain={[0, 100]} />
                <YAxis
                  type="category"
                  dataKey="feature"
                  tickLine={false}
                  axisLine={false}
                  width={84}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar dataKey="usage" fill="var(--color-usage)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent users</CardTitle>
          <CardDescription>Latest sign-ups and their activity</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="text-right">Documents</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentUsers.map((u) => (
                <TableRow key={u.email}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarFallback className="bg-muted text-xs">
                          {u.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{u.name}</p>
                        <p className="truncate text-sm text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.plan === "Pro" ? "default" : "secondary"}>{u.plan}</Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{u.docs}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={u.status === "active" ? "secondary" : "outline"}>
                      {u.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
