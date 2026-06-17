"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  Network,
  Info,
  ZoomIn,
  ZoomOut,
  Locate,
  Sparkles,
  ArrowRight,
  ArrowDown,
  Gauge,
  Boxes,
  Share2,
  TriangleAlert,
  Crown,
} from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { Concept, ConceptConnection } from "@/types"

const W = 820
const H = 580
const MM_W = 168
const MM_H = Math.round((H / W) * MM_W)

type ViewState = { scale: number; x: number; y: number }

const statusMeta: Record<string, { label: string; color: string }> = {
  core: { label: "Core", color: "var(--chart-1)" },
  connected: { label: "Highly connected", color: "var(--chart-3)" },
  emerging: { label: "Emerging", color: "var(--chart-2)" },
  weak: { label: "Weak", color: "var(--destructive)" },
  document: { label: "Document", color: "var(--muted-foreground)" },
}

function nodeColor(n: Concept) {
  if (n.group === "document") return statusMeta.document.color
  return statusMeta[n.status ?? "emerging"]?.color ?? "var(--chart-2)"
}

function nodeRadius(n: Concept) {
  if (n.group === "subject") return 24
  if (n.group === "core") return 19
  if (n.group === "document") return 11
  return 15
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export function KnowledgeGraphView() {
  // --- Real data from API ---
  const [graphConcepts, setGraphConcepts] = useState<Concept[]>([])
  const [graphEdges, setGraphEdges] = useState<ConceptConnection[]>([])
  const [conceptJourney, setConceptJourney] = useState<string[]>([])
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [active, setActive] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [cursor, setCursor] = useState({ x: 0, y: 0 })
  const [view, setView] = useState<ViewState>({ scale: 1, x: 0, y: 0 })
  const [loaded, setLoaded] = useState(false)
  const [panning, setPanning] = useState(false)

  // Filters
  const [showSubjects, setShowSubjects] = useState(true)
  const [showConcepts, setShowConcepts] = useState(true)
  const [showDocuments, setShowDocuments] = useState(true)
  const [recentOnly, setRecentOnly] = useState(false)
  const [difficulty, setDifficulty] = useState<"all" | "foundational" | "intermediate" | "advanced">("all")

  const svgRef = useRef<SVGSVGElement>(null)
  const dragRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    let cancelled = false
    async function loadGraph() {
      try {
        const res = await fetch("/api/knowledge-graph")
        const json = await res.json()
        if (cancelled) return
        if (!res.ok) {
          setFetchError(json.error ?? "Failed to load knowledge graph.")
        } else {
          setGraphConcepts(json.data?.concepts ?? [])
          setGraphEdges(json.data?.connections ?? [])
          setConceptJourney(json.data?.journey ?? [])
        }
      } catch (e) {
        if (!cancelled) setFetchError("Network error loading graph.")
      } finally {
        if (!cancelled) setLoaded(true)
      }
    }
    loadGraph()
    return () => { cancelled = true }
  }, [])

  // Clustered radial layout: subjects on inner ring, their concepts orbit around them.
  const positions = useMemo(() => {
    const map: Record<string, { x: number; y: number }> = {}
    const cx = W / 2
    const cy = H / 2
    const round = (n: number) => Math.round(n * 100) / 100
    const subjectNodes = graphConcepts.filter((c) => c.group === "subject")

    subjectNodes.forEach((s, i) => {
      const angle = (i / subjectNodes.length) * Math.PI * 2 - Math.PI / 2
      const sx = cx + Math.cos(angle) * 200
      const sy = cy + Math.sin(angle) * 150
      map[s.id] = { x: round(sx), y: round(sy) }

      const children = graphConcepts.filter((c) => c.subject === s.subject && c.id !== s.id)
      children.forEach((c, j) => {
        const a = (j / children.length) * Math.PI * 2 + i
        const r = c.group === "document" ? 70 : 110
        map[c.id] = { x: round(sx + Math.cos(a) * r), y: round(sy + Math.sin(a) * r) }
      })
    })
    return map
  }, [graphConcepts])

  const degree = useMemo(() => {
    const d: Record<string, number> = {}
    graphEdges.forEach((e) => {
      d[e.source] = (d[e.source] ?? 0) + 1
      d[e.target] = (d[e.target] ?? 0) + 1
    })
    return d
  }, [graphEdges])

  const visibleIds = useMemo(() => {
    const set = new Set<string>()
    graphConcepts.forEach((n) => {
      if (n.group === "subject") {
        if (showSubjects) set.add(n.id)
        return
      }
      const typeOk = n.group === "document" ? showDocuments : showConcepts
      if (!typeOk) return
      if (recentOnly && !n.recent) return
      if (difficulty !== "all" && n.difficulty !== difficulty) return
      set.add(n.id)
    })
    return set
  }, [graphConcepts, showSubjects, showConcepts, showDocuments, recentOnly, difficulty])

  const visibleEdges = useMemo(
    () => graphEdges.filter((e) => visibleIds.has(e.source) && visibleIds.has(e.target)),
    [graphEdges, visibleIds],
  )

  const connectedIds = useMemo(() => {
    if (!active) return new Set<string>()
    const set = new Set<string>([active])
    graphEdges.forEach((e) => {
      if (e.source === active) set.add(e.target)
      if (e.target === active) set.add(e.source)
    })
    return set
  }, [active, graphEdges])

  const activeConcept = graphConcepts.find((c) => c.id === active) ?? null

  const neighbors = useMemo(() => {
    if (!active) return [] as { node: Concept; strength: number }[]
    return graphEdges
      .filter((e) => e.source === active || e.target === active)
      .map((e) => {
        const otherId = e.source === active ? e.target : e.source
        const node = graphConcepts.find((c) => c.id === otherId)!
        return { node, strength: e.strength ?? 50 }
      })
      .filter((n) => n.node)
      .sort((a, b) => b.strength - a.strength)
  }, [active, graphConcepts, graphEdges])

  // Statistics
  const stats = useMemo(() => {
    const concepts = graphConcepts.filter((c) => c.group !== "document")
    const ranked = [...concepts].sort((a, b) => (degree[b.id] ?? 0) - (degree[a.id] ?? 0))
    const mastered = concepts.filter((c) => (c.mastery ?? 0) > 0)
    const weakest = [...mastered].sort((a, b) => (a.mastery ?? 0) - (b.mastery ?? 0))[0]
    const avgDegree = graphConcepts.length > 0 ? (2 * graphEdges.length) / graphConcepts.length : 0
    return {
      totalConcepts: concepts.length,
      totalConnections: graphEdges.length,
      mostConnected: ranked[0],
      mostConnectedDegree: degree[ranked[0]?.id] ?? 0,
      weakest,
      density: clamp(Math.round(avgDegree * 28), 0, 100),
    }
  }, [degree, graphConcepts, graphEdges])

  const hoveredNode = hovered ? graphConcepts.find((c) => c.id === hovered) : null
  const journeyNodes = conceptJourney
    .map((id) => graphConcepts.find((c) => c.id === id))
    .filter(Boolean) as Concept[]

  // Zoom & pan helpers
  function zoomAt(factor: number, clientX: number, clientY: number) {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const sx = ((clientX - rect.left) / rect.width) * W
    const sy = ((clientY - rect.top) / rect.height) * H
    setView((v) => {
      const newScale = clamp(v.scale * factor, 0.5, 3)
      const k = newScale / v.scale
      return { scale: newScale, x: sx - (sx - v.x) * k, y: sy - (sy - v.y) * k }
    })
  }

  function handleWheel(e: React.WheelEvent) {
    zoomAt(e.deltaY < 0 ? 1.12 : 0.89, e.clientX, e.clientY)
  }

  function handlePointerDown(e: React.PointerEvent) {
    dragRef.current = { x: e.clientX, y: e.clientY }
    setPanning(true)
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent) {
    const rect = svgRef.current?.getBoundingClientRect()
    if (rect) setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    if (dragRef.current && rect) {
      const dx = ((e.clientX - dragRef.current.x) / rect.width) * W
      const dy = ((e.clientY - dragRef.current.y) / rect.height) * H
      dragRef.current = { x: e.clientX, y: e.clientY }
      setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }))
    }
  }

  function endPan() {
    dragRef.current = null
    setPanning(false)
  }

  function resetView() {
    setView({ scale: 1, x: 0, y: 0 })
  }

  // Minimap viewport rect (world -> minimap space)
  const mm = MM_W / W
  const vp = {
    x: clamp((-view.x / view.scale) * mm, 0, MM_W),
    y: clamp((-view.y / view.scale) * mm, 0, MM_H),
    w: clamp((W / view.scale) * mm, 0, MM_W),
    h: clamp((H / view.scale) * mm, 0, MM_H),
  }

  const filters: { label: string; on: boolean; toggle: () => void }[] = [
    { label: "Subjects", on: showSubjects, toggle: () => setShowSubjects((v) => !v) },
    { label: "Concepts", on: showConcepts, toggle: () => setShowConcepts((v) => !v) },
    { label: "Documents", on: showDocuments, toggle: () => setShowDocuments((v) => !v) },
    { label: "Recently learned", on: recentOnly, toggle: () => setRecentOnly((v) => !v) },
  ]

  const difficulties: { label: string; value: typeof difficulty }[] = [
    { label: "All", value: "all" },
    { label: "Foundational", value: "foundational" },
    { label: "Intermediate", value: "intermediate" },
    { label: "Advanced", value: "advanced" },
  ]

  return (
    <>
      <PageHeader
        title="Knowledge Graph"
        description="An AI-mapped view of how every concept in your knowledge base connects."
      >
        <Badge variant="secondary" className="gap-1.5">
          <Sparkles className="size-3.5 text-primary" />
          AI intelligence
        </Badge>
      </PageHeader>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <GraphStat icon={Boxes} label="Total concepts" value={String(stats.totalConcepts)} />
        <GraphStat icon={Share2} label="Total connections" value={String(stats.totalConnections)} />
        <GraphStat
          icon={Crown}
          label="Most connected"
          value={stats.mostConnected?.label ?? "—"}
          sub={`${stats.mostConnectedDegree} links`}
          accent="var(--chart-3)"
        />
        <GraphStat
          icon={TriangleAlert}
          label="Weakest topic"
          value={stats.weakest?.label ?? "—"}
          sub={`${stats.weakest?.mastery ?? 0}% mastery`}
          accent="var(--destructive)"
        />
        <GraphStat icon={Gauge} label="Knowledge density" value={`${stats.density}`} sub="connectivity score" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Filters</span>
            {filters.map((f) => (
              <button
                key={f.label}
                type="button"
                onClick={f.toggle}
                aria-pressed={f.on}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  f.on
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                {f.label}
              </button>
            ))}
            <span className="mx-1 h-4 w-px bg-border" aria-hidden />
            {difficulties.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => setDifficulty(d.value)}
                aria-pressed={difficulty === d.value}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  difficulty === d.value
                    ? "border-accent/50 bg-accent/15 text-accent-foreground"
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                {d.label}
              </button>
            ))}
          </div>

          <Card className="relative overflow-hidden">
            <CardContent className="p-0">
              {!loaded ? (
                <div className="flex h-[580px] w-full items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <Skeleton className="size-16 rounded-full" />
                    <Skeleton className="h-3 w-40" />
                    <span className="text-xs text-muted-foreground">Mapping your knowledge graph…</span>
                  </div>
                </div>
              ) : fetchError ? (
                <div className="flex h-[580px] w-full items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <span className="text-sm font-medium text-destructive">Failed to load graph</span>
                    <span className="text-xs text-muted-foreground">{fetchError}</span>
                  </div>
                </div>
              ) : graphConcepts.length === 0 ? (
                <div className="flex h-[580px] w-full items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
                    <span className="text-sm">No concepts yet.</span>
                    <span className="text-xs">Upload and process documents to build your graph.</span>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <svg
                    ref={svgRef}
                    viewBox={`0 0 ${W} ${H}`}
                    className={cn(
                      "h-[580px] w-full touch-none select-none bg-[radial-gradient(circle_at_center,var(--muted)_0%,transparent_70%)]",
                      panning ? "cursor-grabbing" : "cursor-grab",
                    )}
                    role="img"
                    aria-label="Interactive knowledge graph of connected concepts"
                    onWheel={handleWheel}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={endPan}
                    onPointerLeave={() => {
                      endPan()
                      setHovered(null)
                    }}
                  >
                    <rect x={0} y={0} width={W} height={H} fill="transparent" onClick={() => setActive(null)} />
                    <g transform={`translate(${view.x} ${view.y}) scale(${view.scale})`}>
                      {visibleEdges.map((e, i) => {
                        const a = positions[e.source]
                        const b = positions[e.target]
                        if (!a || !b) return null
                        const isActive = active === e.source || active === e.target
                        return (
                          <g key={i}>
                            <line
                              x1={a.x}
                              y1={a.y}
                              x2={b.x}
                              y2={b.y}
                              stroke={isActive ? "var(--primary)" : "var(--border)"}
                              strokeWidth={isActive ? 2.5 : 1}
                              strokeOpacity={active && !isActive ? 0.18 : 1}
                              className={isActive ? "edge-flow" : undefined}
                            />
                            {isActive && (
                              <g transform={`translate(${(a.x + b.x) / 2} ${(a.y + b.y) / 2})`}>
                                <rect x={-13} y={-9} width={26} height={16} rx={8} fill="var(--card)" stroke="var(--border)" />
                                <text textAnchor="middle" y={3} className="fill-foreground text-[9px] font-semibold">
                                  {e.strength ?? 50}
                                </text>
                              </g>
                            )}
                          </g>
                        )
                      })}
                      {graphConcepts.map((c) => {
                        if (!visibleIds.has(c.id)) return null
                        const p = positions[c.id]
                        if (!p) return null
                        const isActive = c.id === active
                        const isConnected = connectedIds.has(c.id)
                        const dim = active && !isConnected
                        const r = nodeRadius(c)
                        const color = nodeColor(c)
                        return (
                          <g
                            key={c.id}
                            transform={`translate(${p.x},${p.y})`}
                            className="cursor-pointer transition-opacity"
                            opacity={dim ? 0.25 : 1}
                            onClick={(ev) => {
                              ev.stopPropagation()
                              setActive(c.id)
                            }}
                            onPointerEnter={() => setHovered(c.id)}
                            onPointerLeave={() => setHovered(null)}
                          >
                            {isActive && (
                              <circle r={r} fill={color} className="node-pulse" />
                            )}
                            <circle
                              r={r}
                              fill={color}
                              fillOpacity={isActive ? 1 : 0.2}
                              stroke={color}
                              strokeWidth={isActive ? 3 : 1.5}
                            />
                            {c.group === "subject" && (
                              <text textAnchor="middle" y={4} className="fill-background text-[10px] font-bold">
                                {c.label
                                  .split(" ")
                                  .map((w) => w[0])
                                  .join("")
                                  .slice(0, 2)}
                              </text>
                            )}
                            <text
                              y={r + 13}
                              textAnchor="middle"
                              className={cn(
                                "text-[10px]",
                                isActive ? "fill-foreground font-semibold" : "fill-muted-foreground font-medium",
                              )}
                            >
                              {c.label.length > 18 ? `${c.label.slice(0, 17)}…` : c.label}
                            </text>
                          </g>
                        )
                      })}
                    </g>
                  </svg>

                  {/* Hover tooltip */}
                  {hoveredNode && !panning && (
                    <div
                      className="pointer-events-none absolute z-20 w-52 rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-lg"
                      style={{
                        left: clamp(cursor.x + 14, 0, 520),
                        top: clamp(cursor.y + 14, 0, 460),
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full" style={{ backgroundColor: nodeColor(hoveredNode) }} />
                        <span className="text-sm font-semibold leading-tight">{hoveredNode.label}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{hoveredNode.subject}</p>
                      {hoveredNode.group !== "document" ? (
                        <div className="mt-2 grid grid-cols-2 gap-1.5 text-xs">
                          <span className="text-muted-foreground">Mastery</span>
                          <span className="text-right font-medium">{hoveredNode.mastery}%</span>
                          <span className="text-muted-foreground">Importance</span>
                          <span className="text-right font-medium">{hoveredNode.importance}</span>
                          <span className="text-muted-foreground">Reviews</span>
                          <span className="text-right font-medium">{hoveredNode.frequency}</span>
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-muted-foreground">Source document · {hoveredNode.frequency} references</p>
                      )}
                    </div>
                  )}

                  {/* Zoom controls */}
                  <div className="absolute right-3 top-3 flex flex-col gap-1.5">
                    <Button
                      size="icon"
                      variant="outline"
                      className="size-8 bg-card/80 backdrop-blur"
                      onClick={(e) => zoomAt(1.2, e.clientX, e.clientY)}
                      aria-label="Zoom in"
                    >
                      <ZoomIn className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="size-8 bg-card/80 backdrop-blur"
                      onClick={(e) => zoomAt(0.8, e.clientX, e.clientY)}
                      aria-label="Zoom out"
                    >
                      <ZoomOut className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="size-8 bg-card/80 backdrop-blur"
                      onClick={resetView}
                      aria-label="Reset view"
                    >
                      <Locate className="size-4" />
                    </Button>
                  </div>

                  {/* Minimap */}
                  <div className="absolute bottom-3 left-3 overflow-hidden rounded-md border border-border bg-card/80 backdrop-blur">
                    <svg width={MM_W} height={MM_H} aria-hidden>
                      {visibleEdges.map((e, i) => {
                        const a = positions[e.source]
                        const b = positions[e.target]
                        if (!a || !b) return null
                        return (
                          <line
                            key={i}
                            x1={a.x * mm}
                            y1={a.y * mm}
                            x2={b.x * mm}
                            y2={b.y * mm}
                            stroke="var(--border)"
                            strokeWidth={0.5}
                          />
                        )
                      })}
                      {graphConcepts.map((c) => {
                        if (!visibleIds.has(c.id)) return null
                        const p = positions[c.id]
                        if (!p) return null
                        return (
                          <circle
                            key={c.id}
                            cx={p.x * mm}
                            cy={p.y * mm}
                            r={c.group === "subject" ? 2.5 : 1.5}
                            fill={nodeColor(c)}
                          />
                        )
                      })}
                      <rect
                        x={vp.x}
                        y={vp.y}
                        width={vp.w}
                        height={vp.h}
                        fill="var(--primary)"
                        fillOpacity={0.12}
                        stroke="var(--primary)"
                        strokeWidth={1}
                      />
                    </svg>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right rail */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="size-4 text-primary" />
                AI Insights
              </CardTitle>
              <CardDescription>
                {activeConcept ? "Live analysis of your selected concept." : "Select any node to analyze it."}
              </CardDescription>
            </CardHeader>
            {activeConcept && (
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-lg font-semibold leading-tight">{activeConcept.label}</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{activeConcept.subject}</Badge>
                    {activeConcept.status && (
                      <Badge
                        variant="outline"
                        style={{
                          color: statusMeta[activeConcept.status]?.color,
                          borderColor: statusMeta[activeConcept.status]?.color,
                        }}
                      >
                        {statusMeta[activeConcept.status]?.label}
                      </Badge>
                    )}
                  </div>
                </div>

                {activeConcept.group !== "document" && (
                  <div className="flex flex-col gap-3">
                    <Metric label="Importance score" value={activeConcept.importance ?? 0} suffix="/100" />
                    <Metric label="Mastery" value={activeConcept.mastery ?? 0} suffix="%" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Learning frequency</span>
                      <span className="font-medium">{activeConcept.frequency} reviews</span>
                    </div>
                  </div>
                )}

                {neighbors.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Related concepts</span>
                    <div className="flex flex-col gap-2">
                      {neighbors.slice(0, 5).map((n) => (
                        <button
                          key={n.node.id}
                          type="button"
                          onClick={() => setActive(n.node.id)}
                          className="flex items-center gap-2 text-left"
                        >
                          <span className="flex-1 truncate text-sm hover:text-primary">{n.node.label}</span>
                          <span className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                            <span
                              className="block h-full rounded-full bg-primary"
                              style={{ width: `${n.strength}%` }}
                            />
                          </span>
                          <span className="w-7 text-right text-xs text-muted-foreground">{n.strength}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {/* Concept journey */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Concept Journey</CardTitle>
              <CardDescription>A suggested path through linked ideas.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-1.5">
              {journeyNodes.map((n, i) => (
                <div key={n.id} className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActive(n.id)}
                    className={cn(
                      "flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
                      active === n.id ? "border-primary/40 bg-primary/10" : "border-border",
                    )}
                  >
                    <span className="font-medium">{n.label}</span>
                    <span className="text-xs text-muted-foreground">{n.mastery}%</span>
                  </button>
                  {i < journeyNodes.length - 1 && (
                    <ArrowDown className="mx-auto size-3.5 text-muted-foreground" aria-hidden />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Legend</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5">
              {Object.entries(statusMeta).map(([key, meta]) => (
                <div key={key} className="flex items-center gap-2.5 text-sm">
                  <span className="size-3 rounded-full" style={{ backgroundColor: meta.color }} />
                  {meta.label} {key !== "document" ? "concepts" : ""}
                </div>
              ))}
              <div className="mt-1 flex gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                <Info className="size-3.5 shrink-0" />
                Scroll to zoom, drag to pan, and click any node to trace its connections.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

function GraphStat({
  icon: Icon,
  label,
  value,
  sub,
  accent = "var(--primary)",
}: {
  icon: typeof Network
  label: string
  value: string
  sub?: string
  accent?: string
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 p-4">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Icon className="size-3.5" style={{ color: accent }} />
          {label}
        </span>
        <span className="truncate text-lg font-semibold tracking-tight">{value}</span>
        {sub ? <span className="text-xs text-muted-foreground">{sub}</span> : null}
      </CardContent>
    </Card>
  )
}

function Metric({ label, value, suffix }: { label: string; value: number; suffix: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {value}
          {suffix}
        </span>
      </div>
      <Progress value={value} />
    </div>
  )
}
