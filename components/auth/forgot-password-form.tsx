"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"
import { MailCheck } from "lucide-react"

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSent(true)
    }, 800)
  }

  if (sent) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MailCheck />
          </EmptyMedia>
          <EmptyTitle>Check your email</EmptyTitle>
          <EmptyDescription>
            We sent a password reset link to your inbox. Follow the link to
            choose a new password.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" render={<Link href="/reset-password">Open reset page</Link>} />
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <form onSubmit={onSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" placeholder="you@university.edu" required />
        </Field>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Spinner data-icon="inline-start" /> : null}
          Send reset link
        </Button>
      </FieldGroup>
    </form>
  )
}
