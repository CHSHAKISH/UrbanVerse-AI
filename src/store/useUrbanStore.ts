import { create } from "zustand"
import { CityZone, ZoneMetrics } from "@/config/zones"

interface UrbanStore {
  // Map state
  selectedZone: CityZone | null
  setSelectedZone: (zone: CityZone | null) => void

  // AI Panel state
  isAIPanelOpen: boolean
  setIsAIPanelOpen: (open: boolean) => void
  currentPrompt: string
  setCurrentPrompt: (prompt: string) => void

  // Simulation / scenario state
  isSimulating: boolean
  setIsSimulating: (v: boolean) => void
  simulationResult: SimulationResult | null
  setSimulationResult: (result: SimulationResult | null) => void
}

export interface SimulationResult {
  action: string
  zoneId: string
  zoneName: string
  updatedMetrics: ZoneMetrics
  deltaMetrics: Partial<ZoneMetrics>
  aiSummary: string
  benefits: string[]
  risks: string[]
  recommendations: string[]
  timestamp: string
}

export const useUrbanStore = create<UrbanStore>((set) => ({
  selectedZone: null,
  setSelectedZone: (zone) => set({ selectedZone: zone }),

  isAIPanelOpen: false,
  setIsAIPanelOpen: (open) => set({ isAIPanelOpen: open }),
  currentPrompt: "",
  setCurrentPrompt: (prompt) => set({ currentPrompt: prompt }),

  isSimulating: false,
  setIsSimulating: (v) => set({ isSimulating: v }),
  simulationResult: null,
  setSimulationResult: (result) => set({ simulationResult: result }),
}))
