"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Library,
  FolderKanban,
  Sparkles,
  ListChecks,
  Network,
  Search,
  TrendingUp,
  GraduationCap,
  Settings,
  Shield,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Logo } from "@/components/logo"
import { UserMenu } from "@/components/dashboard/user-menu"

const mainNav = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Knowledge Library", href: "/dashboard/library", icon: Library },
  { title: "Subjects", href: "/dashboard/subjects", icon: FolderKanban },
  { title: "Universal Search", href: "/dashboard/search", icon: Search },
]

const aiNav = [
  { title: "Summary Center", href: "/dashboard/summaries", icon: Sparkles },
  { title: "Quiz Generator", href: "/dashboard/quiz", icon: ListChecks },
  { title: "Knowledge Graph", href: "/dashboard/graph", icon: Network },
]

const insightsNav = [
  { title: "Learning Gaps", href: "/dashboard/gaps", icon: TrendingUp },
  { title: "Exam Readiness", href: "/dashboard/exam-readiness", icon: GraduationCap },
]

const systemNav = [
  { title: "Settings", href: "/dashboard/profile", icon: Settings },
  { title: "Admin", href: "/dashboard/admin", icon: Shield },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  function renderGroup(label: string, items: typeof mainNav) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>{label}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  isActive={isActive(item.href)}
                  tooltip={item.title}
                  render={
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  }
                />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center px-1 py-1.5 group-data-[collapsible=icon]:justify-center">
          <Link href="/dashboard" className="flex items-center">
            <Logo showText className="group-data-[collapsible=icon]:hidden" />
            <Logo showText={false} className="hidden group-data-[collapsible=icon]:flex" />
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {renderGroup("Workspace", mainNav)}
        {renderGroup("AI Tools", aiNav)}
        {renderGroup("Insights", insightsNav)}
        {renderGroup("System", systemNav)}
      </SidebarContent>
      <SidebarFooter>
        <UserMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
