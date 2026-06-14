import Link from "next/link"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { auth } from "@clerk/nextjs/server"
import { AuthShell } from "@/components/auth/auth-shell"
import { SignUpForm } from "@/components/auth/sign-up-form"

export const metadata: Metadata = {
  title: "Sign up",
}

export default async function SignUpPage() {
  // Authenticated users should never see the auth form — send them straight
  // to the dashboard before anything renders.
  const { userId } = await auth()
  if (userId) {
    redirect("/dashboard")
  }

  return (
    <AuthShell
      title="Create your account"
      description="Start turning your study material into searchable intelligence."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthShell>
  )
}
