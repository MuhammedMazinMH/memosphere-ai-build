import type { Metadata } from "next"
import { AuthShell } from "@/components/auth/auth-shell"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export const metadata: Metadata = {
  title: "Reset password",
}

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Set a new password"
      description="Choose a strong password you haven't used before."
    >
      <ResetPasswordForm />
    </AuthShell>
  )
}
