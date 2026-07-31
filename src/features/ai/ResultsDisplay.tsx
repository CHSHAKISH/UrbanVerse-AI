"use client"

import { useUrbanStore, SimulationResult } from "@/store/useUrbanStore"
import { CityZone } from "@/config/zones"
import { motion } from "framer-motion"
import {
  Car,
  Leaf,
  Droplets,
  Accessibility,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Users,
  Sparkles,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import CountUp from "react-countup"
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Legend,
} from "recharts"

interface Props {
  result: SimulationResult
  zone: CityZone
}

interface DeltaChipProps {
  value: number
  invert?: boolean // for metrics where lower is better (traffic, carbon, flood)
}

function DeltaChip({ value, invert = false }: DeltaChipProps) {
  const isGood = invert ? value < 0 : value > 0
  const isNeutral = value === 0
  const color = isNeutral
    ? "bg-gray-700 text-gray-400"
    : isGood
    ? "bg-green-500/20 text-green-400"
    : "bg-red-500/20 text-red-400"

  return (
    <span className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-mono font-semibold ${color}`}>
      {isNeutral ? (
        <Minus className="h-3 w-3" />
      ) : isGood ? (
        <TrendingDown className="h-3 w-3" />
      ) : (
        <TrendingUp className="h-3 w-3" />
      )}
      {value > 0 ? "+" : ""}
      {value}
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
  const radarData = METRIC_CONFIG.map(({ key, label }) => ({
    metric: label,
    Before: zone.metrics[key as keyof typeof zone.metrics] as number,
    After: result.updatedMetrics[key as keyof typeof result.updatedMetrics] as number,
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-5"
    >
      {/* AI Summary */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
            AI Assessment
          </span>
        </div>
        <p className="text-sm leading-relaxed text-gray-300">{result.aiSummary}</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-2">
        {METRIC_CONFIG.map(({ key, label, icon: Icon, invert }) => {
          const before = zone.metrics[key as keyof typeof zone.metrics] as number
          const after = result.updatedMetrics[key as keyof typeof result.updatedMetrics] as number
          const delta = result.deltaMetrics[key as keyof typeof result.deltaMetrics] as number
          return (
            <div
              key={key}
              className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </div>
                <DeltaChip value={delta} invert={invert} />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono text-gray-100">
                  <CountUp end={after} duration={1.2} />
                </span>
                <span className="text-xs text-gray-500">/ 100</span>
              </div>
              <p className="text-[10px] text-gray-500">was {before}</p>
            </div>
          )
        })}
      </div>

      {/* Population */}
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Users className="h-4 w-4" />
          Population
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold text-gray-200">
            <CountUp
              end={result.updatedMetrics.population}
              duration={1.5}
              separator=","
            />
          </span>
          {result.deltaMetrics.population !== 0 && (
            <DeltaChip value={result.deltaMetrics.population} invert={false} />
          )}
        </div>
      </div>

      {/* Radar chart */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
        <p className="mb-2 text-center text-xs font-medium text-gray-500">
          Before vs After
        </p>
        <ResponsiveContainer width="100%" height={180}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(255,255,255,0.08)" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: "#9ca3af", fontSize: 10 }}
            />
            <Radar
              name="Before"
              dataKey="Before"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.15}
              strokeWidth={1.5}
            />
            <Radar
              name="After"
              dataKey="After"
              stroke="#22d3ee"
              fill="#22d3ee"
              fillOpacity={0.2}
              strokeWidth={1.5}
            />
            <Legend
              wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <Separator className="bg-white/5" />

      {/* Benefits */}
      {result.benefits.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-green-400">
            <CheckCircle2 className="h-3.5 w-3.5" /> Benefits
          </div>
          <ul className="space-y-1.5">
            {result.benefits.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-400" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Risks */}
      {result.risks.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5" /> Risks
          </div>
          <ul className="space-y-1.5">
            {result.risks.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <Lightbulb className="h-3.5 w-3.5" /> Recommendations
          </div>
          <ul className="space-y-1.5">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-400" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  )
}
