"use client"

import { useEffect, useState } from "react"
import { useUser, useSession } from "@clerk/nextjs"
import type { SessionWithActivitiesResource, TOTPResource } from "@clerk/types"
import { toast } from "sonner"
import { Loader2, ShieldCheck, ShieldOff, Monitor, Smartphone } from "lucide-react"
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
      <MfaCard />
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

function MfaCard() {
  const { user } = useUser()
  const [totp, setTotp] = useState<TOTPResource | null>(null)
  const [code, setCode] = useState("")
  const [busy, setBusy] = useState(false)

  const enabled = user?.totpEnabled ?? false

  async function startEnable() {
    if (!user) return
    setBusy(true)
    try {
      const resource = await user.createTOTP()
      setTotp(resource)
    } catch {
      toast.error("Could not start MFA setup")
    } finally {
      setBusy(false)
    }
  }

  async function verify() {
    if (!user) return
    setBusy(true)
    try {
      await user.verifyTOTP({ code })
      await user.reload()
      setTotp(null)
      setCode("")
      toast.success("Two-factor authentication enabled")
    } catch {
      toast.error("Invalid code, try again")
    } finally {
      setBusy(false)
    }
  }

  async function disable() {
    if (!user) return
    setBusy(true)
    try {
      await user.disableTOTP()
      await user.reload()
      toast.success("Two-factor authentication disabled")
    } catch {
      toast.error("Could not disable MFA")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Two-factor authentication</CardTitle>
            <CardDescription>
              Add an authenticator app for an extra layer of security.
            </CardDescription>
          </div>
          <Badge variant={enabled ? "default" : "secondary"}>
            {enabled ? (
              <>
                <ShieldCheck className="size-3.5" /> Enabled
              </>
            ) : (
              <>
                <ShieldOff className="size-3.5" /> Disabled
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      {totp && !enabled && (
        <CardContent className="flex flex-col gap-4">
          <div className="rounded-lg border bg-muted/40 p-4">
            <p className="text-sm font-medium">Add this key to your authenticator app:</p>
            <code className="mt-2 block break-all rounded bg-background px-2 py-1.5 text-sm">
              {totp.secret}
            </code>
          </div>
          <Field>
            <FieldLabel htmlFor="totp-code">Enter the 6-digit code</FieldLabel>
            <Input
              id="totp-code"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
            />
          </Field>
        </CardContent>
      )}
      <CardFooter className="justify-end gap-2">
        {enabled ? (
          <Button variant="outline" onClick={disable} disabled={busy}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            Disable MFA
          </Button>
        ) : totp ? (
          <>
            <Button variant="ghost" onClick={() => setTotp(null)} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={verify} disabled={busy || code.length !== 6}>
              {busy && <Loader2 className="size-4 animate-spin" />}
              Verify &amp; enable
            </Button>
          </>
        ) : (
          <Button onClick={startEnable} disabled={busy}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            Enable MFA
          </Button>
        )}
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
