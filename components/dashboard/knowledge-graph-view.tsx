"use client"

import { useMemo, useState } from "react"
import { Network, Info, Maximize2 } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { graphConcepts, graphEdges } from "@/lib/mock-data"

const groupColor: Record<string, string> = {
  subject: "var(--chart-1)",
  core: "var(--chart-3)",
  concept: "var(--chart-2)",
}

const W = 760
const H = 520

export function KnowledgeGraphView() {
  const [active, setActive] = useState<string | null>("ml")

  const positions = useMemo(() => {
    const map: Record<string, { x: number; y: number }> = {}
    const cx = W / 2
    const cy = H / 2
    const round = (n: number) => Math.round(n * 100) / 100
    const subjectsList = graphConcepts.filter((c) => c.group === "subject" || c.group === "core")
    const concepts = graphConcepts.filter((c) => c.group === "concept")

    subjectsList.forEach((c, i) => {
      const angle = (i / subjectsList.length) * Math.PI * 2 - Math.PI / 2
      map[c.id] = { x: round(cx + Math.cos(angle) * 140), y: round(cy + Math.sin(angle) * 110) }
    })
    concepts.forEach((c, i) => {
      const angle = (i / concepts.length) * Math.PI * 2
      map[c.id] = { x: round(cx + Math.cos(angle) * 260), y: round(cy + Math.sin(angle) * 210) }
    })
    return map
  }, [])

  const connectedIds = useMemo(() => {
    if (!active) return new Set<string>()
    const set = new Set<string>([active])
    graphEdges.forEach((e) => {
      if (e.source === active) set.add(e.target)
      if (e.target === active) set.add(e.source)
    })
    return set
  }, [active])

  const activeConcept = graphConcepts.find((c) => c.id === active)
  const neighbors = graphConcepts.filter((c) => c.id !== active && connectedIds.has(c.id))

  return (
    <>
      <PageHeader
        title="Knowledge Graph"
        description="See how every concept in your knowledge base connects."
      >
        <Button variant="outline">
          <Maximize2 data-icon="inline-start" />
          Fullscreen
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2">
          <CardContent className="p-0">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="h-[520px] w-full bg-[radial-gradient(circle_at_center,var(--muted)_0%,transparent_70%)]"
              role="img"
              aria-label="Knowledge graph of connected concepts"
            >
              {graphEdges.map((e, i) => {
                const a = positions[e.source]
                const b = positions[e.target]
                if (!a || !b) return null
                const isActive = active === e.source || active === e.target
                return (
                  <line
                    key={i}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={isActive ? "var(--primary)" : "var(--border)"}
                    strokeWidth={isActive ? 2 : 1}
                    strokeOpacity={active && !isActive ? 0.25 : 1}
                  />
                )
              })}
              {graphConcepts.map((c) => {
                const p = positions[c.id]
                if (!p) return null
                const isActive = c.id === active
                const isConnected = connectedIds.has(c.id)
                const dim = active && !isConnected
                const r = c.group === "subject" ? 26 : c.group === "core" ? 22 : 16
                return (
                  <g
                    key={c.id}
                    transform={`translate(${p.x},${p.y})`}
                    className="cursor-pointer"
                    onClick={() => setActive(c.id)}
                    opacity={dim ? 0.3 : 1}
                  >
                    <circle
                      r={r}
                      fill={groupColor[c.group] ?? "var(--chart-2)"}
                      fillOpacity={isActive ? 1 : 0.18}
                      stroke={groupColor[c.group] ?? "var(--chart-2)"}
                      strokeWidth={isActive ? 3 : 1.5}
                    />
                    <text
                      y={r + 14}
                      textAnchor="middle"
                      className="fill-foreground text-[11px] font-medium"
                    >
                      {c.label}
                    </text>
                  </g>
                )
              })}
            </svg>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="size-4 text-primary" />
                {activeConcept ? activeConcept.label : "Select a node"}
              </CardTitle>
              <CardDescription>
                {activeConcept
                  ? `${neighbors.length} direct connections`
                  : "Click any concept to explore its relationships."}
              </CardDescription>
            </CardHeader>
            {activeConcept && (
              <CardContent className="flex flex-col gap-3">
                <Badge variant="secondary" className="w-fit capitalize">
                  {activeConcept.group}
                </Badge>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Connected to</span>
                  <div className="flex flex-wrap gap-2">
                    {neighbors.map((n) => (
                      <button key={n.id} type="button" onClick={() => setActive(n.id)}>
                        <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                          {n.label}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Legend</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5">
              {[
                { label: "Subjects", group: "subject" },
                { label: "Core concepts", group: "core" },
                { label: "Concepts", group: "concept" },
              ].map((l) => (
                <div key={l.group} className="flex items-center gap-2.5 text-sm">
                  <span
                    className="size-3 rounded-full"
                    style={{ backgroundColor: groupColor[l.group] }}
                  />
                  {l.label}
                </div>
              ))}
              <div className="mt-1 flex gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                <Info className="size-3.5 shrink-0" />
                Click nodes to trace connections across your knowledge base.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
