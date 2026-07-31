"use client"

import { usePathname, useRouter } from "next/navigation"
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

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-16 flex-col items-center justify-between border-r border-white/10 bg-gray-950/80 py-4 backdrop-blur-md">
      {/* Logo */}
      <div className="flex flex-col items-center gap-6">
        <Tooltip>
          <TooltipTrigger 
            onClick={() => router.push("/")}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/30 transition-transform hover:scale-110"
          >
            <Zap className="h-5 w-5 text-white" />
          </TooltipTrigger>
          <TooltipContent side="right">UrbanVerse AI</TooltipContent>
        </Tooltip>

        <Separator className="w-8 bg-white/10" />

        {/* Nav Links */}
        <nav className="flex flex-col items-center gap-2">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href
            return (
              <Tooltip key={href}>
                <TooltipTrigger 
                  onClick={() => router.push(href)}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 hover:bg-white/10",
                    isActive
                      ? "bg-blue-500/20 text-blue-400 shadow-inner"
                      : "text-gray-400 hover:text-gray-200"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            )
          })}
        </nav>
      </div>

      {/* Bottom Logout */}
      <Tooltip>
        <TooltipTrigger 
          className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400"
          onClick={() => {
            /* signOut() when auth is connected */
          }}
        >
          <LogOut className="h-5 w-5" />
        </TooltipTrigger>
        <TooltipContent side="right">Logout</TooltipContent>
      </Tooltip>
    </aside>
  )
}

