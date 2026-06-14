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
    const { error: passwordError } = await signIn.password({
      identifier: email,
      password,
    })

    if (passwordError) {
      setFormError(
        passwordError.longMessage ?? passwordError.message ?? "Invalid email or password.",
      )
      return
    }

    // v6: finalize() activates the new session
    const { error: finalizeError } = await signIn.finalize({
      navigate: () => router.push("/dashboard"),
    })

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
