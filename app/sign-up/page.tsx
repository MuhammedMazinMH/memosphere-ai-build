import Link from "next/link"
import type { Metadata } from "next"
import { AuthShell } from "@/components/auth/auth-shell"
import { SignUpForm } from "@/components/auth/sign-up-form"

export const metadata: Metadata = {
  title: "Sign up",
}

export default function SignUpPage() {
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
