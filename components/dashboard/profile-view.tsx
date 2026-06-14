"use client"

import { User, Bell, Shield } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/dashboard/page-header"
import { ProfileTab } from "@/components/dashboard/settings/profile-tab"
import { NotificationsTab } from "@/components/dashboard/settings/notifications-tab"
import { SecurityTab } from "@/components/dashboard/settings/security-tab"

export function ProfileView() {
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

      <TabsContent value="profile">
        <ProfileTab />
      </TabsContent>

      <TabsContent value="notifications">
        <NotificationsTab />
      </TabsContent>

      <TabsContent value="security">
        <SecurityTab />
      </TabsContent>
    </Tabs>
  )
}
