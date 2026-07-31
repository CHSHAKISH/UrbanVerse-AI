"use client"

import { useUrbanStore } from "@/store/useUrbanStore"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bell, Map } from "lucide-react"
import { cn } from "@/lib/utils"

export function Navbar() {
  const selectedZone = useUrbanStore((s) => s.selectedZone)

  return (
    <header className="fixed right-0 top-0 z-30 flex h-14 w-[calc(100%-4rem)] items-center justify-between border-b border-white/10 bg-gray-950/80 px-6 backdrop-blur-md">
      {/* Left: breadcrumb + zone badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Map className="h-4 w-4" />
          <span className="text-gray-200 font-medium">UrbanVerse AI</span>
          <span className="text-gray-600">/</span>
          <span>Dashboard</span>
        </div>
        {selectedZone && (
          <Badge
            className="text-xs"
            style={{ backgroundColor: `${selectedZone.color}22`, color: selectedZone.color, borderColor: `${selectedZone.color}44`, borderWidth: "1px", borderStyle: "solid" }}
          >
            {selectedZone.name}
          </Badge>
        )}
      </div>

      {/* Right: notifications + user */}
      <div className="flex items-center gap-3">
        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white/10 hover:text-gray-200">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-blue-400" />
        </button>
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-400 text-xs font-bold text-white">
              UV
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-300">Planner</span>
        </div>
      </div>
    </header>
  )
}
