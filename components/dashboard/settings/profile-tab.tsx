"use client"

import { useEffect, useRef, useState } from "react"
import useSWR from "swr"
import { useUser } from "@clerk/nextjs"
import { toast } from "sonner"
import { Loader2, Upload, Trash2, Flame, Target } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import type { UserSettings } from "@/lib/types/account"

const settingsFetcher = (url: string) =>
  fetch(url).then((r) => r.json() as Promise<{ settings: UserSettings }>)

function initialsOf(name: string) {
  return (
    name
      .split(/\s+/)
      .map((p) => p[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"
  )
}

export function ProfileTab() {
  const { user, isLoaded } = useUser()
  const fileInput = useRef<HTMLInputElement>(null)

  const email = user?.primaryEmailAddress?.emailAddress ?? ""
  const displayName = user?.fullName || email

  // Editable name (synced from Clerk once loaded).
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [savingName, setSavingName] = useState(false)
  const [avatarBusy, setAvatarBusy] = useState(false)

  useEffect(() => {
    if (isLoaded && user) {
      setFirstName(user.firstName ?? "")
      setLastName(user.lastName ?? "")
    }
  }, [isLoaded, user])

  // DynamoDB-backed profile extras.
  const { data, mutate } = useSWR("/api/settings", settingsFetcher)
  const [studyGoal, setStudyGoal] = useState("")
  const [bio, setBio] = useState("")
  const [savingExtras, setSavingExtras] = useState(false)
  const hydrated = useRef(false)

  useEffect(() => {
    if (data?.settings && !hydrated.current) {
      setStudyGoal(data.settings.studyGoal)
      setBio(data.settings.bio)
      hydrated.current = true
    }
  }, [data])

  async function handleAvatarFile(file: File) {
    if (!user) return
    setAvatarBusy(true)
    try {
      await user.setProfileImage({ file })
      await user.reload()
      toast.success("Avatar updated")
    } catch {
      toast.error("Could not update avatar")
    } finally {
      setAvatarBusy(false)
    }
  }

  async function handleRemoveAvatar() {
    if (!user) return
    setAvatarBusy(true)
    try {
      await user.setProfileImage({ file: null })
      await user.reload()
      toast.success("Avatar removed")
    } catch {
      toast.error("Could not remove avatar")
    } finally {
      setAvatarBusy(false)
    }
  }

  async function handleSaveName() {
    if (!user) return
    setSavingName(true)
    try {
      await user.update({ firstName: firstName.trim(), lastName: lastName.trim() })
      await user.reload()
      // Record a profile_updated notification (foundation type).
      void fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "profile_updated" }),
      })
      toast.success("Profile updated")
    } catch {
      toast.error("Could not update profile")
    } finally {
      setSavingName(false)
    }
  }

  async function handleSaveExtras() {
    setSavingExtras(true)
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studyGoal, bio }),
      })
      if (!res.ok) throw new Error()
      const json = (await res.json()) as { settings: UserSettings }
      await mutate(json, { revalidate: false })
      toast.success("Saved")
    } catch {
      toast.error("Could not save changes")
    } finally {
      setSavingExtras(false)
    }
  }

  const hasAvatar = Boolean(user?.hasImage && user?.imageUrl)

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
          <CardDescription>Update your account details and study goal.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              {hasAvatar && <AvatarImage src={user?.imageUrl} alt="Your avatar" />}
              <AvatarFallback className="bg-primary text-lg text-primary-foreground">
                {initialsOf(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={avatarBusy}
                  onClick={() => fileInput.current?.click()}
                >
                  {avatarBusy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                  {hasAvatar ? "Replace" : "Upload"}
                </Button>
                {hasAvatar && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={avatarBusy}
                    onClick={handleRemoveAvatar}
                  >
                    <Trash2 className="size-4" />
                    Remove
                  </Button>
                )}
              </div>
              <span className="text-xs text-muted-foreground">JPG or PNG, max 10MB.</span>
              <input
                ref={fileInput}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void handleAvatarFile(file)
                  e.target.value = ""
                }}
              />
            </div>
          </div>

          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="firstName">First name</FieldLabel>
                <Input
                  id="firstName"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="lastName">Last name</FieldLabel>
                <Input
                  id="lastName"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" type="email" value={email} readOnly disabled />
              <FieldDescription>
                Your email is managed by your account and cannot be changed here.
              </FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end">
          <Button onClick={handleSaveName} disabled={savingName || !isLoaded}>
            {savingName && <Loader2 className="size-4 animate-spin" />}
            Save profile
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Study goal &amp; bio</CardTitle>
          <CardDescription>These are saved to your MemoSphere profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="goal">Study goal</FieldLabel>
              <Input
                id="goal"
                value={studyGoal}
                onChange={(e) => setStudyGoal(e.target.value)}
                placeholder="e.g. Pass the MCAT by spring"
              />
              <FieldDescription>What are you working toward right now?</FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="bio">Bio</FieldLabel>
              <Textarea
                id="bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us a little about your studies..."
              />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end">
          <Button onClick={handleSaveExtras} disabled={savingExtras}>
            {savingExtras && <Loader2 className="size-4 animate-spin" />}
            Save changes
          </Button>
        </CardFooter>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="flex size-12 items-center justify-center rounded-lg bg-chart-5/15 text-chart-5">
              <Flame className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-semibold">
                {Number(user?.publicMetadata?.streak ?? 0)} days
              </p>
              <p className="text-sm text-muted-foreground">Current study streak</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Target className="size-6" />
            </div>
            <div>
              <p className="text-lg font-semibold">{studyGoal || "No goal set"}</p>
              <p className="text-sm text-muted-foreground">Active goal</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
