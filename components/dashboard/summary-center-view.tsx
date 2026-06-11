"use client"

import { useState } from "react"
import { Sparkles, FileText, Copy, Check, RefreshCw, ListTree, AlignLeft, Quote } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { FileTypeIcon } from "@/components/dashboard/file-type-icon"
import { knowledgeItems } from "@/lib/mock-data"
import { toast } from "sonner"

type Length = "brief" | "standard" | "detailed"

const summaryBullets = [
  "Gradient descent minimizes a loss function by iteratively moving parameters in the direction of steepest descent.",
  "Batch GD uses the full dataset per step; stochastic GD uses one sample; mini-batch balances both for stability and speed.",
  "Learning rate schedules (step decay, cosine annealing) prevent overshooting and help convergence near minima.",
  "Momentum and Nesterov acceleration dampen oscillations in ravines, speeding up convergence.",
  "Adaptive optimizers (Adam, RMSProp) adjust per-parameter learning rates using gradient history.",
]

export function SummaryCenterView() {
  const [selectedDoc, setSelectedDoc] = useState(knowledgeItems[0].id)
  const [length, setLength] = useState<Length>("standard")
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(true)
  const [copied, setCopied] = useState(false)

  const doc = knowledgeItems.find((k) => k.id === selectedDoc)!
  const bulletCount = length === "brief" ? 3 : length === "standard" ? 4 : 5
  const keyTerms = ["Loss function", "Learning rate", "Momentum", "Adam", "Convergence", "Mini-batch"]
  const overview = `This ${doc.type} introduces the foundations of optimization in machine learning, focusing on how models iteratively improve through gradient-based methods. It connects theory to practical training considerations.`

  function generate() {
    setLoading(true)
    setGenerated(false)
    setTimeout(() => {
      setLoading(false)
      setGenerated(true)
      toast.success("Summary generated")
    }, 1600)
  }

  async function copy() {
    const text = [
      `${doc.title} — AI Summary`,
      "",
      "Overview",
      overview,
      "",
      "Key Points",
      ...summaryBullets.slice(0, bulletCount).map((b) => `• ${b}`),
      "",
      `Key Terms: ${keyTerms.join(", ")}`,
    ].join("\n")

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error("Couldn't copy. Please try again.")
    }
  }

  return (
    <>
      <PageHeader
        title="Summary Center"
        description="Turn any document into concise, structured summaries with AI."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Source</CardTitle>
            <CardDescription>Choose a document to summarize</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Select value={selectedDoc} onValueChange={setSelectedDoc}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {knowledgeItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.title}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
              <FileTypeIcon type={doc.type} />
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">{doc.title}</span>
                <span className="text-xs text-muted-foreground">
                  {doc.subject} · {doc.size}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Length</span>
              <ToggleGroup
                value={[length]}
                onValueChange={(v) => v[0] && setLength(v[0] as Length)}
                className="w-full"
              >
                <ToggleGroupItem value="brief" className="flex-1">
                  Brief
                </ToggleGroupItem>
                <ToggleGroupItem value="standard" className="flex-1">
                  Standard
                </ToggleGroupItem>
                <ToggleGroupItem value="detailed" className="flex-1">
                  Detailed
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <Button onClick={generate} disabled={loading}>
              {loading ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles data-icon="inline-start" />
                  Generate Summary
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle>AI Summary</CardTitle>
              <CardDescription>{doc.title}</CardDescription>
            </div>
            {generated && !loading && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={copy}>
                  {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={generate}>
                  <RefreshCw data-icon="inline-start" />
                  Regenerate
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {loading ? (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <>
                <section className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <AlignLeft className="size-4" />
                    Overview
                  </div>
                  <p className="leading-relaxed text-pretty">{overview}</p>
                </section>

                <section className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <ListTree className="size-4" />
                    Key Points
                  </div>
                  <ul className="flex flex-col gap-2.5">
                    {summaryBullets.slice(0, bulletCount).map((b, i) => (
                      <li key={i} className="flex gap-3 text-sm leading-relaxed">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Quote className="size-4" />
                    Key Terms
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {keyTerms.map((t) => (
                      <Badge key={t} variant="secondary">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </section>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
