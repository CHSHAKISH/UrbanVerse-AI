"use client"

import { useUrbanStore } from "@/store/useUrbanStore"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bell, Map, Sun, Moon, LogOut } from "lucide-react"
import { useTheme } from "next-themes"
import { useSession, signOut } from "next-auth/react"
import { useEffect, useState } from "react"

export function Navbar() {
  const selectedZone = useUrbanStore((s) => s.selectedZone)
  const { theme, setTheme } = useTheme()
  const { data: session } = useSession()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), [])

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    : "UV"

  return (
    <header className="fixed right-0 top-0 z-30 flex h-14 w-[calc(100%-4rem)] items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md transition-colors">
      {/* Left: breadcrumb + zone badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Map className="h-4 w-4 text-primary" />
          <span className="font-semibold text-foreground">UrbanVerse AI</span>
          <span className="text-border">/</span>
          <span className="text-muted-foreground">Dashboard</span>
        </div>

        {selectedZone && (
          <span
            className="inline-flex h-5 items-center rounded-full border px-2.5 text-[11px] font-semibold tracking-wide"
            style={{
              backgroundColor: `${selectedZone.color}20`,
              color: selectedZone.color,
              borderColor: `${selectedZone.color}40`,
            }}
          >
            {selectedZone.name}
          </span>
        )}
      </div>

      {/* Right: theme toggle + notifications + user */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-foreground"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        )}

        {/* Notifications */}
        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5 shadow-sm">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-400 text-[10px] font-bold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-[13px] font-medium text-foreground">
            {session?.user?.name ?? "Planner"}
          </span>
        </div>

        {/* Log Out */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
          title="Log out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
