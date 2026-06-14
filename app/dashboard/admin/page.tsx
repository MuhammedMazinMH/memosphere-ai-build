import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { AdminView } from "@/components/dashboard/admin-view"
import { isAdmin } from "@/lib/auth/roles"

export const metadata: Metadata = {
  title: "Admin",
}

// Server-side role gate. Non-admins (and unauthenticated users) never render
// the admin UI — they are redirected to their dashboard. This is the
// authoritative check; sidebar hiding is only a convenience.
export default async function AdminPage() {
  if (!(await isAdmin())) {
    redirect("/dashboard")
  }
  return <AdminView />
}
