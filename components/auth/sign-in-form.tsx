"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSignIn } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Eye, EyeOff } from "lucide-react"

export function SignInForm() {
  const router = useRouter()
  // v6 Signal API: returns { signIn, errors, fetchStatus }
  const { signIn, fetchStatus } = useSignIn()
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const loading = fetchStatus === "fetching"

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!signIn) return
    setFormError(null)

    const data = new FormData(e.currentTarget)
    const email = String(data.get("email") ?? "").trim()
    const password = String(data.get("password") ?? "")

    // v6 method: signIn.password() — submits the identifier + password
    const passwordResult = await signIn.password({
      identifier: email,
      password,
    })

    console.log("[v0] SIGNIN_PASSWORD_RESULT", passwordResult)
    console.log("[v0] SIGNIN_STATUS", signIn.status)
    console.log("[v0] SIGNIN_CREATED_SESSION_ID", signIn.createdSessionId)
    console.log("[v0] SIGNIN_EXISTING_SESSION", signIn.existingSession)
    console.log("[v0] SIGNIN_ERROR", passwordResult.error)

    if (passwordResult.error) {
      setFormError(
        passwordResult.error.longMessage ??
          passwordResult.error.message ??
          "Invalid email or password.",
      )
      return
    }

    // The user already has an active session (e.g. just signed up). No new
    // session is created, so finalize() would fail — just go to the dashboard.
    if (signIn.existingSession?.sessionId) {
      console.log("[v0] SIGNIN_USING_EXISTING_SESSION", signIn.existingSession.sessionId)
      router.push("/dashboard")
      return
    }

    // finalize() requires status === "complete" (a created session). Only then
    // can we activate it. Anything else means more verification is required.
    if (signIn.status !== "complete" || !signIn.createdSessionId) {
      console.log("[v0] SIGNIN_NOT_COMPLETE", signIn.status)
      setFormError(
        `Additional verification is required to sign in (status: ${signIn.status ?? "unknown"}).`,
      )
      return
    }

    // v6: finalize() activates the newly created session.
    const { error: finalizeError } = await signIn.finalize({
      navigate: () => router.push("/dashboard"),
    })

    console.log("[v0] SIGNIN_FINALIZE_ERROR", finalizeError)

    if (finalizeError) {
      setFormError(
        finalizeError.longMessage ?? finalizeError.message ?? "Could not complete sign-in.",
      )
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@university.edu"
            required
          />
        </Field>
        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </Field>
        {formError ? <FieldError>{formError}</FieldError> : null}
        <Button type="submit" className="w-full" disabled={loading || !signIn}>
          {loading ? <Spinner data-icon="inline-start" /> : null}
          Sign in
        </Button>
      </FieldGroup>
    </form>
  )
}
