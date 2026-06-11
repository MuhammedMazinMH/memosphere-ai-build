"use client"

import Link from "next/link"
import { Search, Upload, Bell } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { UploadDialog } from "@/components/dashboard/upload-dialog"

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-md">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 h-4" />
      <Button
        variant="outline"
        className="hidden h-9 w-full max-w-xs justify-start text-muted-foreground sm:flex"
        render={
          <Link href="/dashboard/search">
            <Search data-icon="inline-start" />
            Search your knowledge...
          </Link>
        }
      />
      <div className="ml-auto flex items-center gap-2">
        <UploadDialog
          trigger={
            <Button>
              <Upload data-icon="inline-start" />
              <span className="hidden sm:inline">Upload</span>
            </Button>
          }
        />
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell />
        </Button>
        <ThemeToggle />
      </div>
    </header>
  )
}
