"use client"

import { useUrbanStore } from "@/store/useUrbanStore"
import { CityZone } from "@/config/zones"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Car,
  Leaf,
  Droplets,
  Accessibility,
  Users,
  Bot,
  X,
  TrendingUp,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface MetricRowProps {
  icon: React.ReactNode
  label: string
  value: number
  unit?: string
  colorClass: string
}

function MetricBar({ value, colorClass }: { value: number; colorClass: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`h-full rounded-full ${colorClass}`}
      />
    </div>
  )
}

function MetricRow({ icon, label, value, unit = "%", colorClass }: MetricRowProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-gray-400">
          {icon}
          <span>{label}</span>
        </div>
        <span className="font-mono font-medium text-gray-200">
          {value.toLocaleString()}{unit}
        </span>
      </div>
      <MetricBar value={value} colorClass={colorClass} />
    </div>
  )
}

export function ZoneInfoCard({ zone }: { zone: CityZone }) {
  const setIsAIPanelOpen = useUrbanStore((s) => s.setIsAIPanelOpen)
  const setSelectedZone = useUrbanStore((s) => s.setSelectedZone)

  return (
    <AnimatePresence>
      <motion.div
        key={zone.id}
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="absolute bottom-6 left-6 z-[1000] w-80 overflow-hidden rounded-2xl border border-white/10 bg-gray-950/90 shadow-2xl shadow-black/50 backdrop-blur-xl"
      >
        {/* Header */}
        <div
          className="relative flex items-start justify-between p-4"
          style={{ borderBottom: `1px solid ${zone.color}33` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="h-3 w-3 rounded-full shadow-lg"
              style={{ backgroundColor: zone.color, boxShadow: `0 0 8px ${zone.color}88` }}
            />
            <div>
              <h3 className="text-sm font-semibold text-gray-100">{zone.name}</h3>
              <p className="text-xs text-gray-400 mt-0.5 leading-snug">{zone.description}</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedZone(null)}
            className="ml-2 mt-0.5 flex-shrink-0 rounded-lg p-1 text-gray-500 transition hover:bg-white/10 hover:text-gray-200"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Population badge */}
        <div className="flex items-center gap-2 px-4 py-2.5">
          <Users className="h-3.5 w-3.5 text-gray-500" />
          <span className="text-xs text-gray-400">Population:</span>
          <Badge variant="secondary" className="text-xs px-2 py-0 h-5 bg-white/10 text-gray-200 border-0">
            {zone.metrics.population.toLocaleString()}
          </Badge>
        </div>

        <Separator className="bg-white/5" />

        {/* Metrics */}
        <div className="space-y-3 p-4">
          <MetricRow
            icon={<Car className="h-3 w-3" />}
            label="Traffic Congestion"
            value={zone.metrics.trafficIndex}
            colorClass="bg-orange-400"
          />
          <MetricRow
            icon={<Leaf className="h-3 w-3" />}
            label="Carbon Emissions"
            value={zone.metrics.carbonScore}
            colorClass="bg-red-400"
          />
          <MetricRow
            icon={<Droplets className="h-3 w-3" />}
            label="Flood Risk"
            value={zone.metrics.floodRisk}
            colorClass="bg-blue-400"
          />
          <MetricRow
            icon={<Accessibility className="h-3 w-3" />}
            label="Accessibility"
            value={zone.metrics.accessibility}
            colorClass="bg-green-400"
          />
        </div>

        <Separator className="bg-white/5" />

        {/* CTA */}
        <div className="p-3">
          <Button
            className="w-full gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-500/20 transition-all duration-200"
            onClick={() => setIsAIPanelOpen(true)}
          >
            <Bot className="h-4 w-4" />
            Analyze this Zone
            <TrendingUp className="h-3.5 w-3.5 ml-auto" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
