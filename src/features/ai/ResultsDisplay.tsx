"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useUrbanStore, SimulationResult } from "@/store/useUrbanStore"
import { CityZone } from "@/config/zones"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Car, Leaf, Droplets, Accessibility, TrendingUp, TrendingDown,
  Minus, AlertTriangle, CheckCircle2, Lightbulb, Users, Sparkles,
  Save, FileDown, Loader2, Check,
} from "lucide-react"
import CountUp from "react-countup"
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Legend,
} from "recharts"

interface Props {
  result: SimulationResult
  zone: CityZone
}

interface DeltaChipProps {
  value: number
  invert?: boolean
}

function DeltaChip({ value, invert = false }: DeltaChipProps) {
  const isGood = invert ? value < 0 : value > 0
  const isNeutral = value === 0
  const color = isNeutral
    ? "bg-muted text-muted-foreground"
    : isGood
    ? "bg-green-500/15 text-green-500 dark:text-green-400"
    : "bg-red-500/15 text-red-500 dark:text-red-400"

  return (
    <span className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-mono font-semibold ${color}`}>
      {isNeutral ? <Minus className="h-3 w-3" /> : isGood ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
      {value > 0 ? "+" : ""}{value}
    </span>
  )
}

const METRIC_CONFIG = [
  { key: "trafficIndex", label: "Traffic", icon: Car, invert: true },
  { key: "carbonScore", label: "Carbon", icon: Leaf, invert: true },
  { key: "floodRisk", label: "Flood Risk", icon: Droplets, invert: true },
  { key: "accessibility", label: "Access", icon: Accessibility, invert: false },
] as const

export function ResultsDisplay({ result, zone }: Props) {
  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [saved, setSaved] = useState(false)

  const radarData = METRIC_CONFIG.map(({ key, label }) => ({
    metric: label,
    Before: zone.metrics[key as keyof typeof zone.metrics] as number,
    After: result.updatedMetrics[key as keyof typeof result.updatedMetrics] as number,
  }))

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      })
      if (res.status === 401) {
        toast.error("Please sign in to save scenarios.", {
          action: { label: "Sign In", onClick: () => (window.location.href = "/login") },
        })
        return
      }
      if (!res.ok) throw new Error("Failed to save")
      setSaved(true)
      toast.success("Scenario saved!", { description: "View it in Scenarios history." })
    } catch {
      toast.error("Could not save scenario.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      const { jsPDF } = await import("jspdf")

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
      const pw = pdf.internal.pageSize.getWidth()
      const ph = pdf.internal.pageSize.getHeight()
      const m = 14 // margin

      // ── Background ──────────────────────────────────────
      pdf.setFillColor(8, 12, 21)
      pdf.rect(0, 0, pw, ph, "F")

      // ── Header bar ──────────────────────────────────────
      pdf.setFillColor(20, 30, 55)
      pdf.roundedRect(m, 10, pw - m * 2, 22, 3, 3, "F")

      pdf.setFontSize(15)
      pdf.setTextColor(147, 197, 253) // blue-300
      pdf.setFont("helvetica", "bold")
      pdf.text("UrbanVerse AI", m + 4, 19)

      pdf.setFontSize(9)
      pdf.setTextColor(100, 120, 160)
      pdf.setFont("helvetica", "normal")
      pdf.text("Urban Decision Intelligence Platform", m + 4, 25)

      pdf.setFontSize(10)
      pdf.setTextColor(200, 214, 240)
      pdf.setFont("helvetica", "bold")
      pdf.text(`Impact Report — ${result.zoneName}`, pw - m - 4, 19, { align: "right" })
      pdf.setFontSize(8)
      pdf.setFont("helvetica", "normal")
      pdf.setTextColor(100, 120, 160)
      pdf.text(`Generated: ${new Date().toLocaleString()}`, pw - m - 4, 25, { align: "right" })

      let y = 39

      // ── AI Assessment ────────────────────────────────────
      pdf.setFillColor(15, 25, 60)
      pdf.roundedRect(m, y, pw - m * 2, 8, 2, 2, "F")
      pdf.setFontSize(8)
      pdf.setFont("helvetica", "bold")
      pdf.setTextColor(147, 197, 253)
      pdf.text("✦  AI ASSESSMENT", m + 4, y + 5.5)
      y += 12

      pdf.setFontSize(9)
      pdf.setFont("helvetica", "normal")
      pdf.setTextColor(180, 200, 230)
      const summaryLines = pdf.splitTextToSize(result.aiSummary, pw - m * 2 - 8)
      pdf.text(summaryLines, m + 4, y)
      y += summaryLines.length * 4.5 + 5

      // ── Metric Cards (2 per row) ─────────────────────────
      const metrics = [
        { label: "Traffic Congestion", before: zone.metrics.trafficIndex, after: result.updatedMetrics.trafficIndex, delta: result.deltaMetrics.trafficIndex ?? 0, good: (d: number) => d < 0 },
        { label: "Carbon Score", before: zone.metrics.carbonScore, after: result.updatedMetrics.carbonScore, delta: result.deltaMetrics.carbonScore ?? 0, good: (d: number) => d < 0 },
        { label: "Flood Risk", before: zone.metrics.floodRisk, after: result.updatedMetrics.floodRisk, delta: result.deltaMetrics.floodRisk ?? 0, good: (d: number) => d < 0 },
        { label: "Accessibility", before: zone.metrics.accessibility, after: result.updatedMetrics.accessibility, delta: result.deltaMetrics.accessibility ?? 0, good: (d: number) => d > 0 },
      ]

      const cardW = (pw - m * 2 - 4) / 2
      const cardH = 22

      metrics.forEach((metric, i) => {
        const col = i % 2
        const row = Math.floor(i / 2)
        const cx = m + col * (cardW + 4)
        const cy = y + row * (cardH + 4)

        pdf.setFillColor(13, 21, 38)
        pdf.roundedRect(cx, cy, cardW, cardH, 2, 2, "F")
        pdf.setDrawColor(30, 45, 80)
        pdf.roundedRect(cx, cy, cardW, cardH, 2, 2, "S")

        pdf.setFontSize(7.5)
        pdf.setFont("helvetica", "normal")
        pdf.setTextColor(100, 130, 180)
        pdf.text(metric.label, cx + 4, cy + 6)

        pdf.setFontSize(16)
        pdf.setFont("helvetica", "bold")
        pdf.setTextColor(220, 230, 250)
        pdf.text(String(metric.after), cx + 4, cy + 16)

        pdf.setFontSize(7)
        pdf.setFont("helvetica", "normal")
        pdf.setTextColor(80, 100, 150)
        pdf.text(`was ${metric.before} / 100`, cx + 4, cy + 21)

        // Delta badge
        const d = metric.delta
        const dStr = (d > 0 ? "+" : "") + d
        if (metric.good(d)) {
          pdf.setTextColor(52, 211, 153) // green
        } else if (d === 0) {
          pdf.setTextColor(100, 120, 160)
        } else {
          pdf.setTextColor(248, 113, 113) // red
        }
        pdf.setFontSize(8)
        pdf.setFont("helvetica", "bold")
        pdf.text(dStr, cx + cardW - 4, cy + 6, { align: "right" })
      })

      y += Math.ceil(metrics.length / 2) * (cardH + 4) + 5

      // ── Population bar ───────────────────────────────────
      pdf.setFillColor(13, 21, 38)
      pdf.roundedRect(m, y, pw - m * 2, 14, 2, 2, "F")
      pdf.setFontSize(8)
      pdf.setFont("helvetica", "normal")
      pdf.setTextColor(100, 130, 180)
      pdf.text("Population", m + 4, y + 5.5)
      pdf.setFontSize(11)
      pdf.setFont("helvetica", "bold")
      pdf.setTextColor(220, 230, 250)
      pdf.text(result.updatedMetrics.population.toLocaleString(), m + 4, y + 12)
      const popD = result.deltaMetrics.population ?? 0
      const popStr = (popD > 0 ? "+" : "") + popD.toLocaleString()
      pdf.setTextColor(popD >= 0 ? 52 : 248, popD >= 0 ? 211 : 113, popD >= 0 ? 153 : 113)
      pdf.text(popStr, pw - m - 4, y + 9, { align: "right" })
      y += 19

      // ── Benefits / Risks / Recommendations ───────────────
      const sections = [
        { title: "✓  Benefits", color: [52, 211, 153] as [number, number, number], items: result.benefits },
        { title: "⚠  Risks", color: [251, 191, 36] as [number, number, number], items: result.risks },
        { title: "⚡  Recommendations", color: [147, 197, 253] as [number, number, number], items: result.recommendations },
      ]

      for (const section of sections) {
        if (!section.items.length) continue
        if (y > ph - 30) break

        pdf.setFontSize(8)
        pdf.setFont("helvetica", "bold")
        pdf.setTextColor(...section.color)
        pdf.text(section.title, m, y + 4)
        y += 8

        pdf.setFont("helvetica", "normal")
        pdf.setTextColor(170, 190, 220)
        pdf.setFontSize(8)
        for (const item of section.items) {
          if (y > ph - 15) break
          const lines = pdf.splitTextToSize(`• ${item}`, pw - m * 2 - 4)
          pdf.text(lines, m + 2, y)
          y += lines.length * 4 + 1
        }
        y += 4
      }

      // ── Footer ───────────────────────────────────────────
      pdf.setFontSize(7)
      pdf.setTextColor(50, 70, 110)
      pdf.text("Generated by UrbanVerse AI — Urban Decision Intelligence Platform", pw / 2, ph - 6, { align: "center" })

      pdf.save(`UrbanVerse_${result.zoneName.replace(/\s+/g, "_")}_${Date.now()}.pdf`)
      toast.success("PDF exported!", { description: "Professional report downloaded." })
    } catch (e) {
      console.error(e)
      toast.error("Export failed. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-5"
    >
      {/* Capturable content region */}
      <div id="results-panel-content" className="space-y-5">
        {/* AI Summary */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">AI Assessment</span>
          </div>
          <p className="text-sm leading-relaxed text-foreground/80">{result.aiSummary}</p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 gap-2">
          {METRIC_CONFIG.map(({ key, label, icon: Icon, invert }) => {
            const before = zone.metrics[key as keyof typeof zone.metrics] as number
            const after = result.updatedMetrics[key as keyof typeof result.updatedMetrics] as number
            const delta = (result.deltaMetrics[key as keyof typeof result.deltaMetrics] ?? 0) as number
            return (
              <div key={key} className="rounded-xl border border-border bg-card p-3 space-y-1.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Icon className="h-3.5 w-3.5" />{label}
                  </div>
                  <DeltaChip value={delta} invert={invert} />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold font-mono text-foreground">
                    <CountUp end={after} duration={1.2} />
                  </span>
                  <span className="text-xs text-muted-foreground">/ 100</span>
                </div>
                <p className="text-[10px] text-muted-foreground">was {before}</p>
              </div>
            )
          })}
        </div>

        {/* Population */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />Population
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-foreground">
              <CountUp end={result.updatedMetrics.population} duration={1.5} separator="," />
            </span>
            {(result.deltaMetrics.population ?? 0) !== 0 && (
              <DeltaChip value={result.deltaMetrics.population ?? 0} invert={false} />
            )}
          </div>
        </div>

        {/* Radar chart */}
        <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
          <p className="mb-2 text-center text-xs font-medium text-muted-foreground">Before vs After</p>
          <ResponsiveContainer width="100%" height={175}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="currentColor" className="text-border" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "currentColor", fontSize: 10, className: "text-muted-foreground" }} />
              <Radar name="Before" dataKey="Before" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={1.5} />
              <Radar name="After" dataKey="After" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.2} strokeWidth={1.5} />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <Separator className="bg-border" />

        {result.benefits.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> Benefits
            </div>
            <ul className="space-y-1.5">
              {result.benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500" />{b}
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.risks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-3.5 w-3.5" /> Risks
            </div>
            <ul className="space-y-1.5">
              {result.risks.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />{r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.recommendations.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              <Lightbulb className="h-3.5 w-3.5" /> Recommendations
            </div>
            <ul className="space-y-1.5">
              {result.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />{rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <Separator className="bg-border" />
      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          disabled={isSaving || saved}
          variant="outline"
          className="flex-1 gap-2 border-border text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-60"
        >
          {isSaving ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
          ) : saved ? (
            <><Check className="h-4 w-4 text-green-500" /> Saved</>
          ) : (
            <><Save className="h-4 w-4" /> Save Scenario</>
          )}
        </Button>
        <Button
          onClick={handleExportPDF}
          disabled={isExporting}
          variant="outline"
          className="flex-1 gap-2 border-border text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-60"
        >
          {isExporting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Exporting…</>
          ) : (
            <><FileDown className="h-4 w-4" /> Export PDF</>
          )}
        </Button>
      </div>
    </motion.div>
  )
}
