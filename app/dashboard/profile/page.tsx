import type { Metadata } from "next"
import { ProfileView } from "@/components/dashboard/profile-view"

export const metadata: Metadata = {
  title: "Profile & Settings",
}

export default function ProfilePage() {
  return <ProfileView />
}
