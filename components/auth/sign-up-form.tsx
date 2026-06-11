"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

function strength(pw: string) {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}

const labels = ["Too weak", "Weak", "Fair", "Good", "Strong"]

export function SignUpForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState("")
  const score = strength(password)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => router.push("/dashboard"), 900)
  }

  return (
    <form onSubmit={onSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Full name</FieldLabel>
          <Input id="name" name="name" autoComplete="name" placeholder="Alex Morgan" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@university.edu" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {password ? (
            <div className="mt-1 flex flex-col gap-1.5">
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      i < score
                        ? score <= 1
                          ? "bg-destructive"
                          : score <= 2
                            ? "bg-chart-4"
                            : "bg-chart-2"
                        : "bg-muted",
                    )}
                  />
                ))}
              </div>
              <FieldDescription>{labels[score]}</FieldDescription>
            </div>
          ) : (
            <FieldDescription>
              Use 8+ characters with a mix of letters, numbers, and symbols.
            </FieldDescription>
          )}
        </Field>
        <Field orientation="horizontal">
          <Checkbox id="terms" required />
          <FieldLabel htmlFor="terms" className="text-sm font-normal text-muted-foreground">
            I agree to the Terms of Service and Privacy Policy
          </FieldLabel>
        </Field>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Spinner data-icon="inline-start" /> : null}
          Create account
        </Button>
      </FieldGroup>
    </form>
  )
}
