"use client"

import Link from "next/link"
import { Search, Upload, Bell, CheckCheck } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ThemeToggle } from "@/components/theme-toggle"
import { UploadDialog } from "@/components/dashboard/upload-dialog"

const notifications = [
  {
    id: "n1",
    title: "Concepts extracted",
    body: "We finished analyzing your latest upload and linked new concepts.",
    time: "2m ago",
    unread: true,
  },
  {
    id: "n2",
    title: "Quiz ready",
    body: "A practice quiz was generated from Machine Learning.",
    time: "1h ago",
    unread: true,
  },
  {
    id: "n3",
    title: "Weekly review",
    body: "Your spaced-repetition review for this week is ready.",
    time: "Yesterday",
    unread: false,
  },
]

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
        <Popover>
          <PopoverTrigger
            render={
              <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
                <Bell />
                {notifications.some((n) => n.unread) && (
                  <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary ring-2 ring-background" />
                )}
              </Button>
            }
          />
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <p className="text-sm font-semibold">Notifications</p>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <CheckCheck className="size-3.5" />
                {notifications.filter((n) => n.unread).length} new
              </span>
            </div>
            <ScrollArea className="max-h-80">
              <ul className="divide-y">
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className="flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                  >
                    <span
                      className={`mt-1.5 size-2 shrink-0 rounded-full ${
                        n.unread ? "bg-primary" : "bg-transparent"
                      }`}
                      aria-hidden="true"
                    />
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-medium leading-tight">{n.title}</p>
                      <p className="text-xs text-muted-foreground">{n.body}</p>
                      <span className="text-xs text-muted-foreground/70">{n.time}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </PopoverContent>
        </Popover>
        <ThemeToggle />
      </div>
    </header>
  )
}
