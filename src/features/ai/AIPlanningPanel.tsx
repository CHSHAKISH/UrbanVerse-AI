"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useUrbanStore } from "@/store/useUrbanStore"
import { ResultsDisplay } from "./ResultsDisplay"
import { CityZone } from "@/config/zones"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  X,
  Bot,
  Loader2,
  RotateCcw,
  ChevronRight,
  Zap,
} from "lucide-react"

const EXAMPLE_PROMPTS = [
  "Add a metro station and two urban parks",
  "Build a hospital and upgrade the sewage system",
  "Install solar panels and create pedestrian zones",
  "Add a residential block and a school",
]

interface Props {
  zone: CityZone
}

export function AIPlanningPanel({ zone }: Props) {
  const {
    isAIPanelOpen,
    setIsAIPanelOpen,
    isSimulating,
    setIsSimulating,
    simulationResult,
    setSimulationResult,
  } = useUrbanStore()

  const [prompt, setPrompt] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSimulate = async () => {
    if (!prompt.trim()) {
      toast.error("Please describe what you want to build in this zone.")
      return
    }

    setIsSimulating(true)
    setSimulationResult(null)

    try {
      const res = await fetch("/api/ai/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), zoneId: zone.id }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? "Simulation failed")
      }

      setSimulationResult(data)
      toast.success("Simulation complete!", { description: zone.name })
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong")
    } finally {
      setIsSimulating(false)
    }
  }

  const handleReset = () => {
    setSimulationResult(null)
    setPrompt("")
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSimulate()
    }
  }

  return (
    <AnimatePresence>
      {isAIPanelOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-[900] bg-black/40 backdrop-blur-[2px]"
            onClick={() => setIsAIPanelOpen(false)}
          />

          {/* Slide-in Panel */}
          <motion.div
            key="panel"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="absolute bottom-0 right-0 top-0 z-[950] flex w-[400px] flex-col border-l border-border bg-background/98 shadow-2xl shadow-black/40 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/25">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">AI Urban Planner</h2>
                  <p className="text-xs text-muted-foreground">
                    Analyzing{" "}
                    <span className="font-medium" style={{ color: zone.color }}>
                      {zone.name}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAIPanelOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Prompt input area */}
              <div className="space-y-3">
                {!simulationResult && (
                  <>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Describe urban changes in plain English. The AI will parse your intent and calculate real impacts using our rule engine.
                    </p>

                    {/* Example chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {EXAMPLE_PROMPTS.map((ex) => (
                        <button
                          key={ex}
                          onClick={() => setPrompt(ex)}
                          className="rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] text-muted-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                        >
                          {ex}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* Textarea */}
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`What do you want to build in ${zone.name}?`}
                    rows={3}
                    disabled={isSimulating}
                    className="w-full resize-none rounded-xl border border-border bg-muted/50 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 disabled:opacity-50 transition"
                  />
                  <p className="absolute bottom-2 right-2.5 text-[10px] text-muted-foreground/60">
                    Ctrl+Enter to run
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleSimulate}
                    disabled={isSimulating || !prompt.trim()}
                    className="flex-1 gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-blue-500/20 disabled:opacity-50"
                  >
                    {isSimulating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Simulating…
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        Simulate
                        <ChevronRight className="h-3.5 w-3.5 ml-auto" />
                      </>
                    )}
                  </Button>
                  {simulationResult && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleReset}
                      className="border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Loading skeleton */}
              {isSimulating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2.5 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <p className="text-sm text-primary">
                      Parsing intent with Gemini…
                    </p>
                  </div>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-12 animate-pulse rounded-xl bg-muted"
                      style={{ animationDelay: `${i * 100}ms` }}
                    />
                  ))}
                </motion.div>
              )}

              {/* Results */}
              {simulationResult && !isSimulating && (
                <>
                  <Separator className="bg-border" />
                  <ResultsDisplay result={simulationResult} zone={zone} />
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
