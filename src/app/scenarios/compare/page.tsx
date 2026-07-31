"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import {
  ArrowLeft, GitCompare, Loader2, AlertCircle,
  MapPin, Car, Leaf, Droplets, Accessibility,
  TrendingUp, TrendingDown, Minus, Bot,
  CheckCircle2, AlertTriangle, Lightbulb, Clock,
} from "lucide-react"
import { Sidebar } from "@/components/layout/Sidebar"
import { Navbar } from "@/components/layout/Navbar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Legend, Tooltip,
} from "recharts"

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

const METRIC_DEFS = [
  {
    key: "trafficImpact" as const,
    label: "Traffic",
    icon: Car,
    invert: true,
    desc: "Congestion reduction",
  },
  {
    key: "carbonImpact" as const,
    label: "Carbon",
    icon: Leaf,
    invert: true,
    desc: "Emissions reduction",
  },
  {
    key: "floodImpact" as const,
    label: "Flood Risk",
    icon: Droplets,
    invert: true,
    desc: "Flood risk reduction",
  },
  {
    key: "accessibilityImpact" as const,
    label: "Accessibility",
    icon: Accessibility,
    invert: false,
    desc: "Access improvement",
  },
] as const

// Determine which scenario wins on a given metric
function winner(a: number | null, b: number | null, invert: boolean): "a" | "b" | "tie" {
  const av = a ?? 0
  const bv = b ?? 0
  const aScore = invert ? -av : av
  const bScore = invert ? -bv : bv
  if (aScore > bScore) return "a"
  if (bScore > aScore) return "b"
  return "tie"
}

function DeltaCell({
  value,
  invert,
  won,
}: {
  value: number | null
  invert: boolean
  won: boolean
}) {
  const v = value ?? 0
  const isGood = invert ? v < 0 : v > 0
  const isNeutral = v === 0
  const color = isNeutral
    ? "text-muted-foreground"
    : isGood
    ? "text-green-600 dark:text-green-400"
    : "text-red-600 dark:text-red-400"

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-1 rounded-xl border p-4 transition-all",
        won
          ? "border-primary/30 bg-primary/5 shadow-sm"
          : "border-border bg-card"
      )}
    >
      {won && (
        <span className="mb-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
          Winner
        </span>
      )}
      <div className={cn("flex items-center gap-1 text-2xl font-bold font-mono", color)}>
        {isNeutral ? (
          <Minus className="h-5 w-5" />
        ) : isGood ? (
          <TrendingDown className="h-5 w-5" />
        ) : (
          <TrendingUp className="h-5 w-5" />
        )}
        {v > 0 ? "+" : ""}
        {v}
      </div>
      <span className="text-[11px] text-muted-foreground">/ 100</span>
    </div>
  )
}

