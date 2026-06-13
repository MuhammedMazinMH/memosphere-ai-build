"use client"

import type React from "react"
import { useRef, useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import { UploadCloud, FileText, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

export function UploadDialog({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [stage, setStage] = useState<"idle" | "uploading" | "processing" | "done">("idle")
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState("")
  const [subject, setSubject] = useState("")
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const accept = ".pdf,.pptx,.md,.png,.jpg,.jpeg,.mp4"
  const maxBytes = 200 * 1024 * 1024

  function openFilePicker() {
    inputRef.current?.click()
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    if (file.size > maxBytes) {
      toast.error("File is too large. Maximum size is 200MB.")
      return
    }
    setFileName(file.name)
    start()
  }

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
    setFileName("")
    setSubject("")
    setDragActive(false)
    if (inputRef.current) inputRef.current.value = ""
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
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              className="sr-only"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <button
              type="button"
              onClick={openFilePicker}
              onDragOver={(e) => {
                e.preventDefault()
                setDragActive(true)
              }}
              onDragLeave={(e) => {
                e.preventDefault()
                setDragActive(false)
              }}
              onDrop={(e) => {
                e.preventDefault()
                setDragActive(false)
                handleFiles(e.dataTransfer.files)
              }}
              className={`flex flex-col items-center gap-3 rounded-xl border-2 border-dashed bg-muted/40 p-8 text-center transition-colors hover:border-primary/50 hover:bg-muted ${
                dragActive ? "border-primary bg-muted" : "border-border"
              }`}
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UploadCloud className="size-6" />
              </span>
              <span className="text-sm font-medium">
                {dragActive ? "Drop your file here" : "Click to browse or drop files"}
              </span>
              <span className="text-xs text-muted-foreground">
                PDF, PPTX, MD, PNG, MP4 up to 200MB
              </span>
            </button>
            <Field>
              <FieldLabel htmlFor="upload-subject">Subject</FieldLabel>
              <Input
                id="upload-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Type any subject, e.g. Quantum Physics"
                autoComplete="off"
              />
              <FieldDescription>
                Enter any subject you like. Leave blank to let AI detect it from your file.
              </FieldDescription>
            </Field>
          </FieldGroup>
        )}

        {(stage === "uploading" || stage === "processing") && (
          <div className="flex flex-col gap-4 py-2">
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <FileText className="size-8 text-primary" />
              <div className="flex flex-1 flex-col">
                <span className="truncate text-sm font-medium">{fileName}</span>
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
                {subject.trim()
                  ? `Concepts extracted and linked to ${subject.trim()}.`
                  : "Concepts extracted and your subject was detected automatically."}
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
