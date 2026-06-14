"use client"

import { useEffect, useState } from "react"
import { useUser, useSession } from "@clerk/nextjs"
import type { SessionWithActivitiesResource } from "@clerk/types"
import { toast } from "sonner"
import { Loader2, Monitor, Smartphone } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { DeleteAccountDialog } from "@/components/dashboard/settings/delete-account-dialog"

export function SecurityTab() {
  const { user, isLoaded } = useUser()
  const { session } = useSession()

  return (
    <div className="flex flex-col gap-6">
      <PasswordCard />
      <SessionsCard currentSessionId={session?.id} />
      {isLoaded && user && <DeleteAccountDialog />}
    </div>
  )
}

function PasswordCard() {
  const { user } = useUser()
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [confirm, setConfirm] = useState("")
  const [busy, setBusy] = useState(false)

  const hasPassword = user?.passwordEnabled

  async function submit() {
    if (!user) return
    if (next.length < 8) {
      toast.error("New password must be at least 8 characters")
      return
    }
    if (next !== confirm) {
      toast.error("Passwords do not match")
      return
    }
    setBusy(true)
    try {
      await user.updatePassword({
        currentPassword: hasPassword ? current : undefined,
        newPassword: next,
        signOutOfOtherSessions: true,
      })
      setCurrent("")
      setNext("")
      setConfirm("")
      toast.success("Password updated")
    } catch (err) {
      const msg =
        (err as { errors?: { message?: string }[] })?.errors?.[0]?.message ??
        "Could not update password"
      toast.error(msg)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>
          {hasPassword
            ? "Update your password regularly to stay secure."
            : "Set a password for your account."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          {hasPassword && (
            <Field>
              <FieldLabel htmlFor="current">Current password</FieldLabel>
              <Input
                id="current"
                type="password"
                autoComplete="current-password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
              />
            </Field>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="new">New password</FieldLabel>
              <Input
                id="new"
                type="password"
                autoComplete="new-password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm">Confirm password</FieldLabel>
              <Input
                id="confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </Field>
          </div>
        </FieldGroup>
      </CardContent>
      <CardFooter className="justify-end">
        <Button onClick={submit} disabled={busy}>
          {busy && <Loader2 className="size-4 animate-spin" />}
          {hasPassword ? "Update password" : "Set password"}
        </Button>
      </CardFooter>
    </Card>
  )
}

function SessionsCard({ currentSessionId }: { currentSessionId?: string }) {
  const { user } = useUser()
  const [sessions, setSessions] = useState<SessionWithActivitiesResource[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  async function load() {
    if (!user) return
    try {
      const list = await user.getSessions()
      setSessions(list)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  async function signOutOthers() {
    setBusy(true)
    try {
      await Promise.all(
        sessions
          .filter((s) => s.id !== currentSessionId)
          .map((s) => s.revoke()),
      )
      await load()
      toast.success("Signed out of other devices")
    } catch {
      toast.error("Could not sign out other sessions")
    } finally {
      setBusy(false)
    }
  }

  const others = sessions.filter((s) => s.id !== currentSessionId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active sessions</CardTitle>
        <CardDescription>Devices currently signed in to your account.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {loading ? (
          <p className="py-4 text-sm text-muted-foreground">Loading sessions...</p>
        ) : sessions.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">No active sessions found.</p>
        ) : (
          sessions.map((s, i) => {
            const a = s.latestActivity
            const isMobile = a?.isMobile
            return (
              <div key={s.id}>
                {i > 0 && <Separator />}
                <div className="flex items-center gap-3 py-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    {isMobile ? <Smartphone className="size-4" /> : <Monitor className="size-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {[a?.browserName, a?.deviceType].filter(Boolean).join(" · ") ||
                        "Unknown device"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {[a?.city, a?.country].filter(Boolean).join(", ") || a?.ipAddress || "—"}
                    </p>
                  </div>
                  {s.id === currentSessionId && (
                    <Badge variant="secondary">This device</Badge>
                  )}
                </div>
              </div>
            )
          })
        )}
      </CardContent>
      {others.length > 0 && (
        <CardFooter className="justify-end">
          <Button variant="outline" onClick={signOutOthers} disabled={busy}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            Sign out of other devices
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