// Custom radar tooltip
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border bg-background/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: entry.stroke }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-mono font-bold text-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function ComparePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [scenarios, setScenarios] = useState<[ScenarioRecord, ScenarioRecord] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const ids = searchParams.get("ids") ?? ""

  useEffect(() => {
    if (!ids) { setError("No scenarios selected."); setIsLoading(false); return }

    const fetchScenarios = async () => {
      try {
        const res = await fetch(`/api/scenarios/compare?ids=${ids}`)
        if (res.status === 401) { router.push("/login"); return }
        if (!res.ok) {
          const d = await res.json()
          throw new Error(d.error ?? "Failed to load")
        }
        const data = await res.json()
        setScenarios(data as [ScenarioRecord, ScenarioRecord])
      } catch (err: any) {
        setError(err.message ?? "Something went wrong")
      } finally {
        setIsLoading(false)
      }
    }
    fetchScenarios()
  }, [ids, router])

  // Radar data — absolute deltas to show impact magnitude
  const radarData = scenarios
    ? METRIC_DEFS.map(({ key, label }) => ({
        metric: label,
        [scenarios[0].title.slice(0, 16)]: Math.abs(scenarios[0][key] ?? 0),
        [scenarios[1].title.slice(0, 16)]: Math.abs(scenarios[1][key] ?? 0),
      }))
    : []

  const scoreA = scenarios
    ? METRIC_DEFS.reduce((acc, m) => {
        return acc + (winner(scenarios[0][m.key], scenarios[1][m.key], m.invert) === "a" ? 1 : 0)
      }, 0)
    : 0
  const scoreB = scenarios
    ? METRIC_DEFS.reduce((acc, m) => {
        return acc + (winner(scenarios[0][m.key], scenarios[1][m.key], m.invert) === "b" ? 1 : 0)
      }, 0)
    : 0

  const A_COLOR = "#3b82f6"
  const B_COLOR = "#a855f7"

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col pl-16">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 pt-20">
          {/* Back + Header */}
          <div className="mb-8 flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="border-border text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/25">
                <GitCompare className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  Scenario Comparison
                </h1>
                <p className="text-sm text-muted-foreground">
                  Side-by-side impact analysis
                </p>
              </div>
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-3 py-28">
              <Loader2 className="h-9 w-9 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading scenarios…</p>
            </div>
          )}

          {/* Error */}
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center gap-4 py-24">
              <AlertCircle className="h-10 w-10 text-destructive" />
              <p className="font-medium text-foreground">{error}</p>
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
              </Button>
            </div>
          )}

          {/* Main comparison view */}
          {scenarios && !isLoading && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-6 max-w-6xl"
              >
                {/* ── Scenario Header Cards ─────────────────────── */}
                <div className="grid grid-cols-2 gap-4">
                  {([scenarios[0], scenarios[1]] as const).map((s, idx) => (
                    <div
                      key={s.id}
                      className={cn(
                        "rounded-2xl border p-5 shadow-sm",
                        idx === 0
                          ? "border-blue-500/25 bg-blue-500/5"
                          : "border-purple-500/25 bg-purple-500/5"
                      )}
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ background: idx === 0 ? A_COLOR : B_COLOR }}
                        />
                        <span
                          className="text-xs font-bold uppercase tracking-wider"
                          style={{ color: idx === 0 ? A_COLOR : B_COLOR }}
                        >
                          Scenario {idx === 0 ? "A" : "B"}
                        </span>
                      </div>
                      <h2 className="mb-1 font-bold leading-tight text-foreground line-clamp-2">
                        {s.title}
                      </h2>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {s.zone.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />{" "}
                          {format(new Date(s.timestamp), "MMM d, yyyy · HH:mm")}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground line-clamp-1">
                        {s.action}
                      </p>
                    </div>
                  ))}
                </div>

                {/* ── Overall Score Bar ─────────────────────────── */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Overall Impact Score
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500" />
                      <span className="text-sm font-semibold text-foreground">
                        Scenario A
                      </span>
                      <span className="font-mono text-2xl font-bold text-blue-500">
                        {scoreA}
                      </span>
                      <span className="text-xs text-muted-foreground">wins</span>
                    </div>

                    <div className="relative flex-1 h-3 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: "50%" }}
                        animate={{
                          width:
                            scoreA + scoreB === 0
                              ? "50%"
                              : `${(scoreA / (scoreA + scoreB)) * 100}%`,
                        }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                      />
                      {scoreA === scoreB && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[9px] font-bold text-muted-foreground">TIE</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">wins</span>
                      <span className="font-mono text-2xl font-bold text-purple-500">
                        {scoreB}
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        Scenario B
                      </span>
                      <div className="h-3 w-3 rounded-full bg-purple-500" />
                    </div>
                  </div>
                </div>

                {/* ── Dual Radar Chart ──────────────────────────── */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <p className="mb-1 text-sm font-semibold text-foreground">
                    Impact Profile
                  </p>
                  <p className="mb-4 text-xs text-muted-foreground">
                    Absolute impact magnitude across all metrics (higher = more impactful change)
                  </p>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                      <PolarGrid stroke="currentColor" className="text-border opacity-50" />
                      <PolarAngleAxis
                        dataKey="metric"
                        tick={{ fill: "currentColor", fontSize: 12, fontWeight: 500 }}
                        className="text-muted-foreground"
                      />
                      <Radar
                        name="Scenario A"
                        dataKey={scenarios[0].title.slice(0, 16)}
                        stroke={A_COLOR}
                        fill={A_COLOR}
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                      <Radar
                        name="Scenario B"
                        dataKey={scenarios[1].title.slice(0, 16)}
                        stroke={B_COLOR}
                        fill={B_COLOR}
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
                        formatter={(value, entry) => (
                          <span style={{ color: (entry as any).color }}>
                            {value === scenarios[0].title.slice(0, 16) ? "Scenario A" : "Scenario B"}
                          </span>
                        )}
                      />
                      <Tooltip content={<CustomTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* ── Metric-by-Metric Grid ─────────────────────── */}
                <div className="space-y-3">
                  <h2 className="text-sm font-semibold text-foreground">
                    Metric-by-Metric Breakdown
                  </h2>
                  <div className="space-y-3">
                    {METRIC_DEFS.map(({ key, label, icon: Icon, invert, desc }) => {
                      const w = winner(scenarios[0][key], scenarios[1][key], invert)
                      return (
                        <div
                          key={key}
                          className="rounded-2xl border border-border bg-card p-4 shadow-sm"
                        >
                          {/* Metric header */}
                          <div className="mb-3 flex items-center gap-2">
                            <Icon className="h-4 w-4 text-primary" />
                            <span className="text-sm font-semibold text-foreground">{label}</span>
                            <span className="text-xs text-muted-foreground">— {desc}</span>
                            {w === "tie" && (
                              <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Tie
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <DeltaCell
                              value={scenarios[0][key]}
                              invert={invert}
                              won={w === "a"}
                            />
                            <DeltaCell
                              value={scenarios[1][key]}
                              invert={invert}
                              won={w === "b"}
                            />
                          </div>
                          {/* Mini label row */}
                          <div className="mt-2 grid grid-cols-2 gap-3">
                            <p className="text-center text-[10px] font-medium text-blue-500">
                              Scenario A
                            </p>
                            <p className="text-center text-[10px] font-medium text-purple-500">
                              Scenario B
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <Separator className="bg-border" />

                {/* ── AI Summaries ──────────────────────────────── */}
                <div className="space-y-3">
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Bot className="h-4 w-4 text-primary" /> AI Assessments
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {([scenarios[0], scenarios[1]] as const).map((s, idx) => (
                      <div
                        key={s.id}
                        className={cn(
                          "rounded-2xl border p-5",
                          idx === 0
                            ? "border-blue-500/20 bg-blue-500/3"
                            : "border-purple-500/20 bg-purple-500/3"
                        )}
                      >
                        <div className="mb-3 flex items-center gap-2">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ background: idx === 0 ? A_COLOR : B_COLOR }}
                          />
                          <span
                            className="text-xs font-bold uppercase tracking-wider"
                            style={{ color: idx === 0 ? A_COLOR : B_COLOR }}
                          >
                            Scenario {idx === 0 ? "A" : "B"}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed text-foreground/80">
                          {s.aiSummary ?? (
                            <span className="italic text-muted-foreground">
                              No AI summary available.
                            </span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Spacer */}
                <div className="h-6" />
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  )
}
