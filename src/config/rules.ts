/**
 * Rule Engine — Deterministic Urban Impact Calculator
 *
 * Each action type defines how it changes zone metrics.
 * Values are deltas (can be positive or negative).
 * The AI (Gemini) extracts action types from text; numbers always come from here.
 */

export type ActionType =
  | "ADD_HOSPITAL"
  | "ADD_METRO"
  | "ADD_PARK"
  | "ADD_SCHOOL"
  | "ADD_SOLAR_PANELS"
  | "ADD_HIGHWAY"
  | "ADD_FLYOVER"
  | "ADD_FLOOD_BARRIER"
  | "ADD_WATER_TREATMENT"
  | "ADD_BUS_DEPOT"
  | "ADD_CHARGING_STATION"
  | "ADD_COMMERCIAL_TOWER"
  | "ADD_RESIDENTIAL_BLOCK"
  | "ADD_INDUSTRIAL_PLANT"
  | "ADD_BIKE_LANE"
  | "ADD_PEDESTRIAN_ZONE"
  | "ADD_PARKING_LOT"
  | "REMOVE_SLUM"
  | "PLANT_TREES"
  | "UPGRADE_SEWAGE"

export interface ActionRule {
  label: string
  description: string
  emoji: string
  trafficImpact: number       // +/- index points (0-100 scale)
  carbonImpact: number        // +/- score points
  floodImpact: number         // +/- risk points
  accessibilityImpact: number // +/- score points
  populationImpact: number    // absolute delta
}

export const ACTION_RULES: Record<ActionType, ActionRule> = {
  ADD_HOSPITAL: {
    label: "Hospital",
    description: "Full-service hospital with emergency care",
    emoji: "🏥",
    trafficImpact: +12,
    carbonImpact: +8,
    floodImpact: 0,
    accessibilityImpact: +15,
    populationImpact: +2000,
  },
  ADD_METRO: {
    label: "Metro Station",
    description: "Underground metro interchange",
    emoji: "🚇",
    trafficImpact: -18,
    carbonImpact: -14,
    floodImpact: +3,
    accessibilityImpact: +22,
    populationImpact: +5000,
  },
  ADD_PARK: {
    label: "Urban Park",
    description: "Green recreational space",
    emoji: "🌳",
    trafficImpact: -3,
    carbonImpact: -10,
    floodImpact: -8,
    accessibilityImpact: +8,
    populationImpact: +500,
  },
  ADD_SCHOOL: {
    label: "School",
    description: "Primary or secondary school",
    emoji: "🏫",
    trafficImpact: +6,
    carbonImpact: +3,
    floodImpact: 0,
    accessibilityImpact: +12,
    populationImpact: +3000,
  },
  ADD_SOLAR_PANELS: {
    label: "Solar Installation",
    description: "Rooftop / ground solar panels",
    emoji: "☀️",
    trafficImpact: 0,
    carbonImpact: -18,
    floodImpact: 0,
    accessibilityImpact: +2,
    populationImpact: 0,
  },
  ADD_HIGHWAY: {
    label: "Highway",
    description: "4-6 lane expressway",
    emoji: "🛣️",
    trafficImpact: -8,
    carbonImpact: +20,
    floodImpact: +10,
    accessibilityImpact: +10,
    populationImpact: 0,
  },
  ADD_FLYOVER: {
    label: "Flyover Bridge",
    description: "Grade-separated traffic interchange",
    emoji: "🌉",
    trafficImpact: -12,
    carbonImpact: +10,
    floodImpact: +5,
    accessibilityImpact: +8,
    populationImpact: 0,
  },
  ADD_FLOOD_BARRIER: {
    label: "Flood Barrier",
    description: "Retaining walls and drainage channels",
    emoji: "🌊",
    trafficImpact: 0,
    carbonImpact: +2,
    floodImpact: -25,
    accessibilityImpact: 0,
    populationImpact: +1000,
  },
  ADD_WATER_TREATMENT: {
    label: "Water Treatment Plant",
    description: "Sewage and water treatment facility",
    emoji: "💧",
    trafficImpact: +4,
    carbonImpact: +5,
    floodImpact: -10,
    accessibilityImpact: +5,
    populationImpact: +2000,
  },
  ADD_BUS_DEPOT: {
    label: "Bus Depot",
    description: "Central bus terminal",
    emoji: "🚌",
    trafficImpact: -8,
    carbonImpact: -5,
    floodImpact: +2,
    accessibilityImpact: +14,
    populationImpact: +1000,
  },
  ADD_CHARGING_STATION: {
    label: "EV Charging Station",
    description: "Electric vehicle charging hub",
    emoji: "⚡",
    trafficImpact: +2,
    carbonImpact: -8,
    floodImpact: 0,
    accessibilityImpact: +4,
    populationImpact: 0,
  },
  ADD_COMMERCIAL_TOWER: {
    label: "Commercial Tower",
    description: "High-rise office / retail complex",
    emoji: "🏢",
    trafficImpact: +20,
    carbonImpact: +15,
    floodImpact: +5,
    accessibilityImpact: +6,
    populationImpact: +8000,
  },
  ADD_RESIDENTIAL_BLOCK: {
    label: "Residential Block",
    description: "Mid-density apartment complex",
    emoji: "🏘️",
    trafficImpact: +10,
    carbonImpact: +8,
    floodImpact: +3,
    accessibilityImpact: +4,
    populationImpact: +15000,
  },
  ADD_INDUSTRIAL_PLANT: {
    label: "Industrial Plant",
    description: "Manufacturing facility",
    emoji: "🏭",
    trafficImpact: +15,
    carbonImpact: +25,
    floodImpact: +8,
    accessibilityImpact: -5,
    populationImpact: +500,
  },
  ADD_BIKE_LANE: {
    label: "Bike Lane Network",
    description: "Dedicated cycling infrastructure",
    emoji: "🚲",
    trafficImpact: -6,
    carbonImpact: -7,
    floodImpact: 0,
    accessibilityImpact: +10,
    populationImpact: 0,
  },
  ADD_PEDESTRIAN_ZONE: {
    label: "Pedestrian Zone",
    description: "Car-free walkable streets",
    emoji: "🚶",
    trafficImpact: -10,
    carbonImpact: -8,
    floodImpact: -3,
    accessibilityImpact: +12,
    populationImpact: 0,
  },
  ADD_PARKING_LOT: {
    label: "Parking Lot",
    description: "Surface or multi-level car park",
    emoji: "🅿️",
    trafficImpact: -5,
    carbonImpact: +3,
    floodImpact: +8,
    accessibilityImpact: +3,
    populationImpact: 0,
  },
  REMOVE_SLUM: {
    label: "Slum Redevelopment",
    description: "Redevelop informal settlement into planned housing",
    emoji: "🏗️",
    trafficImpact: -5,
    carbonImpact: -10,
    floodImpact: -12,
    accessibilityImpact: +18,
    populationImpact: +5000,
  },
  PLANT_TREES: {
    label: "Urban Forestation",
    description: "Tree planting and green corridors",
    emoji: "🌿",
    trafficImpact: 0,
    carbonImpact: -12,
    floodImpact: -6,
    accessibilityImpact: +5,
    populationImpact: 0,
  },
  UPGRADE_SEWAGE: {
    label: "Sewage Upgrade",
    description: "Modern underground drainage system",
    emoji: "🔧",
    trafficImpact: +3,
    carbonImpact: +2,
    floodImpact: -15,
    accessibilityImpact: +6,
    populationImpact: +1000,
  },
}

