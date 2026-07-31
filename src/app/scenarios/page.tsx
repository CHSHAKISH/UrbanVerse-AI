"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import {
  History,
  TrendingUp, TrendingDown, Minus,
  MapPin, Bot, Loader2, Inbox,
} from "lucide-react"
import { Sidebar } from "@/components/layout/Sidebar"
import { Navbar } from "@/components/layout/Navbar"
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
      "flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-medium",
      isNeutral ? "bg-muted text-muted-foreground" :
      isGood ? "bg-green-500/10 text-green-600 dark:text-green-400" :
      "bg-red-500/10 text-red-600 dark:text-red-400"
    )}>
      {isNeutral ? <Minus className="h-2.5 w-2.5" /> : isGood ? <TrendingDown className="h-2.5 w-2.5" /> : <TrendingUp className="h-2.5 w-2.5" />}
      <span className="font-mono">{rounded > 0 ? "+" : ""}{rounded}</span>
      <span className="opacity-60">{label}</span>
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
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col pl-16">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 pt-20">
          {/* Page header */}
          <div className="mb-8">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 shadow-lg shadow-indigo-500/25">
                <History className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-foreground">Scenario History</h1>
                <p className="text-sm text-muted-foreground">Your saved urban planning simulations</p>
              </div>
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* Sign in required */}
          {error === "sign-in" && (
            <div className="flex flex-col items-center justify-center gap-4 py-24">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <Bot className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground">Sign in to view your history</p>
              <a
                href="/login"
                className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition"
              >
                Sign In
              </a>
            </div>
          )}

          {/* Generic error */}
          {error && error !== "sign-in" && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && scenarios.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-24">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <Inbox className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground">No scenarios saved yet</p>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
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
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                  className="group cursor-pointer rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:border-primary/20 hover:shadow-md hover:-translate-y-0.5"
                >
                  {/* Zone + time */}
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                      {s.zone.name}
                    </div>
                    <span className="flex-shrink-0 text-[11px] text-muted-foreground/70">
                      {format(new Date(s.timestamp), "MMM d, HH:mm")}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="mb-2 font-semibold tracking-tight text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {s.title}
                  </h3>

                  {/* Actions */}
                  <p className="mb-3 text-xs text-muted-foreground line-clamp-2">{s.action}</p>

                  {/* Metric deltas */}
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    <DeltaBadge value={s.trafficImpact} invert label="Traffic" />
                    <DeltaBadge value={s.carbonImpact}  invert label="Carbon" />
                    <DeltaBadge value={s.floodImpact}   invert label="Flood" />
                    <DeltaBadge value={s.accessibilityImpact}  label="Access" />
                  </div>

                  {/* AI Summary */}
                  {s.aiSummary && (
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 border-t border-border pt-3">
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
