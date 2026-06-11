import type { Metadata } from "next"
import { AdminView } from "@/components/dashboard/admin-view"

export const metadata: Metadata = {
  title: "Admin Analytics",
}

export default function AdminPage() {
  return <AdminView />
}
