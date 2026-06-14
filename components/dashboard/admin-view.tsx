"use client"

import { useState } from "react"
import useSWR from "swr"
import {
  Users,
  UserPlus,
  Activity,
  FolderKanban,
  FileText,
  Layers,
  Search,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PageHeader } from "@/components/dashboard/page-header"

interface StatsResponse {
  users: { total: number; newThisWeek: number; active: number }
  content: {
    subjects: number
    documents: number
    concepts: number
    settings: number
    notifications: number
  }
}

interface AdminUser {
  id: string
  name: string
  email: string
  imageUrl: string
  role: "admin" | "user"
  createdAt: number
  lastActiveAt: number | null
}

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Request failed")
    return r.json()
  })

function initialsOf(name: string, email: string) {
  const base = name && name !== "—" ? name : email
  return (
    base
      .split(/\s+/)
      .map((p) => p[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  loading,
}: {
  label: string
  value: number
  icon: typeof Users
  color: string
  loading: boolean
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-6">
        <div
          className="flex size-11 items-center justify-center rounded-lg"
          style={{
            backgroundColor: `color-mix(in oklch, ${color} 15%, transparent)`,
            color,
          }}
        >
          <Icon className="size-5" />
        </div>
        <div>
          {loading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="text-2xl font-semibold tabular-nums">{value.toLocaleString()}</p>
          )}
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function AdminView() {
  const [search, setSearch] = useState("")
  const { data: stats, isLoading: statsLoading } = useSWR<StatsResponse>(
    "/api/admin/stats",
    fetcher,
  )
  const { data: usersData, isLoading: usersLoading } = useSWR<{
    users: AdminUser[]
    total: number
  }>(`/api/admin/users?q=${encodeURIComponent(search)}`, fetcher, {
    keepPreviousData: true,
  })

  const users = usersData?.users ?? []

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Admin"
        description="Real platform metrics from Clerk and DynamoDB."
      />

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">User analytics</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Total users"
            value={stats?.users.total ?? 0}
            icon={Users}
            color="var(--chart-1)"
            loading={statsLoading}
          />
          <StatCard
            label="New this week"
            value={stats?.users.newThisWeek ?? 0}
            icon={UserPlus}
            color="var(--chart-2)"
            loading={statsLoading}
          />
          <StatCard
            label="Active users"
            value={stats?.users.active ?? 0}
            icon={Activity}
            color="var(--chart-4)"
            loading={statsLoading}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">Content analytics</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Subjects"
            value={stats?.content.subjects ?? 0}
            icon={FolderKanban}
            color="var(--chart-3)"
            loading={statsLoading}
          />
          <StatCard
            label="Documents"
            value={stats?.content.documents ?? 0}
            icon={FileText}
            color="var(--chart-1)"
            loading={statsLoading}
          />
          <StatCard
            label="Concepts"
            value={stats?.content.concepts ?? 0}
            icon={Layers}
            color="var(--chart-5)"
            loading={statsLoading}
          />
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>User management</CardTitle>
          <CardDescription>Search and view registered users.</CardDescription>
          <div className="relative mt-2 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="pl-9"
              aria-label="Search users"
            />
          </div>
        </CardHeader>
        <CardContent>
          {usersLoading && users.length === 0 ? (
            <div className="flex flex-col gap-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {search ? "No users match your search." : "No users yet."}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Joined</TableHead>
                  <TableHead className="text-right">Last active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          <AvatarImage src={u.imageUrl || undefined} alt="" />
                          <AvatarFallback className="bg-muted text-xs">
                            {initialsOf(u.name, u.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{u.name}</p>
                          <p className="truncate text-sm text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                      {u.lastActiveAt
                        ? new Date(u.lastActiveAt).toLocaleDateString()
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
