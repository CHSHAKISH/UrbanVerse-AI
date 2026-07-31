"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import {
  History,
  Car, Leaf, Droplets, Accessibility,
  TrendingUp, TrendingDown, Minus,
  MapPin, Bot, Loader2, Inbox,
} from "lucide-react"
import { Sidebar } from "@/components/layout/Sidebar"
import { Navbar } from "@/components/layout/Navbar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useUrbanStore } from "@/store/useUrbanStore"
import { getZoneById } from "@/config/zones"

interface ScenarioRecord {
  id: string
  zoneId: string
  title: string
  action: string
  aiSummary: string | null
  trafficImpact: number | null
  carbonImpact: number | null
  floodImpact: number | null
  accessibilityImpact: number | null
  timestamp: string
  zone: { name: string }
}

function DeltaBadge({ value, invert = false, label }: { value: number | null; invert?: boolean; label: string }) {
  if (value === null) return null
  const rounded = Math.round(value)
  const isGood = invert ? rounded < 0 : rounded > 0
  const isNeutral = rounded === 0
  return (
    <div className={cn(
      "flex items-center gap-1 rounded-lg px-2 py-1 text-xs",
      isNeutral ? "bg-gray-800 text-gray-400" :
      isGood ? "bg-green-500/15 text-green-400" :
      "bg-red-500/15 text-red-400"
    )}>
      {isNeutral ? <Minus className="h-3 w-3" /> : isGood ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
      <span className="font-mono">{rounded > 0 ? "+" : ""}{rounded}</span>
      <span className="text-[10px] opacity-70">{label}</span>
    </div>
  )
}

export default function ScenariosPage() {
  const [scenarios, setScenarios] = useState<ScenarioRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const setSelectedZone = useUrbanStore(s => s.setSelectedZone)

  const handleOpenScenario = (zoneId: string) => {
    const zone = getZoneById(zoneId)
    if (zone) {
      setSelectedZone(zone)
      router.push("/")
    }
  }

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const res = await fetch("/api/scenarios")
        if (res.status === 401) {
          setError("sign-in")
          return
        }
        if (!res.ok) throw new Error("Failed to fetch")
        const data = await res.json()
        setScenarios(data)
      } catch {
        setError("Failed to load scenarios.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchScenarios()
  }, [])

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-950">
      <Sidebar />
      <div className="flex flex-1 flex-col pl-16">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 pt-20">
          {/* Page header */}
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 shadow-lg shadow-indigo-500/30">
                <History className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-100">Scenario History</h1>
                <p className="text-sm text-gray-400">Your saved urban planning simulations</p>
              </div>
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          )}

          {/* Sign in required */}
          {error === "sign-in" && (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-800">
                <Bot className="h-7 w-7 text-gray-400" />
              </div>
              <p className="text-gray-400">Sign in to view your scenario history.</p>
              <a
                href="/login"
                className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-500 transition"
              >
                Sign In
              </a>
            </div>
          )}

          {/* Generic error */}
          {error && error !== "sign-in" && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && scenarios.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-800">
                <Inbox className="h-7 w-7 text-gray-500" />
              </div>
              <p className="text-gray-400">No scenarios saved yet.</p>
              <p className="text-sm text-gray-600">
                Run a simulation on the dashboard and click "Save Scenario".
              </p>
            </div>
          )}

          {/* Scenarios grid */}
          {!isLoading && !error && scenarios.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {scenarios.map((s, i) => (
                <motion.div
                  key={s.id}
                  onClick={() => handleOpenScenario(s.zoneId)}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="cursor-pointer rounded-2xl border border-white/10 bg-gray-900/60 p-5 backdrop-blur-sm transition-all hover:bg-gray-800/60 hover:border-white/20"
                >
                  {/* Zone + time */}
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                      {s.zone.name}
                    </div>
                    <span className="flex-shrink-0 text-[11px] text-gray-600">
                      {format(new Date(s.timestamp), "MMM d, HH:mm")}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="mb-2 font-semibold text-gray-200 leading-snug line-clamp-2">
                    {s.title}
                  </h3>

                  {/* Actions */}
                  <p className="mb-3 text-xs text-gray-500 line-clamp-2">{s.action}</p>

                  {/* Metric deltas */}
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    <DeltaBadge value={s.trafficImpact}       invert label="Traffic" />
                    <DeltaBadge value={s.carbonImpact}        invert label="Carbon" />
                    <DeltaBadge value={s.floodImpact}         invert label="Flood" />
                    <DeltaBadge value={s.accessibilityImpact}       label="Access" />
                  </div>

                  {/* AI Summary */}
                  {s.aiSummary && (
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 border-t border-white/5 pt-3">
                      {s.aiSummary}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
