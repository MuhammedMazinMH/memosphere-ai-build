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

type Step = "credentials" | "code"

// Builds a plain, JSON-serializable snapshot of the Clerk signIn object so the
// logs print actual contents instead of "[object Object]".
function snapshotSignIn(signIn: any) {
  if (!signIn) return null
  return {
    id: signIn.id,
    status: signIn.status,
    createdSessionId: signIn.createdSessionId,
    identifier: signIn.identifier,
    isTransferable: signIn.isTransferable,
    existingSession: signIn.existingSession ?? null,
    supportedFirstFactors: signIn.supportedFirstFactors ?? null,
    supportedSecondFactors: signIn.supportedSecondFactors ?? null,
    firstFactorVerification: signIn.firstFactorVerification
      ? {
          status: signIn.firstFactorVerification.status,
          strategy: signIn.firstFactorVerification.strategy,
          error: signIn.firstFactorVerification.error,
        }
      : null,
    secondFactorVerification: signIn.secondFactorVerification
      ? {
          status: signIn.secondFactorVerification.status,
          strategy: signIn.secondFactorVerification.strategy,
          error: signIn.secondFactorVerification.error,
        }
      : null,
    userData: signIn.userData ?? null,
  }
}

function logSignIn(label: string, signIn: any) {
  console.log(`[v0] ${label}`, JSON.stringify(snapshotSignIn(signIn), null, 2))
}