/** Clamp a value to the 0-100 range */
function clamp(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)))
}

export interface SimulationInput {
  baseMetrics: {
    trafficIndex: number
    carbonScore: number
    floodRisk: number
    accessibility: number
    population: number
  }
  actions: ActionType[]
}

export interface SimulationOutput {
  updatedMetrics: {
    trafficIndex: number
    carbonScore: number
    floodRisk: number
    accessibility: number
    population: number
  }
  deltaMetrics: {
    trafficIndex: number
    carbonScore: number
    floodRisk: number
    accessibility: number
    population: number
  }
  appliedActions: Array<ActionRule & { type: ActionType }>
}

export function runSimulation(input: SimulationInput): SimulationOutput {
  const { baseMetrics, actions } = input

  let trafficDelta = 0
  let carbonDelta = 0
  let floodDelta = 0
  let accessibilityDelta = 0
  let populationDelta = 0

  const appliedActions = actions.map((type) => {
    const rule = ACTION_RULES[type]
    trafficDelta += rule.trafficImpact
    carbonDelta += rule.carbonImpact
    floodDelta += rule.floodImpact
    accessibilityDelta += rule.accessibilityImpact
    populationDelta += rule.populationImpact
    return { ...rule, type }
  })

  return {
    updatedMetrics: {
      trafficIndex: clamp(baseMetrics.trafficIndex + trafficDelta),
      carbonScore: clamp(baseMetrics.carbonScore + carbonDelta),
      floodRisk: clamp(baseMetrics.floodRisk + floodDelta),
      accessibility: clamp(baseMetrics.accessibility + accessibilityDelta),
      population: Math.max(0, baseMetrics.population + populationDelta),
    },
    deltaMetrics: {
      trafficIndex: trafficDelta,
      carbonScore: carbonDelta,
      floodRisk: floodDelta,
      accessibility: accessibilityDelta,
      population: populationDelta,
    },
    appliedActions,
  }
}
