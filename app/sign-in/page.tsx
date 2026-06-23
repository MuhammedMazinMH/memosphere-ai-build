import Link from "next/link"
import type { Metadata } from "next"
import { AuthShell } from "@/components/auth/auth-shell"
import { SignInForm } from "@/components/auth/sign-in-form"

export const metadata: Metadata = {
  title: "Sign in",
}

export default function SignInPage() {
  // Authenticated users are redirected to the dashboard by the middleware
  // (a real HTTP redirect), so this page only ever renders for signed-out
  // visitors.
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
