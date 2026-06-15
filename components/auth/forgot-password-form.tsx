"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSignIn } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Eye, EyeOff } from "lucide-react"

type Step = "request" | "reset"

export function ForgotPasswordForm() {
  const router = useRouter()
  // v6 Signal API: returns { signIn, fetchStatus }
  const { signIn, fetchStatus } = useSignIn()
  const [step, setStep] = useState<Step>("request")
  const [formError, setFormError] = useState<string | null>(null)
  const [code, setCode] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const loading = fetchStatus === "fetching"

  // Step 1: ask Clerk to send a password-reset code to the account email.
  // Success UI is shown ONLY if Clerk returns no error.
  async function onRequestCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!signIn) return
    setFormError(null)

    const data = new FormData(e.currentTarget)
    const email = String(data.get("email") ?? "").trim()

    // Create the sign-in attempt with the identifier, then send the reset code.
    const createResult = await signIn.create({ identifier: email })
    if (createResult.error) {
      const err = createResult.error
      setFormError(err.longMessage ?? err.message ?? "Could not start password reset.")
      return
    }

    const sendResult = await signIn.resetPasswordEmailCode.sendCode()
    if (sendResult.error) {
      const err = sendResult.error
      setFormError(err.longMessage ?? err.message ?? "Could not send a reset email.")
      return
    }

    // Only now do we advance to the "enter code + new password" step.
    setStep("reset")
  }

  // Step 2: verify the code, then submit the new password, then finalize the
  // session and redirect. Each Clerk call is checked before advancing.
  async function onSubmitNewPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!signIn) return
    setFormError(null)

    const data = new FormData(e.currentTarget)
    const password = String(data.get("password") ?? "")
    const confirm = String(data.get("confirm") ?? "")

    if (password !== confirm) {
      setFormError("Passwords do not match.")
      return
    }

    const verifyResult = await signIn.resetPasswordEmailCode.verifyCode({ code })
    if (verifyResult.error) {
      const err = verifyResult.error
      setFormError(err.longMessage ?? err.message ?? "Invalid or expired code.")
      return
    }

    const submitResult = await signIn.resetPasswordEmailCode.submitPassword({ password })
    if (submitResult.error) {
      const err = submitResult.error
      setFormError(err.longMessage ?? err.message ?? "Could not update your password.")
      return
    }

    if (signIn.status === "complete" && signIn.createdSessionId) {
      const { error } = await signIn.finalize({
        navigate: () => router.push("/dashboard"),
      })
      if (error) {
        setFormError(error.longMessage ?? error.message ?? "Password updated, but sign-in failed.")
      }
      return
    }

    // Password changed but a second factor is required to create a session.
    setFormError(null)
    router.push("/sign-in")
  }

  if (step === "reset") {
    return (
      <form key="reset-step" onSubmit={onSubmitNewPassword}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="code">Reset code</FieldLabel>
            <Input
              key="reset-code-input"
              id="code"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <FieldDescription>Enter the code we emailed you.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="password">New password</FieldLabel>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <FieldDescription>
              Use 8+ characters with a mix of letters, numbers, and symbols.
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="confirm">Confirm password</FieldLabel>
            <Input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter new password"
              required
            />
          </Field>
          {formError ? <FieldError>{formError}</FieldError> : null}
          <Button type="submit" className="w-full" disabled={loading || !signIn}>
            {loading ? <Spinner data-icon="inline-start" /> : null}
            Reset password
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => {
              setStep("request")
              setCode("")
              setFormError(null)
            }}
          >
            Use a different email
          </Button>
        </FieldGroup>
      </form>
    )
  }

  return (
    <form key="request-step" onSubmit={onRequestCode}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            key="reset-email-input"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@university.edu"
            required
          />
        </Field>
        {formError ? <FieldError>{formError}</FieldError> : null}
        <Button type="submit" className="w-full" disabled={loading || !signIn}>
          {loading ? <Spinner data-icon="inline-start" /> : null}
          Send reset code
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          render={<Link href="/sign-in">Back to sign in</Link>}
        />
      </FieldGroup>
    </form>
  )
}
