"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import type { NotificationPreferences, UserSettings } from "@/lib/types/account"

const ITEMS: { id: keyof NotificationPreferences; label: string; desc: string }[] = [
  { id: "weekly", label: "Weekly progress digest", desc: "A summary of what you studied each week." },
  { id: "gaps", label: "Knowledge gap alerts", desc: "Get notified when new gaps are detected." },
  { id: "quiz", label: "Quiz reminders", desc: "Nudges to keep your streak alive." },
  { id: "product", label: "Product updates", desc: "New features and improvements." },
]

const fetcher = (url: string) =>
  fetch(url).then((r) => r.json() as Promise<{ settings: UserSettings }>)

export function NotificationsTab() {
  const { data, isLoading, mutate } = useSWR("/api/settings", fetcher)
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null)

  useEffect(() => {
    if (data?.settings && !prefs) {
      setPrefs(data.settings.notifications)
    }
  }, [data, prefs])

  async function toggle(id: keyof NotificationPreferences, value: boolean) {
    if (!prefs) return
    const next = { ...prefs, [id]: value }
    setPrefs(next) // optimistic
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifications: next }),
      })
      if (!res.ok) throw new Error()
      const json = (await res.json()) as { settings: UserSettings }
      await mutate(json, { revalidate: false })
      toast.success("Preferences saved")
    } catch {
      setPrefs(prefs) // revert
      toast.error("Could not save preferences")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification preferences</CardTitle>
        <CardDescription>Choose what MemoSphere sends you. Saved automatically.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {isLoading || !prefs ? (
          <div className="flex flex-col gap-4 py-2">
            {ITEMS.map((it) => (
              <Skeleton key={it.id} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          ITEMS.map((n, i) => (
            <div key={n.id}>
              {i > 0 && <Separator />}
              <div className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="font-medium">{n.label}</p>
                  <p className="text-sm text-muted-foreground">{n.desc}</p>
                </div>
                <Switch
                  checked={prefs[n.id]}
                  onCheckedChange={(v) => toggle(n.id, v)}
                  aria-label={n.label}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
