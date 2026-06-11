"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"

export function ResetPasswordForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      toast.success("Password updated. You can sign in now.")
      router.push("/sign-in")
    }, 800)
  }

  return (
    <form onSubmit={onSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="password">New password</FieldLabel>
          <Input id="password" type="password" placeholder="Enter new password" required />
          <FieldDescription>
            Use 8+ characters with a mix of letters, numbers, and symbols.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm">Confirm password</FieldLabel>
          <Input id="confirm" type="password" placeholder="Re-enter new password" required />
        </Field>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Spinner data-icon="inline-start" /> : null}
          Reset password
        </Button>
      </FieldGroup>
    </form>
  )
}
