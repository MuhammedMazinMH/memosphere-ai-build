import Link from "next/link"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { auth } from "@clerk/nextjs/server"
import { AuthShell } from "@/components/auth/auth-shell"
import { SignInForm } from "@/components/auth/sign-in-form"

export const metadata: Metadata = {
  title: "Sign in",
}

export default async function SignInPage() {
  // Authenticated users should never see the auth form — send them straight
  // to the dashboard before anything renders.
  const { userId } = await auth()
  if (userId) {
    redirect("/dashboard")
  }

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to continue building your second brain."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <SignInForm />
    </AuthShell>
  )
}
