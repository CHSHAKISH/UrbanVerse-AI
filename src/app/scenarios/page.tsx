"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import {
  History, TrendingUp, TrendingDown, Minus, MapPin,
  Bot, Loader2, Inbox, GitCompare, Check, X, ChevronRight,
} from "lucide-react"
import { Sidebar } from "@/components/layout/Sidebar"
import { Navbar } from "@/components/layout/Navbar"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useUrbanStore } from "@/store/useUrbanStore"
import { getZoneById } from "@/config/zones"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

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

function DeltaBadge({
  value,
  invert = false,
  label,
}: {
  value: number | null
  invert?: boolean
  label: string
}) {
  if (value === null) return null
  const rounded = Math.round(value)
  const isGood = invert ? rounded < 0 : rounded > 0
  const isNeutral = rounded === 0
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-medium",
        isNeutral
          ? "bg-muted text-muted-foreground"
          : isGood
          ? "bg-green-500/10 text-green-600 dark:text-green-400"
          : "bg-red-500/10 text-red-600 dark:text-red-400"
      )}
    >
      {isNeutral ? (
        <Minus className="h-2.5 w-2.5" />
      ) : isGood ? (
        <TrendingDown className="h-2.5 w-2.5" />
      ) : (
        <TrendingUp className="h-2.5 w-2.5" />
      )}
      <span className="font-mono">
        {rounded > 0 ? "+" : ""}
        {rounded}
      </span>
      <span className="opacity-60">{label}</span>
    </div>
  )
}

