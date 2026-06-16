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
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

export function UploadDialog({
  trigger,
  onUploadComplete,
}: {
  trigger: React.ReactNode
  onUploadComplete?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [stage, setStage] = useState<"idle" | "uploading" | "done" | "error">("idle")
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState("")
  const [subject, setSubject] = useState("")
  const [dragActive, setDragActive] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const accept = ".pdf,.pptx,.ppt,.md,.txt,.png,.jpg,.jpeg"
  const maxBytes = 200 * 1024 * 1024

  // Video/audio are no longer supported. Reject them client-side with a
  // friendly message before any upload is attempted.
  const blockedExtensions = [
    "mp4", "mov", "avi", "mkv", "webm", "m4v",
    "mp3", "wav", "aac", "ogg", "flac", "m4a",
  ]

  function openFilePicker() {
    inputRef.current?.click()
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
    const isAvType =
      file.type.startsWith("video/") ||
      file.type.startsWith("audio/") ||
      blockedExtensions.includes(ext)
    if (isAvType) {
      toast.error("Video and audio files aren't supported. Upload a PDF, PPTX, MD, TXT, or image.")
      return
    }
    if (file.size > maxBytes) {
      toast.error("File is too large. Maximum size is 200MB.")
      return
    }
    setFileName(file.name)
    setSelectedFile(file)
  }

  async function start() {
    if (!selectedFile) return

    setStage("uploading")
    setProgress(0)
    setErrorMsg("")

    try {
      // Create FormData
      const formData = new FormData()
      formData.append("file", selectedFile)
      if (subject.trim()) {
        formData.append("subjectId", subject.trim())
      }

      // Upload
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `Upload failed (${response.status})`)
      }

      const result = await response.json()
      setProgress(100)
      setStage("done")

      toast.success("Document uploaded successfully")
      
      // Call callback to refresh the library
      onUploadComplete?.()

      // Close after delay
      setTimeout(() => close(false), 1200)
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Upload failed"
      setErrorMsg(msg)
      setStage("error")
      toast.error(msg)
    }
  }

  function reset() {
    setStage("idle")
    setProgress(0)
    setFileName("")
    setSubject("")
    setDragActive(false)
    setErrorMsg("")
    setSelectedFile(null)
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
            Add PDFs, slides, notes, or images. We&apos;ll extract concepts automatically.
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
                PDF, PPTX, MD, TXT, PNG, JPG up to 200MB
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
            <Button
              onClick={start}
              disabled={!selectedFile}
              className="w-full"
            >
              Upload
            </Button>
          </FieldGroup>
        )}

        {stage === "uploading" && (
          <div className="flex flex-col gap-4 py-2">
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <FileText className="size-8 text-primary" />
              <div className="flex flex-1 flex-col">
                <span className="truncate text-sm font-medium">{fileName}</span>
                <span className="text-xs text-muted-foreground">
                  Uploading {progress}%
                </span>
              </div>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {stage === "done" && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-chart-2/15 text-chart-2">
              <CheckCircle2 className="size-7" />
            </span>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">Upload complete</p>
              <p className="text-xs text-muted-foreground">
                Document processed and added to your library.
              </p>
            </div>
          </div>
        )}

        {stage === "error" && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <AlertCircle className="size-7" />
            </span>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">Upload failed</p>
              <p className="text-xs text-muted-foreground">{errorMsg}</p>
            </div>
            <Button onClick={() => close(false)} variant="outline">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
