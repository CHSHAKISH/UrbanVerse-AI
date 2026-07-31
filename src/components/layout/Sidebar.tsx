"use client"

import { usePathname, useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  History,
  FileText,
  Settings,
  LogOut,
  Zap,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/scenarios", icon: History, label: "Scenarios" },
  { href: "/reports", icon: FileText, label: "Reports" },
  { href: "/settings", icon: Settings, label: "Settings" },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-16 flex-col items-center justify-between border-r border-border bg-background/90 py-4 backdrop-blur-md transition-colors">
      {/* Logo */}
      <div className="flex flex-col items-center gap-5">
        {mounted ? (
          <Tooltip>
            <TooltipTrigger
              onClick={() => router.push("/")}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/30 transition-transform hover:scale-110 cursor-pointer"
            >
              <Zap className="h-5 w-5 text-white" />
            </TooltipTrigger>
            <TooltipContent side="right" className="font-semibold">UrbanVerse AI</TooltipContent>
          </Tooltip>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 opacity-90">
            <Zap className="h-5 w-5 text-white" />
          </div>
        )}

        <Separator className="w-8 bg-border" />

        {/* Nav Links */}
        <nav className="flex flex-col items-center gap-1">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href
            const buttonClass = cn(
              "flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl transition-all duration-200",
              isActive
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )

            return mounted ? (
              <Tooltip key={href}>
                <TooltipTrigger onClick={() => router.push(href)} className={buttonClass}>
                  <Icon className="h-[18px] w-[18px]" />
                </TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            ) : (
              <div key={href} className={buttonClass}>
                <Icon className="h-[18px] w-[18px]" />
              </div>
            )
          })}
        </nav>
      </div>

      {/* Bottom Logout */}
      {mounted ? (
        <Tooltip>
          <TooltipTrigger
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-[18px] w-[18px]" />
          </TooltipTrigger>
          <TooltipContent side="right">Sign Out</TooltipContent>
        </Tooltip>
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground">
          <LogOut className="h-[18px] w-[18px]" />
        </div>
      )}
    </aside>
  )
}