export function SignInForm() {
  const router = useRouter()
  // v6 Signal API: returns { signIn, errors, fetchStatus }
  const { signIn, fetchStatus } = useSignIn()
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [step, setStep] = useState<Step>("credentials")
  // Which verification method the current "code" step expects.
  const [codeMode, setCodeMode] = useState<
    "first_factor_email" | "mfa_email" | "mfa_phone" | "mfa_totp" | null
  >(null)
  const [code, setCode] = useState("")

  const loading = fetchStatus === "fetching"

  // Activates the created session and redirects. Shared by every path that
  // reaches status === "complete".
  async function finalizeAndRedirect(): Promise<boolean> {
    if (!signIn) return false
    const { error } = await signIn.finalize({
      navigate: () => router.push("/dashboard"),
    })
    console.log("[v0] SIGNIN_FINALIZE_ERROR", JSON.stringify(error, null, 2))
    if (error) {
      setFormError(error.longMessage ?? error.message ?? "Could not complete sign-in.")
      return false
    }
    return true
  }

  // Inspects signIn.status after a verification step and routes accordingly.
  // Returns true when the flow is fully handled (complete or error shown).
  async function routeByStatus(): Promise<void> {
    if (!signIn) return

    // Already authenticated (e.g. signed up moments ago): no new session.
    if (signIn.existingSession?.sessionId) {
      console.log("[v0] SIGNIN_EXISTING_SESSION", signIn.existingSession.sessionId)
      router.push("/dashboard")
      return
    }

    if (signIn.status === "complete" && signIn.createdSessionId) {
      await finalizeAndRedirect()
      return
    }

    if (signIn.status === "needs_first_factor") {
      // Password alone wasn't sufficient — the instance wants an email code.
      const emailFactor = (signIn.supportedFirstFactors ?? []).find(
        (f: any) => f.strategy === "email_code",
      )
      if (emailFactor) {
        const { error } = await signIn.emailCode.sendCode()
        console.log("[v0] SIGNIN_SEND_FIRST_FACTOR_EMAIL", JSON.stringify(error, null, 2))
        if (error) {
          setFormError(error.longMessage ?? error.message ?? "Could not send verification code.")
          return
        }
        setCodeMode("first_factor_email")
        setStep("code")
        return
      }
      setFormError(
        `This account requires a first-factor strategy that isn't supported here (supported: ${
          (signIn.supportedFirstFactors ?? []).map((f: any) => f.strategy).join(", ") || "none"
        }).`,
      )
      return
    }

    if (signIn.status === "needs_second_factor") {
      const second = signIn.supportedSecondFactors ?? []
      const hasTOTP = second.some((f: any) => f.strategy === "totp")
      const hasPhone = second.some((f: any) => f.strategy === "phone_code")
      const hasEmail = second.some((f: any) => f.strategy === "email_code")

      if (hasTOTP) {
        setCodeMode("mfa_totp")
        setStep("code")
        return
      }
      if (hasPhone) {
        const { error } = await signIn.mfa.sendPhoneCode()
        console.log("[v0] SIGNIN_SEND_MFA_PHONE", JSON.stringify(error, null, 2))
        if (error) {
          setFormError(error.longMessage ?? error.message ?? "Could not send verification code.")
          return
        }
        setCodeMode("mfa_phone")
        setStep("code")
        return
      }
      if (hasEmail) {
        const { error } = await signIn.mfa.sendEmailCode()
        console.log("[v0] SIGNIN_SEND_MFA_EMAIL", JSON.stringify(error, null, 2))
        if (error) {
          setFormError(error.longMessage ?? error.message ?? "Could not send verification code.")
          return
        }
        setCodeMode("mfa_email")
        setStep("code")
        return
      }
      setFormError("Two-factor authentication is required but no supported method is available.")
      return
    }

    if (signIn.status === "needs_new_password") {
      setFormError("Your password must be reset before signing in. Use the “Forgot password?” link.")
      return
    }

    // needs_identifier / needs_client_trust / unknown
    setFormError(`Additional verification is required to sign in (status: ${signIn.status ?? "unknown"}).`)
  }

  async function onSubmitCredentials(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!signIn) return
    setFormError(null)

    const data = new FormData(e.currentTarget)
    const email = String(data.get("email") ?? "").trim()
    const password = String(data.get("password") ?? "")

    const passwordResult = await signIn.password({ identifier: email, password })

    // Full diagnostic dump of the Clerk response + signIn state.
    console.log("[v0] SIGNIN_PASSWORD_ERROR", JSON.stringify(passwordResult.error, null, 2))
    logSignIn("SIGNIN_STATE_AFTER_PASSWORD", signIn)
    console.log("[v0] SIGNIN_STATUS", signIn.status)
    console.log("[v0] SIGNIN_CREATED_SESSION_ID", signIn.createdSessionId)
    console.log(
      "[v0] SIGNIN_SUPPORTED_FIRST_FACTORS",
      JSON.stringify(signIn.supportedFirstFactors ?? null, null, 2),
    )
    console.log(
      "[v0] SIGNIN_SUPPORTED_SECOND_FACTORS",
      JSON.stringify(signIn.supportedSecondFactors ?? null, null, 2),
    )

    if (passwordResult.error) {
      setFormError(
        passwordResult.error.longMessage ??
          passwordResult.error.message ??
          "Invalid email or password.",
      )
      return
    }

    await routeByStatus()
  }

  async function onSubmitCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!signIn) return
    setFormError(null)

    let result: { error: any } = { error: null }
    if (codeMode === "first_factor_email") {
      result = await signIn.emailCode.verifyCode({ code })
    } else if (codeMode === "mfa_email") {
      result = await signIn.mfa.verifyEmailCode({ code })
    } else if (codeMode === "mfa_phone") {
      result = await signIn.mfa.verifyPhoneCode({ code })
    } else if (codeMode === "mfa_totp") {
      result = await signIn.mfa.verifyTOTP({ code })
    }

    console.log("[v0] SIGNIN_VERIFY_ERROR", JSON.stringify(result.error, null, 2))
    logSignIn("SIGNIN_STATE_AFTER_VERIFY", signIn)

    if (result.error) {
      setFormError(result.error.longMessage ?? result.error.message ?? "Invalid verification code.")
      return
    }

    await routeByStatus()
  }

  if (step === "code") {
    const heading =
      codeMode === "mfa_totp"
        ? "Enter the code from your authenticator app"
        : "Enter the verification code we sent you"
    return (
      <form onSubmit={onSubmitCode}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="code">Verification code</FieldLabel>
            <Input
              id="code"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <FieldDescription>{heading}</FieldDescription>
          </Field>
          {formError ? <FieldError>{formError}</FieldError> : null}
          <Button type="submit" className="w-full" disabled={loading || !signIn}>
            {loading ? <Spinner data-icon="inline-start" /> : null}
            Verify and sign in
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => {
              setStep("credentials")
              setCode("")
              setCodeMode(null)
              setFormError(null)
            }}
          >
            Back
          </Button>
        </FieldGroup>
      </form>
    )
  }

  return (
    <form onSubmit={onSubmitCredentials}>
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