export default function ScenariosPage() {
  const [scenarios, setScenarios] = useState<ScenarioRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [compareMode, setCompareMode] = useState(false)
  const [selected, setSelected] = useState<string[]>([])

  const router = useRouter()
  const setSelectedZone = useUrbanStore((s) => s.setSelectedZone)

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const res = await fetch("/api/scenarios")
        if (res.status === 401) { setError("sign-in"); return }
        if (!res.ok) throw new Error("Failed to fetch")
        setScenarios(await res.json())
      } catch {
        setError("Failed to load scenarios.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchScenarios()
  }, [])

  const handleCardClick = useCallback(
    (s: ScenarioRecord) => {
      if (!compareMode) {
        const zone = getZoneById(s.zoneId)
        if (zone) { setSelectedZone(zone); router.push("/") }
        return
      }
      setSelected((prev) => {
        if (prev.includes(s.id)) return prev.filter((id) => id !== s.id)
        if (prev.length >= 2) {
          toast.warning("You can only compare 2 scenarios at a time.")
          return prev
        }
        return [...prev, s.id]
      })
    },
    [compareMode, router, setSelectedZone]
  )

  const handleCompare = () => {
    if (selected.length !== 2) return
    router.push(`/scenarios/compare?ids=${selected.join(",")}`)
  }

  const toggleCompareMode = () => {
    setCompareMode((v) => !v)
    setSelected([])
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col pl-16">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 pt-20">
          {/* Page header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 shadow-lg shadow-indigo-500/25">
                <History className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  Scenario History
                </h1>
                <p className="text-sm text-muted-foreground">
                  Your saved urban planning simulations
                </p>
              </div>
            </div>

            {/* Compare Mode Toggle */}
            {scenarios.length >= 2 && !isLoading && !error && (
              <Button
                variant={compareMode ? "default" : "outline"}
                size="sm"
                onClick={toggleCompareMode}
                className={cn(
                  "gap-2 transition-all",
                  compareMode
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {compareMode ? (
                  <><X className="h-4 w-4" /> Exit Compare</>
                ) : (
                  <><GitCompare className="h-4 w-4" /> Compare Scenarios</>
                )}
              </Button>
            )}
          </div>

          {/* Compare mode instruction banner */}
          <AnimatePresence>
            {compareMode && (
              <motion.div
                key="compare-banner"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-5 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3"
              >
                <GitCompare className="h-4 w-4 flex-shrink-0 text-primary" />
                <p className="text-sm text-foreground/70">
                  <span className="font-semibold text-foreground">Compare Mode:</span> Select
                  exactly{" "}
                  <span className="font-mono font-bold text-primary">2</span> scenarios to compare
                  side-by-side.{" "}
                  <span className="text-primary font-semibold">
                    {selected.length}/2
                  </span>{" "}
                  selected.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

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
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 pb-28">
              {scenarios.map((s, i) => {
                const isSelected = selected.includes(s.id)
                const selectionOrder = selected.indexOf(s.id)

                return (
                  <motion.div
                    key={s.id}
                    onClick={() => handleCardClick(s)}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className={cn(
                      "group relative cursor-pointer rounded-2xl border bg-card p-5 shadow-sm transition-all duration-200",
                      compareMode
                        ? isSelected
                          ? "border-primary bg-primary/5 shadow-md shadow-primary/10 ring-2 ring-primary/30"
                          : "border-border hover:border-primary/30 hover:bg-primary/3"
                        : "border-border hover:border-primary/20 hover:shadow-md hover:-translate-y-0.5"
                    )}
                  >
                    {/* Selection indicator overlay */}
                    {compareMode && (
                      <div
                        className={cn(
                          "absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background"
                        )}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                      </div>
                    )}

                    {/* Selection order badge */}
                    {isSelected && selectionOrder >= 0 && (
                      <div className="absolute left-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {selectionOrder + 1}
                      </div>
                    )}

                    {/* Zone + time */}
                    <div className={cn("mb-3 flex items-start justify-between gap-2", isSelected && "mt-1")}>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                        {s.zone.name}
                      </div>
                      <span className="flex-shrink-0 text-[11px] text-muted-foreground/70">
                        {format(new Date(s.timestamp), "MMM d, HH:mm")}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      className={cn(
                        "mb-2 font-semibold tracking-tight text-foreground leading-snug line-clamp-2 transition-colors",
                        !compareMode && "group-hover:text-primary",
                        compareMode && isSelected && "text-primary"
                      )}
                    >
                      {s.title}
                    </h3>

                    {/* Actions */}
                    <p className="mb-3 text-xs text-muted-foreground line-clamp-2">{s.action}</p>

                    {/* Metric deltas */}
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      <DeltaBadge value={s.trafficImpact} invert label="Traffic" />
                      <DeltaBadge value={s.carbonImpact} invert label="Carbon" />
                      <DeltaBadge value={s.floodImpact} invert label="Flood" />
                      <DeltaBadge value={s.accessibilityImpact} label="Access" />
                    </div>

                    {/* AI Summary */}
                    {s.aiSummary && (
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 border-t border-border pt-3">
                        {s.aiSummary}
                      </p>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </main>
      </div>

      {/* Floating Compare Bar */}
      <AnimatePresence>
        {compareMode && (
          <motion.div
            key="compare-bar"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
          >
            <div className="flex items-center gap-4 rounded-2xl border border-border bg-background/95 px-6 py-4 shadow-2xl shadow-black/30 backdrop-blur-xl ring-1 ring-border">
              {/* Selection pills */}
              <div className="flex items-center gap-2">
                {[0, 1].map((slot) => (
                  <div
                    key={slot}
                    className={cn(
                      "flex h-9 min-w-[120px] items-center gap-2 rounded-xl border px-3 text-xs font-medium transition-all",
                      selected[slot]
                        ? "border-primary/30 bg-primary/8 text-foreground"
                        : "border-dashed border-border text-muted-foreground"
                    )}
                  >
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full flex-shrink-0",
                        slot === 0 ? "bg-blue-500" : "bg-purple-500",
                        !selected[slot] && "opacity-30"
                      )}
                    />
                    {selected[slot]
                      ? scenarios.find((s) => s.id === selected[slot])?.title.slice(0, 22) + "…"
                      : `Scenario ${slot + 1}`}
                  </div>
                ))}
              </div>

              <div className="h-6 w-px bg-border" />

              {/* Compare button */}
              <Button
                onClick={handleCompare}
                disabled={selected.length !== 2}
                className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40"
              >
                <GitCompare className="h-4 w-4" />
                Compare
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>

              {/* Dismiss */}
              <button
                onClick={toggleCompareMode}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
