"use client"

import { useState } from "react"
import { useClerk } from "@clerk/nextjs"
import { toast } from "sonner"
import { Loader2, Trash2 } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function DeleteAccountDialog() {
  const { signOut } = useClerk()
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [busy, setBusy] = useState(false)

  const canDelete = confirmText.trim().toUpperCase() === "DELETE"

  async function handleDelete() {
    if (!canDelete) return
    setBusy(true)
    try {
      // 1) Server cleanup of DynamoDB-owned data + Clerk user deletion.
      const res = await fetch("/api/account", { method: "DELETE" })
      if (!res.ok) {
        const json = await res.json().catch(() => ({})) as { detail?: string; error?: string }
        const msg = json.detail ?? json.error ?? "Could not delete your account. Please try again."
        console.error("[delete-account] server error:", json)
        toast.error(msg)
        setBusy(false)
        return
      }
      // 2) Clear the local session and redirect to the landing page.
      await signOut({ redirectUrl: "/" })
    } catch (err) {
      console.error("[delete-account] unexpected error:", err)
      setBusy(false)
      toast.error("Could not delete your account. Please try again.")
    }
  }

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="text-destructive">Danger zone</CardTitle>
        <CardDescription>
          Permanently delete your account and all associated data. This cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button variant="destructive">
                <Trash2 className="size-4" />
                Delete account
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete your account?</DialogTitle>
              <DialogDescription>
                This permanently removes your profile, settings, notifications, and
                all user-owned records, then deletes your login. This action is
                irreversible.
              </DialogDescription>
            </DialogHeader>
            <Field>
              <FieldLabel htmlFor="confirm-delete">
                Type <span className="font-semibold">DELETE</span> to confirm
              </FieldLabel>
              <Input
                id="confirm-delete"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                autoComplete="off"
              />
              <FieldDescription>This helps prevent accidental deletion.</FieldDescription>
            </Field>
            <DialogFooter>
              <DialogClose
                render={
                  <Button variant="outline" disabled={busy}>
                    Cancel
                  </Button>
                }
              />
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={!canDelete || busy}
              >
                {busy && <Loader2 className="size-4 animate-spin" />}
                Permanently delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
}
