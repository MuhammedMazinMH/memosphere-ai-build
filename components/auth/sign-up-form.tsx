"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSignUp } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field"
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
  // v6 Signal API: returns { signUp, errors, fetchStatus }
  // No isLoaded, no setActive — fetchStatus is 'idle' | 'fetching'
  const { signUp, fetchStatus } = useSignUp()

  console.log("[v0] RAW_USE_SIGNUP", useSignUp())

  const [password, setPassword] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [pendingVerification, setPendingVerification] = useState(false)
  const [code, setCode] = useState("")
  const score = strength(password)

  const loading = fetchStatus === "fetching"

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    console.log("[v0] SUBMIT_CLICKED")
    e.preventDefault()
    console.log("[v0] SIGNUP_OBJECT", signUp)
    if (!signUp) return
    setFormError(null)

    const form = e.currentTarget
    const data = new FormData(form)
    const fullName = String(data.get("name") ?? "").trim()
    const email = String(data.get("email") ?? "").trim()
    const pw = String(data.get("password") ?? "")
    const [firstName, ...rest] = fullName.split(" ")
    const lastName = rest.join(" ")

    console.log("[v0] SIGNUP_PASSWORD_START")
    // v6 method: signUp.password() — creates account + sends verification
    const { error: createError } = await signUp.password({
      emailAddress: email,
      password: pw,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
    })

    if (createError) {
      console.error("[v0] SIGNUP_PASSWORD_ERROR", createError)
      setFormError(createError.longMessage ?? createError.message ?? "Something went wrong. Please try again.")
      return
    }

    console.log("[v0] SIGNUP_PASSWORD_SUCCESS")
    console.log("[v0] SEND_EMAIL_CODE_START")

    // v6: verifications.sendEmailCode() — triggers the email verification code
    const { error: verifyError } = await signUp.verifications.sendEmailCode()

    if (verifyError) {
      console.error("[v0] SEND_EMAIL_CODE_ERROR", verifyError)
      setFormError(verifyError.longMessage ?? verifyError.message ?? "Failed to send verification code.")
      return
    }

    console.log("[v0] SEND_EMAIL_CODE_SUCCESS")
    setPendingVerification(true)
  }

  async function onVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!signUp) return
    setFormError(null)

    console.log("[v0] VERIFY_EMAIL_CODE_START")
    // v6: verifications.verifyEmailCode() — attempts the code
    const { error: codeError } = await signUp.verifications.verifyEmailCode({ code })

    if (codeError) {
      console.error("[v0] VERIFY_EMAIL_CODE_ERROR", codeError)
      setFormError(codeError.longMessage ?? codeError.message ?? "Invalid verification code.")
      return
    }

    console.log("[v0] VERIFY_EMAIL_CODE_SUCCESS")
    console.log("[v0] FINALIZE_START")

    // v6: finalize() replaces setActive({ session }) — activates the new session
    const { error: finalizeError } = await signUp.finalize()

    if (finalizeError) {
      console.error("[v0] FINALIZE_ERROR", finalizeError)
      setFormError(finalizeError.longMessage ?? finalizeError.message ?? "Could not complete sign-up.")
      return
    }

    console.log("[v0] FINALIZE_SUCCESS")
    router.push("/dashboard")
  }

  if (pendingVerification) {
    return (
      <form onSubmit={onVerify}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="code">Verification code</FieldLabel>
            <Input
              id="code"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Enter the 6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <FieldDescription>We sent a verification code to your email.</FieldDescription>
            {formError ? <FieldError>{formError}</FieldError> : null}
          </Field>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Spinner data-icon="inline-start" /> : null}
            Verify email
          </Button>
        </FieldGroup>
      </form>
    )
  }

  return (
    <form onSubmit={onSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Full name</FieldLabel>
          <Input id="name" name="name" autoComplete="name" placeholder="Your full name" required />
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
        {formError ? <FieldError>{formError}</FieldError> : null}
        <div id="clerk-captcha" />
        <Button type="submit" className="w-full" disabled={loading || !signUp}>
          {loading ? <Spinner data-icon="inline-start" /> : null}
          Create account
        </Button>
      </FieldGroup>
    </form>
  )
}
