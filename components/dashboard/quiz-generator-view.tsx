"use client"

import { useState } from "react"
import {
  ListChecks,
  Sparkles,
  Check,
  X,
  ChevronRight,
  RotateCcw,
  Trophy,
  Lightbulb,
  FileText,
} from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { DerivedSubject, QuizQuestion } from "@/types"

interface Props {
  subjects: DerivedSubject[]
}

type Stage = "setup" | "loading" | "active" | "result"

const difficulties = ["Easy", "Medium", "Hard", "Mixed"] as const

export function QuizGeneratorView({ subjects }: Props) {
  const hasSubjects = subjects.length > 0
  const defaultSubject = subjects[0]?.id ?? ""

  const [stage, setStage] = useState<Stage>("setup")
  const [subject, setSubject] = useState(defaultSubject)
  const [count, setCount] = useState(5)
  const [difficulty, setDifficulty] = useState<string>("Mixed")
  const [quiz, setQuiz] = useState<QuizQuestion[]>([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [error, setError] = useState<string | null>(null)

  const question = quiz[current]
  const total = quiz.length
  const score = answers.filter(Boolean).length

  async function start() {
    if (!subject) return
    setStage("loading")
    setError(null)

    try {
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectId: subject, questionCount: Math.min(Math.max(count, 1), 50) }),
      })
      const json = await res.json()

      if (!res.ok) {
        const msg = json.error ?? "Failed to generate quiz."
        setError(msg)
        setStage("setup")
        toast.error(msg)
        return
      }

      const questions: QuizQuestion[] = json.data ?? []
      if (questions.length === 0) {
        setError("No questions were generated. Make sure your documents have extracted text.")
        setStage("setup")
        toast.error("No questions generated.")
        return
      }

      setQuiz(questions)
      setStage("active")
      setCurrent(0)
      setSelected(null)
      setRevealed(false)
      setAnswers([])
      toast.success(`Quiz ready — ${questions.length} questions. Good luck!`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error."
      setError(msg)
      setStage("setup")
      toast.error(msg)
    }
  }

  function check() {
    if (selected === null) return
    setRevealed(true)
    setAnswers((prev) => [...prev, selected === question.answer])
  }

  function next() {
    if (current + 1 >= total) {
      setStage("result")
      return
    }
    setCurrent((c) => c + 1)
    setSelected(null)
    setRevealed(false)
  }

  function restart() {
    setStage("setup")
  }

  return (
    <>
      <PageHeader
        title="Quiz Generator"
        description="Generate adaptive practice quizzes from your uploaded documents."
      />

      {stage === "setup" && (
        <Card className="mx-auto w-full max-w-xl">
          <CardHeader>
            <CardTitle>Create a quiz</CardTitle>
            <CardDescription>
              {hasSubjects
                ? "Pick a subject and we'll build questions from your uploaded documents."
                : "Upload documents first to generate a quiz from your study materials."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {!hasSubjects ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center text-muted-foreground">
                <FileText className="size-8 opacity-40" />
                <p className="text-sm">No documents found. Upload study materials to get started.</p>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Subject</span>
                  <Select value={subject} onValueChange={(v) => setSubject(v ?? defaultSubject)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {subjects.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name} ({s.documentCount} {s.documentCount === 1 ? "doc" : "docs"})
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Questions</span>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={50}
                      value={count}
                      onChange={(e) => {
                        const v = Number.parseInt(e.target.value, 10)
                        setCount(Number.isNaN(v) ? 1 : Math.min(Math.max(v, 1), 50))
                      }}
                      aria-label="Number of questions"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Difficulty</span>
                    <Select value={difficulty} onValueChange={(v) => setDifficulty(v ?? "Mixed")}>
                      <SelectTrigger aria-label="Difficulty">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {difficulties.map((d) => (
                            <SelectItem key={d} value={d}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={start} className="w-full" disabled={!hasSubjects || !subject}>
              <Sparkles data-icon="inline-start" />
              Generate Quiz
            </Button>
          </CardFooter>
        </Card>
      )}

      {stage === "loading" && (
        <Card className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 py-16">
          <Spinner className="size-8 text-primary" />
          <div className="flex flex-col items-center gap-1">
            <p className="font-medium">Generating questions...</p>
            <p className="text-sm text-muted-foreground">Analyzing your uploaded documents</p>
          </div>
        </Card>
      )}

      {stage === "active" && question && (
        <Card className="mx-auto w-full max-w-2xl">
          <CardHeader className="gap-3">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">
                Question {current + 1} of {total}
              </Badge>
              <span className="text-sm text-muted-foreground">Score: {score}</span>
            </div>
            <Progress value={((current + (revealed ? 1 : 0)) / total) * 100} />
            <CardTitle className="pt-2 text-lg leading-snug text-balance">{question.question}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {question.options.map((option, i) => {
              const isCorrect = i === question.answer
              const isSelected = i === selected
              return (
                <button
                  key={i}
                  type="button"
                  disabled={revealed}
                  onClick={() => setSelected(i)}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                    !revealed && isSelected && "border-primary bg-primary/5",
                    !revealed && !isSelected && "hover:bg-muted/60",
                    revealed && isCorrect && "border-emerald-500/50 bg-emerald-500/10",
                    revealed && isSelected && !isCorrect && "border-destructive/50 bg-destructive/10",
                    revealed && "cursor-default",
                  )}
                >
                  <span>{option}</span>
                  {revealed && isCorrect && <Check className="size-4 text-emerald-600" />}
                  {revealed && isSelected && !isCorrect && <X className="size-4 text-destructive" />}
                </button>
              )
            })}

            {revealed && question.explanation && (
              <div className="mt-1 flex gap-3 rounded-lg border bg-muted/40 p-4">
                <Lightbulb className="size-4 shrink-0 text-primary" />
                <p className="text-sm leading-relaxed text-muted-foreground">{question.explanation}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-end">
            {!revealed ? (
              <Button onClick={check} disabled={selected === null}>
                Check Answer
              </Button>
            ) : (
              <Button onClick={next}>
                {current + 1 >= total ? "See Results" : "Next Question"}
                <ChevronRight data-icon="inline-end" />
              </Button>
            )}
          </CardFooter>
        </Card>
      )}

      {stage === "result" && (
        <Card className="mx-auto w-full max-w-xl">
          <CardContent className="flex flex-col items-center gap-5 py-10 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Trophy className="size-8" />
            </span>
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-semibold">Quiz complete!</h2>
              <p className="text-muted-foreground">
                You scored {score} out of {total} ({Math.round((score / total) * 100)}%)
              </p>
            </div>
            <div className="w-full max-w-xs">
              <Progress value={(score / total) * 100} />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={restart}>
                <RotateCcw data-icon="inline-start" />
                New Quiz
              </Button>
              <Button onClick={start}>
                <ListChecks data-icon="inline-start" />
                Retake
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
