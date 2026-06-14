"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { toast } from "sonner"
import { User, Bell, Shield, Flame, Target, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field"
import { user as seedProfile } from "@/lib/mock-data"
import { PageHeader } from "@/components/dashboard/page-header"

const notifications = [
  { id: "weekly", label: "Weekly progress digest", desc: "A summary of what you studied each week.", on: true },
  { id: "gaps", label: "Knowledge gap alerts", desc: "Get notified when new gaps are detected.", on: true },
  { id: "quiz", label: "Quiz reminders", desc: "Nudges to keep your streak alive.", on: false },
  { id: "product", label: "Product updates", desc: "New features and improvements.", on: false },
]

export function ProfileView() {
  const { user: clerkUser } = useUser()
  const [notifState, setNotifState] = useState(() =>
    Object.fromEntries(notifications.map((n) => [n.id, n.on])),
  )

  // Identity (name/email/initials) comes ONLY from the authenticated Clerk
  // session — never from the seeded mock profile. App-specific stats
  // (streak/goal) are the only fields still sourced from the seed.
  const name =
    clerkUser?.fullName || clerkUser?.primaryEmailAddress?.emailAddress || ""
  const initials =
    (name
      .split(/\s+/)
      .map((part) => part[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase()) || "U"

  const user = {
    name,
    email: clerkUser?.primaryEmailAddress?.emailAddress ?? "",
    initials,
    streak: seedProfile.streak,
    goal: seedProfile.goal,
  }
  console.log("[v0] PROFILE_USER", user)

  return (
    <Tabs defaultValue="profile" className="gap-6">
      <PageHeader
        title="Profile & Settings"
        description="Manage your account, notifications, and security."
      />
      <TabsList>
        <TabsTrigger value="profile">
          <User data-icon="inline-start" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="notifications">
          <Bell data-icon="inline-start" />
          Notifications
        </TabsTrigger>
        <TabsTrigger value="security">
          <Shield data-icon="inline-start" />
          Security
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal information</CardTitle>
            <CardDescription>Update your account details and study goal.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="size-16">
                <AvatarFallback className="bg-primary text-lg text-primary-foreground">
                  {user.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm">Change avatar</Button>
                <span className="text-xs text-muted-foreground">JPG or PNG, max 2MB.</span>
              </div>
            </div>
            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="name">Full name</FieldLabel>
                  <Input key={`name-${user.name}`} id="name" name="name" autoComplete="name" defaultValue={user.name} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input key={`email-${user.email}`} id="email" name="email" type="email" autoComplete="email" defaultValue={user.email} />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="goal">Study goal</FieldLabel>
                <Input id="goal" name="goal" autoComplete="off" defaultValue={user.goal} />
                <FieldDescription>What are you working toward right now?</FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="bio">Bio</FieldLabel>
                <Textarea id="bio" rows={3} placeholder="Tell us a little about your studies..." />
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button variant="outline">Cancel</Button>
            <Button onClick={() => toast.success("Profile updated")}>Save changes</Button>
          </CardFooter>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="flex items-center gap-4 py-6">
              <div className="flex size-12 items-center justify-center rounded-lg bg-chart-5/15 text-chart-5">
                <Flame className="size-6" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{user.streak} days</p>
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
                <p className="text-lg font-semibold">{user.goal}</p>
                <p className="text-sm text-muted-foreground">Active goal</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notification preferences</CardTitle>
            <CardDescription>Choose what MemoSphere sends you.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {notifications.map((n, i) => (
              <div key={n.id}>
                {i > 0 && <Separator />}
                <div className="flex items-center justify-between gap-4 py-4">
                  <div>
                    <p className="font-medium">{n.label}</p>
                    <p className="text-sm text-muted-foreground">{n.desc}</p>
                  </div>
                  <Switch
                    checked={notifState[n.id]}
                    onCheckedChange={(v) => {
                      setNotifState((s) => ({ ...s, [n.id]: v }))
                      toast.success(`${n.label} ${v ? "enabled" : "disabled"}`)
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="security" className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>Update your password regularly to stay secure.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="current">Current password</FieldLabel>
                  <Input id="current" name="current-password" type="password" autoComplete="current-password" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="new">New password</FieldLabel>
                  <Input id="new" name="new-password" type="password" autoComplete="new-password" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="confirm">Confirm password</FieldLabel>
                  <Input id="confirm" name="confirm-password" type="password" autoComplete="new-password" />
                </Field>
              </div>
            </FieldGroup>
          </CardContent>
          <CardFooter className="justify-end">
            <Button onClick={() => toast.success("Password updated")}>Update password</Button>
          </CardFooter>
        </Card>

        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-destructive">Danger zone</CardTitle>
            <CardDescription>Permanently delete your account and all data.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="destructive" onClick={() => toast.error("Account deletion is disabled in the demo")}>
              <Trash2 data-icon="inline-start" />
              Delete account
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
