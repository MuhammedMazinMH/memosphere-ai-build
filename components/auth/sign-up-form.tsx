"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSignUp } from "@clerk/nextjs"
import { isClerkAPIResponseError } from "@clerk/nextjs/errors"
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
  const { isLoaded, signUp, setActive } = useSignUp()
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [pendingVerification, setPendingVerification] = useState(false)
  const [code, setCode] = useState("")
  const score = strength(password)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!isLoaded) return
    setFormError(null)
    setLoading(true)

    const form = e.currentTarget
    const data = new FormData(form)
    const fullName = String(data.get("name") ?? "").trim()
    const email = String(data.get("email") ?? "").trim()
    const pw = String(data.get("password") ?? "")
    const [firstName, ...rest] = fullName.split(" ")
    const lastName = rest.join(" ")

    try {
      await signUp.create({
        emailAddress: email,
        password: pw,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      })
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
      setPendingVerification(true)
    } catch (err) {
      setFormError(
        isClerkAPIResponseError(err)
          ? (err.errors[0]?.longMessage ?? err.errors[0]?.message ?? "Something went wrong. Please try again.")
          : "Something went wrong. Please try again.",
      )
    } finally {
      setLoading(false)
    }
  }

  async function onVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!isLoaded) return
    setFormError(null)
    setLoading(true)

    try {
      const result = await signUp.attemptEmailAddressVerification({ code })
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        router.push("/dashboard")
      } else {
        setFormError("Verification could not be completed. Please try again.")
      }
    } catch (err) {
      setFormError(
        isClerkAPIResponseError(err)
          ? (err.errors[0]?.longMessage ?? err.errors[0]?.message ?? "Invalid verification code.")
          : "Invalid verification code.",
      )
    } finally {
      setLoading(false)
    }
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
        {formError ? <FieldError>{formError}</FieldError> : null}
        {/* Clerk bot-protection widget renders into this element when required */}
        <div id="clerk-captcha" />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Spinner data-icon="inline-start" /> : null}
          Create account
        </Button>
      </FieldGroup>
    </form>
  )
}
