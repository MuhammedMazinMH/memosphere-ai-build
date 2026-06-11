"use client"

import type React from "react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { UploadCloud, FileText, CheckCircle2 } from "lucide-react"
import { subjects } from "@/lib/mock-data"
import { toast } from "sonner"

export function UploadDialog({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [stage, setStage] = useState<"idle" | "uploading" | "processing" | "done">("idle")
  const [progress, setProgress] = useState(0)

  function start() {
    setStage("uploading")
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval)
          setStage("processing")
          setTimeout(() => setStage("done"), 1400)
          return 100
        }
        return p + 10
      })
    }, 120)
  }

  function reset() {
    setStage("idle")
    setProgress(0)
  }

  function close(v: boolean) {
    setOpen(v)
    if (!v) setTimeout(reset, 200)
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload to your knowledge base</DialogTitle>
          <DialogDescription>
            Add PDFs, slides, notes, images, or videos. We&apos;ll extract concepts automatically.
          </DialogDescription>
        </DialogHeader>

        {stage === "idle" && (
          <FieldGroup>
            <button
              type="button"
              onClick={start}
              className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/40 p-8 text-center transition-colors hover:border-primary/50 hover:bg-muted"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UploadCloud className="size-6" />
              </span>
              <span className="text-sm font-medium">Click to browse or drop files</span>
              <span className="text-xs text-muted-foreground">
                PDF, PPTX, MD, PNG, MP4 up to 200MB
              </span>
            </button>
            <Field>
              <FieldLabel>Assign to subject</FieldLabel>
              <Select defaultValue={subjects[0].id}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
        )}

        {(stage === "uploading" || stage === "processing") && (
          <div className="flex flex-col gap-4 py-2">
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <FileText className="size-8 text-primary" />
              <div className="flex flex-1 flex-col">
                <span className="text-sm font-medium">Lecture Notes Week 8.pdf</span>
                <span className="text-xs text-muted-foreground">
                  {stage === "uploading" ? `Uploading ${progress}%` : "Extracting concepts with AI..."}
                </span>
              </div>
            </div>
            <Progress value={stage === "processing" ? 100 : progress} />
            {stage === "processing" && (
              <p className="text-center text-xs text-muted-foreground">
                Analyzing content, detecting concepts, and generating a summary.
              </p>
            )}
          </div>
        )}

        {stage === "done" && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-chart-2/15 text-chart-2">
              <CheckCircle2 className="size-7" />
            </span>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">Knowledge added</p>
              <p className="text-xs text-muted-foreground">
                14 concepts extracted and linked to Machine Learning.
              </p>
            </div>
            <Button
              onClick={() => {
                close(false)
                toast.success("Document processed and added to your library.")
              }}
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
